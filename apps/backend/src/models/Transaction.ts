import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript Interface for Transaction
export interface ITransaction extends Document {
  userRef: Types.ObjectId;
  planRef: Types.ObjectId;
  amount: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Schema Definition
const TransactionSchema = new Schema<ITransaction>(
  {
    userRef: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    planRef: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: 'Status must be one of: pending, completed, failed, refunded',
      },
      default: 'pending',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create indexes for faster queries
TransactionSchema.index({ userRef: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ transactionId: 1 }, { unique: true });

// Create and export the model
export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);