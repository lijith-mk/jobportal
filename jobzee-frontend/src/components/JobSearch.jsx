import React, { useState, useEffect } from "react";

<<<<<<< HEAD
=======
import { toast } from 'react-toastify';

>>>>>>> da4180d (Initial commit)
const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [animate, setAnimate] = useState(false);
<<<<<<< HEAD

  useEffect(() => {
    setAnimate(true);
  }, []);

=======
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [applyingJobs, setApplyingJobs] = useState(new Set());
  const [savingJobs, setSavingJobs] = useState(new Set());

  useEffect(() => {
    setAnimate(true);
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/jobs');
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs);
        // Check application status for each job
        checkApplicationStatuses(data.jobs);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatuses = async (jobsList) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const appliedSet = new Set();
    const savedSet = new Set();

    // Check application status and saved status for each job
    for (const job of jobsList) {
      try {
        // Check application status
        const appResponse = await fetch(`http://localhost:5000/api/jobs/${job._id}/application-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (appResponse.ok) {
          const appData = await appResponse.json();
          if (appData.hasApplied) {
            appliedSet.add(job._id);
          }
        }

        // Check saved status
        const savedResponse = await fetch(`http://localhost:5000/api/saved-jobs/${job._id}/saved-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          if (savedData.isSaved) {
            savedSet.add(job._id);
          }
        }
      } catch (error) {
        console.error(`Error checking status for job ${job._id}:`, error);
      }
    }

    setAppliedJobs(appliedSet);
    setSavedJobs(savedSet);
  };

  const handleQuickApply = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to apply for jobs');
      return;
    }

    setApplyingJobs(prev => new Set([...prev, jobId]));

    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/quick-apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Application submitted successfully! 🎉');
        setAppliedJobs(prev => new Set([...prev, jobId]));
      } else {
        if (data.requiresResume) {
          toast.error('Please upload your resume before applying to jobs');
        } else {
          toast.error(data.message || 'Failed to apply for job');
        }
      }
    } catch (error) {
      console.error('Quick apply error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleSaveJob = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save jobs');
      return;
    }

    const isCurrentlySaved = savedJobs.has(jobId);
    setSavingJobs(prev => new Set([...prev, jobId]));

    try {
      const url = `http://localhost:5000/api/saved-jobs/${jobId}/save`;
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        if (isCurrentlySaved) {
          toast.success('Job removed from saved jobs');
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
        } else {
          toast.success('Job saved successfully! 💾');
          setSavedJobs(prev => new Set([...prev, jobId]));
        }
      } else {
        toast.error(data.message || 'Failed to save job');
      }
    } catch (error) {
      console.error('Save job error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSavingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

>>>>>>> da4180d (Initial commit)
  const categories = [
    { id: "tech", name: "Technology", icon: "💻", color: "from-blue-500 to-blue-600" },
    { id: "design", name: "Design", icon: "🎨", color: "from-purple-500 to-purple-600" },
    { id: "marketing", name: "Marketing", icon: "📈", color: "from-green-500 to-green-600" },
    { id: "sales", name: "Sales", icon: "💰", color: "from-yellow-500 to-yellow-600" },
    { id: "hr", name: "Human Resources", icon: "👥", color: "from-pink-500 to-pink-600" },
    { id: "finance", name: "Finance", icon: "📊", color: "from-indigo-500 to-indigo-600" },
  ];

<<<<<<< HEAD
  const featuredJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechCorp Inc.",
      location: "New York, NY",
      salary: "$120k - $150k",
      type: "Full-time",
      posted: "2 days ago",
      logo: "🏢",
      category: "tech",
      description: "We're looking for an experienced React developer to join our team and help build amazing user experiences.",
      skills: ["React", "TypeScript", "Node.js", "AWS"],
      urgent: true
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Design Studio",
      location: "San Francisco, CA",
      salary: "$90k - $120k",
      type: "Full-time",
      posted: "1 week ago",
      logo: "🎨",
      category: "design",
      description: "Join our creative team and help design beautiful, user-friendly interfaces for our products.",
      skills: ["Figma", "Sketch", "Adobe Creative Suite", "Prototyping"],
      urgent: false
    },
    {
      id: 3,
      title: "Digital Marketing Manager",
      company: "GrowthCo",
      location: "Remote",
      salary: "$80k - $100k",
      type: "Full-time",
      posted: "3 days ago",
      logo: "📈",
      category: "marketing",
      description: "Lead our digital marketing efforts and drive growth through innovative campaigns.",
      skills: ["Google Ads", "Facebook Ads", "SEO", "Analytics"],
      urgent: true
    },
    {
      id: 4,
      title: "Sales Representative",
      company: "SalesForce",
      location: "Chicago, IL",
      salary: "$60k - $80k + Commission",
      type: "Full-time",
      posted: "5 days ago",
      logo: "💰",
      category: "sales",
      description: "Join our sales team and help grow our customer base through relationship building.",
      skills: ["Sales", "CRM", "Negotiation", "Communication"],
      urgent: false
    }
  ];

  const filteredJobs = featuredJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
