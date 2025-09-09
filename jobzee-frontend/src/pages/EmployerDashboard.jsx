import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [employer, setEmployer] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [animate, setAnimate] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const employerData = localStorage.getItem("employer");
    const token = localStorage.getItem("employerToken");
    
    if (!employerData || !token) {
      navigate("/employer/login");
      return;
    }

    setEmployer(JSON.parse(employerData));
    fetchDashboardStats(token);
    setAnimate(true);
  }, [navigate]);

  const fetchDashboardStats = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/employers/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      } else {
        console.error("Failed to fetch dashboard stats");
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("employerToken");
    localStorage.removeItem("employer");
    toast.success("Logged out successfully");
    setTimeout(() => {
      navigate("/employer/login");
    }, 1000);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionColor = (plan) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-large mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!employer || !stats) return null;

  const dashboardStats = [
    { 
      title: "Active Job Posts", 
      value: stats.jobPostingsUsed?.toString() || "0", 
      icon: "💼", 
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: `${stats.remainingJobPosts || 0} remaining`,
      change: "+3%"
    },
    { 
      title: "Total Applications", 
      value: stats.totalApplicationsReceived?.toString() || "0", 
      icon: "📋", 
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+12 this week",
      change: "+12%"
    },
    { 
      title: "Profile Views", 
      value: stats.profileViews?.toString() || "0", 
      icon: "👁️", 
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      trend: "+5 this week",
      change: "+5%"
    },
    { 
      title: "Hired Candidates", 
      value: stats.totalJobPosts?.toString() || "0", 
      icon: "🎯", 
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      trend: "All time",
      change: "+2%"
    }
  ];

  const notifications = [
    {
      id: 1,
      title: "New application received",
      message: "John Doe applied for Senior React Developer position",
      time: "5 mins ago",
      unread: true
    },
    {
      id: 2,
      title: "Job post approval",
      message: "Your Frontend Developer job post has been approved and is now live",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      title: "Profile verification",
      message: "Your company profile verification is complete",
      time: "2 hours ago",
      unread: false
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "application",
      message: "New application for Senior Developer position",
      time: "2 hours ago",
      icon: "📝",
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "view",
      message: "Company profile viewed by 3 candidates",
      time: "4 hours ago", 
      icon: "👀",
      color: "text-green-600"
    },
    {
      id: 3,
      type: "job_post",
      message: "Job post 'Frontend Developer' is trending",
      time: "1 day ago",
      icon: "🔥",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Professional Header - Indeed/Naukri Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Company Badge */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">JobZee</h1>
                  <p className="text-xs text-gray-500 -mt-1">Employer Dashboard</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">For Employers</span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(stats.verificationStatus)}`}>
                  {stats.isVerified ? '✓ Verified' : 'Pending'}
                </div>
              </div>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Subscription Plan Badge */}
              <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionColor(stats.subscriptionPlan)}`}>
                {stats.subscriptionPlan.charAt(0).toUpperCase() + stats.subscriptionPlan.slice(1)} Plan
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zm-8.5-9.5a3.5 3.5 0 117 0v9a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-9zM13 7.5V6a3 3 0 00-6 0v1.5" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">3</span>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${notification.unread ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Company Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{employer.companyName}</p>
                  <p className="text-xs text-gray-500">Employer Dashboard</p>
                </div>
                <div className="relative group">
                  {employer.companyLogo ? (
                    <img 
                      src={employer.companyLogo}
                      alt="Company Logo"
                      className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer group-hover:border-blue-300 transition-all duration-200 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer group-hover:shadow-lg transition-all">
                      {employer.companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{employer.companyName}</p>
                      <p className="text-sm text-gray-600">{employer.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/employer/profile" className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Company Profile</span>
                      </Link>
                      <Link to="/employer/settings" className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Hero Section - Indeed Style */}
        <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 ${animate ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 relative">
            {/* Professional background pattern */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-blue-600 opacity-90"></div>
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="employer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#employer-grid)"/>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
              <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    {employer.companyLogo ? (
                      <img 
                        src={employer.companyLogo}
                        alt="Company Logo"
                        className="w-12 h-12 rounded-lg border-2 border-white/50 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                        {employer.companyName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      Welcome, {employer.companyName}!
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Ready to find your next great hire?
                    </p>
                  </div>
                </div>
                
                <div className="max-w-2xl mx-auto lg:mx-0">
                  <p className="text-xl text-blue-50 mb-8 leading-relaxed">
                    Post jobs, review applications, and connect with top talent. Manage your entire recruitment process in one place.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link
                      to="/employer/post-job"
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Post New Job</span>
                    </Link>
                    <Link
                      to="/employer/candidates"
                      className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Browse Candidates</span>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Professional illustration */}
              <div className="hidden xl:block">
                <div className="relative">
                  <div className="w-48 h-48 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center&auto=format&q=80"
                      alt="Professional workplace"
                      className="w-40 h-40 rounded-xl object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-xl shadow-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -top-4 -left-4 bg-white text-blue-600 px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                    {stats.subscriptionPlan.charAt(0).toUpperCase() + stats.subscriptionPlan.slice(1)} Plan
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Grid - Indeed Style */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${animate ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group cursor-pointer"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center text-2xl ${stat.iconColor}`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 ${
          animate ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'
        }`}>
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover-lift">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 hover-lift font-medium">
                📝 Post New Job
              </button>
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-4 rounded-lg transition duration-200 hover-lift font-medium">
                👥 View Applications
              </button>
              <Link
                to="/employer/profile"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition duration-200 hover-lift block text-center font-medium"
              >
                🏢 Update Company Profile
              </Link>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover-lift">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Subscription Status
            </h3>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Job Posts Used</span>
                <span className="text-sm">{stats.jobPostingsUsed}/{stats.jobPostingLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${(stats.jobPostingsUsed / stats.jobPostingLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSubscriptionColor(stats.subscriptionPlan)}`}>
                  {stats.subscriptionPlan.charAt(0).toUpperCase() + stats.subscriptionPlan.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${stats.hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {stats.hasActiveSubscription ? 'Active' : 'Expired'}
                </span>
              </div>
            </div>
            {stats.subscriptionPlan === 'free' && (
              <button className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg transition duration-200 text-sm font-medium">
                Upgrade Plan
              </button>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover-lift">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${activity.color}`}>{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Job Posts Overview */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
          animate ? 'animate-fade-in-up animation-delay-800' : 'opacity-0'
        }`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
              </svg>
              Recent Job Posts
            </h3>
          </div>
          <div className="p-6">
            {stats.totalJobPosts > 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Job Posts</h4>
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet. Start by creating your first job post.</p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover-lift">
                  Create First Job Post
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to hire?</h4>
                <p className="text-gray-600 mb-4">Post your first job and start receiving applications from qualified candidates.</p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover-lift">
                  Post Your First Job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-up">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout from your employer dashboard?</p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
