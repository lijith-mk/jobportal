#!/usr/bin/env node

/**
 * Security Test Suite for JobZee
 */

const http = require('http');
const https = require('https');

console.log('🔍 Running JobZee Security Tests...');
console.log('====================================\n');

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
      
      console.log(`Status: ${res.statusCode}`);
      
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
          console.log(`✅ ${header}: ${headers[header]}`);
          passed++;
        } else {
          console.log(`❌ Missing: ${header}`);
        }
      });
      
      console.log(`\nSecurity Headers Score: ${passed}/${securityHeaders.length}\n`);
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
    
    console.log('\n📊 Security Test Results:');
    console.log(`Passed: ${passedTests}/${totalTests}`);
    
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
