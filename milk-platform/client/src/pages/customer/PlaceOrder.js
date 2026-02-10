import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const PlaceOrder = () => {
  const { milkId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [milk, setMilk] = useState(null);
  const [orderType, setOrderType] = useState('daily');
  const [formData, setFormData] = useState({
    deliveryDate: '',
    quantity: 1,
    // Subscription fields
    startDate: '',
    numberOfDays: 7,
    quantityPerDay: 1,
    // Address
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchMilkDetails();
  }, [milkId]);

  useEffect(() => {
    calculateTotal();
  }, [formData, orderType, milk]);

  const fetchMilkDetails = async () => {
    try {
      const response = await API.get(`/milk/${milkId}`);
      setMilk(response.data.data);
    } catch (error) {
      toast.error('Error fetching milk details');
      navigate('/customer/browse-milk');
    }
  };

  const calculateTotal = () => {
    if (!milk) return;

    if (orderType === 'daily') {
      setTotalAmount(formData.quantity * milk.pricePerLiter);
    } else {
      setTotalAmount(formData.numberOfDays * formData.quantityPerDay * milk.pricePerLiter);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateOrderTime = () => {
    if (orderType === 'daily') {
      const deliveryDate = new Date(formData.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deliveryDate.setHours(0, 0, 0, 0);

      // Same day order
      if (deliveryDate.getTime() === today.getTime()) {
        const currentHour = new Date().getHours();
        if (currentHour < 5 || currentHour >= 10) {
          toast.error('Same-day orders are only allowed between 5:00 AM and 10:00 AM');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOrderTime()) {
      return;
    }

    setLoading(true);

    try {
      const address = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      if (orderType === 'daily') {
        const orderData = {
          milkId: milk._id,
          deliveryDate: formData.deliveryDate,
          quantity: parseFloat(formData.quantity),
          deliveryAddress: address,
          notes: formData.notes
        };

        const response = await API.post('/orders/daily', orderData);
        
        if (response.data.success) {
          toast.success('Order placed successfully!');
          navigate('/customer/orders');
        }
      } else {
        const subscriptionData = {
          milkId: milk._id,
          startDate: formData.startDate,
          numberOfDays: parseInt(formData.numberOfDays),
          quantityPerDay: parseFloat(formData.quantityPerDay),
          deliveryAddress: address,
          notes: formData.notes
        };

        const response = await API.post('/subscriptions', subscriptionData);
        
        if (response.data.success) {
          toast.success('Subscription created successfully!');
          navigate('/customer/subscriptions');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If after 10 AM, minimum date is tomorrow
    if (currentHour >= 10) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    
    return now.toISOString().split('T')[0];
  };

  if (!milk) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="place-order">
      <div className="container">
        <div className="order-layout">
          {/* Left: Order Form */}
          <div className="order-form-section">
            <div className="card">
              <h2>Place Your Order</h2>
              
              {/* Order Type Selector */}
              <div className="order-type-selector">
                <button
                  className={`type-btn ${orderType === 'daily' ? 'active' : ''}`}
                  onClick={() => setOrderType('daily')}
                >
                  Daily Order
                </button>
                <button
                  className={`type-btn ${orderType === 'subscription' ? 'active' : ''}`}
                  onClick={() => setOrderType('subscription')}
                >
                  Subscription
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {orderType === 'daily' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Delivery Date *</label>
                      <input
                        type="date"
                        name="deliveryDate"
                        className="form-control"
                        value={formData.deliveryDate}
                        onChange={handleChange}
                        min={getMinDate()}
                        required
                      />
                      <small className="text-muted">
                        Same-day orders: 5 AM - 10 AM only. Future orders: anytime.
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity (liters) *</label>
                      <input
                        type="number"
                        name="quantity"
                        className="form-control"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="0.5"
                        step="0.5"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={formData.startDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Number of Days *</label>
                      <input
                        type="number"
                        name="numberOfDays"
                        className="form-control"
                        value={formData.numberOfDays}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quantity Per Day (liters) *</label>
                      <input
                        type="number"
                        name="quantityPerDay"
                        className="form-control"
                        value={formData.quantityPerDay}
                        onChange={handleChange}
                        min="0.5"
                        step="0.5"
                        required
                      />
                    </div>
                  </>
                )}

                <h3 className="section-title">Delivery Address</h3>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    className="form-control"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street address"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-control"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="PIN code"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions..."
                    rows="3"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place Order - ₹${totalAmount.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="order-summary-section">
            <div className="card">
              <h3>Order Summary</h3>
              
              <div className="summary-item">
                <span>Milk Type:</span>
                <strong>{milk.milkType === 'Other' ? milk.customMilkType : milk.milkType}</strong>
              </div>

              <div className="summary-item">
                <span>Seller:</span>
                <strong>{milk.seller?.businessName || milk.seller?.name}</strong>
              </div>

              <div className="summary-item">
                <span>Price per Liter:</span>
                <strong>₹{milk.pricePerLiter}</strong>
              </div>

              <div className="summary-item">
                <span>Fat Percentage:</span>
                <strong>{milk.fatPercentage}%</strong>
              </div>

              <hr />

              {orderType === 'daily' ? (
                <>
                  <div className="summary-item">
                    <span>Quantity:</span>
                    <strong>{formData.quantity} L</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="summary-item">
                    <span>Duration:</span>
                    <strong>{formData.numberOfDays} days</strong>
                  </div>
                  <div className="summary-item">
                    <span>Daily Quantity:</span>
                    <strong>{formData.quantityPerDay} L</strong>
                  </div>
                  <div className="summary-item">
                    <span>Total Quantity:</span>
                    <strong>{(formData.numberOfDays * formData.quantityPerDay).toFixed(1)} L</strong>
                  </div>
                </>
              )}

              <hr />

              <div className="summary-total">
                <span>Total Amount:</span>
                <strong className="text-primary">₹{totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;