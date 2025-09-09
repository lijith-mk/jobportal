const nodemailer = require('nodemailer');

// Create reusable transporter object using the Gmail SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    // Enhanced settings for better deliverability
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 second between emails
    rateLimit: 5, // max 5 emails per rateDelta
    // Add proper headers for better delivery
    defaults: {
      from: `"JobZee - Password Reset" <${process.env.EMAIL_FROM}>`,
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userType = 'user') => {
  try {
    const transporter = createTransporter();
    
    // Determine reset URL based on user type
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = userType === 'employer' 
      ? `${baseUrl}/employer/reset-password/${resetToken}`
      : `${baseUrl}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"JobZee - Password Reset" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🔒 Reset Your JobZee Password - Action Required',
      // Add headers for better deliverability
      headers: {
        'X-Mailer': 'JobZee Application',
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': `<mailto:unsubscribe@jobzee.com>`,
        'Message-ID': `<${resetToken}@jobzee.com>`,
      },
      // Add envelope settings
      envelope: {
        from: process.env.EMAIL_FROM,
        to: email
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Jobzee</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 300;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #333;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .content p {
              margin-bottom: 20px;
              font-size: 16px;
              line-height: 1.6;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              padding: 15px 30px;
              border-radius: 5px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .reset-button:hover {
              transform: translateY(-2px);
            }
            .token-box {
              background-color: #f8f9fa;
              border: 2px dashed #dee2e6;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
              font-family: 'Courier New', monospace;
              word-break: break-all;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              font-size: 14px;
              color: #6c757d;
              border-top: 1px solid #dee2e6;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
            }
            .warning strong {
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Jobzee</h1>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              
              <p>Hello,</p>
              
              <p>We received a request to reset your password for your Jobzee ${userType} account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <div class="token-box">
                ${resetUrl}
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Information:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This link will expire in <strong>1 hour</strong> for security reasons</li>
                  <li>You can only use this link once</li>
                  <li>If you didn't request this reset, please contact our support team</li>
                </ul>
              </div>
              
              <p>For your security, this password reset link will expire in 1 hour. If you need a new reset link, please visit our password reset page again.</p>
              
              <p>Best regards,<br>
              The Jobzee Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>If you need help, contact us at support@jobzee.com</p>
              <p>&copy; 2024 Jobzee. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Jobzee
        
        Hello,
        
        We received a request to reset your password for your Jobzee ${userType} account.
        
        To reset your password, visit this link:
        ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        The Jobzee Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Test email configuration
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConnection
};
