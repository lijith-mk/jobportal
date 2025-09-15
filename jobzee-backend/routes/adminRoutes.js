const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { adminAuth, checkPermission } = require('../middleware/adminAuth');
const { adminLimiter, authLimiter } = require('../middleware/rateLimiter');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const ContactQuery = require('../models/ContactQuery');

// Initialize admin account - SECURITY: Restrict this in production
router.post('/init', adminLimiter, async (req, res) => {
  try {
    // SECURITY CHECK: Only allow in development or with special admin key
    const initKey = req.headers['x-admin-init-key'];
    const expectedKey = process.env.ADMIN_INIT_KEY;
    
    if (process.env.NODE_ENV === 'production' && (!initKey || !expectedKey || initKey !== expectedKey)) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin initialization is restricted in production',
        errorType: 'INIT_RESTRICTED' 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ userId: 'admin123' });
    if (existingAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'Admin already initialized',
        errorType: 'ADMIN_EXISTS' 
      });
    }

    // Create default admin
    const admin = new Admin();
    await admin.save();

    res.json({ 
      success: true,
      message: 'Admin initialized successfully' 
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to initialize admin' 
    });
  }
});

// Admin login
router.post('/login', adminLimiter, async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    // Find admin
    const admin = await Admin.findOne({ userId });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is deactivated' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('CRITICAL: JWT_SECRET environment variable is not set!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        userId: admin.userId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalEmployers,
      totalJobs,
      activeJobs,
      pendingJobs,
      rejectedJobs
    ] = await Promise.all([
      User.countDocuments(),
      Employer.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ status: 'rejected' })
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employerId', 'companyName')
      .select('title company status createdAt');

    res.json({
      stats: {
        totalUsers,
        totalEmployers,
        totalJobs,
        activeJobs,
        pendingJobs,
        rejectedJobs
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// User Management Routes
router.get('/users', adminAuth, checkPermission('userManagement'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;

    const query = { status: { $ne: 'deleted' } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      if (status === 'active') query.status = 'active';
      else if (status === 'suspended') query.status = 'suspended';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Create user (admin)
router.post('/users', adminAuth, checkPermission('userManagement'), async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const normalizedEmail = String(email).toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const user = new User({ name, email: normalizedEmail, phone, role: role || 'user' });
    if (password) {
      const bcrypt = require('bcryptjs');
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    const output = user.toObject();
    delete output.password;
    res.status(201).json({ message: 'User created', user: output });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user (admin)
router.put('/users/:id', adminAuth, checkPermission('userManagement'), async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.password;
    delete update.email; // prevent email changes via this endpoint
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Soft delete user (admin)
router.delete('/users/:id', adminAuth, checkPermission('userManagement'), async (req, res) => {
  try {
    const { hard } = req.query;
    if (hard === 'true') {
      const result = await User.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
      return res.json({ message: 'User permanently deleted' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'deleted';
    user.isActive = false;
    user.deletedAt = new Date();
    user.deletedBy = req.admin._id;
    await user.save();
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Suspend/Activate user
router.patch('/users/:id/status', adminAuth, checkPermission('userManagement'), async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    if (!isActive && reason) {
      user.suspensionReason = reason;
      user.suspendedAt = new Date();
      user.suspendedBy = req.admin._id;
      user.status = 'suspended';
    } else if (isActive) {
      user.status = 'active';
      user.suspensionReason = undefined;
      user.suspendedAt = undefined;
      user.suspendedBy = undefined;
    }
    await user.save();

    res.json({ message: `User ${isActive ? 'activated' : 'suspended'} successfully` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Employer Management Routes
router.get('/employers', adminAuth, checkPermission('employerManagement'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;

    // Show all except deleted (keep suspended visible)
    const query = { deletedAt: { $exists: false } };
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { companyEmail: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      if (status === 'active') query.isActive = { $ne: false };
      else if (status === 'suspended') query.isActive = false;
    }

    const employers = await Employer.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Employer.countDocuments(query);

    res.json({
      employers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalEmployers: total
    });
  } catch (error) {
    console.error('Get employers error:', error);
    res.status(500).json({ message: 'Failed to fetch employers' });
  }
});

// Approve/Reject employer
router.patch('/employers/:id/status', adminAuth, checkPermission('employerManagement'), async (req, res) => {
  try {
    const { isApproved, reason } = req.body;
    const employer = await Employer.findById(req.params.id);

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    employer.isApproved = isApproved;
    employer.approvedBy = req.admin._id;
    employer.approvedAt = new Date();
    if (!isApproved && reason) {
      employer.rejectionReason = reason;
    }
    await employer.save();

    res.json({ message: `Employer ${isApproved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    console.error('Update employer status error:', error);
    res.status(500).json({ message: 'Failed to update employer status' });
  }
});

// Update employer verification (verify/unverify, set status/notes/document)
router.patch('/employers/:id/verification', adminAuth, checkPermission('employerManagement'), async (req, res) => {
  try {
    const { isVerified, status, notes, document } = req.body;

    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    if (typeof isVerified === 'boolean') {
      employer.isVerified = isVerified;
      // If explicitly verified/unverified but no status provided, sync status
      if (!status) {
        employer.verificationStatus = isVerified ? 'verified' : 'pending';
      }
    }

    if (status) {
      const allowed = ['pending', 'verified', 'rejected'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid verification status' });
      }
      employer.verificationStatus = status;
    }

    if (notes !== undefined) {
      employer.verificationNotes = String(notes || '').trim();
    }

    if (document !== undefined) {
      employer.verificationDocument = String(document || '').trim();
    }

    await employer.save();

    return res.json({
      message: 'Employer verification updated',
      employer: {
        id: employer._id,
        isVerified: employer.isVerified,
        verificationStatus: employer.verificationStatus,
        verificationNotes: employer.verificationNotes,
        verificationDocument: employer.verificationDocument
      }
    });
  } catch (error) {
    console.error('Update employer verification error:', error);
    return res.status(500).json({ message: 'Failed to update employer verification' });
  }
});
// Create employer (admin)
router.post('/employers', adminAuth, checkPermission('employerManagement'), async (req, res) => {
  try {
    const { companyName, companyEmail, contactPersonName, password } = req.body;
    if (!companyName || !companyEmail || !contactPersonName) {
      return res.status(400).json({ message: 'companyName, companyEmail, contactPersonName are required' });
    }
    const normalizedEmail = String(companyEmail).toLowerCase();
    const exists = await Employer.findOne({ companyEmail: normalizedEmail });
    if (exists) return res.status(400).json({ message: 'Company email already exists' });
    const employer = new Employer({ ...req.body, companyEmail: normalizedEmail });
    if (password) {
      const bcrypt = require('bcryptjs');
      employer.password = await bcrypt.hash(password, 10);
    }
    await employer.save();
    const out = employer.toObject();
    delete out.password;
    res.status(201).json({ message: 'Employer created', employer: out });
  } catch (error) {
    console.error('Create employer error:', error);
    res.status(500).json({ message: 'Failed to create employer' });
  }
});

// Update employer (admin)
router.put('/employers/:id', adminAuth, checkPermission('employerManagement'), async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.password;
    delete update.companyEmail; // prevent email change here
    const employer = await Employer.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true, select: '-password' }
    );
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    res.json({ message: 'Employer updated', employer });
  } catch (error) {
    console.error('Update employer error:', error);
    res.status(500).json({ message: 'Failed to update employer' });
  }
});

// Soft delete employer (admin)
router.delete('/employers/:id', adminAuth, checkPermission('employerManagement'), async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id);
    if (!employer) return res.status(404).json({ message: 'Employer not found' });
    employer.isActive = false;
    employer.deletedAt = new Date();
    await employer.save();
    res.json({ message: 'Employer deleted' });
  } catch (error) {
    console.error('Delete employer error:', error);
    res.status(500).json({ message: 'Failed to delete employer' });
  }
});

// Job Management Routes
router.get('/jobs', adminAuth, checkPermission('jobManagement'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .populate('employerId', 'companyName contactEmail')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalJobs: total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Approve/Reject job
router.patch('/jobs/:id/status', adminAuth, checkPermission('jobManagement'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    job.status = status;
    job.approvedBy = req.admin._id;
    job.approvedAt = new Date();
    if (adminNotes) {
      job.adminNotes = adminNotes;
    }
    await job.save();

    res.json({ message: `Job ${status} successfully` });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ message: 'Failed to update job status' });
  }
});

// Analytics
router.get('/analytics', adminAuth, checkPermission('analytics'), async (req, res) => {
  try {
    // Get data for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      employerGrowth,
      jobPostings,
      topSkills
    ] = await Promise.all([
      User.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Employer.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Job.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Job.aggregate([
        { $unwind: "$skills" },
        {
          $group: {
            _id: "$skills",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      userGrowth,
      employerGrowth,
      jobPostings,
      topSkills
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
