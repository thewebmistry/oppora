import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript Interface for Product
export interface IProduct extends Document {
  productName: string;
  companyRef: Types.ObjectId;
  price: number;
  category: 'StarterKit' | 'Software' | 'PhysicalGoods' | 'Subscription' | 'Other';
  imageUrl?: string;
  description?: string;
  status: 'active' | 'out_of_stock' | 'discontinued';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Product Schema Definition
const ProductSchema = new Schema<IProduct>({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true
  },
  
  companyRef: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required'],
    index: true
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['StarterKit', 'Software', 'PhysicalGoods', 'Subscription', 'Other'],
    default: 'Other',
    index: true
  },
  
  imageUrl: {
    type: String,
    default: '',
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Please provide a valid image URL']
  },
  
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  
  status: {
    type: String,
    enum: ['active', 'out_of_stock', 'discontinued'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique-ish product name per company
// This ensures we don't have duplicate product names within the same company
ProductSchema.index({ productName: 1, companyRef: 1 }, { unique: true });

// Index for filtering by category and status
ProductSchema.index({ category: 1, status: 1 });

// Index for price range queries
ProductSchema.index({ price: 1 });

// Virtual for company details (populated on demand)
ProductSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyRef',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to validate company exists
ProductSchema.pre<IProduct>('save', async function(next) {
  try {
    // Check if the referenced company exists
    const Company = mongoose.model('Company');
    const company = await Company.findById(this.companyRef);
    
    if (!company) {
      const error = new Error('Referenced company does not exist');
      return next(error as any);
    }
    
    // Additional validation: Ensure product name is not empty after trimming
    if (!this.productName.trim()) {
      const error = new Error('Product name cannot be empty');
      return next(error as any);
    }
    
    next();
  } catch (error) {
    next(error as any);
  }
});

// Pre-find hook to add default sorting
ProductSchema.pre('find', function(next) {
  // Default sort by creation date (newest first)
  // Use type assertion to access options
  const query = this as any;
  if (!query.options || !query.options.sort) {
    query.sort({ createdAt: -1 });
  }
  next();
});

// Create and export the model
export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product;