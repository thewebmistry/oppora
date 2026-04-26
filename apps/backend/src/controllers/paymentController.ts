import { Request, Response, NextFunction } from 'express';
import { Plan } from '../models/Plan';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import AppError from '../utils/AppError';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
      };
    }
  }
}

/**
 * @desc    Get all active plans
 * @route   GET /api/payment/plans
 * @access  Public
 */
export const getAvailablePlans = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const plans = await Plan.find({ isActive: true }).select('-__v').lean();

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initiate checkout for a plan
 * @route   POST /api/payment/checkout
 * @access  Private (User must be authenticated)
 */
export const initiateCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.body;
    const userId = req.user?._id; // Assuming user is attached to request via auth middleware

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!planId) {
      return next(new AppError('Plan ID is required', 400));
    }

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return next(new AppError('Plan not found', 404));
    }

    if (!plan.isActive) {
      return next(new AppError('This plan is currently unavailable', 400));
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Generate a unique transaction ID (in production, this would come from payment gateway)
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create a pending transaction record
    const transaction = await Transaction.create({
      userRef: userId,
      planRef: planId,
      amount: plan.price,
      transactionId,
      status: 'pending',
      metadata: {
        planName: plan.name,
        planDuration: plan.duration,
        initiatedAt: new Date().toISOString(),
        // In production, add gateway-specific metadata here
      },
    });

    // In production, you would integrate with Stripe/Razorpay here
    // and return a checkout URL or session ID
    // For now, we return the transaction object with a mock checkout URL

    res.status(201).json({
      success: true,
      message: 'Checkout initiated successfully',
      data: {
        transaction: {
          id: transaction._id,
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          status: transaction.status,
          createdAt: transaction.createdAt,
        },
        plan: {
          name: plan.name,
          duration: plan.duration,
          features: plan.features,
        },
        // Mock checkout URL for development
        checkoutUrl: `https://sandbox.payment-gateway.com/checkout/${transactionId}`,
        instructions: 'In production, this would be a real payment gateway checkout URL',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Webhook handler for payment gateway callbacks (placeholder)
 * @route   POST /api/payment/webhook
 * @access  Public (called by payment gateway)
 */
export const handlePaymentWebhook = async (
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    // This is a placeholder for webhook handling
    // In production, you would verify the webhook signature,
    // update transaction status, and trigger any post-payment actions
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};