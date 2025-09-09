import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sessionManager from "./utils/sessionManager";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import HomeModern from "./pages/HomeModern"; // Ultra-modern version
import About from "./pages/About";
import Contact from "./pages/Contact";
import PageNotFound from "./pages/PageNotFound";
import Dashboard from "./pages/Dashboard";

import Register from "./components/Register";
import Login from "./components/Login";
import JobSearch from "./components/JobSearch";
import Onboarding from "./components/Onboarding";
import UserProfile from "./components/UserProfile";
import EmployerRegister from "./components/EmployerRegister";
import EmployerLogin from "./components/EmployerLogin";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import EmployerForgotPassword from "./components/EmployerForgotPassword";
import EmployerResetPassword from "./components/EmployerResetPassword";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerProfile from "./components/EmployerProfile";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  // Initialize session manager and handle auto-logout
  useEffect(() => {
    // Check session on app load
    if (!sessionManager.isLoggedIn()) {
      // Clear any stale data
      sessionManager.clearSession();
    }

    // Add click outside functionality for dropdowns
    const handleClickOutside = (event) => {
      // Close any open dropdowns when clicking outside
      const dropdowns = document.querySelectorAll('[data-dropdown]');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
          const closeEvent = new CustomEvent('closeDropdown');
          dropdown.dispatchEvent(closeEvent);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeModern />} />
          <Route path="/home-classic" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobSearch />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/user-profile" element={<UserProfile />} />
          
          {/* User Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Employer Routes */}
          <Route path="/employer/register" element={<EmployerRegister />} />
          <Route path="/employer/login" element={<EmployerLogin />} />
          <Route path="/employer/forgot-password" element={<EmployerForgotPassword />} />
          <Route path="/employer/reset-password/:token" element={<EmployerResetPassword />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        
        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Layout>
    </Router>
  );
}

export default App;
