#!/usr/bin/env node

/**
 * JobZee Security Hardening Script
 * This script helps fix security vulnerabilities identified in the audit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

console.log('🔒 JobZee Security Hardening Script');
console.log('=====================================\n');

const projectRoot = path.dirname(__filename);
const backendPath = path.join(projectRoot, 'jobzee-backend');
const frontendPath = path.join(projectRoot, 'jobzee-frontend');

/**
 * Step 1: Fix Admin Auth Fallback
 */
function fixAdminAuthFallback() {
  console.log('🔧 Step 1: Fixing Admin Auth Fallback...');
  
  const adminAuthPath = path.join(backendPath, 'middleware', 'adminAuth.js');
  
  if (fs.existsSync(adminAuthPath)) {
    let content = fs.readFileSync(adminAuthPath, 'utf8');
    
    // Replace the fallback secret with proper validation
    content = content.replace(
      'const decoded = jwt.verify(token, process.env.JWT_SECRET || \'your-secret-key\');',
      `// Enforce JWT_SECRET environment variable
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('CRITICAL: JWT_SECRET environment variable is not set!');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        errorType: 'server_config_error'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);`
    );
    
    fs.writeFileSync(adminAuthPath, content);
    console.log('✅ Fixed admin auth fallback secret');
  }
}

/**
 * Step 2: Generate Strong JWT Secret
 */
function generateSecureJWTSecret() {
  console.log('🔐 Step 2: Generating Secure JWT Secret...');
  
  const newSecret = crypto.randomBytes(64).toString('hex');
  console.log('Generated new JWT secret (save this in your .env file):');
  console.log(`JWT_SECRET=${newSecret}\n`);
  
  return newSecret;
}

/**
 * Step 3: Install Security Packages
 */
function installSecurityPackages() {
  console.log('📦 Step 3: Installing Security Packages...');
  
  try {
    console.log('Installing helmet for security headers...');
    execSync('npm install helmet', { cwd: backendPath, stdio: 'inherit' });
    
    console.log('Installing express-validator for input validation...');
    execSync('npm install express-validator', { cwd: backendPath, stdio: 'inherit' });
    
    console.log('Installing hpp for HTTP Parameter Pollution protection...');
    execSync('npm install hpp', { cwd: backendPath, stdio: 'inherit' });
    
    console.log('Installing express-mongo-sanitize for NoSQL injection protection...');
    execSync('npm install express-mongo-sanitize', { cwd: backendPath, stdio: 'inherit' });
    
    console.log('✅ Security packages installed');
  } catch (error) {
    console.error('❌ Failed to install security packages:', error.message);
  }
}

/**
 * Step 4: Create Security Middleware
 */
function createSecurityMiddleware() {
  console.log('🛡️ Step 4: Creating Security Middleware...');
  
  const securityMiddleware = `const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Security middleware collection for JobZee application
 */
const securityMiddleware = {
  
  /**
   * Apply all security middlewares
   */
  apply: (app) => {
    // Security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"]
        },
      },
      crossOriginEmbedderPolicy: false
    }));
    
    // Prevent HTTP Parameter Pollution
    app.use(hpp());
    
    // Sanitize user input to prevent NoSQL injection attacks
    app.use(mongoSanitize());
    
    console.log('✅ Security middlewares applied');
  },

  /**
   * CORS configuration for production
   */
  corsOptions: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Add your production domains here:
        // 'https://yourdomain.com',
        // 'https://www.yourdomain.com'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200
  },

  /**
   * Enhanced logging middleware
   */
  requestLogger: (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    console.log(\`[\${timestamp}] \${req.method} \${req.url} - IP: \${ip} - UA: \${userAgent}\`);
    
    // Log sensitive operations
    if (req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/reset-password')) {
      console.log(\`🔐 Security-sensitive operation: \${req.method} \${req.url} from \${ip}\`);
    }
    
    next();
  }
};

module.exports = securityMiddleware;
`;
  
  const middlewarePath = path.join(backendPath, 'middleware', 'security.js');
  fs.writeFileSync(middlewarePath, securityMiddleware);
  console.log('✅ Created security middleware');
}

/**
 * Step 5: Update Main Server File
 */
function updateServerFile() {
  console.log('🔄 Step 5: Updating Server Configuration...');
  
  const indexPath = path.join(backendPath, 'index.js');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Add security middleware import
    if (!content.includes("require('./middleware/security')")) {
      content = content.replace(
        "const cors = require('cors');",
        `const cors = require('cors');
const securityMiddleware = require('./middleware/security');`
      );
    }
    
    // Replace CORS configuration with secure version
    if (content.includes('app.use(cors({')) {
      content = content.replace(
        /app\.use\(cors\(\{[\s\S]*?\}\)\);/,
        'app.use(cors(securityMiddleware.corsOptions));'
      );
    }
    
    // Add security middlewares after CORS
    if (!content.includes('securityMiddleware.apply(app)')) {
      content = content.replace(
        'app.use(cors(securityMiddleware.corsOptions));',
        `app.use(cors(securityMiddleware.corsOptions));

// Apply security middlewares
securityMiddleware.apply(app);`
      );
    }
    
    // Replace basic logging with enhanced logging
    content = content.replace(
      /app\.use\(\(req, res, next\) => \{[\s\S]*?\}\);/,
      'app.use(securityMiddleware.requestLogger);'
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ Updated server configuration');
  }
}

