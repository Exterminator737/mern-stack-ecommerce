import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlists();
    } else {
      setWishlists([]);
    }
  }, [isAuthenticated]);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/wishlists');
      setWishlists(res.data || []);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWishlist = async (name, description) => {
    try {
      const res = await axios.post('/api/wishlists', { name, description });
      await fetchWishlists();
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create wishlist'
      };
    }
  };

  const deleteWishlist = async (id) => {
    try {
      await axios.delete(`/api/wishlists/${id}`);
      await fetchWishlists();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete wishlist'
      };
    }
  };

  const addToWishlist = async (wishlistId, productId) => {
    try {
      await axios.post(`/api/wishlists/${wishlistId}/add`, { productId });
      await fetchWishlists();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to wishlist'
      };
    }
  };

  const removeFromWishlist = async (wishlistId, productId) => {
    try {
      await axios.delete(`/api/wishlists/${wishlistId}/remove/${productId}`);
      await fetchWishlists();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from wishlist'
      };
    }
  };

  const isInWishlist = (productId) => {
    for (const wishlist of wishlists) {
      if (wishlist.products.some(p => (typeof p === 'string' ? p : p._id) === productId)) {
        return wishlist._id;
      }
    }
    return null;
  };

  const value = {
    wishlists,
    loading,
    fetchWishlists,
    createWishlist,
    deleteWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
