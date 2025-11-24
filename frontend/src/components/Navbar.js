import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>🛍️ Wholesale ZA</h1>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/products" className="navbar-link">Products</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="navbar-link cart-link">
                Cart {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
              </Link>
              <Link to="/orders" className="navbar-link">Orders</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-link">Admin</Link>
              )}
              <div className="navbar-user">
                <span>Hello, {user?.name}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


