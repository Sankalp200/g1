const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// All routes are protected
router.use(protect);

// Pricing plans
const PLANS = {
  basic: {
    name: 'Basic Plan',
    price: 999, // in paise (₹9.99)
    features: ['Dashboard Access', 'Basic Analytics', 'Email Support']
  },
  premium: {
    name: 'Premium Plan',
    price: 2999, // in paise (₹29.99)
    features: ['All Basic Features', 'Advanced Analytics', 'Priority Support', 'API Access']
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 9999, // in paise (₹99.99)
    features: ['All Premium Features', 'Custom Integrations', 'Dedicated Support', 'White Label']
  }
};

// @desc    Get available plans
// @route   GET /api/payments/plans
// @access  Private
router.get('/plans', async (req, res, next) => {
  try {
    res.json({
      success: true,
      plans: PLANS
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', [
  body('plan')
    .isIn(['basic', 'premium', 'enterprise'])
    .withMessage('Invalid plan selected'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { plan } = req.body;
    const planDetails = PLANS[plan];

    if (!planDetails) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    // Generate unique receipt
    const receipt = `rcpt_${Date.now()}_${req.user._id}`;

    // Create Razorpay order
    const orderOptions = {
      amount: planDetails.price, // amount in paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: req.user._id.toString(),
        plan: plan,
        userEmail: req.user.email
      }
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);

    // Save order in database
    const payment = new Payment({
      user: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: planDetails.price,
      currency: 'INR',
      plan: plan,
      description: `Payment for ${planDetails.name}`,
      receipt: receipt,
      notes: orderOptions.notes
    });

    await payment.save();

    res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      },
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: planDetails
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', [
  body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Signature is required'),
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Find payment record
    const payment = await Payment.findOne({ 
      razorpayOrderId: razorpay_order_id,
      user: req.user._id 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified, update payment record
      await payment.markAsPaid(razorpay_payment_id, razorpay_signature);

      // Update user subscription status or role if needed
      await User.findByIdAndUpdate(req.user._id, {
        subscriptionPlan: payment.plan,
        subscriptionStatus: 'active',
        subscriptionDate: new Date()
      });

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment: {
          id: payment._id,
          orderId: payment.razorpayOrderId,
          paymentId: payment.razorpayPaymentId,
          amount: payment.amount,
          plan: payment.plan,
          status: payment.status
        }
      });
    } else {
      // Invalid signature
      await payment.markAsFailed('Invalid signature');
      
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
});

// @desc    Get user payments
// @route   GET /api/payments/history
// @access  Private
router.get('/history', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-razorpaySignature'); // Don't expose signature

    const total = await Payment.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      count: payments.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      payments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id
    }).select('-razorpaySignature');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Razorpay webhook (for production use)
// @route   POST /api/payments/webhook
// @access  Public (but should be secured with webhook signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const webhookSignature = req.get('X-Razorpay-Signature');
    const webhookBody = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(webhookBody);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        // Handle successful payment
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        // Handle failed payment
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
});

// Helper functions for webhook handling
async function handlePaymentCaptured(paymentEntity) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id
    });

    if (payment && payment.status !== 'paid') {
      await payment.markAsPaid(paymentEntity.id, null);
      
      // Update user subscription
      await User.findByIdAndUpdate(payment.user, {
        subscriptionPlan: payment.plan,
        subscriptionStatus: 'active',
        subscriptionDate: new Date()
      });
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(paymentEntity) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentEntity.order_id
    });

    if (payment && payment.status !== 'failed') {
      await payment.markAsFailed(paymentEntity.error_description || 'Payment failed');
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

module.exports = router;