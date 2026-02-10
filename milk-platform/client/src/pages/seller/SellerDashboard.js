import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Seller.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    activeSubscriptions: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [todayOrdersRes, subscriptionsRes, earningsRes] = await Promise.all([
        API.get(`/orders/seller?date=${today}`),
        API.get('/subscriptions/seller?status=active'),
        API.get('/payments/seller/summary')
      ]);

      setStats({
        todayOrders: todayOrdersRes.data.count,
        activeSubscriptions: subscriptionsRes.data.count,
        totalEarnings: earningsRes.data.data.totalEarnings || 0,
        averageRating: user?.averageRating || 0
      });

      setTodayOrders(todayOrdersRes.data.data.slice(0, 5));
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await API.put(`/orders/${orderId}/status`, { status });
      
      if (response.data.success) {
        toast.success('Order status updated');
        fetchDashboardData();
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
    <div className="seller-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.businessName || user?.name}! 🥛</h1>
          <p className="text-muted">Manage your milk business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-4">
          <div className="stat-card card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.todayOrders}</h3>
              <p>Today's Orders</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">🔁</div>
            <div className="stat-info">
              <h3>{stats.activeSubscriptions}</h3>
              <p>Active Subscriptions</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{stats.totalEarnings.toFixed(2)}</h3>
              <p>Total Earnings</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats.averageRating.toFixed(1)}</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/seller/manage-milk" className="btn btn-primary">
              Manage Milk Products
            </Link>
            <Link to="/seller/orders" className="btn btn-outline">
              View All Orders
            </Link>
            <Link to="/seller/subscriptions" className="btn btn-outline">
              View Subscriptions
            </Link>
            <Link to="/seller/payments" className="btn btn-outline">
              Payment Details
            </Link>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="todays-orders card">
          <div className="flex-between mb-3">
            <h2>Today's Orders</h2>
            <Link to="/seller/orders" className="text-primary">View All →</Link>
          </div>

          {todayOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders for today yet</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Milk Type</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <div>
                          <strong>{order.customer?.name}</strong>
                          <p className="text-muted small">{order.customer?.phone}</p>
                        </div>
                      </td>
                      <td>{order.milk?.milkType || order.milk?.customMilkType}</td>
                      <td>{order.quantity} L</td>
                      <td>₹{order.totalAmount}</td>
                      <td>
                        <span className={`badge badge-${
                          order.status === 'delivered' ? 'success' :
                          order.status === 'cancelled' ? 'danger' :
                          order.status === 'confirmed' ? 'info' : 'warning'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                            className="btn btn-sm btn-primary"
                          >
                            Confirm
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'delivered')}
                            className="btn btn-sm btn-success"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;