/**
 * Step 6: Create Environment Template
 */
function createSecureEnvTemplate() {
  console.log('📝 Step 6: Creating Secure Environment Template...');
  
  const secureEnvTemplate = `# 🔒 JobZee Backend Environment Variables (Production Template)
# SECURITY: Never commit this file with real values to version control

# ================================
# 🚨 CRITICAL SECURITY VARIABLES  
# ================================

# JWT Secret - MUST be a strong random string (minimum 64 characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=REPLACE_WITH_SECURE_64_CHAR_RANDOM_STRING

# ================================
# 🗄️ DATABASE CONFIGURATION
# ================================

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobzee

# ================================
# 🌐 SERVER CONFIGURATION
# ================================

PORT=5000
NODE_ENV=production

# Frontend URLs (add all your production domains)
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Application Settings
APP_NAME=JobZee

# ================================
# 🔑 GOOGLE OAUTH
# ================================

GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_here

# ================================
# 📧 EMAIL CONFIGURATION
# ================================

# Production Email Settings (Use SendGrid, Mailgun, or AWS SES)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# ================================
# ☁️ CLOUDINARY (File Uploads)
# ================================

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# ================================
# 🔒 ADDITIONAL SECURITY
# ================================

# Session secret (if using sessions)
SESSION_SECRET=another_secure_random_string

# API versioning
API_VERSION=v1

# Rate limiting (requests per window)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# ================================
# 📊 MONITORING & LOGGING
# ================================

# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Enable security event logging
SECURITY_LOGGING=true

# ================================
# 🚨 SECURITY NOTES
# ================================

# 1. Rotate all secrets regularly (at least every 90 days)
# 2. Use different credentials for each environment
# 3. Never commit real credentials to version control
# 4. Use a secrets management service in production
# 5. Monitor for unauthorized access attempts
# 6. Enable 2FA on all service accounts
# 7. Regularly update dependencies
# 8. Use HTTPS in production
# 9. Enable MongoDB authentication
# 10. Restrict database network access
`;
  
  const envTemplatePath = path.join(backendPath, '.env.production.template');
  fs.writeFileSync(envTemplatePath, secureEnvTemplate);
  console.log('✅ Created secure environment template');
}

/**
 * Step 7: Create Security Documentation
 */
function createSecurityDocs() {
  console.log('📚 Step 7: Creating Security Documentation...');
  
  const securityDocs = `# 🔒 JobZee Security Guide

## Security Checklist for Production

### 🚨 Critical (Must Do)
- [ ] Rotate all API keys and secrets
- [ ] Use strong, unique JWT_SECRET (64+ characters)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS origins
- [ ] Enable MongoDB authentication
- [ ] Use production email service (SendGrid, Mailgun)
- [ ] Set up error monitoring (Sentry, LogRocket)

### 🛡️ Important (Should Do)
- [ ] Implement request/response logging
- [ ] Set up automated backups
- [ ] Configure rate limiting monitoring
- [ ] Use a reverse proxy (Nginx, Cloudflare)
- [ ] Implement health checks
- [ ] Set up secret management (AWS Secrets Manager)

### 📊 Monitoring (Good to Have)
- [ ] Set up security alerts
- [ ] Implement audit logging
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Create incident response procedures

## Security Headers Implemented

- **Helmet.js**: Comprehensive security headers
- **Content Security Policy**: Prevents XSS attacks
- **HTTP Parameter Pollution**: Prevents HPP attacks
- **NoSQL Injection Protection**: Sanitizes MongoDB queries

## Rate Limiting Configuration

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Password Reset: 3 requests per hour
- Admin Operations: 3 requests per 15 minutes

## Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Employer, admin, user roles
- **Token Expiration**: Configurable token lifetimes
- **Password Hashing**: bcrypt with salt rounds

## Data Protection

- **Input Validation**: Express-validator for all inputs
- **SQL/NoSQL Injection**: Sanitization middleware
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: SameSite cookies (if using sessions)

## Monitoring & Logging

All security-sensitive operations are logged:
- Login attempts
- Password reset requests
- Admin operations
- Failed authentication attempts
- Rate limit violations

## Incident Response

1. **Detection**: Monitor logs and alerts
2. **Assessment**: Determine severity and impact
3. **Containment**: Block malicious IPs if needed
4. **Recovery**: Restore services and data
5. **Lessons Learned**: Update security measures

## Regular Security Tasks

### Daily
- Monitor error logs
- Check for failed login attempts
- Review rate limiting violations

### Weekly
- Update dependencies (\`npm audit\`)
- Review access logs
- Check SSL certificate status

### Monthly
- Rotate API keys and secrets
- Review user permissions
- Security dependency audit
- Backup verification

### Quarterly
- Full security review
- Penetration testing
- Update security documentation
- Review incident response procedures

## Contact Information

For security issues, contact:
- Emergency: [Your emergency contact]
- General: [Your security team email]
- Bug Bounty: [Your bug bounty program]
`;
  
  const securityDocsPath = path.join(projectRoot, 'SECURITY_GUIDE.md');
  fs.writeFileSync(securityDocsPath, securityDocs);
  console.log('✅ Created security documentation');
}

