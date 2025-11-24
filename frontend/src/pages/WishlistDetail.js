import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { ArrowLeft, Trash2, ShoppingCart, Heart, AlertCircle } from 'lucide-react';

const WishlistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, [id]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/wishlists/${id}`);
      setWishlist(res.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      navigate('/wishlists');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Remove from wishlist?')) {
      await removeFromWishlist(id, productId);
      fetchWishlist();
    }
  };

  const handleMoveToCart = async (product) => {
    await addToCart(product._id, 1);
    // Optional: Ask to remove from wishlist after adding to cart
    // await removeFromWishlist(id, product._id);
    // fetchWishlist();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!wishlist) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/wishlists" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wishlists
          </Link>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{wishlist.name}</h1>
              {wishlist.description && <p className="text-gray-500 mt-1">{wishlist.description}</p>}
            </div>
          </div>
        </div>

        {wishlist.products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="flex justify-center">
              <Heart className="h-12 w-12 text-gray-300" />
            </div>
            <p className="mt-4 text-lg text-gray-500">This wishlist is empty</p>
            <Link to="/products" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {wishlist.products.map((product) => (
                <li key={product._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-shrink-0 h-24 w-24 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          <Link to={`/products/${product._id}`} className="hover:text-primary-600">
                            {product.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.stock > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRemove(product._id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                        <button
                          onClick={() => handleMoveToCart(product)}
                          disabled={product.stock === 0}
                          className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white ${
                            product.stock === 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDetail;
