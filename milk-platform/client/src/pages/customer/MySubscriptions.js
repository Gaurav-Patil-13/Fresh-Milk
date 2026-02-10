import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pauseModal, setPauseModal] = useState({ show: false, subscriptionId: null });
  const [pauseDate, setPauseDate] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await API.get('/subscriptions/customer');
      setSubscriptions(response.data.data);
    } catch (error) {
      toast.error('Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseClick = (subscriptionId) => {
    setPauseModal({ show: true, subscriptionId });
    
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPauseDate(tomorrow.toISOString().split('T')[0]);
  };

  const handlePauseSubmit = async () => {
    try {
      const response = await API.post(`/subscriptions/${pauseModal.subscriptionId}/pause`, {
        pauseDate
      });

      if (response.data.success) {
        toast.success('Subscription paused successfully! End date extended by 1 day.');
        setPauseModal({ show: false, subscriptionId: null });
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error pausing subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to cancel this subscription? All future orders will be cancelled.')) {
      return;
    }

    try {
      const response = await API.put(`/subscriptions/${subscriptionId}/cancel`);

      if (response.data.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling subscription');
    }
  };

  const getMinPauseDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-subscriptions">
      <div className="container">
        <div className="page-header">
          <h1>My Subscriptions</h1>
          <p className="text-muted">Manage your milk subscriptions</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="empty-state card">
            <h3>No subscriptions yet</h3>
            <p>Create a subscription for regular milk delivery!</p>
          </div>
        ) : (
          <div className="subscriptions-grid">
            {subscriptions.map(subscription => (
              <div key={subscription._id} className="subscription-card card">
                <div className="subscription-header">
                  <div>
                    <h3>{subscription.milk?.milkType || subscription.milk?.customMilkType} Milk</h3>
                    <p className="text-muted">From: {subscription.seller?.businessName || subscription.seller?.name}</p>
                  </div>
                  <span className={`badge badge-${
                    subscription.status === 'active' ? 'success' :
                    subscription.status === 'paused' ? 'warning' :
                    subscription.status === 'completed' ? 'info' : 'danger'
                  }`}>
                    {subscription.status.toUpperCase()}
                  </span>
                </div>

                <div className="subscription-details">
                  <div className="detail-row">
                    <span className="label">Start Date:</span>
                    <span className="value">{new Date(subscription.startDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">End Date:</span>
                    <span className="value">{new Date(subscription.endDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Total Days:</span>
                    <span className="value">{subscription.totalDays} days</span>
                  </div>

                  {subscription.extendedDays > 0 && (
                    <div className="detail-row">
                      <span className="label">Extended Days:</span>
                      <span className="value text-primary">{subscription.extendedDays} days</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="label">Remaining Days:</span>
                    <span className="value">{subscription.remainingDays} days</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Daily Quantity:</span>
                    <span className="value">{subscription.quantityPerDay} L</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Price per Liter:</span>
                    <span className="value">₹{subscription.pricePerLiter}</span>
                  </div>
                  
                  <div className="detail-row total-row">
                    <span className="label">Total Amount:</span>
                    <span className="value text-primary">₹{subscription.totalAmount}</span>
                  </div>

                  <div className="payment-info">
                    <div className="payment-row">
                      <span>Paid:</span>
                      <span className="text-success">₹{subscription.totalPaid || 0}</span>
                    </div>
                    <div className="payment-row">
                      <span>Remaining:</span>
                      <span className="text-danger">₹{subscription.remainingAmount || subscription.totalAmount}</span>
                    </div>
                  </div>

                  {subscription.pausedDates && subscription.pausedDates.length > 0 && (
                    <div className="paused-dates">
                      <strong>Paused Dates:</strong>
                      <div className="dates-list">
                        {subscription.pausedDates.map((pd, index) => (
                          <span key={index} className="date-badge">
                            {new Date(pd.date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {subscription.status === 'active' && (
                  <div className="subscription-actions">
                    <button
                      onClick={() => handlePauseClick(subscription._id)}
                      className="btn btn-warning btn-sm"
                    >
                      Pause a Day
                    </button>
                    <button
                      onClick={() => handleCancelSubscription(subscription._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pause Modal */}
        {pauseModal.show && (
          <div className="modal-overlay" onClick={() => setPauseModal({ show: false, subscriptionId: null })}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Pause Subscription</h3>
              <p className="text-muted mb-3">
                Select a date to pause delivery. Must be at least 1 day in advance.
                Your subscription will be automatically extended by 1 day.
              </p>

              <div className="form-group">
                <label className="form-label">Pause Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={pauseDate}
                  onChange={(e) => setPauseDate(e.target.value)}
                  min={getMinPauseDate()}
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={handlePauseSubmit}
                  className="btn btn-primary"
                  disabled={!pauseDate}
                >
                  Confirm Pause
                </button>
                <button
                  onClick={() => setPauseModal({ show: false, subscriptionId: null })}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;