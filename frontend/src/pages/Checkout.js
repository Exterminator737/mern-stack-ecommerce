import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const { cartItems, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'Credit Card'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    } else {
      // Pre-fill with user address if available
      if (user?.address) {
        setFormData(prev => ({
          ...prev,
          ...user.address
        }));
      }
      fetchCart();
    }
  }, [isAuthenticated, navigate, cartItems.length, user, fetchCart]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };

      const res = await axios.post('/api/orders', orderData);
      
      if (formData.paymentMethod === 'PayFast') {
        // Initiate PayFast payment
        const payFastRes = await axios.post('/api/payfast/pay', {
          orderId: res.data._id,
          amount: res.data.totalPrice,
          itemName: `Order #${res.data._id}`
        });
        
        const { url, paymentData } = payFastRes.data;
        
        // Create hidden form and submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = url;
        
        Object.keys(paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        navigate(`/orders/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return null;
  }

  const shippingPrice = cartTotal > 500 ? 0 : 50;
  const taxPrice = cartTotal * 0.15;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping Address</h3>
                    <p className="mt-1 text-sm text-gray-500">Where should we send your order?</p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input
                          type="text"
                          name="street"
                          id="street"
                          value={formData.street}
                          onChange={handleChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                        <input
                          type="text"
                          name="state"
                          id="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          name="country"
                          id="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 border px-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Payment</h3>
                    <p className="mt-1 text-sm text-gray-500">Select your payment method.</p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="col-span-6">
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm h-10"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="PayFast">PayFast</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    loading ? 'opacity-75 cursor-wait' : ''
                  }`}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 p-6 border-b border-gray-200">Order Summary</h2>
              
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {cartItems.map(item => (
                  item.product && (
                    <li key={item.productId} className="flex py-6 px-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                        </div>
                      </div>
                    </li>
                  )
                ))}
              </ul>

              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Subtotal</p>
                  <p className="font-medium text-gray-900">{formatCurrency(cartTotal)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Shipping</p>
                  <p className="font-medium text-gray-900">{shippingPrice === 0 ? 'FREE' : formatCurrency(shippingPrice)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <p>Tax (15%)</p>
                  <p className="font-medium text-gray-900">{formatCurrency(taxPrice)}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 pt-4 border-t border-gray-200">
                  <p>Total</p>
                  <p className="text-primary-600">{formatCurrency(totalPrice)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


