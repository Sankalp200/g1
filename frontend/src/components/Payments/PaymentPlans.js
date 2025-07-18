import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './PaymentPlans.css';

const PaymentPlans = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
    loadRazorpayScript();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/payments/plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planType) => {
    if (processingPayment) return;
    
    setProcessingPayment(true);
    setSelectedPlan(planType);

    try {
      // Create order
      const orderResponse = await axios.post('/api/payments/create-order', {
        plan: planType
      });

      const { order, keyId, plan } = orderResponse.data;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Roadmap App',
        description: `Payment for ${plan.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await axios.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.data.success) {
              alert('Payment successful! Your subscription has been activated.');
              // Refresh page or update user context
              window.location.reload();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || ''
        },
        notes: {
          userId: currentUser?.id || '',
          plan: planType
        },
        theme: {
          color: '#667eea'
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            setSelectedPlan(null);
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Error creating payment order. Please try again.');
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="payment-plans-container">
        <div className="loading">Loading payment plans...</div>
      </div>
    );
  }

  return (
    <div className="payment-plans-container">
      <div className="plans-header">
        <h1>Choose Your Plan</h1>
        <p>Select the perfect plan for your needs</p>
        {currentUser?.subscriptionPlan && currentUser?.subscriptionPlan !== 'free' && (
          <div className="current-plan">
            <span className="current-plan-badge">
              Current Plan: {currentUser.subscriptionPlan.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="plans-grid">
        {Object.entries(plans).map(([planType, planDetails]) => (
          <div key={planType} className={`plan-card ${planType}`}>
            <div className="plan-header">
              <h3>{planDetails.name}</h3>
              <div className="plan-price">
                {formatPrice(planDetails.price)}
                <span className="price-period">/month</span>
              </div>
            </div>

            <div className="plan-features">
              <ul>
                {planDetails.features.map((feature, index) => (
                  <li key={index}>
                    <span className="feature-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-footer">
              <button
                className={`plan-btn ${
                  processingPayment && selectedPlan === planType ? 'processing' : ''
                }`}
                onClick={() => handlePayment(planType)}
                disabled={processingPayment}
              >
                {processingPayment && selectedPlan === planType
                  ? 'Processing...'
                  : currentUser?.subscriptionPlan === planType
                  ? 'Current Plan'
                  : 'Choose Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-info">
        <div className="info-section">
          <h3>💳 Secure Payment</h3>
          <p>All payments are processed securely through Razorpay with bank-level encryption.</p>
        </div>
        
        <div className="info-section">
          <h3>🔄 Easy Cancellation</h3>
          <p>Cancel your subscription anytime from your account settings.</p>
        </div>
        
        <div className="info-section">
          <h3>📞 24/7 Support</h3>
          <p>Get help whenever you need it with our dedicated customer support.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPlans;