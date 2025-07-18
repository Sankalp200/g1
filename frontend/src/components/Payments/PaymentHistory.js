import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPaymentHistory();
  }, [page]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/payments/history?page=${page}&limit=10`);
      setPayments(response.data.payments);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amountInPaise) => {
    return `₹${(amountInPaise / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#28a745';
      case 'failed': return '#dc3545';
      case 'created': return '#ffc107';
      case 'cancelled': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return '✓';
      case 'failed': return '✗';
      case 'created': return '⏳';
      case 'cancelled': return '⚠';
      default: return '?';
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="payment-history-container">
        <div className="loading">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="history-header">
        <h2>Payment History</h2>
        <p>View all your past transactions and payment details</p>
      </div>

      {payments.length === 0 ? (
        <div className="no-payments">
          <div className="no-payments-icon">💳</div>
          <h3>No Payments Found</h3>
          <p>You haven't made any payments yet.</p>
        </div>
      ) : (
        <>
          <div className="payments-list">
            {payments.map((payment) => (
              <div key={payment._id} className="payment-item">
                <div className="payment-info">
                  <div className="payment-main">
                    <div className="payment-plan">
                      <h4>{payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)} Plan</h4>
                      <p className="payment-description">{payment.description}</p>
                    </div>
                    <div className="payment-amount">
                      {formatAmount(payment.amount)}
                    </div>
                  </div>
                  
                  <div className="payment-details">
                    <div className="payment-meta">
                      <span className="payment-date">
                        📅 {formatDate(payment.createdAt)}
                      </span>
                      <span className="payment-receipt">
                        🧾 {payment.receipt}
                      </span>
                      {payment.razorpayPaymentId && (
                        <span className="payment-id">
                          🔗 {payment.razorpayPaymentId}
                        </span>
                      )}
                    </div>
                    
                    <div 
                      className="payment-status"
                      style={{ 
                        backgroundColor: getStatusColor(payment.status),
                        color: 'white'
                      }}
                    >
                      <span className="status-icon">
                        {getStatusIcon(payment.status)}
                      </span>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                className="pagination-btn"
              >
                ← Previous
              </button>
              
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistory;