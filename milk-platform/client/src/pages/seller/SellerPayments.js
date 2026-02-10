import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Seller.css';

const SellerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalEarnings: 0, pendingAmount: 0, monthlyEarnings: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = '/payments/seller?';
      if (filter.startDate) url += `startDate=${filter.startDate}&`;
      if (filter.endDate) url += `endDate=${filter.endDate}`;
      
      const response = await API.get(url);
      setPayments(response.data.data);
    } catch (error) {
      toast.error('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await API.get('/payments/seller/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary');
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="seller-payments">
      <div className="container">
        <div className="page-header">
          <h1>Payment Details & Earnings</h1>
          <p className="text-muted">Track your income and payments</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-3 mb-4">
          <div className="earnings-card card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total Earnings</h3>
              <p className="amount text-success">₹{summary.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          <div className="earnings-card card">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <h3>Pending Amount</h3>
              <p className="amount text-warning">₹{summary.pendingAmount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          
          <div className="earnings-card card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Total Transactions</h3>
              <p className="amount text-primary">{payments.length}</p>
            </div>
          </div>
        </div>

        {/* Monthly Earnings */}
        {summary.monthlyEarnings && summary.monthlyEarnings.length > 0 && (
          <div className="card mb-4">
            <h2>Monthly Earnings Trend</h2>
            <div className="monthly-chart">
              {summary.monthlyEarnings.map((item, index) => (
                <div key={index} className="month-item">
                  <div className="month-bar" style={{ height: `${(item.total / Math.max(...summary.monthlyEarnings.map(m => m.total))) * 150}px` }}>
                    <span className="bar-value">₹{item.total.toFixed(0)}</span>
                  </div>
                  <div className="month-label">
                    {new Date(2024, item._id.month - 1).toLocaleString('default', { month: 'short' })}
                  </div>
                  <div className="month-count">{item.count} txns</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-section card">
          <h3>Filter Payments</h3>
          <div className="filters">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                name="startDate"
                className="form-control"
                value={filter.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                name="endDate"
                className="form-control"
                value={filter.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <button 
                onClick={() => setFilter({ startDate: '', endDate: '' })} 
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <h2>Payment History</h2>
          
          {payments.length === 0 ? (
            <div className="empty-state">
              <p>No payments received yet</p>
            </div>
          ) : (
            <div className="payments-list">
              {payments.map(payment => (
                <div key={payment._id} className="payment-item">
                  <div className="payment-main">
                    <div className="payment-customer">
                      <strong>{payment.customer?.name}</strong>
                      <p className="text-muted">
                        {new Date(payment.paidAt).toLocaleDateString()} at {new Date(payment.paidAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="payment-amount-section">
                      <span className="payment-amount">₹{payment.amount.toFixed(2)}</span>
                      <span className={`badge badge-${
                        payment.paymentStatus === 'completed' ? 'success' :
                        payment.paymentStatus === 'pending' ? 'warning' :
                        payment.paymentStatus === 'failed' ? 'danger' : 'info'
                      }`}>
                        {payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="payment-details-grid">
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
                        <span className="label">For Order:</span>
                        <span className="value">
                          Delivery on {new Date(payment.order.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {payment.subscription && (
                      <div className="detail-item">
                        <span className="label">For Subscription:</span>
                        <span className="value">
                          {new Date(payment.subscription.startDate).toLocaleDateString()} - {new Date(payment.subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {payment.notes && (
                      <div className="detail-item full-width">
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
    </div>
  );
};

export default SellerPayments;