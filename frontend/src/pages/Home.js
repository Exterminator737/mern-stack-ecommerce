import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import HeroSection from "../components/HeroSection";
import BrandCarousel from "../components/BrandCarousel";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getRecentlyViewed, getTopCategories } from "../utils/personalization";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const { user } = useAuth();
  const { cartItemCount } = useCart();

  useEffect(() => {
    fetchProducts();
    setRecentlyViewed(getRecentlyViewed(8));
    fetchRecommended();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, saleRes] = await Promise.all([
        axios.get("/api/products?limit=8&sort=newest"),
        axios.get("/api/products?isOnSale=true&limit=4&sort=newest"),
      ]);
      setProducts(featuredRes.data.products);
      setSaleProducts(saleRes.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      setRecLoading(true);
      const cats = getTopCategories(2);
      if (!cats || cats.length === 0) {
        setRecommended([]);
        return;
      }
      const promises = cats.map((c) =>
        axios.get(
          `/api/products?category=${encodeURIComponent(c)}&limit=6&sort=newest`
        )
      );
      const results = await Promise.all(promises);
      const merged = results.flatMap((r) => r.data?.products || []);
      const seen = new Set();
      const dedup = [];
      for (const p of merged) {
        if (!seen.has(p._id)) {
          seen.add(p._id);
          dedup.push(p);
        }
      }
      setRecommended(dedup.slice(0, 8));
    } catch (e) {
      setRecommended([]);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {cartItemCount > 0 && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="text-sm text-amber-900">
              You left {cartItemCount} item{cartItemCount > 1 ? "s" : ""} in
              your cart.
            </div>
            <Link
              to="/cart"
              className="text-sm font-medium text-amber-900 underline"
            >
              Go to cart
            </Link>
          </div>
        </div>
      )}

      {/* New Hero Section */}
      <HeroSection />

      {/* Brand Carousel */}
      <BrandCarousel />

      {(user?.name || recommended.length > 0 || recentlyViewed.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {user?.name && (
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {user.name.split(" ")[0]}
            </h2>
          )}
        </section>
      )}

      {recommended.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Recommended for you
          </h3>
          {recLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommended.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Recently viewed
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* On Sale Section */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-red-50">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
            <span className="mr-2">🔥</span> On Sale Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          Featured Products
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
