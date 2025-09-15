import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            This Privacy Policy explains how JobZee collects, uses, and protects your information when
            you use our website and services. By using JobZee, you agree to the practices described in
            this policy.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account details such as name, email, phone, and profile data you provide</li>
            <li>Usage data like device information, pages visited, and interactions</li>
            <li>Job-related information including resumes, applications, and preferences</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To create and maintain your account and profile</li>
            <li>To match job seekers with relevant jobs and employers</li>
            <li>To communicate important updates, security notices, and support</li>
            <li>To improve our services and prevent fraud or abuse</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">Sharing and Disclosure</h2>
          <p>
            We do not sell your personal data. We may share information with trusted service providers
            (e.g., hosting, email) under strict agreements, or when required by law.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Your Choices</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Update your profile information from your account settings</li>
            <li>Opt out of non-essential emails via unsubscribe links</li>
            <li>Contact support to request data deletion subject to legal limits</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>
            If you have questions about this policy, contact us at
            <a href="mailto:support@jobzee.com" className="text-blue-600 hover:text-blue-700 ml-1">support@jobzee.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;



