const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  profilePhoto: { type: String },
  isOnboarded: { type: Boolean, default: false },
  experienceLevel: { type: String, enum: ['fresher', 'experienced'], default: null },
  preferredFields: [{ type: String }],
  expectedSalary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  remotePreference: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: null },
  location: { type: String },
  skills: [{ type: String }],
  education: { type: String },
  yearsOfExperience: { type: Number },
  currentRole: { type: String },
  preferredJobTypes: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] }],
  workAuthorization: { type: String, enum: ['citizen', 'permanent-resident', 'work-visa', 'student-visa', 'other'] },
  willingToRelocate: { type: Boolean, default: false },
  noticePeriod: { type: String, enum: ['immediate', '15-days', '30-days', '60-days', '90-days'] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Debug function
async function debugLogin(email, password) {
  try {
    console.log('🔍 Starting login debug for:', email);
    console.log('==================================');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI?.includes('mongodb+srv') 
      ? process.env.MONGODB_URI 
      : process.env.MONGO_URI;
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Searching for user with email:', normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('📝 Suggestions:');
      console.log('   - Check if the email is correct');
      console.log('   - Try with exact case as registered');
      console.log('   - Check if user was actually registered');
      
      // List similar emails
      const similarUsers = await User.find({
        email: { $regex: email.split('@')[0], $options: 'i' }
      }).select('email name');
      
      if (similarUsers.length > 0) {
        console.log('📧 Similar emails found:');
        similarUsers.forEach(u => {
          console.log(`   - ${u.email} (${u.name})`);
        });
      }
    } else {
      console.log('✅ User found!');
      console.log('👤 User details:');
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Is Onboarded: ${user.isOnboarded}`);
      console.log(`   - Created: ${user.createdAt}`);
      console.log(`   - Has Password: ${!!user.password}`);
      console.log(`   - Password Length: ${user.password?.length || 0} characters`);

      if (password) {
        console.log('\n🔐 Testing password...');
        try {
          const isMatch = await bcrypt.compare(password, user.password);
          console.log(`Password Match: ${isMatch ? '✅ YES' : '❌ NO'}`);
          
          if (!isMatch) {
            console.log('🔧 Password troubleshooting:');
            console.log('   - Check if password is correct');
            console.log('   - Try copying and pasting the password');
            console.log('   - Check for extra spaces');
            console.log('   - Verify caps lock is off');
          }
        } catch (bcryptError) {
          console.error('❌ Password comparison error:', bcryptError.message);
        }
      }
    }

    console.log('\n📊 Database statistics:');
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('email name createdAt');
    
    console.log(`   - Total users: ${totalUsers}`);
    console.log('   - Recent users:');
    recentUsers.forEach(u => {
      console.log(`     ${u.email} (${u.name}) - ${u.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Debug complete');
  }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node debug-login.js <email> [password]');
  console.log('Example: node debug-login.js test@example.com mypassword123');
  process.exit(1);
}

const email = args[0];
const password = args[1];

debugLogin(email, password);
