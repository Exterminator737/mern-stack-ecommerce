import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';
import ProductCard from '../components/ProductCard';
import HeroSection from '../components/HeroSection';
import BrandCarousel from '../components/BrandCarousel';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, saleRes] = await Promise.all([
        axios.get('/api/products?limit=8&sort=newest'),
        axios.get('/api/products?isOnSale=true&limit=4&sort=newest')
      ]);
      setProducts(featuredRes.data.products);
      setSaleProducts(saleRes.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* New Hero Section */}
      <HeroSection />

      {/* Brand Carousel */}
      <BrandCarousel />

      {/* On Sale Section */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-red-50">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
            <span className="mr-2">🔥</span> On Sale Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Featured Products</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link to="/products" className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;


