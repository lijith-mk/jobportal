import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { validateEmail, validatePhone, validatePassword, validateZipCode, normalizeCountryToISO, getZipExampleForCountry, validateName } from '../utils/validationUtils';

const EmployerRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  const [formData, setFormData] = useState({
    // Company Basic Info
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    password: "",
    confirmPassword: "",
    
    // Contact Person
    contactPersonName: "",
    contactPersonTitle: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    
    // Company Details
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    
    // Headquarters
    headquarters: {
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    }
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setAnimate(true);
  }, []);

  const steps = [
    {
      title: "Company Information",
      description: "Tell us about your company",
      icon: "🏢"
    },
    {
      title: "Contact Details",
      description: "Primary contact information",
      icon: "👤"
    },
    {
      title: "Company Profile",
      description: "Company size and industry",
      icon: "📊"
    },
    {
      title: "Location",
      description: "Company headquarters",
      icon: "📍"
    }
  ];

  const industries = [
    "Technology", "Finance", "Healthcare", "Education", "Retail",
    "Manufacturing", "Consulting", "Marketing", "Real Estate",
    "Hospitality", "Transportation", "Energy", "Media", "Other"
  ];

  const companySizes = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1000+", label: "1000+ employees" }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        // Company name validation
        if (!formData.companyName.trim()) {
          newErrors.companyName = "Company name is required";
        } else if (formData.companyName.trim().length < 2) {
          newErrors.companyName = "Company name must be at least 2 characters";
        }
        
        // Email validation using utility (allow personal domains too)
        if (!formData.companyEmail.trim()) {
          newErrors.companyEmail = "Company email is required";
        } else {
          const emailValidation = validateEmail(formData.companyEmail, { 
            requireCorporateDomain: false 
          });
          if (!emailValidation.isValid) {
            newErrors.companyEmail = emailValidation.errors[0];
          }
        }
        
        // Enhanced phone validation using utility
        if (!formData.companyPhone.trim()) {
          newErrors.companyPhone = "Company phone is required";
        } else {
          const phoneValidation = validatePhone(formData.companyPhone, {
            region: 'IN',
            requireCountryCode: false
          });
          if (!phoneValidation.isValid) {
            newErrors.companyPhone = phoneValidation.errors[0];
          }
        }
        
        // Enhanced password validation using utility
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else {
          const passwordValidation = validatePassword(formData.password);
          if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors[0];
          }
        }
        
        // Confirm password validation
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords don't match";
        }
        break;

      case 1:
        if (!formData.contactPersonName.trim()) newErrors.contactPersonName = "Contact person name is required";
        else {
          const nameValidation = validateName(formData.contactPersonName);
          if (!nameValidation.isValid) newErrors.contactPersonName = nameValidation.errors[0];
        }
        if (!formData.contactPersonTitle.trim()) newErrors.contactPersonTitle = "Contact person title is required";
        if (!formData.contactPersonEmail.trim()) newErrors.contactPersonEmail = "Contact person email is required";
        else {
          const cEmail = validateEmail(formData.contactPersonEmail, { requireCorporateDomain: false });
          if (!cEmail.isValid) newErrors.contactPersonEmail = cEmail.errors[0];
        }
        if (!formData.contactPersonPhone.trim()) newErrors.contactPersonPhone = "Contact person phone is required";
        else {
          const region = normalizeCountryToISO(formData.headquarters.country) || 'IN';
          const cPhone = validatePhone(formData.contactPersonPhone, { region, requireCountryCode: false });
          if (!cPhone.isValid) newErrors.contactPersonPhone = cPhone.errors[0];
        }
        break;

      case 2:
        if (!formData.industry) newErrors.industry = "Industry is required";
        if (!formData.companySize) newErrors.companySize = "Company size is required";
        break;

      case 3:
        if (!formData.headquarters.address.trim()) newErrors.address = "Address is required";
        if (!formData.headquarters.city.trim()) newErrors.city = "City is required";
        if (!formData.headquarters.state.trim()) newErrors.state = "State is required";
        if (!formData.headquarters.country.trim()) newErrors.country = "Country is required";
        if (!String(formData.headquarters.zipCode).trim()) {
          newErrors.zipCode = "ZIP/Postal code is required";
        } else {
          const countryCode = normalizeCountryToISO(formData.headquarters.country) || '';
          const zipVal = validateZipCode(formData.headquarters.zipCode, countryCode);
          if (!zipVal.isValid) newErrors.zipCode = zipVal.errors[0];
        }
        break;
    }

    return newErrors;
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFocus = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field.includes('.')
      ? field.split('.').reduce((acc, key) => acc && acc[key], formData)
      : formData[field];
    if (!String(value || '').trim()) {
      setErrors(prev => ({ ...prev, [field.includes('.') ? field.split('.')[1] : field]: 'This field is required' }));
    }
  };

  const handleBlur = (field) => {
    // Field-level validation on blur
    const key = field.includes('.') ? field.split('.')[1] : field;
    let message = '';
    const getValue = () => field.includes('.')
      ? field.split('.').reduce((acc, k) => acc && acc[k], formData)
      : formData[field];
    const value = String(getValue() || '').trim();

    switch (field) {
      case 'companyEmail': {
        const v = validateEmail(value, { requireCorporateDomain: false });
        if (!v.isValid) message = v.errors[0];
        break;
      }
      case 'companyPhone': {
        const region = normalizeCountryToISO(formData.headquarters.country) || 'IN';
        const v = validatePhone(value, { region, requireCountryCode: false });
        if (!v.isValid) message = v.errors[0];
        break;
      }
      case 'contactPersonEmail': {
        const v = validateEmail(value, { requireCorporateDomain: false });
        if (!v.isValid) message = v.errors[0];
        break;
      }
      case 'contactPersonName': {
        const v = validateName(value);
        if (!v.isValid) message = v.errors[0];
        break;
      }
      case 'contactPersonPhone': {
        const region = normalizeCountryToISO(formData.headquarters.country) || 'IN';
        const v = validatePhone(value, { region, requireCountryCode: false });
        if (!v.isValid) message = v.errors[0];
        break;
      }
      case 'headquarters.zipCode': {
        const countryCode = normalizeCountryToISO(formData.headquarters.country) || '';
        const v = validateZipCode(value, countryCode);
        if (!v.isValid) message = v.errors[0];
        break;
      }
      default: {
        if (!value) message = 'This field is required';
      }
    }

    setErrors(prev => ({ ...prev, [key]: message }));
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/employers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("🎉 Company registered successfully! Please login to continue.");
      setTimeout(() => {
        navigate("/employer/login");
      }, 2000);

    } catch (err) {
      toast.error("Network error! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                onFocus={() => handleFocus('companyName')}
                onBlur={() => handleBlur('companyName')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companyName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter company name"
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                onFocus={() => handleFocus('companyEmail')}
                onBlur={() => handleBlur('companyEmail')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companyEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="company@example.com"
              />
              {errors.companyEmail && <p className="text-red-500 text-sm mt-1">{errors.companyEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone *</label>
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                onFocus={() => handleFocus('companyPhone')}
                onBlur={() => handleBlur('companyPhone')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companyPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
              />
              {errors.companyPhone && <p className="text-red-500 text-sm mt-1">{errors.companyPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter secure password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name *</label>
              <input
                type="text"
                value={formData.contactPersonName}
                onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                onFocus={() => handleFocus('contactPersonName')}
                onBlur={() => handleBlur('contactPersonName')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPersonName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter contact person name"
              />
              {errors.contactPersonName && <p className="text-red-500 text-sm mt-1">{errors.contactPersonName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Title *</label>
              <input
                type="text"
                value={formData.contactPersonTitle}
                onChange={(e) => handleInputChange('contactPersonTitle', e.target.value)}
                onFocus={() => handleFocus('contactPersonTitle')}
                onBlur={() => handleBlur('contactPersonTitle')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPersonTitle ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., HR Manager, CEO"
              />
              {errors.contactPersonTitle && <p className="text-red-500 text-sm mt-1">{errors.contactPersonTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Email *</label>
              <input
                type="email"
                value={formData.contactPersonEmail}
                onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
                onFocus={() => handleFocus('contactPersonEmail')}
                onBlur={() => handleBlur('contactPersonEmail')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPersonEmail ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="contact@example.com"
              />
              {errors.contactPersonEmail && <p className="text-red-500 text-sm mt-1">{errors.contactPersonEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Phone *</label>
              <input
                type="tel"
                value={formData.contactPersonPhone}
                onChange={(e) => handleInputChange('contactPersonPhone', e.target.value)}
                onFocus={() => handleFocus('contactPersonPhone')}
                onBlur={() => handleBlur('contactPersonPhone')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPersonPhone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
              />
              {errors.contactPersonPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPersonPhone}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.industry ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && <p className="text-red-500 text-sm mt-1">{errors.industry}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size *</label>
              <select
                value={formData.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companySize ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select company size</option>
                {companySizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
              {errors.companySize && <p className="text-red-500 text-sm mt-1">{errors.companySize}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.foundedYear}
                onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.company.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <input
                type="text"
                value={formData.headquarters.address}
                onChange={(e) => handleInputChange('headquarters.address', e.target.value)}
                onFocus={() => handleFocus('headquarters.address')}
                onBlur={() => handleBlur('headquarters.address')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Street address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.headquarters.city}
                  onChange={(e) => handleInputChange('headquarters.city', e.target.value)}
                  onFocus={() => handleFocus('headquarters.city')}
                  onBlur={() => handleBlur('headquarters.city')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  value={formData.headquarters.state}
                  onChange={(e) => handleInputChange('headquarters.state', e.target.value)}
                  onFocus={() => handleFocus('headquarters.state')}
                  onBlur={() => handleBlur('headquarters.state')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="State"
                />
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <input
                  type="text"
                  value={formData.headquarters.country}
                  onChange={(e) => handleInputChange('headquarters.country', e.target.value)}
                  onFocus={() => handleFocus('headquarters.country')}
                  onBlur={() => handleBlur('headquarters.country')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.country ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Country"
                />
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={formData.headquarters.zipCode}
                  onChange={(e) => handleInputChange('headquarters.zipCode', e.target.value)}
                  onFocus={() => handleFocus('headquarters.zipCode')}
                  onBlur={() => handleBlur('headquarters.zipCode')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.zipCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={getZipExampleForCountry(formData.headquarters.country)}
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 ${animate ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{steps[currentStep].icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Company</h1>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover-lift"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover-lift"
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/employer/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployerRegister;
