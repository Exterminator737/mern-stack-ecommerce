import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Package, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="flex justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <p className="mt-4 text-lg text-gray-500">You haven't placed any orders yet</p>
            <Link to="/products" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order._id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order #{order._id.slice(-8)}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.isPaid ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Paid</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Pending Payment</>
                      )}
                    </span>
                    {order.isDelivered && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Delivered
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  <ul className="divide-y divide-gray-200">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="py-4 flex items-center">
                        {item.product && (
                          <>
                            <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                              <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <div className="ml-4 text-sm font-medium text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-base font-medium text-gray-900">
                    Total: {formatCurrency(order.totalPrice)}
                  </div>
                  <Link 
                    to={`/orders/${order._id}`} 
                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
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


