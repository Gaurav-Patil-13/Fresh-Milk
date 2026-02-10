import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Auth Pages
import CustomerLogin from './pages/auth/CustomerLogin';
import CustomerSignup from './pages/auth/CustomerSignup';
import SellerLogin from './pages/auth/SellerLogin';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseMilk from './pages/customer/BrowseMilk';
import SellersByMilk from './pages/customer/SellersByMilk';
import PlaceOrder from './pages/customer/PlaceOrder';
import MyOrders from './pages/customer/MyOrders';
import MySubscriptions from './pages/customer/MySubscriptions';
import MyPayments from './pages/customer/MyPayments';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageMilk from './pages/seller/ManageMilk';
import SellerOrders from './pages/seller/SellerOrders';
import SellerSubscriptions from './pages/seller/SellerSubscriptions';
import SellerPayments from './pages/seller/SellerPayments';
import SellerRatings from './pages/seller/SellerRatings';

// Shared Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/signup" element={<CustomerSignup />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        
        {/* Customer Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <PrivateRoute role="customer">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/browse-milk"
          element={
            <PrivateRoute role="customer">
              <BrowseMilk />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/sellers/:milkType"
          element={
            <PrivateRoute role="customer">
              <SellersByMilk />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/place-order/:milkId"
          element={
            <PrivateRoute role="customer">
              <PlaceOrder />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <PrivateRoute role="customer">
              <MyOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/subscriptions"
          element={
            <PrivateRoute role="customer">
              <MySubscriptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/payments"
          element={
            <PrivateRoute role="customer">
              <MyPayments />
            </PrivateRoute>
          }
        />
        
        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <PrivateRoute role="seller">
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/manage-milk"
          element={
            <PrivateRoute role="seller">
              <ManageMilk />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <PrivateRoute role="seller">
              <SellerOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/subscriptions"
          element={
            <PrivateRoute role="seller">
              <SellerSubscriptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/payments"
          element={
            <PrivateRoute role="seller">
              <SellerPayments />
            </PrivateRoute>
          }
        />
        <Route
          path="/seller/ratings"
          element={
            <PrivateRoute role="seller">
              <SellerRatings />
            </PrivateRoute>
          }
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;