/**
 * Step 8: Fix Frontend Dependencies
 */
function fixFrontendDependencies() {
  console.log('🔄 Step 8: Fixing Frontend Dependencies...');
  
  try {
    console.log('Running npm audit fix on frontend...');
    execSync('npm audit fix --force', { 
      cwd: frontendPath, 
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    console.log('✅ Frontend dependencies fixed');
  } catch (error) {
    console.log('⚠️  Some frontend dependency issues may require manual intervention');
    console.log('Run: npm audit in the frontend directory for details');
  }
}

/**
 * Step 9: Create Security Test Script
 */
function createSecurityTests() {
  console.log('🧪 Step 9: Creating Security Test Script...');
  
  const securityTest = `#!/usr/bin/env node

/**
 * Security Test Suite for JobZee
 */

const http = require('http');
const https = require('https');

console.log('🔍 Running JobZee Security Tests...');
console.log('====================================\\n');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

/**
 * Test security headers
 */
function testSecurityHeaders() {
  console.log('🛡️ Testing Security Headers...');
  
  return new Promise((resolve, reject) => {
    const client = BASE_URL.startsWith('https') ? https : http;
    
    client.get(BASE_URL + '/api/health', (res) => {
      const headers = res.headers;
      
      console.log(\`Status: \${res.statusCode}\`);
      
      // Check for security headers
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      let passed = 0;
      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(\`✅ \${header}: \${headers[header]}\`);
          passed++;
        } else {
          console.log(\`❌ Missing: \${header}\`);
        }
      });
      
      console.log(\`\\nSecurity Headers Score: \${passed}/\${securityHeaders.length}\\n\`);
      resolve(passed === securityHeaders.length);
    }).on('error', reject);
  });
}

/**
 * Test rate limiting
 */
async function testRateLimit() {
  console.log('⏱️ Testing Rate Limiting...');
  
  try {
    const requests = [];
    for (let i = 0; i < 6; i++) {
      requests.push(fetch(BASE_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      }));
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log('✅ Rate limiting is working');
    } else {
      console.log('❌ Rate limiting may not be configured properly');
    }
    
    return rateLimited;
  } catch (error) {
    console.log('❌ Error testing rate limiting:', error.message);
    return false;
  }
}

/**
 * Run all security tests
 */
async function runAllTests() {
  try {
    const headerTest = await testSecurityHeaders();
    const rateLimitTest = await testRateLimit();
    
    const totalTests = 2;
    const passedTests = (headerTest ? 1 : 0) + (rateLimitTest ? 1 : 0);
    
    console.log('\\n📊 Security Test Results:');
    console.log(\`Passed: \${passedTests}/\${totalTests}\`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All security tests passed!');
      process.exit(0);
    } else {
      console.log('⚠️  Some security tests failed. Please review the configuration.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running security tests:', error);
    process.exit(1);
  }
}

runAllTests();
`;
  
  const testPath = path.join(projectRoot, 'run-security-tests.js');
  fs.writeFileSync(testPath, securityTest);
  
  // Make it executable on Unix systems
  try {
    fs.chmodSync(testPath, 0o755);
  } catch (error) {
    // Windows doesn't support chmod
  }
  
  console.log('✅ Created security test script');
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Starting security hardening process...\n');
    
    fixAdminAuthFallback();
    const newSecret = generateSecureJWTSecret();
    installSecurityPackages();
    createSecurityMiddleware();
    updateServerFile();
    createSecureEnvTemplate();
    createSecurityDocs();
    fixFrontendDependencies();
    createSecurityTests();
    
    console.log('\n🎉 Security Hardening Complete!');
    console.log('==================================\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Update your .env file with the new JWT_SECRET shown above');
    console.log('2. Rotate all API keys and credentials');
    console.log('3. Review and update CORS origins for production');
    console.log('4. Test the application: npm start');
    console.log('5. Run security tests: node run-security-tests.js');
    console.log('6. Review SECURITY_GUIDE.md for production deployment');
    console.log('\n⚠️  IMPORTANT: Don\'t forget to rotate all credentials in .env!');
    
  } catch (error) {
    console.error('❌ Error during security hardening:', error);
    process.exit(1);
  }
}

// Run the hardening process
if (require.main === module) {
  main();
}

module.exports = {
  fixAdminAuthFallback,
  generateSecureJWTSecret,
  installSecurityPackages,
  createSecurityMiddleware,
  updateServerFile,
  createSecureEnvTemplate,
  createSecurityDocs,
  fixFrontendDependencies,
  createSecurityTests
};
