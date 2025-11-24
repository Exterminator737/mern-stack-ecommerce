import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import './Orders.css';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>
        
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <p className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.isPaid ? 'paid' : 'pending'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                    {order.isDelivered && (
                      <span className="status-badge delivered">Delivered</span>
                    )}
                  </div>
                </div>
                
                <div className="order-items-list">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="order-item-row">
                      {item.product && (
                        <>
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className="order-item-image"
                          />
                          <div className="order-item-details">
                            <h4>{item.product.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                          <div className="order-item-price">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total: {formatCurrency(order.totalPrice)}</strong>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;


