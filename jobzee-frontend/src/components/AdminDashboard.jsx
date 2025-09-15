import React, { useState, useEffect } from 'react';
import { validateEmail, validatePhone, validateName } from '../utils/validationUtils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import AdminSidebar from './AdminSidebar';


const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [queries, setQueries] = useState([]);
  const [queryPage, setQueryPage] = useState(1);
  const [queryTotalPages, setQueryTotalPages] = useState(1);
  const [querySearch, setQuerySearch] = useState('');
  const [queryStatus, setQueryStatus] = useState('');

  const [users, setUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showViewUser, setShowViewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', role: 'user', password: '' });
  const [createErrors, setCreateErrors] = useState({});
  const [createTouched, setCreateTouched] = useState({});
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: 'user' });
  const [employers, setEmployers] = useState([]);
  const [showCreateEmployer, setShowCreateEmployer] = useState(false);
  const [createEmployerForm, setCreateEmployerForm] = useState({ companyName: '', companyEmail: '', contactPersonName: '', phone: '', password: '' });
  const [createEmployerErrors, setCreateEmployerErrors] = useState({});
  const [createEmployerTouched, setCreateEmployerTouched] = useState({});
  const [showViewEmployer, setShowViewEmployer] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);


  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');

  const [showEditEmployer, setShowEditEmployer] = useState(false);
  const [editEmployerForm, setEditEmployerForm] = useState({ companyName: '', companyPhone: '', contactPersonName: '' });
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, search = '', status = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users?page=${page}&search=${search}&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error('Network error occurred');
    }
  };

  const validateCreateForm = () => {
    const errs = {};
    const nameRes = validateName(createForm.name);
    if (!nameRes.isValid) errs.name = nameRes.errors[0];
    const emailRes = validateEmail(createForm.email);
    if (!emailRes.isValid) errs.email = emailRes.errors[0];
    // Phone is optional for admin-created users; validate only if provided
    if (String(createForm.phone || '').trim()) {
      const phoneRes = validatePhone(createForm.phone, { region: 'IN', requireCountryCode: false });
      if (!phoneRes.isValid) errs.phone = phoneRes.errors[0];
    }
    return errs;
  };

  const handleCreateFocus = (field) => {
    setCreateTouched(prev => ({ ...prev, [field]: true }));
    if (!String(createForm[field] || '').trim()) {
      setCreateErrors(prev => ({ ...prev, [field]: 'This field is required' }));
    }
  };

  const handleCreateBlur = (field) => {
    const value = String(createForm[field] || '').trim();
    let message = '';
    if (!value) {
      message = 'This field is required';
    } else {
      if (field === 'name') {
        const r = validateName(value);
        if (!r.isValid) message = r.errors[0];
      } else if (field === 'email') {
        const r = validateEmail(value);
        if (!r.isValid) message = r.errors[0];
      } else if (field === 'phone') {
        const r = validatePhone(value, { region: 'IN', requireCountryCode: false });
        if (!r.isValid) message = r.errors[0];
      }
    }
    setCreateErrors(prev => ({ ...prev, [field]: message }));
  };

  const createUser = async () => {
    const errs = validateCreateForm();
    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      toast.error('Please fix the errors before creating the user');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User created');
        setShowCreateUser(false);
        setCreateForm({ name: '', email: '', phone: '', role: 'user', password: '' });
        setCreateErrors({});
        setCreateTouched({});
        fetchUsers(1, searchTerm, filterStatus);
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (e) {
      console.error('Create user error:', e);
      toast.error('Network error');
    }
  };

  const openEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name || '', phone: user.phone || '', role: user.role || 'user' });
    setShowEditUser(true);
  };

  const openViewUser = (user) => {
    setSelectedUser(user);
    setShowViewUser(true);
  };

  const saveEditUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User updated');
        setShowEditUser(false);
        setSelectedUser(null);
        fetchUsers(currentPage, searchTerm, filterStatus);
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (e) {
      console.error('Edit user error:', e);
      toast.error('Network error');
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}?hard=true`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'User deleted');
        fetchUsers(currentPage, searchTerm, filterStatus);
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (e) {
      console.error('Delete user error:', e);
      toast.error('Network error');
    }
  };

  const fetchEmployers = async (page = 1, search = '', status = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/employers?page=${page}&search=${search}&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployers(data.employers);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        toast.error('Failed to fetch employers');
      }
    } catch (error) {
      console.error('Employers fetch error:', error);
      toast.error('Network error occurred');
    }
  };

  const updateEmployerVerification = async (employerId, payload) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/employers/${employerId}/verification`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Verification updated');
        setEmployers(prev => prev.map(e => e._id === employerId ? { ...e, ...data.employer } : e));
      } else {
        toast.error(data.message || 'Failed to update verification');
      }
    } catch (error) {
      console.error('Update employer verification error:', error);
      toast.error('Network error occurred');
    }
  };


  const fetchJobs = async (page = 1, search = '', status = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/jobs?page=${page}&search=${search}&status=${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        toast.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Jobs fetch error:', error);
      toast.error('Network error occurred');
    }
  };

  const updateUserStatus = async (userId, isActive, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive, reason })
      });

      if (response.ok) {
        toast.success(`User ${isActive ? 'activated' : 'suspended'} successfully`);
        fetchUsers(currentPage, searchTerm, filterStatus);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Update user status error:', error);
      toast.error('Network error occurred');
    }
  };

  const updateEmployerStatus = async (employerId, isApproved, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/employers/${employerId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isApproved, reason })
      });

      if (response.ok) {
        toast.success(`Employer ${isApproved ? 'approved' : 'rejected'} successfully`);
        fetchEmployers(currentPage, searchTerm, filterStatus);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update employer status');
      }
    } catch (error) {
      console.error('Update employer status error:', error);
      toast.error('Network error occurred');
    }
  };

  const openViewEmployer = (employer) => {
    setSelectedEmployer(employer);
    setShowViewEmployer(true);
  };

  const updateEmployerActiveStatus = async (employerId, isActive, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/employers/${employerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive, suspensionReason: !isActive ? reason : undefined })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Employer ${isActive ? 'activated' : 'suspended'} successfully`);
        // Optimistically update row in-place so it doesn't disappear
        setEmployers(prev => prev.map(emp => emp._id === employerId ? { ...emp, isActive } : emp));
      } else {
        toast.error(data.message || 'Failed to update employer status');
      }
    } catch (error) {
      console.error('Update employer active status error:', error);
      toast.error('Network error occurred');
    }
  };

  const validateCreateEmployerForm = () => {
    const errs = {};
    const nameRes = validateName(createEmployerForm.companyName);
    if (!nameRes.isValid) errs.companyName = nameRes.errors[0];
    const contactRes = validateName(createEmployerForm.contactPersonName);
    if (!contactRes.isValid) errs.contactPersonName = contactRes.errors[0];
    const emailRes = validateEmail(createEmployerForm.companyEmail);
    if (!emailRes.isValid) errs.companyEmail = emailRes.errors[0];
    if (String(createEmployerForm.phone || '').trim()) {
      const phoneRes = validatePhone(createEmployerForm.phone, { region: 'IN', requireCountryCode: false });
      if (!phoneRes.isValid) errs.phone = phoneRes.errors[0];
    }
    return errs;
  };

  const handleCreateEmployerFocus = (field) => {
    setCreateEmployerTouched(prev => ({ ...prev, [field]: true }));
    if (!String(createEmployerForm[field] || '').trim() && field !== 'phone' && field !== 'password') {
      setCreateEmployerErrors(prev => ({ ...prev, [field]: 'This field is required' }));
    }
  };

  const handleCreateEmployerBlur = (field) => {
    const value = String(createEmployerForm[field] || '').trim();
    let message = '';
    if (!value && field !== 'phone' && field !== 'password') {
      message = 'This field is required';
    } else {
      if (field === 'companyName' || field === 'contactPersonName') {
        const r = validateName(value);
        if (!r.isValid) message = r.errors[0];
      } else if (field === 'companyEmail') {
        const r = validateEmail(value);
        if (!r.isValid) message = r.errors[0];
      } else if (field === 'phone' && value) {
        const r = validatePhone(value, { region: 'IN', requireCountryCode: false });
        if (!r.isValid) message = r.errors[0];
      }
    }
    setCreateEmployerErrors(prev => ({ ...prev, [field]: message }));
  };

  const updateJobStatus = async (jobId, status, adminNotes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes })
      });

      if (response.ok) {
        toast.success(`Job ${status} successfully`);
        fetchJobs(currentPage, searchTerm, filterStatus);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Update job status error:', error);
      toast.error('Network error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setFilterStatus('');
    setCurrentPage(1);
    
    if (tab === 'users') fetchUsers();
    else if (tab === 'employers') fetchEmployers();
    else if (tab === 'jobs') fetchJobs();

    else if (tab === 'queries') fetchQueries();
  };

  const fetchQueries = async (page = 1, search = '', status = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/queries?page=${page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQueries(data.queries);
        setQueryTotalPages(data.totalPages);
        setQueryPage(data.currentPage);
      } else {
        toast.error('Failed to fetch contact queries');
      }
    } catch (error) {
      console.error('Queries fetch error:', error);
      toast.error('Network error occurred');
    }
  };

  const updateQueryStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/queries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Query updated');
        setQueries(prev => prev.map(q => q._id === id ? data.query : q));
      } else {
        toast.error(data.message || 'Failed to update query');
      }
    } catch (e) {
      console.error('Update query status error:', e);
      toast.error('Network error');
    }
  };

  const openQueryModal = (q) => {
    setSelectedQuery(q);
    setNotesDraft(q.adminNotes || '');
    setShowQueryModal(true);
  };

  const saveQueryNotes = async () => {
    if (!selectedQuery) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/queries/${selectedQuery._id}/notes`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: notesDraft })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Notes saved');
        setQueries(prev => prev.map(q => q._id === selectedQuery._id ? data.query : q));
        setSelectedQuery(data.query);
      } else {
        toast.error(data.message || 'Failed to save notes');
      }
    } catch (e) {
      console.error('Save notes error:', e);
      toast.error('Network error');
    }
  };

  const deleteQuery = async (q) => {
    if (!window.confirm('Delete this query? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/queries/${q._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Query deleted');
        setQueries(prev => prev.filter(x => x._id !== q._id));
        if (selectedQuery && selectedQuery._id === q._id) setShowQueryModal(false);
      } else {
        toast.error(data.message || 'Failed to delete query');
      }
    } catch (e) {
      console.error('Delete query error:', e);
      toast.error('Network error');
    }

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">

              <button
                className="md:hidden mr-3 text-gray-700 border rounded-md px-2 py-1"
                onClick={() => setMobileOpen(true)}
              >
                ☰
              </button>

              <h1 className="text-2xl font-bold text-gray-900">JobZee Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {admin.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <nav className="flex space-x-8 px-6 py-4">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'users', name: 'Users', icon: '👥' },
              { id: 'employers', name: 'Employers', icon: '🏢' },
              { id: 'jobs', name: 'Jobs', icon: '💼' },
              { id: 'analytics', name: 'Analytics', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

=======
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          admin={admin}
        />
        {/* Mobile drawer */}
        <AdminSidebar
          isMobile
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
          admin={admin}
        />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboardData.stats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Employers</p>
                    <p className="text-3xl font-bold text-green-600">{dashboardData.stats.totalEmployers}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                    <p className="text-3xl font-bold text-purple-600">{dashboardData.stats.totalJobs}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-3xl font-bold text-indigo-600">{dashboardData.stats.activeJobs}</p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Jobs</p>
                    <p className="text-3xl font-bold text-yellow-600">{dashboardData.stats.pendingJobs}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected Jobs</p>
                    <p className="text-3xl font-bold text-red-600">{dashboardData.stats.rejectedJobs}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-4">
                  {dashboardData.recentActivity.users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
                <div className="space-y-4">
                  {dashboardData.recentActivity.jobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                        <div className="text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Contact Queries */}
        {activeTab === 'queries' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Queries</h3>
                <button
                  onClick={() => fetchQueries(queryPage, querySearch, queryStatus)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Refresh
                </button>
              </div>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search by name, email, subject..."
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={queryStatus}
                  onChange={(e) => setQueryStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={() => fetchQueries(1, querySearch, queryStatus)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queries.map((q) => (
                    <tr key={q._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{q.name}</div>
                        <div className="text-sm text-gray-500">{q.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{q.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate" title={q.message}>{q.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          q.status === 'resolved' ? 'bg-green-100 text-green-800' : q.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {q.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(q.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {q.status !== 'in_progress' && (
                          <button onClick={() => updateQueryStatus(q._id, 'in_progress')} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">In Progress</button>
                        )}
                        {q.status !== 'resolved' && (
                          <button onClick={() => updateQueryStatus(q._id, 'resolved')} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Resolve</button>
                        )}
                        <button onClick={() => openQueryModal(q)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">View</button>
                        <button onClick={() => deleteQuery(q)} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-gray-600">Page {queryPage} of {queryTotalPages}</div>
              <div className="space-x-2">
                <button
                  disabled={queryPage <= 1}
                  onClick={() => fetchQueries(queryPage - 1, querySearch, queryStatus)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={queryPage >= queryTotalPages}
                  onClick={() => fetchQueries(queryPage + 1, querySearch, queryStatus)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Query Detail Modal */}
        {showQueryModal && selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-xl font-semibold mb-4">Query Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-500">From</div>
                  <div className="font-medium">{selectedQuery.name}</div>
                  <div className="text-sm text-gray-600 break-all">{selectedQuery.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Submitted</div>
                  <div className="font-medium">{new Date(selectedQuery.createdAt).toLocaleString()}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Subject</div>
                  <div className="font-medium">{selectedQuery.subject}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Message</div>
                  <div className="mt-1 p-3 border rounded bg-gray-50 whitespace-pre-wrap">{selectedQuery.message}</div>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">IP</div>
                    <div className="font-medium break-all">{selectedQuery.metadata?.ip || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">User Agent</div>
                    <div className="font-medium break-all">{selectedQuery.metadata?.userAgent || '-'}</div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Origin</div>
                  <div className="font-medium break-all">{selectedQuery.metadata?.origin || '-'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Admin Notes</div>
                    <div>
                      <select
                        value={selectedQuery.status}
                        onChange={(e) => updateQueryStatus(selectedQuery._id, e.target.value)}
                        className="px-3 py-1 border rounded"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <textarea
                    rows={5}
                    className="mt-1 w-full border rounded px-3 py-2"
                    placeholder="Add internal notes..."
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button onClick={() => setShowQueryModal(false)} className="px-4 py-2 rounded border">Close</button>
                <button onClick={saveQueryNotes} className="px-4 py-2 rounded bg-blue-600 text-white">Save Notes</button>
                <button onClick={() => deleteQuery(selectedQuery)} className="px-4 py-2 rounded bg-gray-700 text-white">Delete</button>
              </div>
            </div>
          </div>
        )}


        {/* Create Employer Modal */}
        {showCreateEmployer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Employer</h3>
              <div className="space-y-3">
                <input
                  className={`w-full border px-3 py-2 rounded ${createEmployerErrors.companyName ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Company Name"
                  value={createEmployerForm.companyName}
                  onChange={(e)=>{ setCreateEmployerForm({...createEmployerForm,companyName:e.target.value}); if (createEmployerErrors.companyName) setCreateEmployerErrors(prev=>({...prev,companyName:''})); }}
                  onFocus={()=>handleCreateEmployerFocus('companyName')}
                  onBlur={()=>handleCreateEmployerBlur('companyName')}
                />
                {createEmployerErrors.companyName && <p className="text-red-500 text-sm">{createEmployerErrors.companyName}</p>}
                <input
                  className={`w-full border px-3 py-2 rounded ${createEmployerErrors.companyEmail ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Company Email"
                  value={createEmployerForm.companyEmail}
                  onChange={(e)=>{ setCreateEmployerForm({...createEmployerForm,companyEmail:e.target.value}); if (createEmployerErrors.companyEmail) setCreateEmployerErrors(prev=>({...prev,companyEmail:''})); }}
                  onFocus={()=>handleCreateEmployerFocus('companyEmail')}
                  onBlur={()=>handleCreateEmployerBlur('companyEmail')}
                />
                {createEmployerErrors.companyEmail && <p className="text-red-500 text-sm">{createEmployerErrors.companyEmail}</p>}
                <input
                  className={`w-full border px-3 py-2 rounded ${createEmployerErrors.contactPersonName ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Contact Person Name"
                  value={createEmployerForm.contactPersonName}
                  onChange={(e)=>{ setCreateEmployerForm({...createEmployerForm,contactPersonName:e.target.value}); if (createEmployerErrors.contactPersonName) setCreateEmployerErrors(prev=>({...prev,contactPersonName:''})); }}
                  onFocus={()=>handleCreateEmployerFocus('contactPersonName')}
                  onBlur={()=>handleCreateEmployerBlur('contactPersonName')}
                />
                {createEmployerErrors.contactPersonName && <p className="text-red-500 text-sm">{createEmployerErrors.contactPersonName}</p>}
                <input
                  className={`w-full border px-3 py-2 rounded ${createEmployerErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Phone (optional)"
                  value={createEmployerForm.phone}
                  onChange={(e)=> { setCreateEmployerForm({...createEmployerForm,phone:e.target.value}); if (createEmployerErrors.phone) setCreateEmployerErrors(prev=>({...prev,phone:''})); }}
                  onBlur={()=>handleCreateEmployerBlur('phone')}
                />
                {createEmployerErrors.phone && <p className="text-red-500 text-sm">{createEmployerErrors.phone}</p>}
                <input
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Password (optional)"
                  type="password"
                  value={createEmployerForm.password}
                  onChange={(e)=> setCreateEmployerForm({...createEmployerForm,password:e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={()=>setShowCreateEmployer(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={async ()=>{
                  const errs = validateCreateEmployerForm();
                  setCreateEmployerErrors(errs);
                  if (Object.keys(errs).length>0) return;
                  try {
                    const token = localStorage.getItem('adminToken');
                    const res = await fetch('http://localhost:5000/api/admin/employers', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(createEmployerForm)
                    });
                    const data = await res.json();
                    if (res.ok) {
                      toast.success('Employer created');
                      setShowCreateEmployer(false);
                      setCreateEmployerForm({ companyName: '', companyEmail: '', contactPersonName: '', phone: '', password: '' });
                      fetchEmployers(1, searchTerm, filterStatus);
                    } else {
                      toast.error(data.message || 'Failed to create employer');
                    }
                  } catch (e) {
                    console.error('Create employer error:', e);
                    toast.error('Network error');
                  }
                }} className="px-4 py-2 rounded bg-blue-600 text-white">Create</button>
              </div>
            </div>
          </div>
        )}
        {/* Employers Management */}
        {activeTab === 'employers' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Employer Management</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => fetchEmployers(1, searchTerm, filterStatus)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => { setShowCreateEmployer(true); setCreateEmployerErrors({}); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + New Employer
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search employers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button
                  onClick={() => fetchEmployers(1, searchTerm, filterStatus)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
<<<<<<< HEAD
=======
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
>>>>>>> da4180d (Initial commit)
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employers.map((emp) => (
                    <tr key={emp._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{emp.companyName || emp.name}</div>
                          <div className="text-sm text-gray-500">{emp.companyEmail || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${emp.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {emp.isActive !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
<<<<<<< HEAD
=======
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${emp.isVerified ? 'bg-green-100 text-green-800' : emp.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {emp.isVerified ? 'Verified' : (emp.verificationStatus || 'pending')}
                          </span>
                        </div>
                      </td>
>>>>>>> da4180d (Initial commit)
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openViewEmployer(emp)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setSelectedEmployer(emp); setEditEmployerForm({ companyName: emp.companyName || '', companyPhone: emp.companyPhone || '', contactPersonName: emp.contactPersonName || '' }); setShowEditEmployer(true); }}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
<<<<<<< HEAD
=======
                        {!emp.isVerified && emp.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => updateEmployerVerification(emp._id, { isVerified: true, status: 'verified' })}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Verify
                          </button>
                        )}
                        {emp.isVerified && (
                          <button
                            onClick={() => updateEmployerVerification(emp._id, { isVerified: false, status: 'pending' })}
                            className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                          >
                            Unverify
                          </button>
                        )}
                        {!emp.isVerified && (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for rejection:');
                              if (reason !== null) updateEmployerVerification(emp._id, { status: 'rejected', notes: reason });
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        )}
>>>>>>> da4180d (Initial commit)
                        {emp.isActive !== false ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for suspension:');
                              if (reason !== null) updateEmployerActiveStatus(emp._id, false, reason);
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateEmployerActiveStatus(emp._id, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete employer ${emp.companyName}?`)) return;
                            try {
                              const token = localStorage.getItem('adminToken');
                              const res = await fetch(`http://localhost:5000/api/admin/employers/${emp._id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              const data = await res.json();
                              if (res.ok) {
                                toast.success(data.message || 'Employer deleted');
                                setEmployers(prev => prev.filter(e => e._id !== emp._id));
                              } else {
                                toast.error(data.message || 'Failed to delete employer');
                              }
                            } catch (e) {
                              console.error('Delete employer error:', e);
                              toast.error('Network error');
                            }
                          }}
                          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Employer Modal */}
        {showViewEmployer && selectedEmployer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">Employer Details</h3>
              <div className="space-y-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-500">Company:</div>
                  <div className="font-medium">{selectedEmployer.companyName || selectedEmployer.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email:</div>
                  <div className="font-medium break-all">{selectedEmployer.companyEmail || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone:</div>
                  <div className="font-medium">{selectedEmployer.companyPhone || selectedEmployer.contactPersonPhone || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Status:</div>
                    <div className="font-medium">{selectedEmployer.isApproved ? 'Approved' : selectedEmployer.status === 'rejected' ? 'Rejected' : 'Pending'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Joined:</div>
                    <div className="font-medium">{selectedEmployer.createdAt ? new Date(selectedEmployer.createdAt).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowViewEmployer(false)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employer Modal */}
        {showEditEmployer && selectedEmployer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Employer</h3>
              <div className="space-y-3">
                <input className="w-full border px-3 py-2 rounded" placeholder="Company Name" value={editEmployerForm.companyName} onChange={(e)=>setEditEmployerForm({...editEmployerForm,companyName:e.target.value})} />
                <input className="w-full border px-3 py-2 rounded" placeholder="Company Phone" value={editEmployerForm.companyPhone} onChange={(e)=>setEditEmployerForm({...editEmployerForm,companyPhone:e.target.value})} />
                <input className="w-full border px-3 py-2 rounded" placeholder="Contact Person Name" value={editEmployerForm.contactPersonName} onChange={(e)=>setEditEmployerForm({...editEmployerForm,contactPersonName:e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={()=>setShowEditEmployer(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={async ()=>{
                  try {
                    const token = localStorage.getItem('adminToken');
                    const res = await fetch(`http://localhost:5000/api/admin/employers/${selectedEmployer._id}`, {
                      method: 'PUT',
                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                      body: JSON.stringify(editEmployerForm)
                    });
                    const data = await res.json();
                    if (res.ok) {
                      toast.success('Employer updated');
                      setShowEditEmployer(false);
                      setEmployers(prev => prev.map(e => e._id === selectedEmployer._id ? { ...e, ...editEmployerForm } : e));
                    } else {
                      toast.error(data.message || 'Failed to update employer');
                    }
                  } catch (e) {
                    console.error('Edit employer error:', e);
                    toast.error('Network error');
                  }
                }} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
              </div>
            </div>
          </div>
        )}
        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => fetchUsers(1, searchTerm, filterStatus)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => { setShowCreateUser(true); setCreateErrors({}); setCreateTouched({}); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    + New User
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button
                  onClick={() => fetchUsers(1, searchTerm, filterStatus)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openViewUser(user)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          View
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Reason for suspension:');
                              if (reason) updateUserStatus(user._id, false, reason);
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUserStatus(user._id, true)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => openEditUser(user)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create User</h3>
              <div className="space-y-3">
                <input
                  className={`w-full border px-3 py-2 rounded ${createErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Name"
                  value={createForm.name}
                  onChange={(e)=>{ setCreateForm({...createForm,name:e.target.value}); if (createErrors.name) setCreateErrors(prev=>({...prev,name:''})); }}
                  onFocus={()=>handleCreateFocus('name')}
                  onBlur={()=>handleCreateBlur('name')}
                />
                {createErrors.name && <p className="text-red-500 text-sm">{createErrors.name}</p>}
                <input
                  className={`w-full border px-3 py-2 rounded ${createErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Email"
                  value={createForm.email}
                  onChange={(e)=>{ setCreateForm({...createForm,email:e.target.value}); if (createErrors.email) setCreateErrors(prev=>({...prev,email:''})); }}
                  onFocus={()=>handleCreateFocus('email')}
                  onBlur={()=>handleCreateBlur('email')}
                />
                {createErrors.email && <p className="text-red-500 text-sm">{createErrors.email}</p>}
                <input
                  className={`w-full border px-3 py-2 rounded ${createErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Phone"
                  value={createForm.phone}
                  onChange={(e)=>{ setCreateForm({...createForm,phone:e.target.value}); if (createErrors.phone) setCreateErrors(prev=>({...prev,phone:''})); }}
                  onFocus={()=>handleCreateFocus('phone')}
                  onBlur={()=>handleCreateBlur('phone')}
                />
                {createErrors.phone && <p className="text-red-500 text-sm">{createErrors.phone}</p>}
                <select className="w-full border px-3 py-2 rounded" value={createForm.role} onChange={(e)=>setCreateForm({...createForm,role:e.target.value})}>
                  <option value="user">User</option>
                </select>
                <input className="w-full border px-3 py-2 rounded" placeholder="Password (optional)" type="password" value={createForm.password} onChange={(e)=>setCreateForm({...createForm,password:e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={()=>setShowCreateUser(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={createUser} className="px-4 py-2 rounded bg-blue-600 text-white">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit User</h3>
              <div className="space-y-3">
                <input className="w-full border px-3 py-2 rounded" placeholder="Name" value={editForm.name} onChange={(e)=>setEditForm({...editForm,name:e.target.value})} />
                <input className="w-full border px-3 py-2 rounded" placeholder="Phone" value={editForm.phone} onChange={(e)=>setEditForm({...editForm,phone:e.target.value})} />
                <select className="w-full border px-3 py-2 rounded" value={editForm.role} onChange={(e)=>setEditForm({...editForm,role:e.target.value})}>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={()=>setShowEditUser(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button onClick={saveEditUser} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewUser && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-xl font-semibold mb-4">User Details</h3>
              <div className="space-y-4 text-gray-800">
                <div>
                  <div className="text-sm text-gray-500">Name:</div>
                  <div className="font-medium">{selectedUser.name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email:</div>
                  <div className="font-medium break-all">{selectedUser.email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone:</div>
                  <div className="font-medium">{selectedUser.phone || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Role:</div>
                    <div className="font-medium capitalize">{selectedUser.role || 'user'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status:</div>
                    <div className="font-medium">{selectedUser.isActive ? 'Active' : 'Suspended'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Joined:</div>
                  <div className="font-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '-'}</div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowViewUser(false)} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">Close</button>
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Similar tables for employers and jobs would go here */}
        {/* Add pagination controls */}
=======
        {/* Jobs Management */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Jobs Management</h3>
                <button
                  onClick={() => fetchJobs(1, searchTerm, filterStatus)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Refresh
                </button>
              </div>
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Search by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  onClick={() => fetchJobs(1, searchTerm, filterStatus)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{job.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{job.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{job.jobType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          job.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {job.status === 'pending' && (
                          <>
                            <button onClick={() => updateJobStatus(job._id, 'approved')} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Approve</button>
                            <button onClick={() => updateJobStatus(job._id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
                          </>
                        )}
                        {job.status === 'approved' && (
                          <button onClick={() => updateJobStatus(job._id, 'active')} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Activate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="text-sm text-gray-600">Page {currentPage} of {totalPages}</div>
              <div className="space-x-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => fetchJobs(currentPage - 1, searchTerm, filterStatus)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => fetchJobs(currentPage + 1, searchTerm, filterStatus)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Add pagination controls */}
        </main>
>>>>>>> da4180d (Initial commit)
      </div>
    </div>
  );
};

export default AdminDashboard;
