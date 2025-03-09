import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Resources from './pages/Resources';
import Discussions from './pages/Discussions';
import Login from './pages/Login';
import PostDetails from './pages/PostDetails';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import PrivateRoute from './components/PrivateRoute';
import PregnancyGuide from './pages/PregnancyGuide';
import Shop from './pages/Shop';
import ProductListing from './pages/ProductListing';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';
import OrderConfirmation from './pages/OrderConfirmation';
import PaymentFailed from './pages/PaymentFailed';
import './i18n';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="resources" element={<Resources />} />
            <Route path="discussions" element={<Discussions />} />
            <Route path="discussions/:id" element={<PostDetails />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/:id" element={<BlogDetail />} />
            <Route path="pregnancy-guide" element={<PregnancyGuide />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/:categoryId" element={<ProductListing />} />
            
            {/* Protected routes */}
            <Route path="checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
            <Route path="order-confirmation" element={
              <PrivateRoute>
                <OrderConfirmation />
              </PrivateRoute>
            } />
            <Route path="payment-failed" element={
              <PrivateRoute>
                <PaymentFailed />
              </PrivateRoute>
            } />
          </Route>
          <Route path="payment/success" element={<Navigate to="/order-confirmation" />} />
          <Route path="payment/failure" element={<Navigate to="/payment-failed" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;