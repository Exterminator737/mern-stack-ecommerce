import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchOrder();
    }
  }, [id, isAuthenticated, navigate]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!order) {
    return <div className="loading-container">Order not found</div>;
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          ← Back to Orders
        </button>
        
        <h1>Order Details</h1>
        
        <div className="order-detail-card">
          <div className="order-info-section">
            <div className="info-group">
              <h3>Order Information</h3>
              <div className="info-row">
                <label>Order ID:</label>
                <span>#{order._id.slice(-8)}</span>
              </div>
              <div className="info-row">
                <label>Order Date:</label>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <label>Payment Method:</label>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="info-row">
                <label>Payment Status:</label>
                <span className={`status-badge ${order.isPaid ? 'paid' : 'pending'}`}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="info-group">
              <h3>Shipping Address</h3>
              <p>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="order-items-section">
            <h3>Order Items</h3>
            <div className="order-items-list">
              {order.orderItems.map((item, index) => (
                <div key={index} className="order-item-card">
                  {item.product && (
                    <>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="order-item-image"
                      />
                      <div className="order-item-info">
                        <h4>{item.product.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: {formatCurrency(item.price)}</p>
                      </div>
                      <div className="order-item-total">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.totalPrice - order.taxPrice - order.shippingPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="summary-row">
              <span>Tax:</span>
              <span>{formatCurrency(order.taxPrice)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


