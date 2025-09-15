import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EmployerPostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employer, setEmployer] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'entry',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    requirements: '',
    benefits: '',
    skills: '',
    remote: 'onsite'
  });

  useEffect(() => {
    const token = localStorage.getItem('employerToken');
    const emp = localStorage.getItem('employer');
    if (!token || !emp) {
      navigate('/employer/login');
      return;
    }
    setEmployer(JSON.parse(emp));
  }, [navigate]);

  const validate = () => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.location.trim()) return 'Location is required';
    if (!form.jobType) return 'Job type is required';
    if (!form.experienceLevel) return 'Experience level is required';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      return 'Salary min cannot be greater than max';
    }
    return '';
  };

  const toArray = (text) => {
    return text
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const token = localStorage.getItem('employerToken');
    if (!token) {
      toast.error('Please login as employer');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      jobType: form.jobType,
      experienceLevel: form.experienceLevel,
      salary: {
        min: form.salaryMin ? Number(form.salaryMin) : undefined,
        max: form.salaryMax ? Number(form.salaryMax) : undefined,
        currency: form.currency || 'USD'
      },
      requirements: toArray(form.requirements),
      benefits: toArray(form.benefits),
      skills: toArray(form.skills),
      remote: form.remote
    };

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/employers/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errorType === 'free_plan_limit_reached') {
          setShowUpgradeModal(true);
        } else {
          toast.error(data.message || 'Failed to create job');
        }
        return;
      }
      toast.success(data.message || 'Job created');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!employer) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-600">Fill in the details below to create a new job post.</p>
          
          {/* Plan Status Indicator */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">Current Plan: Free</span>
              </div>
              <span className="text-sm text-blue-700">1 job posting allowed</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Upgrade to post unlimited jobs and access premium features
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e)=>setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Senior React Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e)=>setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the role, responsibilities, and qualifications"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e)=>setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select
                value={form.remote}
                onChange={(e)=>setForm({ ...form, remote: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select
                value={form.jobType}
                onChange={(e)=>setForm({ ...form, jobType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
              <select
                value={form.experienceLevel}
                onChange={(e)=>setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e)=>setForm({ ...form, currency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="USD"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min</label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={(e)=>setForm({ ...form, salaryMin: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max</label>
              <input
                type="number"
                value={form.salaryMax}
                onChange={(e)=>setForm({ ...form, salaryMax: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 90000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e)=>setForm({ ...form, skills: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (comma separated)</label>
              <input
                type="text"
                value={form.requirements}
                onChange={(e)=>setForm({ ...form, requirements: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="3+ years experience, Strong JS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (comma separated)</label>
              <input
                type="text"
                value={form.benefits}
                onChange={(e)=>setForm({ ...form, benefits: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Health insurance, Remote stipend"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/employer/dashboard')}
              className="px-4 py-2 rounded border"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Job'}
            </button>
          </div>
        </form>
      </div>

      {/* Upgrade Plan Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Plan Limit Reached</h3>
              <p className="text-gray-600 mb-6">
                Your free plan allows only 1 job posting. To post more jobs and unlock additional features, please upgrade your plan.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    // Navigate to upgrade page or contact support
                    toast.info('Please contact support to upgrade your plan');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upgrade Plan
                </button>
                
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerPostJob;
