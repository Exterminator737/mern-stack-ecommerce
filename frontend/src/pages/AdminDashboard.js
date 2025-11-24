import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { Plus, Edit2, Trash2, Package, ShoppingBag, X, ArrowUp, ArrowDown } from 'lucide-react';
import ProductSpecifications from '../components/ProductSpecifications';

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    salePrice: '',
    isOnSale: false,
    category: 'Electronics',
    image: '',
    stock: '',
    specifications: []
  });

  // Calculated percentage for preview
  const salePercentage = formData.isOnSale && formData.originalPrice && formData.salePrice 
    ? Math.round(((formData.originalPrice - formData.salePrice) / formData.originalPrice) * 100)
    : 0;

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
    } else {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/orders/admin/all')
      ]);
      setProducts(productsRes.data.products);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Specification Management Functions
  const addSpec = () => {
    setFormData({
      ...formData,
      specifications: [
        ...formData.specifications,
        { label: '', value: '', type: 'text' }
      ]
    });
  };

  const removeSpec = (index) => {
    const newSpecs = [...formData.specifications];
    newSpecs.splice(index, 1);
    setFormData({ ...formData, specifications: newSpecs });
  };

  const updateSpec = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const moveSpec = (index, direction) => {
    const newSpecs = [...formData.specifications];
    if (direction === 'up' && index > 0) {
      [newSpecs[index], newSpecs[index - 1]] = [newSpecs[index - 1], newSpecs[index]];
    } else if (direction === 'down' && index < newSpecs.length - 1) {
      [newSpecs[index], newSpecs[index + 1]] = [newSpecs[index + 1], newSpecs[index]];
    }
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Sale price must be lower than original price
    if (formData.isOnSale && parseFloat(formData.salePrice) >= parseFloat(formData.originalPrice)) {
      alert('Sale price must be lower than the regular price');
      return;
    }

    // Prepare payload
    // We ensure 'price' is sent as the effective price, although backend hook also handles it
    const payload = {
      ...formData,
      price: formData.isOnSale ? formData.salePrice : formData.originalPrice
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        await axios.post('/api/products', payload);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        originalPrice: '',
        salePrice: '',
        isOnSale: false,
        category: 'Electronics',
        image: '',
        stock: '',
        specifications: []
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      originalPrice: (product.originalPrice || product.price).toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      isOnSale: product.isOnSale || false,
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      specifications: product.specifications || []
    });
    setShowProductForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => {
              setShowProductForm(true);
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                originalPrice: '',
                salePrice: '',
                isOnSale: false,
                category: 'Electronics',
                image: '',
                stock: '',
                specifications: []
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {showProductForm && (
          <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowProductForm(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Regular Price</label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleChange}
                          required
                          step="0.01"
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          id="isOnSale"
                          name="isOnSale"
                          type="checkbox"
                          checked={formData.isOnSale}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-900">
                          Put this product on sale
                        </label>
                      </div>

                      {formData.isOnSale && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                          <label className="block text-sm font-medium text-gray-700">Sale Price</label>
                          <div className="flex gap-4 items-center">
                            <input
                              type="number"
                              name="salePrice"
                              value={formData.salePrice}
                              onChange={handleChange}
                              required={formData.isOnSale}
                              step="0.01"
                              min="0"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            {salePercentage > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {salePercentage}% OFF
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                             Must be lower than regular price.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          required
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="Electronics">Electronics</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Books">Books</option>
                          <option value="Home">Home</option>
                          <option value="Sports">Sports</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900">Product Specifications</h4>
                        <button
                          type="button"
                          onClick={addSpec}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Attribute
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.specifications.map((spec, index) => (
                          <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-md border border-gray-200">
                             <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Label (e.g. Brand)"
                                    value={spec.label}
                                    onChange={(e) => updateSpec(index, 'label', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                  />
                                  <select
                                    value={spec.type}
                                    onChange={(e) => updateSpec(index, 'type', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                  >
                                    <option value="text">Text</option>
                                    <option value="list">List (New lines)</option>
                                    <option value="boolean">Boolean (Yes/No)</option>
                                    <option value="number">Number</option>
                                    <option value="link">Link</option>
                                  </select>
                                </div>
                                
                                {spec.type === 'boolean' ? (
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`spec-bool-${index}`}
                                      checked={spec.value === true || spec.value === 'true'}
                                      onChange={(e) => updateSpec(index, 'value', e.target.checked)}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`spec-bool-${index}`} className="ml-2 block text-sm text-gray-900">
                                      Yes / True
                                    </label>
                                  </div>
                                ) : spec.type === 'list' ? (
                                  <textarea
                                    placeholder="Value (one per line)"
                                    value={spec.value}
                                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                                    rows="3"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                  />
                                ) : (
                                  <input
                                    type={spec.type === 'number' ? 'number' : 'text'}
                                    placeholder="Value"
                                    value={spec.value}
                                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                                  />
                                )}
                             </div>
                             
                             <div className="flex flex-col gap-1">
                               <button
                                 type="button"
                                 onClick={() => moveSpec(index, 'up')}
                                 disabled={index === 0}
                                 className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                               >
                                 <ArrowUp className="h-4 w-4" />
                               </button>
                               <button
                                 type="button"
                                 onClick={() => moveSpec(index, 'down')}
                                 disabled={index === formData.specifications.length - 1}
                                 className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                               >
                                 <ArrowDown className="h-4 w-4" />
                               </button>
                               <button
                                 type="button"
                                 onClick={() => removeSpec(index)}
                                 className="p-1 text-red-400 hover:text-red-600"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                          </div>
                        ))}
                        
                        {formData.specifications.length === 0 && (
                          <p className="text-center text-gray-500 text-sm py-4 italic">
                            No specifications added yet.
                          </p>
                        )}
                      </div>
                      
                      {formData.specifications.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Preview</h4>
                          <div className="transform scale-90 origin-top-left w-[110%]">
                            <ProductSpecifications specifications={formData.specifications} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-5 sm:mt-6 flex gap-3">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                      >
                        {editingProduct ? 'Update' : 'Create'} Product
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false);
                          setEditingProduct(null);
                        }}
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
              <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-400" />
                Products ({products.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                        {product.isOnSale && product.originalPrice && (
                          <div className="flex items-center gap-1">
                             <span className="text-xs text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                             <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">SALE</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gray-400" />
                Recent Orders ({orders.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 10).map(order => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">#{order._id.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{order.user?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


