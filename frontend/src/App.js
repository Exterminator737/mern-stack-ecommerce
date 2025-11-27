import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminSales from "./pages/AdminSales";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AdminCoupons from "./pages/AdminCoupons";
import Wishlists from "./pages/Wishlists";
import WishlistDetail from "./pages/WishlistDetail";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import FAQs from "./pages/FAQs";
import AdminRoute from "./components/AdminRoute";
import BottomNav from "./components/BottomNav";
import ScrollToTopButton from "./components/ScrollToTopButton";
import { useAuth } from "./context/AuthContext";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const hideChrome =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    (isAdmin && user);

  React.useEffect(() => {
    if (
      !loading &&
      user &&
      isAdmin &&
      !location.pathname.startsWith("/admin")
    ) {
      navigate("/admin", { replace: true });
    }
  }, [loading, user, isAdmin, location.pathname, navigate]);
  if (!loading && user && isAdmin && !location.pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <div className="min-h-screen flex flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-grow pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sales"
            element={
              <AdminRoute>
                <AdminSales />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute>
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettings />
              </AdminRoute>
            }
          />
          <Route path="/wishlists" element={<Wishlists />} />
          <Route path="/wishlists/:id" element={<WishlistDetail />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />
          <Route path="/faqs" element={<FAQs />} />
        </Routes>
      </main>
      {!hideChrome && <Footer />}
      {!hideChrome && <BottomNav />}
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <AppLayout />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
