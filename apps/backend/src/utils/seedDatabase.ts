/**
 * Database Seed Script
 * 
 * This script populates the database with realistic demo data for development and testing.
 * It creates:
 * - 3 dummy Companies (MLM, Crypto, E-commerce)
 * - 1 dummy User (Owner)
 * - 1 dummy Post
 * 
 * Usage:
 * 1. Ensure MongoDB is running
 * 2. Run: `npm run db:seed` or `tsx src/utils/seedDatabase.ts`
 * 3. Use `--clear` flag to clear existing dummy data: `npm run db:seed -- --clear`
 * 
 * Note: This script uses the same database connection as the main application.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { ICompany } from '../models/Company';
import { IUser } from '../models/User';
import { IPost } from '../models/Post';

// Load environment variables
dotenv.config();

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/company_intelligence';
const CLEAR_EXISTING_DUMMY_DATA = process.argv.includes('--clear');

// Helper function to generate random scores
const generateScores = () => ({
  overallRating: Math.floor(Math.random() * 30) + 70, // 70-100
  trustScore: Math.floor(Math.random() * 40) + 60,    // 60-100
  growthTrend: Math.floor(Math.random() * 60) - 20,   // -20 to 40
  riskLevel: Math.floor(Math.random() * 5) + 1,       // 1-6
});

// Seed data for companies
const companiesData: Partial<ICompany>[] = [
  {
    companyName: 'Vestige Marketing Pvt. Ltd.',
    slug: 'vestige-marketing',
    category: 'mlm' as const,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Vestige_Logo.svg/1200px-Vestige_Logo.svg.png',
    description: 'Vestige is a leading direct selling company in India offering wellness, personal care, and home care products. Founded in 2004, it has grown to become one of the largest MLM companies in the country with a strong distributor network.',
    foundedYear: 2004,
    headquarters: 'New Delhi, India',
    website: 'https://www.vestige.in',
    tags: ['mlm', 'wellness', 'direct-selling', 'india', 'health-products'],
    minTRSavings: '₹5,000 - ₹50,000 per month',
    registrationCertificateNo: 'U74999DL2004PTC130285',
    gstin: '07AAACV1234M1Z5',
    directorName: 'Gautam Bali',
    productCategories: ['Health Supplements', 'Personal Care', 'Home Care', 'Cosmetics'],
    scores: generateScores(),
    status: 'active' as const,
  },
  {
    companyName: 'Bitcoin Foundation',
    slug: 'bitcoin-foundation',
    category: 'crypto' as const,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png',
    description: 'Bitcoin is the first decentralized cryptocurrency, created in 2009 by Satoshi Nakamoto. It operates on a peer-to-peer network without central authority, using blockchain technology to enable secure transactions.',
    foundedYear: 2009,
    headquarters: 'Global (Decentralized)',
    website: 'https://bitcoin.org',
    tags: ['cryptocurrency', 'blockchain', 'bitcoin', 'digital-gold', 'decentralized'],
    tokenSymbol: 'BTC',
    contractAddress: 'N/A (Native blockchain)',
    whitepaperUrl: 'https://bitcoin.org/bitcoin.pdf',
    auditStatus: true,
    auditReportUrl: 'https://github.com/bitcoin/bitcoin',
    scores: generateScores(),
    status: 'active' as const,
  },
  {
    companyName: 'Amazon India',
    slug: 'amazon-india',
    category: 'ecommerce' as const,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png',
    description: 'Amazon India is the Indian subsidiary of Amazon.com, offering a wide range of products including electronics, fashion, home essentials, and more. It is one of the largest e-commerce platforms in India with fast delivery and extensive product selection.',
    foundedYear: 2013,
    headquarters: 'Bengaluru, Karnataka, India',
    website: 'https://www.amazon.in',
    tags: ['ecommerce', 'retail', 'marketplace', 'prime', 'india'],
    scores: generateScores(),
    status: 'active' as const,
  },
];

// Seed data for user
const userData: Partial<IUser> = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'john.doe@example.com',
  passwordHash: '', // Will be set after hashing
  role: 'owner' as const,
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  bio: 'Platform owner and administrator. Passionate about business intelligence and helping companies grow.',
  socialLinks: {
    twitter: 'https://twitter.com/johndoe',
    linkedIn: 'https://linkedin.com/in/johndoe',
  },
  isVerified: true,
  followers: [],
  following: [],
};

// Seed data for post
const postData: Partial<IPost> = {
  content: 'Welcome to the Company Intelligence Platform! 🎉\n\nThis platform helps you analyze, compare, and rate companies across MLM, Crypto, and E-commerce categories. We provide real-time insights, social features, and intelligent scoring to help you make informed business decisions.\n\nFeel free to explore the demo companies (Vestige, Bitcoin, Amazon) and test out all the features!',
  mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  tags: ['welcome', 'introduction', 'platform', 'demo'],
  likes: [],
  commentsCount: 0,
  isActive: true,
};

/**
 * Connect to MongoDB database
 */
