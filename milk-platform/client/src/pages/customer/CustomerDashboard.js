import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { toast } from 'react-toastify';
import './Customer.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeOrders: 0,
    activeSubscriptions: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, subscriptionsRes, paymentsRes] = await Promise.all([
        API.get('/orders/customer?status=pending'),
        API.get('/subscriptions/customer?status=active'),
        API.get('/payments/customer')
      ]);

      const totalSpent = paymentsRes.data.data.reduce((sum, payment) => sum + payment.amount, 0);

      setStats({
        activeOrders: ordersRes.data.count,
        activeSubscriptions: subscriptionsRes.data.count,
        totalSpent
      });

      // Get recent orders
      const allOrdersRes = await API.get('/orders/customer');
      setRecentOrders(allOrdersRes.data.data.slice(0, 5));
    } catch (error) {
      toast.error('Error fetching dashboard data');
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
    <div className="customer-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}! 🥛</h1>
          <p className="text-muted">Manage your milk orders and subscriptions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-3">
          <div className="stat-card card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats.activeOrders}</h3>
              <p>Active Orders</p>
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
              <h3>₹{stats.totalSpent.toFixed(2)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/customer/browse-milk" className="btn btn-primary">
              Browse Milk Types
            </Link>
            <Link to="/customer/orders" className="btn btn-outline">
              View All Orders
            </Link>
            <Link to="/customer/subscriptions" className="btn btn-outline">
              Manage Subscriptions
            </Link>
            <Link to="/customer/payments" className="btn btn-outline">
              Payment History
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders card">
          <div className="flex-between mb-3">
            <h2>Recent Orders</h2>
            <Link to="/customer/orders" className="text-primary">View All →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet. Start by browsing milk types!</p>
              <Link to="/customer/browse-milk" className="btn btn-primary mt-2">
                Browse Milk
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {recentOrders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-info">
                    <h4>{order.milk?.milkType || order.milk?.customMilkType}</h4>
                    <p className="text-muted">
                      From: {order.seller?.businessName || order.seller?.name}
                    </p>
                    <p className="text-muted">
                      Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-details">
                    <span className={`badge badge-${
                      order.status === 'delivered' ? 'success' :
                      order.status === 'cancelled' ? 'danger' :
                      order.status === 'confirmed' ? 'info' : 'warning'
                    }`}>
                      {order.status}
                    </span>
                    <p className="order-amount">₹{order.totalAmount}</p>
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

export default CustomerDashboard;