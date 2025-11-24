import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { ArrowLeft, Package, Truck, CreditCard, Calendar, MapPin } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Order not found</h3>
          <div className="mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/orders')} 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          {/* Order Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Order #{order._id.slice(-8)}
                </h2>
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  Placed on {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  order.isPaid 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                }`}>
                  <CreditCard className="mr-1.5 h-4 w-4" />
                  {order.isPaid ? 'Paid' : 'Pending Payment'}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  order.isDelivered 
                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  <Truck className="mr-1.5 h-4 w-4" />
                  {order.isDelivered ? 'Delivered' : 'Processing'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-5 sm:p-6">
            {/* Shipping Information */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                  {order.orderItems.map((item, index) => (
                    <li key={index} className="p-4 flex items-center bg-white">
                      {item.product && (
                        <>
                          <div className="flex-shrink-0 h-20 w-20 border border-gray-200 rounded-md overflow-hidden">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="text-base font-medium text-gray-900">{item.product.name}</h4>
                            <p className="mt-1 text-sm text-gray-500">Quantity: {item.quantity}</p>
                            <p className="mt-1 text-sm text-gray-500">Price: {formatCurrency(item.price)}</p>
                          </div>
                          <div className="ml-4 text-base font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary & Address */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Subtotal</dt>
                    <dd className="text-gray-900">{formatCurrency(order.totalPrice - order.taxPrice - order.shippingPrice)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Shipping</dt>
                    <dd className="text-gray-900">{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Tax</dt>
                    <dd className="text-gray-900">{formatCurrency(order.taxPrice)}</dd>
                  </div>
                  <div className="pt-3 flex justify-between text-base font-bold border-t border-gray-200">
                    <dt className="text-gray-900">Total</dt>
                    <dd className="text-primary-600">{formatCurrency(order.totalPrice)}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                </div>
                <address className="not-italic text-sm text-gray-500 leading-relaxed">
                  <span className="block text-gray-900 font-medium mb-1">{order.shippingAddress.street}</span>
                  <span className="block">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                  <span className="block">{order.shippingAddress.zipCode}</span>
                  <span className="block">{order.shippingAddress.country}</span>
                </address>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
                </div>
                <p className="text-sm text-gray-500">
                  {order.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;


