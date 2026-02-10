import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Seller.css';

const SellerSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      let url = '/subscriptions/seller';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const response = await API.get(url);
      setSubscriptions(response.data.data);
    } catch (error) {
      toast.error('Error fetching subscriptions');
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
    <div className="seller-subscriptions">
      <div className="container">
        <div className="page-header">
          <h1>Customer Subscriptions</h1>
          <p className="text-muted">Track and manage all subscriptions</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-tab ${filter === 'paused' ? 'active' : ''}`}
            onClick={() => setFilter('paused')}
          >
            Paused
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="empty-state card">
            <h3>No subscriptions found</h3>
            <p>No subscriptions match your current filter</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {subscriptions.map(sub => (
              <div key={sub._id} className="subscription-card card">
                <div className="subscription-header">
                  <div>
                    <h3>{sub.customer?.name}</h3>
                    <p className="text-muted">📞 {sub.customer?.phone}</p>
                  </div>
                  <span className={`badge badge-${
                    sub.status === 'active' ? 'success' :
                    sub.status === 'paused' ? 'warning' :
                    sub.status === 'completed' ? 'info' : 'danger'
                  }`}>
                    {sub.status.toUpperCase()}
                  </span>
                </div>

                <div className="subscription-details">
                  <div className="detail-row">
                    <span className="label">Milk Type:</span>
                    <span className="value">{sub.milk?.milkType || sub.milk?.customMilkType}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Daily Quantity:</span>
                    <span className="value">{sub.quantityPerDay} L/day</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span className="value">{new Date(sub.startDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span className="value">{new Date(sub.endDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Total Days:</span>
                    <span className="value">{sub.totalDays} days</span>
                  </div>

                  {sub.extendedDays > 0 && (
                    <div className="detail-row">
                      <span className="label">Extended Days:</span>
                      <span className="value text-warning">{sub.extendedDays} days (paused)</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="label">Remaining Days:</span>
                    <span className="value text-primary">{sub.remainingDays} days</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Completed Days:</span>
                    <span className="value">{sub.completedDays} days</span>
                  </div>
                  
                  <div className="detail-row total-row">
                    <span className="label">Total Amount:</span>
                    <span className="value text-primary">₹{sub.totalAmount}</span>
                  </div>

                  <div className="payment-info">
                    <div className="payment-row">
                      <span>Paid Amount:</span>
                      <span className="text-success">₹{sub.totalPaid || 0}</span>
                    </div>
                    <div className="payment-row">
                      <span>Remaining:</span>
                      <span className="text-danger">₹{sub.remainingAmount || sub.totalAmount}</span>
                    </div>
                  </div>

                  {sub.pausedDates && sub.pausedDates.length > 0 && (
                    <div className="paused-dates">
                      <strong>Paused Dates:</strong>
                      <div className="dates-list">
                        {sub.pausedDates.map((pd, index) => (
                          <span key={index} className="date-badge">
                            {new Date(pd.date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sub.deliveryAddress && (
                    <div className="address-section">
                      <strong>Delivery Address:</strong>
                      <p className="text-muted">
                        {sub.deliveryAddress.street && `${sub.deliveryAddress.street}, `}
                        {sub.deliveryAddress.city && `${sub.deliveryAddress.city}, `}
                        {sub.deliveryAddress.state && `${sub.deliveryAddress.state} `}
                        {sub.deliveryAddress.pincode}
                      </p>
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

export default SellerSubscriptions;