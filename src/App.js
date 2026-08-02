import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Analytics from "./pages/Analytics";
import Navbar from './components/Navbar';
import WhatsappCall from './components/WatsappCall';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
// import { useEffect } from "react";

// Route-level code splitting — each page loads its own chunk on demand
// instead of bloating the initial bundle.
const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const About         = lazy(() => import('./pages/About'));
const Info          = lazy(() => import('./pages/Info'));
const Contact       = lazy(() => import('./pages/Contact'));
const Login         = lazy(() => import('./pages/Login'));
const Signup        = lazy(() => import('./pages/Signup'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Payment       = lazy(() => import('./pages/Payment'));
const OrderHistory  = lazy(() => import('./pages/OrderHistory'));
const OrderSuccess  = lazy(() => import('./pages/OrderSuccess'));
const OrderFailed   = lazy(() => import('./pages/OrderFailed'));

function RouteFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
      <div style={{
        width: 44, height: 44,
        border: "5px solid #e0f2f1",
        borderTop: "5px solid #009688",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  // useEffect(() => {
  //   document.title = "Natural Cocos | Premium Cocopeat & Coir Products";
  //   const handleContextMenu = (e) => {
  //     e.preventDefault();
  //     window.alert("Sorry, right-click has been disabled.");
  //   };
  //   document.addEventListener("contextmenu", handleContextMenu);
  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //   };
  // }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Analytics />
          <Navbar />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:section/:product" element={<ProductDetails />} />
          <Route path="/WhyUs" element={<Info />} />
          <Route path="/AboutUs" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/order-failed" element={<ProtectedRoute><OrderFailed /></ProtectedRoute>} />
        </Routes>
          </Suspense>
          <WhatsappCall message="Hi, I would like to order a custom product!" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
