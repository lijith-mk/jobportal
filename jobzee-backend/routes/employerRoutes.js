const express = require('express');
const router = express.Router();
const {
  registerEmployer,
  loginEmployer,
  googleAuth,
  getEmployerProfile,
  updateEmployerProfile,
  getDashboardStats,
  changePassword,
  deactivateAccount,
  getAllEmployers,
  forgotPassword,
  resetPassword,
  createJob,
  listMyJobs,
  getJob,
  deleteJob
} = require('../controllers/employerController');

const emailService = require('../services/emailService');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { employerAuth, requireVerification, checkSubscriptionLimits } = require('../middleware/employerAuth');

// Public routes (no authentication required)
router.post('/register', authLimiter, registerEmployer);
router.post('/login', authLimiter, loginEmployer);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Email test route (DEVELOPMENT ONLY - REMOVE IN PRODUCTION)
router.post('/test-email', async (req, res) => {
  // SECURITY: Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false,
      message: 'Route not found',
      errorType: 'ROUTE_NOT_FOUND'
    });
  }
  
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: 'Email address is required',
      errorType: 'MISSING_EMAIL'
    });
  }
  
  try {
    const result = await emailService.sendTestEmail(email);
    res.json({
      success: true,
      message: 'Test email request processed',
      details: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Protected routes (authentication required)
router.use(employerAuth); // Apply authentication middleware to all routes below

// Profile management
router.get('/profile', getEmployerProfile);
router.put('/profile', updateEmployerProfile);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Account management
router.put('/change-password', changePassword);
router.put('/deactivate', deactivateAccount);

// SECURITY: This route is now moved to admin routes only
// router.get('/all', getAllEmployers); // REMOVED: This is now admin-only in /api/admin/employers

// Jobs
router.post('/jobs', requireVerification, createJob);
router.get('/jobs', requireVerification, listMyJobs);
router.get('/jobs/:jobId', requireVerification, getJob);
router.delete('/jobs/:jobId', requireVerification, deleteJob);
module.exports = router;
