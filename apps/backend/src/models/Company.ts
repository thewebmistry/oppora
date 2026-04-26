import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript Interface for Company
export interface ICompany extends Document {
  companyName: string;
  slug: string;
  category: 'mlm' | 'crypto' | 'ecommerce';
  logoUrl?: string;
  description?: string;
  
  // Group A: Common Details
  foundedYear?: number;
  headquarters?: string;
  website?: string;
  tags: string[];
  
  // Group B: MLM / Business Specific (Conditional)
  minTRSavings?: string;
  registrationCertificateNo?: string;
  gstin?: string;
  directorName?: string;
  productCategories?: string[];
  
  // Group C: Crypto Specific (Conditional)
  tokenSymbol?: string;
  contractAddress?: string;
  whitepaperUrl?: string;
  auditStatus?: boolean;
  auditReportUrl?: string;
  
  // Scoring Engine Fields
  scores: {
    overallRating: number;
    trustScore: number;
    growthTrend: number;
    riskLevel: number;
  };
  
  status: 'pending_review' | 'active' | 'flagged_scam' | 'under_construction';
  ownerUserId?: Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Scores Subdocument Schema
const ScoresSchema = new Schema({
  overallRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [100, 'Rating cannot exceed 100']
  },
  trustScore: {
    type: Number,
    default: 0,
    min: [0, 'Trust score cannot be negative'],
    max: [100, 'Trust score cannot exceed 100']
  },
  growthTrend: {
    type: Number,
    default: 0,
    min: [-100, 'Growth trend cannot be less than -100'],
    max: [100, 'Growth trend cannot exceed 100']
  },
  riskLevel: {
    type: Number,
    default: 0,
    min: [0, 'Risk level cannot be negative'],
    max: [10, 'Risk level cannot exceed 10']
  }
}, { _id: false });

// Company Schema Definition
const CompanySchema = new Schema<ICompany>({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
    index: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, hyphens)']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['mlm', 'crypto', 'ecommerce'],
    index: true
  },
  logoUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  
  // Group A: Common Details
  foundedYear: {
    type: Number,
    min: [1900, 'Founded year must be after 1900'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  headquarters: {
    type: String,
    trim: true,
    maxlength: [200, 'Headquarters cannot exceed 200 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please provide a valid website URL']
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 20; // Limit to 20 tags
      },
      message: 'Cannot have more than 20 tags'
    }
  },
  
  // Group B: MLM / Business Specific
  minTRSavings: {
    type: String,
    trim: true
  },
  registrationCertificateNo: {
    type: String,
    trim: true,
    uppercase: true
  },
  gstin: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
  },
  directorName: {
    type: String,
    trim: true,
    maxlength: [100, 'Director name cannot exceed 100 characters']
  },
  productCategories: {
    type: [String],
    default: []
  },
  
  // Group C: Crypto Specific
  tokenSymbol: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Token symbol cannot exceed 10 characters']
  },
  contractAddress: {
    type: String,
    trim: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum contract address']
  },
  whitepaperUrl: {
    type: String,
    trim: true
  },
  auditStatus: {
    type: Boolean,
    default: false
  },
  auditReportUrl: {
    type: String,
    trim: true
  },
  
  // Scoring Engine Fields
  scores: {
    type: ScoresSchema,
    default: () => ({
      overallRating: 0,
      trustScore: 0,
      growthTrend: 0,
      riskLevel: 0
    })
  },
  
  status: {
    type: String,
    enum: ['pending_review', 'active', 'flagged_scam', 'under_construction'],
    default: 'pending_review',
    index: true
  },
  
  ownerUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better query performance
CompanySchema.index({ companyName: 1, category: 1 });
CompanySchema.index({ slug: 1 }, { unique: true });
CompanySchema.index({ status: 1, category: 1 });
CompanySchema.index({ 'scores.overallRating': -1 }); // For sorting by rating
CompanySchema.index({ 'scores.riskLevel': 1 }); // For risk-based queries
CompanySchema.index({ tags: 1 }); // For tag-based filtering

// Virtual for full company name (if needed)
CompanySchema.virtual('fullName').get(function() {
  return `${this.companyName} (${this.category.toUpperCase()})`;
});

// Pre-save hook to ensure conditional fields are validated based on category
CompanySchema.pre<ICompany>('save', function(next) {
  // You can add category-specific validation logic here if needed
  // For example, ensure crypto companies have contractAddress if tokenSymbol exists
  if (this.category === 'crypto' && this.tokenSymbol && !this.contractAddress) {
    // Could add warning or validation - for now just pass
  }
  
  // Ensure MLM companies have required fields if needed
  if (this.category === 'mlm') {
    // Add any MLM-specific validation
  }
  
  next();
});

// Create and export the model
export const Company = mongoose.model<ICompany>('Company', CompanySchema);
export default Company;