import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { Trash2, ShoppingCart } from 'lucide-react';

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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="flex justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <p className="mt-4 text-lg text-gray-500">Your cart is empty</p>
            <Link to="/products" className="mt-6 inline-block bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    item.product && (
                      <li key={item.productId} className="p-6 flex items-center">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1 flex flex-col sm:flex-row sm:justify-between">
                          <div className="pr-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link to={`/products/${item.product._id}`} className="hover:underline">
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                            <p className="mt-1 text-lg font-medium text-gray-900">{formatCurrency(item.price)}</p>
                          </div>

                          <div className="mt-4 sm:mt-0 flex flex-col items-end justify-between">
                            <button
                              onClick={() => handleRemove(item.productId)}
                              className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                            
                            <div className="mt-2 flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                className="p-2 text-gray-600 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-4 py-2 text-gray-900 font-medium border-l border-r border-gray-300 min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                className="p-2 text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                
                <div className="flow-root">
                  <dl className="-my-4 text-sm divide-y divide-gray-200">
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Subtotal</dt>
                      <dd className="font-medium text-gray-900">{formatCurrency(cartTotal)}</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Shipping</dt>
                      <dd className="font-medium text-gray-900">{cartTotal > 500 ? 'FREE' : formatCurrency(50)}</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between">
                      <dt className="text-gray-600">Tax (15%)</dt>
                      <dd className="font-medium text-gray-900">{formatCurrency(cartTotal * 0.15)}</dd>
                    </div>
                    <div className="py-4 flex items-center justify-between border-t border-gray-200">
                      <dt className="text-base font-bold text-gray-900">Total</dt>
                      <dd className="text-base font-bold text-primary-600">
                        {formatCurrency(cartTotal + (cartTotal > 500 ? 0 : 50) + (cartTotal * 0.15))}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;


