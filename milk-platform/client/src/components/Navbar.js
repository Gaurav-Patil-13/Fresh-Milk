import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, isCustomer, isSeller } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🥛 Milk Platform
          </Link>

          <div className="navbar-menu">
            {!isAuthenticated && (
              <>
                <Link to="/customer/login" className="nav-link">
                  Customer Login
                </Link>
                <Link to="/customer/signup" className="nav-link">
                  Customer Signup
                </Link>
                <Link to="/seller/login" className="nav-link">
                  Seller Login
                </Link>
              </>
            )}

            {isAuthenticated && isCustomer && (
              <>
                <Link to="/customer/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/customer/browse-milk" className="nav-link">
                  Browse Milk
                </Link>
                <Link to="/customer/orders" className="nav-link">
                  My Orders
                </Link>
                <Link to="/customer/subscriptions" className="nav-link">
                  Subscriptions
                </Link>
              </>
            )}

            {isAuthenticated && isSeller && (
              <>
                <Link to="/seller/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link to="/seller/manage-milk" className="nav-link">
                  Manage Milk
                </Link>
                <Link to="/seller/orders" className="nav-link">
                  Orders
                </Link>
                <Link to="/seller/subscriptions" className="nav-link">
                  Subscriptions
                </Link>
              </>
            )}

            {isAuthenticated && (
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="btn btn-sm btn-danger">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;