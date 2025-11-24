import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories] = useState(['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Other']);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State initialized from URL params
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { wishlists } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Update state when URL params change (e.g. from Navbar search)
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'All';
    const searchParam = searchParams.get('search') || '';
    const pageParam = parseInt(searchParams.get('page') || '1');
    const sortParam = searchParams.get('sort') || 'newest';
    const minPriceParam = searchParams.get('minPrice') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';

    setSelectedCategory(categoryParam);
    setSearchTerm(searchParam);
    setCurrentPage(pageParam);
    setSort(sortParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);

    fetchProducts({
      category: categoryParam,
      search: searchParam,
      page: pageParam,
      sort: sortParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam
    });
  }, [searchParams]);

  const fetchProducts = async (params) => {
    try {
      setLoading(true);
      const apiParams = {
        ...params,
        limit: 12
      };
      
      const res = await axios.get('/api/products', { params: apiParams });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update URL params
  const updateParams = (newParams) => {
    const currentParams = Object.fromEntries([...searchParams]);
    const mergedParams = { ...currentParams, ...newParams };
    
    // Remove empty params to keep URL clean
    Object.keys(mergedParams).forEach(key => {
      if (mergedParams[key] === '' || mergedParams[key] === null || mergedParams[key] === undefined) {
        delete mergedParams[key];
      }
    });
    
    // Reset to page 1 if filters change (but not if page changes)
    if (!newParams.page) {
      mergedParams.page = '1';
    }

    setSearchParams(mergedParams);
    setMobileFiltersOpen(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      updateParams({ search: searchTerm });
    }
  };

  const handleApplyPriceFilter = () => {
    updateParams({ minPrice, maxPrice });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4 items-center">
             {/* Sort Dropdown */}
             <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="oldest">Oldest</option>
              </select>

             <div className="relative rounded-md shadow-sm max-w-xs w-full">
              <input
                type="text"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-4 pr-10 sm:text-sm border-gray-300 rounded-md h-10"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleSearchSubmit}
              />
               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <button 
              className="md:hidden inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`md:w-64 flex-shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => updateParams({ category })}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="sr-only">Min</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="sr-only">Max</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleApplyPriceFilter}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Apply Price
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSearchParams({});
                  // State will update via useEffect
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-4 text-primary-600 hover:text-primary-500 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => updateParams({ page: Math.max(1, currentPage - 1) })}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => updateParams({ page: Math.min(totalPages, currentPage + 1) })}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;