=======
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesCategory = !selectedCategory || job.jobType === selectedCategory;
>>>>>>> da4180d (Initial commit)
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

<<<<<<< HEAD
=======
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `${salary.currency || 'USD'} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) return `${salary.currency || 'USD'} ${salary.min.toLocaleString()}+`;
    if (salary.max) return `Up to ${salary.currency || 'USD'} ${salary.max.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

>>>>>>> da4180d (Initial commit)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className={`text-center mb-12 ${animate ? 'animate-fade-in-down' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 gradient-text">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover thousands of job opportunities with all the information you need. Its your future.
          </p>
        </div>

        {/* Search Form */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-12 ${animate ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover-lift">
              Search Jobs
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === "" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} text-white` 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Job Results */}
        <div className={`${animate ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
<<<<<<< HEAD
              {filteredJobs.length} Jobs Found
=======
              {loading ? 'Loading jobs...' : `${filteredJobs.length} Jobs Found`}
>>>>>>> da4180d (Initial commit)
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Most Recent</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
                <option>Company Name</option>
              </select>
            </div>
          </div>

<<<<<<< HEAD
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className={`bg-white rounded-xl shadow-lg p-6 hover-lift transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                      {job.logo}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                  </div>
                  {job.urgent && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                      Urgent
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4">{job.description}</p>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {job.salary}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Posted {job.posted}</span>
                  <div className="flex space-x-2">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Save
                    </button>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
=======
          {loading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading jobs...</h3>
              <p className="text-gray-600">Please wait while we fetch the latest job listings</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading jobs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchJobs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job, index) => (
                <div
                  key={job._id}
                  className={`bg-white rounded-xl shadow-lg p-6 hover-lift transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                        {job.employer?.companyLogo ? (
                          <img 
                            src={job.employer.companyLogo} 
                            alt={job.company}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {job.company.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    {job.isPromoted && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {job.description.length > 150 
                      ? `${job.description.substring(0, 150)}...` 
                      : job.description
                    }
                  </p>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {formatSalary(job.salary)}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                    </span>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 4).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Posted {formatDate(job.createdAt)}</span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleSaveJob(job._id)}
                        disabled={savingJobs.has(job._id)}
                        className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          savedJobs.has(job._id)
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        } ${savingJobs.has(job._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {savingJobs.has(job._id) ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span>{savedJobs.has(job._id) ? 'Saved' : 'Save'}</span>
                          </>
                        )}
                      </button>
                      
                      {appliedJobs.has(job._id) ? (
                        <button 
                          disabled
                          className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed flex items-center space-x-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Applied</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleQuickApply(job._id)}
                          disabled={applyingJobs.has(job._id)}
                          className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift flex items-center space-x-1 ${
                            applyingJobs.has(job._id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {applyingJobs.has(job._id) ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Applying...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Quick Apply</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
>>>>>>> da4180d (Initial commit)
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all jobs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch; 