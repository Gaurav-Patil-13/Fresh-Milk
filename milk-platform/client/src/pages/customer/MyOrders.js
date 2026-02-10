import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      let url = '/orders/customer';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const response = await API.get(url);
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await API.put(`/orders/${orderId}/cancel`, {
        cancelReason: 'Cancelled by customer'
      });

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling order');
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
    <div className="my-orders">
      <div className="container">
        <div className="page-header">
          <h1>My Orders</h1>
          <p className="text-muted">View and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
          <button
            className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-state card">
            <h3>No orders found</h3>
            <p>Start ordering fresh milk today!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order._id} className="order-card card">
                <div className="order-header-section">
                  <div>
                    <h3>{order.milk?.milkType || order.milk?.customMilkType} Milk</h3>
                    <p className="text-muted">From: {order.seller?.businessName || order.seller?.name}</p>
                  </div>
                  <span className={`badge badge-${
                    order.status === 'delivered' ? 'success' :
                    order.status === 'cancelled' ? 'danger' :
                    order.status === 'confirmed' ? 'info' : 'warning'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-details-section">
                  <div className="detail-row">
                    <span className="label">Order Type:</span>
                    <span className="value">{order.orderType === 'daily' ? 'Daily Order' : 'Subscription'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Delivery Date:</span>
                    <span className="value">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{order.quantity} L</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Price per Liter:</span>
                    <span className="value">₹{order.pricePerLiter}</span>
                  </div>
                  
                  <div className="detail-row total-row">
                    <span className="label">Total Amount:</span>
                    <span className="value text-primary">₹{order.totalAmount}</span>
                  </div>

                  {order.deliveryAddress && (
                    <div className="address-section">
                      <strong>Delivery Address:</strong>
                      <p className="text-muted">
                        {order.deliveryAddress.street && `${order.deliveryAddress.street}, `}
                        {order.deliveryAddress.city && `${order.deliveryAddress.city}, `}
                        {order.deliveryAddress.state && `${order.deliveryAddress.state} `}
                        {order.deliveryAddress.pincode}
                      </p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="notes-section">
                      <strong>Notes:</strong>
                      <p className="text-muted">{order.notes}</p>
                    </div>
                  )}
                </div>

                {order.status === 'pending' && order.orderType === 'daily' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;