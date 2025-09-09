const fetch = require('node-fetch');

async function testLogin() {
  console.log('🧪 Testing login functionality...\n');
  
  // Test credentials - you can modify these to match an existing user
  const testCredentials = {
    email: 'test@example.com',
    password: 'Test123@'
  };
  
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('1. Testing with credentials:', testCredentials.email);
    
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify(testCredentials),
      timeout: 15000
    });
    
    console.log('2. Response status:', response.status, response.statusText);
    console.log('3. Response headers:');
    console.log('   Content-Type:', response.headers.get('content-type'));
    console.log('   Access-Control-Allow-Origin:', response.headers.get('access-control-allow-origin'));
    
    const responseText = await response.text();
    console.log('4. Raw response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('5. Parsed JSON response:', data);
      
      if (response.ok && data.token) {
        console.log('✅ Login successful!');
        console.log('   Token received:', data.token.substring(0, 20) + '...');
        console.log('   User data:', data.user);
      } else {
        console.log('❌ Login failed');
        console.log('   Error type:', data.errorType);
        console.log('   Message:', data.message);
        
        if (data.errorType === 'user_not_found') {
          console.log('\n🔧 User not found. Let\'s try creating a test user...');
          await createTestUser();
        }
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError.message);
      console.log('   This might indicate a server error or wrong content type');
    }
    
  } catch (error) {
    console.log('❌ Network/Request error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🔧 Server appears to be down. Please start the backend server.');
    } else if (error.message.includes('timeout')) {
      console.log('🔧 Request timed out. Server may be slow or unresponsive.');
    } else if (error.message.includes('fetch')) {
      console.log('🔧 Network error. Check your connection and server status.');
    }
  }
}

async function createTestUser() {
  console.log('\n🔨 Creating test user...');
  
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    password: 'Test123@'
  };
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testUser),
      timeout: 15000
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Test user created successfully!');
      console.log('   Now you can test login with:', testUser.email);
      
      // Try login again
      console.log('\n🔄 Retrying login...');
      await testLogin();
    } else {
      console.log('❌ Failed to create test user:', data.message);
      if (data.message?.includes('already exists')) {
        console.log('   User already exists, trying login anyway...');
      }
    }
  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
  }
}

// Run the test
console.log('🚀 Starting login test...');
console.log('Make sure your backend server is running on port 5000\n');

testLogin().catch(console.error);
