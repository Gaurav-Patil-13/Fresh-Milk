import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, isCustomer, isSeller } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">🥛 Fresh Milk Delivered Daily</h1>
          <p className="hero-subtitle">
            Order fresh, quality milk from trusted local sellers
          </p>

          {!isAuthenticated && (
            <div className="hero-actions">
              <Link to="/customer/signup" className="btn btn-primary btn-lg">
                Get Started as Customer
              </Link>
              <Link to="/seller/login" className="btn btn-outline btn-lg">
                Seller Login
              </Link>
            </div>
          )}

          {isAuthenticated && isCustomer && (
            <div className="hero-actions">
              <Link to="/customer/browse-milk" className="btn btn-primary btn-lg">
                Browse Milk Types
              </Link>
              <Link to="/customer/dashboard" className="btn btn-outline btn-lg">
                Go to Dashboard
              </Link>
            </div>
          )}

          {isAuthenticated && isSeller && (
            <div className="hero-actions">
              <Link to="/seller/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          
          <div className="grid grid-3">
            <div className="feature-card card">
              <div className="feature-icon">🥛</div>
              <h3>Fresh & Quality</h3>
              <p>Get fresh milk delivered daily from trusted local sellers</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">📅</div>
              <h3>Flexible Subscriptions</h3>
              <p>Create custom subscriptions and pause them when needed</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Updates</h3>
              <p>Get instant notifications for all your orders and deliveries</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">💳</div>
              <h3>Easy Payments</h3>
              <p>Track your payments and manage your balance effortlessly</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">⭐</div>
              <h3>Ratings & Reviews</h3>
              <p>Choose the best sellers based on customer ratings</p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">🚚</div>
              <h3>Doorstep Delivery</h3>
              <p>Fresh milk delivered right to your doorstep every day</p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="grid grid-2">
            <div className="steps-column">
              <h3 className="mb-3">For Customers</h3>
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Sign Up</h4>
                  <p>Create your account in seconds</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Browse Milk Types</h4>
                  <p>Choose from various milk types and sellers</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Place Order</h4>
                  <p>Order daily or create a subscription</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Enjoy Fresh Milk</h4>
                  <p>Get fresh milk delivered to your door</p>
                </div>
              </div>
            </div>

            <div className="steps-column">
              <h3 className="mb-3">For Sellers</h3>
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Get Verified</h4>
                  <p>Admin creates your seller account</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Add Products</h4>
                  <p>List your milk products with details</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Receive Orders</h4>
                  <p>Get real-time notifications for orders</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Grow Business</h4>
                  <p>Build your reputation with great service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;