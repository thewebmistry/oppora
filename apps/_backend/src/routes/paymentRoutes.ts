import { Router } from 'express';
import {
  getAvailablePlans,
  initiateCheckout,
  handlePaymentWebhook,
} from '../controllers/paymentController';

const router = Router();

/**
 * @route   GET /api/payment/plans
 * @desc    Get all active subscription plans
 * @access  Public
 */
router.get('/plans', getAvailablePlans);

/**
 * @route   POST /api/payment/checkout
 * @desc    Initiate checkout for a plan (create pending transaction)
 * @access  Private (requires authentication)
 * TODO: Add authentication middleware when available
 */
router.post('/checkout', initiateCheckout);

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle payment gateway webhook callbacks
 * @access  Public (called by payment gateway)
 */
router.post('/webhook', handlePaymentWebhook);

export default router;