import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import './Cart.css';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, updateCartItem, removeFromCart, fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchCart();
    }
  }, [isAuthenticated, navigate, fetchCart]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateCartItem(productId, newQuantity);
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map(item => (
                item.product && (
                  <div key={item.productId} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.product.image} alt={item.product.name} />
                    </div>
                    
                    <div className="cart-item-details">
                      <h3>{item.product.name}</h3>
                      <p className="cart-item-price">{formatCurrency(item.price)}</p>
                    </div>
                    
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="cart-item-total">
                      <p>{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="btn-remove"
                    >
                      ×
                    </button>
                  </div>
                )
              ))}
            </div>
            
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{cartTotal > 500 ? 'FREE' : formatCurrency(50)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>{formatCurrency(cartTotal * 0.15)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatCurrency(cartTotal + (cartTotal > 500 ? 0 : 50) + (cartTotal * 0.15))}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary btn-lg btn-block">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;


