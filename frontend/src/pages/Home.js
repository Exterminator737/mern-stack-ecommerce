import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../utils/currency';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products?limit=8');
      setProducts(res.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Welcome to Wholesale ZA</h1>
          <p>Quality office supplies and stationery at wholesale prices</p>
          <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <Link key={product._id} to={`/products/${product._id}`} className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center" style={{ marginTop: '30px' }}>
            <Link to="/products" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


