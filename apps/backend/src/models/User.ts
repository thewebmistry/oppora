import mongoose, { Document, Schema, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

// TypeScript Interface for User
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'owner';
  avatarUrl?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedIn?: string;
  };
  isVerified: boolean;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  
  // Method to compare passwords
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Social Links Schema
const SocialLinksSchema = new Schema({
  twitter: { type: String, trim: true },
  instagram: { type: String, trim: true },
  linkedIn: { type: String, trim: true }
}, { _id: false });

// User Schema Definition
const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false // Don't return password hash by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'owner'],
    default: 'user'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: ''
  },
  socialLinks: {
    type: SocialLinksSchema,
    default: {}
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
UserSchema.index({ username: 1, email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isVerified: 1 });

// Method to compare entered password with stored hash
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Pre-save hook to hash password (if needed in future)
UserSchema.pre<IUser>('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Create and export the model
export const User = mongoose.model<IUser>('User', UserSchema);
export default User;