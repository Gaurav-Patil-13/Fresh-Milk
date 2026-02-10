import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Seller.css';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filter, dateFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/orders/seller?';
      if (filter !== 'all') url += `status=${filter}&`;
      if (dateFilter) url += `date=${dateFilter}`;
      
      const response = await API.get(url);
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await API.put(`/orders/${orderId}/status`, { status });
      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Error updating status');
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
    <div className="seller-orders">
      <div className="container">
        <div className="page-header">
          <h1>Orders Management</h1>
          <p className="text-muted">View and manage customer orders</p>
        </div>
        
        <div className="filters-section card">
          <div className="filters">
            <div className="form-group">
              <label className="form-label">Filter by Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Status</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                className="form-select"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state card">
            <h3>No orders found</h3>
            <p>No orders match your current filters</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card card">
                <div className="order-header">
                  <div>
                    <h3>{order.customer?.name}</h3>
                    <p className="text-muted">📞 {order.customer?.phone}</p>
                  </div>
                  <span className={`badge badge-${
                    order.status === 'delivered' ? 'success' :
                    order.status === 'cancelled' ? 'danger' :
                    order.status === 'confirmed' ? 'info' : 'warning'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Milk Type:</span>
                    <span className="value">{order.milk?.milkType || order.milk?.customMilkType}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Quantity:</span>
                    <span className="value">{order.quantity} Liters</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Delivery Date:</span>
                    <span className="value">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Order Type:</span>
                    <span className="value">{order.orderType === 'daily' ? 'Daily Order' : 'Subscription'}</span>
                  </div>
                  
                  <div className="detail-row total-row">
                    <span className="label">Amount:</span>
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
                      <strong>Customer Notes:</strong>
                      <p className="text-muted">{order.notes}</p>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                        className="btn btn-primary btn-sm"
                      >
                        Confirm Order
                      </button>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <button 
                      onClick={() => handleUpdateStatus(order._id, 'delivered')}
                      className="btn btn-success btn-sm"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="text-success">✓ Delivered</span>
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

export default SellerOrders;