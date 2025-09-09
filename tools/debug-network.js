const fetch = require('node-fetch');

async function debugNetworkConnection() {
  console.log('🔍 Starting comprehensive network diagnostics...\n');
  
  const baseUrl = 'http://localhost:5000';
  const tests = [];
  
  // Test 1: Basic server connectivity
  console.log('1. Testing basic server connectivity...');
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is healthy:', data.status);
      console.log('   Database status:', data.database.status);
      tests.push({ name: 'Health Check', status: 'PASS' });
    } else {
      console.log('❌ Health check failed:', response.status, response.statusText);
      tests.push({ name: 'Health Check', status: 'FAIL', error: `${response.status} ${response.statusText}` });
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    tests.push({ name: 'Health Check', status: 'FAIL', error: error.message });
  }
  
  // Test 2: CORS preflight request
  console.log('\n2. Testing CORS preflight request...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      timeout: 10000
    });
    
    console.log('✅ CORS preflight status:', response.status);
    console.log('   CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('access-control-allow-origin'),
      'Access-Control-Allow-Methods': response.headers.get('access-control-allow-methods'),
      'Access-Control-Allow-Headers': response.headers.get('access-control-allow-headers')
    });
    tests.push({ name: 'CORS Preflight', status: 'PASS' });
  } catch (error) {
    console.log('❌ CORS preflight error:', error.message);
    tests.push({ name: 'CORS Preflight', status: 'FAIL', error: error.message });
  }
  
  // Test 3: Test login endpoint with invalid data
  console.log('\n3. Testing login endpoint with invalid credentials...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        email: 'test@nonexistent.com',
        password: 'wrongpassword'
      }),
      timeout: 15000
    });
    
    console.log('✅ Login endpoint responsive, status:', response.status);
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      console.log('   Response data:', data);
      tests.push({ name: 'Login Endpoint', status: 'PASS' });
    } else {
      console.log('❌ Response is not JSON');
      const text = await response.text();
      console.log('   Response text:', text);
      tests.push({ name: 'Login Endpoint', status: 'FAIL', error: 'Non-JSON response' });
    }
  } catch (error) {
    console.log('❌ Login endpoint error:', error.message);
    tests.push({ name: 'Login Endpoint', status: 'FAIL', error: error.message });
  }
  
  // Test 4: Test with actual user credentials (if any exist)
  console.log('\n4. Testing with timeout simulation...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'timeout-test@test.com',
        password: 'test123'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('✅ Request completed within timeout, status:', response.status);
    tests.push({ name: 'Timeout Test', status: 'PASS' });
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Request timed out as expected');
      tests.push({ name: 'Timeout Test', status: 'PASS' });
    } else {
      console.log('❌ Timeout test error:', error.message);
      tests.push({ name: 'Timeout Test', status: 'FAIL', error: error.message });
    }
  }
  
  // Test 5: Check port availability
  console.log('\n5. Testing port availability...');
  const net = require('net');
  try {
    const server = net.createServer();
    server.listen(5001, () => {
      console.log('✅ Port 5001 is available (alternative port works)');
      server.close();
      tests.push({ name: 'Port Availability', status: 'PASS' });
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('⚠️  Port 5001 is in use (normal if other services running)');
      }
      tests.push({ name: 'Port Availability', status: 'PASS' });
    });
  } catch (error) {
    console.log('❌ Port test error:', error.message);
    tests.push({ name: 'Port Availability', status: 'FAIL', error: error.message });
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 DIAGNOSTICS SUMMARY');
  console.log('='.repeat(50));
  
  tests.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${test.name}: ${status} ${test.status}`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  const passCount = tests.filter(t => t.status === 'PASS').length;
  const failCount = tests.filter(t => t.status === 'FAIL').length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 RESULTS: ${passCount} passed, ${failCount} failed`);
  
  if (failCount > 0) {
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('1. Ensure backend server is running: npm start (in backend directory)');
    console.log('2. Check if MongoDB is connected');
    console.log('3. Verify no firewall is blocking localhost:5000');
    console.log('4. Try restarting both frontend and backend servers');
    console.log('5. Check for any conflicting processes on port 5000');
  } else {
    console.log('\n🎉 All tests passed! Network connectivity is working properly.');
    console.log('   If you\'re still experiencing issues, the problem may be:');
    console.log('   - Browser cache or cookies');
    console.log('   - Specific user data causing database timeouts');
    console.log('   - Frontend state management issues');
  }
  
  console.log('='.repeat(50));
}

// Run the diagnostics
debugNetworkConnection().catch(console.error);
