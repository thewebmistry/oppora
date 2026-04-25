import mongoose, { Document, Schema } from 'mongoose';

// TypeScript Interface for Plan
export interface IPlan extends Document {
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Plan Schema Definition
const PlanSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: [50, 'Plan name cannot exceed 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      enum: {
        values: ['monthly', 'yearly'],
        message: 'Duration must be either monthly or yearly',
      },
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create and export the model
export const Plan = mongoose.model<IPlan>('Plan', PlanSchema);