async function connectDatabase(): Promise<void> {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Clear existing dummy data (optional)
 * Removes companies, users, and posts created by this seed script
 */
async function clearExistingDummyData(): Promise<void> {
  try {
    console.log('🧹 Clearing existing dummy data...');
    
    // Find and delete dummy companies
    const dummyCompanySlugs = ['vestige-marketing', 'bitcoin-foundation', 'amazon-india'];
    const deleteCompaniesResult = await Company.deleteMany({ 
      slug: { $in: dummyCompanySlugs } 
    });
    console.log(`   Deleted ${deleteCompaniesResult.deletedCount} dummy companies`);
    
    // Find and delete dummy user
    const deleteUserResult = await User.deleteMany({ 
      email: 'john.doe@example.com' 
    });
    console.log(`   Deleted ${deleteUserResult.deletedCount} dummy users`);
    
    // Find and delete dummy post (by content pattern)
    const deletePostResult = await Post.deleteMany({ 
      content: { $regex: 'Welcome to the Company Intelligence Platform', $options: 'i' } 
    });
    console.log(`   Deleted ${deletePostResult.deletedCount} dummy posts`);
    
    console.log('✅ Existing dummy data cleared');
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    throw error;
  }
}

/**
 * Create dummy user with hashed password
 */
async function createDummyUser(): Promise<mongoose.Types.ObjectId> {
  try {
    console.log('👤 Creating dummy user...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('   User already exists, skipping creation');
      return existingUser._id;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    
    // Create user with hashed password
    const user = new User({
      ...userData,
      passwordHash: hashedPassword,
    });
    
    await user.save();
    console.log(`   User created: ${user.username} (${user.email})`);
    return user._id;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

/**
 * Create dummy companies
 */
async function createDummyCompanies(ownerUserId: mongoose.Types.ObjectId): Promise<void> {
  try {
    console.log('🏢 Creating dummy companies...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const companyData of companiesData) {
      // Check if company already exists
      const existingCompany = await Company.findOne({ slug: companyData.slug });
      if (existingCompany) {
        console.log(`   Company "${companyData.companyName}" already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      // Create company with owner reference
      const company = new Company({
        ...companyData,
        ownerUserId,
      });
      
      await company.save();
      console.log(`   Company created: ${company.companyName} (${company.category})`);
      createdCount++;
    }
    
    console.log(`   Created ${createdCount} new companies, skipped ${skippedCount} existing ones`);
  } catch (error) {
    console.error('❌ Error creating companies:', error);
    throw error;
  }
}

/**
 * Create dummy post
 */
async function createDummyPost(authorId: mongoose.Types.ObjectId): Promise<void> {
  try {
    console.log('📝 Creating dummy post...');
    
    // Check if similar post already exists
    const existingPost = await Post.findOne({ 
      author: authorId,
      content: { $regex: 'Welcome to the Company Intelligence Platform', $options: 'i' }
    });
    
    if (existingPost) {
      console.log('   Similar post already exists, skipping creation');
      return;
    }
    
    // Create post
    const post = new Post({
      ...postData,
      author: authorId,
    });
    
    await post.save();
    console.log(`   Post created: "${post.content.substring(0, 50)}..."`);
  } catch (error) {
    console.error('❌ Error creating post:', error);
    throw error;
  }
}

/**
 * Main seed function
 */
async function runSeed(): Promise<void> {
  console.log('🌱 Starting database seed...');
  console.log('========================================');
  
  try {
    // Connect to database
    await connectDatabase();
    
    // Clear existing dummy data if flag is set
    if (CLEAR_EXISTING_DUMMY_DATA) {
      await clearExistingDummyData();
    }
    
    // Create dummy user
    const userId = await createDummyUser();
    
    // Create dummy companies
    await createDummyCompanies(userId);
    
    // Create dummy post
    await createDummyPost(userId);
    
    console.log('========================================');
    console.log('✅ Database seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 1 User created (john.doe@example.com / Password123!)');
    console.log('   - 3 Companies created (Vestige, Bitcoin, Amazon)');
    console.log('   - 1 Welcome post created');
    console.log('\n🔑 Login credentials:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: Password123!');
    console.log('\n🚀 You can now access the platform with the demo data.');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

/**
 * Command line execution
 */
if (require.main === module) {
  runSeed().catch((error) => {
    console.error('Unhandled error during seed:', error);
    process.exit(1);
  });
}

export { runSeed };