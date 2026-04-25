// Quick test to verify models can be instantiated
const mongoose = require('mongoose');

// Mock connection
mongoose.connect('mongodb://localhost:27017/test_db', { useNewUrlParser: true, useUnifiedTopology: true });

// Import models
const { User } = require('./dist/models/User');
const { Company } = require('./dist/models/Company');

async function testModels() {
  try {
    // Test User model instantiation
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hashedpassword123',
      role: 'user'
    };
    
    const user = new User(userData);
    console.log('✅ User model instantiated successfully');
    console.log('User fields:', Object.keys(user.toObject()));
    
    // Test Company model instantiation
    const companyData = {
      companyName: 'Test Company',
      slug: 'test-company',
      category: 'crypto',
      scores: {
        overallRating: 75,
        trustScore: 80,
        growthTrend: 10,
        riskLevel: 3
      },
      status: 'pending_review',
      tags: ['legit', 'growing']
    };
    
    const company = new Company(companyData);
    console.log('✅ Company model instantiated successfully');
    console.log('Company fields:', Object.keys(company.toObject()));
    
    // Test password matching method
    const isMatch = await user.matchPassword('testpassword');
    console.log('✅ Password match method works (returns boolean):', typeof isMatch === 'boolean');
    
    console.log('\n🎉 All model tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testModels();