import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await API.get('/payments/customer');
      setPayments(response.data.data);
      
      // Calculate total
      const total = response.data.data.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalPaid(total);
    } catch (error) {
      toast.error('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-payments">
      <div className="container">
        <div className="page-header">
          <h1>Payment History</h1>
          <p className="text-muted">View all your payment transactions</p>
        </div>

        {/* Summary Card */}
        <div className="summary-card card">
          <div className="summary-item">
            <span className="label">Total Payments Made:</span>
            <span className="value text-primary">₹{totalPaid.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Transactions:</span>
            <span className="value">{payments.length}</span>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="empty-state card">
            <h3>No payments yet</h3>
            <p>Your payment history will appear here</p>
          </div>
        ) : (
          <div className="payments-list">
            {payments.map(payment => (
              <div key={payment._id} className="payment-card card">
                <div className="payment-header">
                  <div>
                    <h4>Payment to {payment.seller?.businessName || payment.seller?.name}</h4>
                    <p className="text-muted">
                      {new Date(payment.paidAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="payment-amount">
                    <span className="amount">₹{payment.amount}</span>
                    <span className={`badge badge-${
                      payment.paymentStatus === 'completed' ? 'success' :
                      payment.paymentStatus === 'pending' ? 'warning' :
                      payment.paymentStatus === 'failed' ? 'danger' : 'info'
                    }`}>
                      {payment.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="payment-details">
                  <div className="detail-item">
                    <span className="label">Payment Method:</span>
                    <span className="value">{payment.paymentMethod.toUpperCase()}</span>
                  </div>

                  {payment.transactionId && (
                    <div className="detail-item">
                      <span className="label">Transaction ID:</span>
                      <span className="value">{payment.transactionId}</span>
                    </div>
                  )}

                  {payment.order && (
                    <div className="detail-item">
                      <span className="label">Order Date:</span>
                      <span className="value">
                        {new Date(payment.order.deliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {payment.subscription && (
                    <div className="detail-item">
                      <span className="label">Subscription Period:</span>
                      <span className="value">
                        {new Date(payment.subscription.startDate).toLocaleDateString()} - {new Date(payment.subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {payment.notes && (
                    <div className="detail-item">
                      <span className="label">Notes:</span>
                      <span className="value">{payment.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPayments;