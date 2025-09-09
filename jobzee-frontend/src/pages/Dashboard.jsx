import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getDashboardAssets, getDashboardBackgrounds, handleImageErrorEnhanced } from '../services/dashboardAssets';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [animate, setAnimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState({ percentage: 85, items: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [dashboardAssets, setDashboardAssets] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    setAnimate(true);
    
    // Load profile data and calculate completion
    loadProfileData();
    
    // Load dashboard assets
    loadDashboardAssets();
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [navigate]);

  // Load enhanced dashboard assets from MongoDB
  const loadDashboardAssets = async () => {
    try {
      // Try to get enhanced assets first
      const enhancedAssets = await getDashboardAssets();
      
      // Convert to legacy format for backward compatibility
      const legacyFormat = {
        backgrounds: {},
        gradients: {}
      };
      
      // Map enhanced assets to legacy format
      Object.keys(enhancedAssets.backgrounds || {}).forEach(category => {
        const asset = enhancedAssets.backgrounds[category];
        legacyFormat.backgrounds[category] = asset.url;
        legacyFormat.gradients[category] = {
          gradient: enhancedAssets.fallbacks[category]?.gradient || `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          overlay: `bg-gradient-to-br from-black/30 to-black/50`,
          color: enhancedAssets.metadata[category]?.color || '#3B82F6'
        };
      });
      
      setDashboardAssets(legacyFormat);
      console.log('✅ Enhanced dashboard assets loaded successfully!');
    } catch (error) {
      console.error('Failed to load enhanced dashboard assets:', error);
      
      // Fallback to legacy method
      try {
        const legacyAssets = await getDashboardBackgrounds();
        setDashboardAssets(legacyAssets);
        console.log('✅ Fallback dashboard assets loaded successfully!');
      } catch (fallbackError) {
        console.error('Failed to load fallback dashboard assets:', fallbackError);
        // Use hardcoded fallbacks
        setDashboardAssets({
          backgrounds: null,
          gradients: {
            applications: {
              gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
              overlay: 'from-blue-900/85 to-blue-800/90',
              color: '#3B82F6'
            },
            interviews: {
              gradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
              overlay: 'from-emerald-900/85 to-emerald-800/90',
              color: '#10B981'
            },
            profileViews: {
              gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700',
              overlay: 'from-indigo-900/85 to-indigo-800/90',
              color: '#8B5CF6'
            },
            savedJobs: {
              gradient: 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700',
              overlay: 'from-amber-900/85 to-amber-800/90',
              color: '#F59E0B'
            }
          }
        });
        console.log('✅ Hardcoded fallback assets loaded!');
      }
    }
  };

  // Function to calculate profile completion
  const calculateProfileCompletion = (profileData) => {
    const profileFields = [
      { key: 'name', label: 'Full Name', weight: 10 },
      { key: 'title', label: 'Professional Title', weight: 10 },
      { key: 'phone', label: 'Phone Number', weight: 8 },
      { key: 'location', label: 'Location', weight: 8 },
      { key: 'bio', label: 'Professional Bio', weight: 12 },
      { key: 'skills', label: 'Skills', weight: 15 },
      { key: 'languages', label: 'Languages', weight: 8 },
      { key: 'experience', label: 'Experience Level', weight: 10 },
      { key: 'profilePicture', label: 'Profile Picture', weight: 7 },
      { key: 'expectedSalary', label: 'Expected Salary', weight: 8 },
      { key: 'remotePreference', label: 'Remote Preference', weight: 4 }
    ];

    let completedWeight = 0;
    const completedItems = [];
    const incompleteItems = [];

    profileFields.forEach(field => {
      const value = profileData[field.key];
      let isComplete = false;

      if (field.key === 'skills' || field.key === 'languages') {
        isComplete = Array.isArray(value) && value.length > 0;
      } else if (field.key === 'expectedSalary') {
        isComplete = value && (value.min || value.max);
      } else if (field.key === 'profilePicture') {
        isComplete = value && value.trim() !== '';
      } else {
        isComplete = value && value.toString().trim() !== '';
      }

      if (isComplete) {
        completedWeight += field.weight;
        completedItems.push({ label: field.label, completed: true });
      } else {
        incompleteItems.push({ label: field.label, completed: false });
      }
    });

    // Add resume upload check
    const hasResume = profileData?.resume && profileData.resume.trim() !== '';
    if (hasResume) {
      completedWeight += 8;
      completedItems.push({ label: 'Resume Uploaded', completed: true });
    } else {
      incompleteItems.push({ label: 'Resume Uploaded', completed: false });
    }

    const percentage = Math.min(100, Math.round(completedWeight));
    return {
      percentage,
      items: [...completedItems, ...incompleteItems]
    };
  };

  // Function to load profile data
  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await fetch(`http://localhost:5000/api/auth/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        const profileData = {
          name: data.user.name || '',
          title: data.user.title || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
          bio: data.user.bio || '',
          skills: data.user.skills || [],
          languages: data.user.languages || [],
          experience: data.user.experience || '',
          profilePicture: data.user.profilePhoto || '',
          expectedSalary: {
            min: data.user.expectedSalary?.min || '',
            max: data.user.expectedSalary?.max || ''
          },
          remotePreference: data.user.remotePreference || '',
          resume: data.user.resume || ''
        };
        const completion = calculateProfileCompletion(profileData);
        setProfileCompletion(completion);
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Create enhanced dashboard stats with Cloudinary images
  const getJobStats = () => {
    const baseStats = [
      { 
        id: "applications",
        title: "Applications Sent", 
        value: "24", 
        change: "+18%", 
        changeType: "positive",
        description: "Job applications submitted this month",
        icon: "📝",
        iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        backgroundImage: "https://res.cloudinary.com/dxspcarx8/image/upload/v1756236764/desones_vkv4fh.pnghttps://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80"
      },
      { 
        id: "interviews",
        title: "Interview Invites", 
        value: "7", 
        change: "+12%", 
        changeType: "positive",
        description: "Interview opportunities this month",
        icon: "🎯",
        iconPath: "M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4",
        backgroundImage: "https://res.cloudinary.com/dxspcarx8/image/upload/v1756236776/destwos_ub4yxy.png"
      },
      { 
        id: "profileViews",
        title: "Profile Views", 
        value: "156", 
        change: "+24%", 
        changeType: "positive",
        description: "Employers viewed your profile",
        icon: "👁️",
        iconPath: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
        backgroundImage: "https://res.cloudinary.com/dxspcarx8/image/upload/v1756236921/desthrees_yqomx3.png"
      },
      { 
        id: "savedJobs",
        title: "Saved Jobs", 
        value: "32", 
        change: "+8%", 
        changeType: "positive",
        description: "Jobs saved for future reference",
        icon: "❤️",
        iconPath: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z",
        backgroundImage: "https://res.cloudinary.com/dxspcarx8/image/upload/v1756236931/desfourss_hklwst.png"
      },
    ];

    // If dashboard assets are loaded, use Cloudinary images, otherwise use direct URLs
    return baseStats.map(stat => ({
      ...stat,
      backgroundImage: dashboardAssets?.backgrounds?.[stat.id] || stat.backgroundImage,
      fallbackGradient: dashboardAssets?.gradients?.[stat.id]?.gradient || `bg-gradient-to-br from-${stat.id === 'applications' ? 'blue' : stat.id === 'interviews' ? 'emerald' : stat.id === 'profileViews' ? 'indigo' : 'amber'}-500 to-${stat.id === 'applications' ? 'blue' : stat.id === 'interviews' ? 'emerald' : stat.id === 'profileViews' ? 'indigo' : 'amber'}-700`,
      gradientOverlay: dashboardAssets?.gradients?.[stat.id]?.overlay || `from-${stat.id === 'applications' ? 'blue' : stat.id === 'interviews' ? 'emerald' : stat.id === 'profileViews' ? 'indigo' : 'amber'}-900/85 to-${stat.id === 'applications' ? 'blue' : stat.id === 'interviews' ? 'emerald' : stat.id === 'profileViews' ? 'indigo' : 'amber'}-800/90`
    }));
  };

  const jobStats = getJobStats();

  const notifications = [
    {
      id: 1,
      title: "New job match found!",
      message: "Senior React Developer at Google matches your profile",
      time: "2 mins ago",
      type: "job_match",
      unread: true
    },
    {
      id: 2,
      title: "Interview reminder",
      message: "Product Designer interview at Microsoft tomorrow at 2 PM",
      time: "1 hour ago",
      type: "interview",
      unread: true
    },
    {
      id: 3,
      title: "Application status updated",
      message: "Your application for DevOps Engineer has been reviewed",
      time: "3 hours ago",
      type: "status",
      unread: false
    }
  ];

  const recentJobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      company: "Microsoft",
      location: "Seattle, WA",
      salary: "$140k - $180k",
      type: "Full-time",
      status: "Applied",
      date: "2 days ago",
      logo: "https://img.icons8.com/fluency/48/microsoft.png",
      skills: ["React", "Node.js", "TypeScript"],
      remote: true
    },
    {
      id: 2,
      title: "Product Designer",
      company: "Google",
      location: "Mountain View, CA",
      salary: "$120k - $160k",
      type: "Full-time",
      status: "Interview",
      date: "1 day ago",
      logo: "https://img.icons8.com/fluency/48/google-logo.png",
      skills: ["Figma", "UI/UX", "Prototyping"],
      remote: false
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "Amazon",
      location: "Austin, TX",
      salary: "$130k - $170k",
      type: "Full-time",
      status: "Saved",
      date: "3 days ago",
      logo: "https://img.icons8.com/color/48/amazon.png",
      skills: ["AWS", "Kubernetes", "Docker"],
      remote: true
    },
    {
      id: 4,
      title: "Frontend Developer",
      company: "Netflix",
      location: "Los Gatos, CA",
      salary: "$110k - $150k",
      type: "Contract",
      status: "Applied",
      date: "5 days ago",
      logo: "https://img.icons8.com/color/48/netflix.png",
      skills: ["Vue.js", "SASS", "JavaScript"],
      remote: true
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Professional Header - Indeed/Naukri Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">JobZee</h1>
                  <p className="text-xs text-gray-500 -mt-1">Find your dream job</p>
                </div>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              
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
              
              {/* Profile Dropdown */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">User Dashboard</p>
                </div>
                <div className="relative group">
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-gray-200 cursor-pointer group-hover:border-blue-300 transition-all duration-200 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 cursor-pointer group-hover:border-blue-300 transition-all duration-200 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                      </Link>
                      <Link to="/my-applications" className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>My Applications</span>
                      </Link>
                      <Link to="/saved-jobs" className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Saved Jobs</span>
                      </Link>
                      <Link to="/settings" className="flex items-center space-x-3 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
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
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"/>
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
              <div className="flex-1 text-center lg:text-left mb-8 lg:mb-0">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    {user.profilePhoto ? (
                      <img 
                        src={user.profilePhoto}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-white/50 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-white/50 bg-white/20 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      Welcome, {user.name.split(' ')[0]}!
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Ready to take the next step in your career?
                    </p>
                  </div>
                </div>
                
                <div className="max-w-2xl mx-auto lg:mx-0">
                  <p className="text-xl text-blue-50 mb-8 leading-relaxed">
                    Explore personalized job recommendations, track your applications, and connect with top employers.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link
                      to="/jobs"
                      className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search Jobs</span>
                    </Link>
                    <button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Resume</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Professional illustration */}
              <div className="hidden xl:block">
                <div className="relative">
                  <div className="w-48 h-48 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/dxspcarx8/image/upload/v1756236090/desten_notf9n.png"
                      alt="Professional workspace"
                      className="w-40 h-40 rounded-xl object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-3 rounded-xl shadow-lg">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute -top-4 -left-4 bg-white text-blue-600 px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                    Profile {profileCompletion.percentage}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Grid - Enhanced with Cloudinary */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${animate ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
          {jobStats.map((stat, index) => (
            <div
              key={stat.id}
              className="group relative rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-translate-y-1"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Enhanced Background with Image/Gradient */}
              <div className="absolute inset-0">
                {stat.backgroundImage ? (
                  <>
                    <img 
                      src={stat.backgroundImage}
                      alt={stat.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        // Hide image and show gradient fallback
                        e.target.style.display = 'none';
                        const fallbackElement = e.target.nextElementSibling;
                        if (fallbackElement) {
                          fallbackElement.classList.remove('hidden');
                        }
                      }}
                      onLoad={(e) => {
                        // Ensure image is visible when loaded
                        e.target.style.display = 'block';
                      }}
                    />
                    {/* Gradient Fallback */}
                    <div className={`hidden w-full h-full ${stat.fallbackGradient}`}></div>
                    {/* Dark Overlay for Text Readability */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientOverlay} group-hover:opacity-90 transition-opacity duration-300`}></div>
                  </>
                ) : (
                  /* Pure Gradient Background */
                  <>
                    <div className={`w-full h-full ${stat.fallbackGradient}`}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 group-hover:opacity-90 transition-opacity duration-300"></div>
                  </>
                )}
              </div>
              
              {/* Content with Enhanced Styling */}
              <div className="relative z-10 p-6 h-40 flex flex-col justify-between">
                {/* Header with Change Indicator */}
                <div className="flex items-center justify-between mb-auto">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-bold text-white">{stat.change}</span>
                  </div>
                  <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white/90 tracking-wide uppercase">{stat.title}</h3>
                  <p className="text-4xl font-bold text-white leading-none group-hover:text-white transition-colors duration-300">{stat.value}</p>
                  <p className="text-xs text-white/80 font-medium">{stat.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-white/70">Last 30 days</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Subtle Border Effect */}
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 ${
          animate ? 'animate-fade-in-up animation-delay-600' : 'opacity-0'
        }`}>
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-4">
              <Link
                to="/jobs"
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Find Jobs</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              
              <button className="group flex items-center justify-between w-full p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Upload Resume</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Profile Strength</h3>
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white opacity-90">Completion</span>
                  <span className="font-bold text-2xl">{profileCompletion.percentage}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div className="bg-white h-3 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion.percentage}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-3">
                {profileCompletion.items.slice(0, 3).map((item, index) => (
                  <div key={index} className={`flex items-center justify-between text-sm ${item.completed ? '' : 'opacity-60'}`}>
                    <span className={item.completed ? 'opacity-90' : ''}>{item.label}</span>
                    {item.completed ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    )}
                  </div>
                ))}
                {profileCompletion.items.length > 3 && (
                  <div className="text-sm opacity-75 text-center pt-2">
                    +{profileCompletion.items.length - 3} more items
                  </div>
                )}
              </div>
              
              {/* Complete Profile Button */}
              {(profileCompletion.percentage < 100 || user?.onboardingSkipped) && (
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    {user?.onboardingSkipped ? 'Complete Your Profile' : 'Improve Profile'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interview Tracker */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upcoming Interviews</h3>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                <img 
                  src="https://img.icons8.com/fluency/32/google-logo.png" 
                  alt="Google" 
                  className="w-8 h-8 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Google</p>
                  <p className="text-sm text-gray-600">Product Designer</p>
                  <p className="text-xs text-orange-600 font-medium">Tomorrow, 2:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <img 
                  src="https://img.icons8.com/color/32/amazon.png" 
                  alt="Amazon" 
                  className="w-8 h-8 rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Amazon</p>
                  <p className="text-sm text-gray-600">DevOps Engineer</p>
                  <p className="text-xs text-gray-500">Friday, 10:00 AM</p>
                </div>
              </div>
              
              <button className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                View All Interviews
              </button>
            </div>
          </div>
        </div>

        {/* Modern Job Applications Section */}
        <div className={`bg-white rounded-2xl shadow-lg border-0 overflow-hidden ${
          animate ? 'animate-fade-in-up animation-delay-800' : 'opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your Job Applications</h3>
                  <p className="text-sm text-gray-600">Track your recent applications and their status</p>
                </div>
              </div>
              <Link 
                to="/applications"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentJobs.map((job, index) => (
              <div key={job.id} className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group cursor-pointer`} style={{ animationDelay: `${1000 + index * 200}ms` }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img 
                          src={job.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=3b82f6&color=fff&size=64`}
                          alt={job.company}
                          className="w-14 h-14 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=3b82f6&color=fff&size=64`;
                          }}
                        />
                        {job.remote && (
                          <div className="absolute -top-1 -right-1 bg-green-400 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            Remote
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{job.title}</h4>
                            <p className="text-gray-600 font-medium">{job.company}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{job.location}</span>
                              </span>
                              
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                <span className="font-semibold text-gray-700">{job.salary}</span>
                              </span>
                              
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{job.type}</span>
                              </span>
                            </div>
                            
                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.skills.map((skill, skillIndex) => (
                                <span key={skillIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${
                        job.status === "Applied" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        job.status === "Saved" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        job.status === "Interview" ? "bg-green-50 text-green-700 border-green-200" :
                        "bg-gray-50 text-gray-700 border-gray-200"
                      }`}>
                        {job.status === "Interview" ? "🎯 Interview" : 
                         job.status === "Applied" ? "✉️ Applied" : 
                         job.status === "Saved" ? "❤️ Saved" : job.status}
                      </span>
                      
                      <div className="group/menu relative">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">View Details</button>
                          <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Save Job</button>
                          <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg">Remove</button>
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-sm text-gray-500 font-medium">{job.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Showing 4 of 24 applications</p>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-white transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-lg">1</span>
                <span className="px-3 py-1 hover:bg-white text-sm text-gray-600 rounded-lg cursor-pointer transition-colors">2</span>
                <span className="px-3 py-1 hover:bg-white text-sm text-gray-600 rounded-lg cursor-pointer transition-colors">3</span>
                <button className="p-2 rounded-lg hover:bg-white transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
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
              <p className="text-gray-600 mb-6">Are you sure you want to logout? You'll be redirected to the home page.</p>
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

export default Dashboard; 