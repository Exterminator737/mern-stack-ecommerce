import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "../utils/currency";
import AdminSidebar from "../components/AdminSidebar";
import ProductSpecifications from "../components/ProductSpecifications";

const AdminProducts = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("search") || "");
  const category = searchParams.get("category") || "All";
  const inStock = searchParams.get("inStock") === "true";
  const onSale = searchParams.get("isOnSale") === "true";
  const lowStockOnly = searchParams.get("lowStock") === "1";

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    salePrice: "",
    isOnSale: false,
    category: "Electronics",
    image: "",
    stock: "",
    specifications: [],
    variants: [],
  });

  const salePercentage =
    formData.isOnSale && formData.originalPrice && formData.salePrice
      ? Math.round(
          ((formData.originalPrice - formData.salePrice) /
            formData.originalPrice) *
            100
        )
      : 0;

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
      };
      if (category && category !== "All") params.category = category;
      if (q) params.search = q;
      if (inStock) params.inStock = true;
      if (onSale) params.isOnSale = true;
      const res = await axios.get("/api/products", { params });
      let list = res.data.products || [];
      if (lowStockOnly) {
        list = list.filter(
          (p) =>
            (typeof p.stock === "number"
              ? p.stock
              : parseInt(p.stock || "0", 10)) <= 5
        );
      }
      setProducts(list);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (next) => {
    const current = Object.fromEntries([...searchParams]);
    const merged = { ...current, ...next };
    Object.keys(merged).forEach((k) => {
      if (merged[k] === "" || merged[k] === undefined || merged[k] === null)
        delete merged[k];
    });
    setSearchParams(merged);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`/api/products/${productToDelete._id}`);
      fetchProducts();
    } catch (e) {
      alert("Error deleting product");
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  // Edit modal handlers
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      originalPrice: (product.originalPrice || product.price).toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : "",
      isOnSale: product.isOnSale || false,
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      specifications: product.specifications || [],
      variants: Array.isArray(product.variants)
        ? product.variants.map((v) => ({
            _id: v._id,
            sku: v.sku || "",
            attributes: Array.isArray(v.attributes)
              ? v.attributes.map((a) => ({
                  name: a.name || "",
                  value: a.value || "",
                }))
              : [],
            price: v.price ?? "",
            originalPrice: v.originalPrice ?? "",
            salePrice: v.salePrice ?? "",
            isOnSale: !!v.isOnSale,
            stock: v.stock ?? 0,
            image: v.image || "",
          }))
        : [],
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.isOnSale &&
      parseFloat(formData.salePrice) >= parseFloat(formData.originalPrice)
    ) {
      alert("Sale price must be lower than the regular price");
      return;
    }
    const payload = {
      ...formData,
      price: formData.isOnSale ? formData.salePrice : formData.originalPrice,
    };
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, payload);
      } else {
        await axios.post("/api/products", payload);
      }
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving product");
    }
  };

  const addSpec = () => {
    setFormData({
      ...formData,
      specifications: [
        ...formData.specifications,
        { label: "", value: "", type: "text" },
      ],
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
    if (direction === "up" && index > 0) {
      [newSpecs[index], newSpecs[index - 1]] = [
        newSpecs[index - 1],
        newSpecs[index],
      ];
    } else if (direction === "down" && index < newSpecs.length - 1) {
      [newSpecs[index], newSpecs[index + 1]] = [
        newSpecs[index + 1],
        newSpecs[index],
      ];
    }
    setFormData({ ...formData, specifications: newSpecs });
  };

  // Variant handlers
  const addVariant = () => {
    const next = [
      ...formData.variants,
      {
        sku: "",
        attributes: [],
        price: "",
        originalPrice: "",
        salePrice: "",
        isOnSale: false,
        stock: 0,
        image: "",
      },
    ];
    setFormData({ ...formData, variants: next });
  };

  const removeVariant = (idx) => {
    const next = [...formData.variants];
    next.splice(idx, 1);
    setFormData({ ...formData, variants: next });
  };

  const updateVariantField = (idx, field, value) => {
    const next = [...formData.variants];
    next[idx] = { ...next[idx], [field]: value };
    setFormData({ ...formData, variants: next });
  };

  const addVariantAttribute = (vidx) => {
    const next = [...formData.variants];
    const v = next[vidx];
    v.attributes = Array.isArray(v.attributes) ? v.attributes : [];
    v.attributes.push({ name: "", value: "" });
    setFormData({ ...formData, variants: next });
  };

  const removeVariantAttribute = (vidx, aidx) => {
    const next = [...formData.variants];
    const v = next[vidx];
    v.attributes.splice(aidx, 1);
    setFormData({ ...formData, variants: next });
  };

  const updateVariantAttribute = (vidx, aidx, field, value) => {
    const next = [...formData.variants];
    const v = next[vidx];
    v.attributes[aidx][field] = value;
    setFormData({ ...formData, variants: next });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="md:pl-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Products
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    description: "",
                    originalPrice: "",
                    salePrice: "",
                    isOnSale: false,
                    category: "Electronics",
                    image: "",
                    stock: "",
                    specifications: [],
                    variants: [],
                  });
                  setShowEditModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-5 w-5 mr-2" /> Add Product
              </button>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center px-3 py-2 border rounded-md bg-white hover:bg-gray-50 text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or description"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && updateParams({ search: q })
                }
                className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value })}
              className="py-2 px-3 border rounded-md"
            >
              {[
                "All",
                "Electronics",
                "Clothing",
                "Books",
                "Home",
                "Sports",
                "Other",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) =>
                  updateParams({
                    inStock: e.target.checked ? "true" : undefined,
                  })
                }
              />
              In Stock
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) =>
                  updateParams({
                    isOnSale: e.target.checked ? "true" : undefined,
                  })
                }
              />
              On Sale
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) =>
                  updateParams({ lowStock: e.target.checked ? "1" : undefined })
                }
              />
              Low Stock (≤5)
            </label>
            <div className="md:col-span-4 flex gap-2">
              <button
                onClick={() => updateParams({ search: q })}
                className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setQ("");
                  updateParams({
                    search: undefined,
                    category: undefined,
                    inStock: undefined,
                    isOnSale: undefined,
                    lowStock: undefined,
                  });
                }}
                className="px-3 py-2 bg-white border rounded-md text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {p.description?.slice(0, 80)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {p.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(p.price)}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium ${
                          (Array.isArray(p.variants) && p.variants.length > 0
                            ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
                            : p.stock || 0) <= 5
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {Array.isArray(p.variants) && p.variants.length > 0
                          ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
                          : p.stock || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => handleEdit(p)}
                          className="inline-flex items-center text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="inline-flex items-center text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {showEditModal && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto"
              aria-labelledby="modal-title"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  aria-hidden="true"
                  onClick={() => setShowEditModal(false)}
                ></div>
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </h3>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
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
                          <label className="block text-sm font-medium text-gray-700">
                            Regular Price
                          </label>
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
                          <label
                            htmlFor="isOnSale"
                            className="ml-2 block text-sm text-gray-900"
                          >
                            Put this product on sale
                          </label>
                        </div>
                        {formData.isOnSale && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Sale Price
                            </label>
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
                          <label className="block text-sm font-medium text-gray-700">
                            Stock
                          </label>
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Category
                          </label>
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Image URL
                        </label>
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium text-gray-900">
                            Product Specifications
                          </h4>
                          <button
                            type="button"
                            onClick={addSpec}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Attribute
                          </button>
                        </div>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {formData.specifications.map((spec, index) => (
                            <div
                              key={index}
                              className="flex gap-2 items-start bg-gray-50 p-3 rounded-md border border-gray-200"
                            >
                              <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Label"
                                    value={spec.label}
                                    onChange={(e) =>
                                      updateSpec(index, "label", e.target.value)
                                    }
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                  />
                                  <select
                                    value={spec.type}
                                    onChange={(e) =>
                                      updateSpec(index, "type", e.target.value)
                                    }
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                  >
                                    <option value="text">Text</option>
                                    <option value="list">List</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="number">Number</option>
                                    <option value="link">Link</option>
                                  </select>
                                </div>
                                {spec.type === "boolean" ? (
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={
                                        spec.value === true ||
                                        spec.value === "true"
                                      }
                                      onChange={(e) =>
                                        updateSpec(
                                          index,
                                          "value",
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-900">
                                      Yes / True
                                    </label>
                                  </div>
                                ) : spec.type === "list" ? (
                                  <textarea
                                    placeholder="One per line"
                                    value={spec.value}
                                    onChange={(e) =>
                                      updateSpec(index, "value", e.target.value)
                                    }
                                    rows="2"
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                  />
                                ) : (
                                  <input
                                    type={
                                      spec.type === "number" ? "number" : "text"
                                    }
                                    placeholder="Value"
                                    value={spec.value}
                                    onChange={(e) =>
                                      updateSpec(index, "value", e.target.value)
                                    }
                                    className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm"
                                  />
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveSpec(index, "up")}
                                  disabled={index === 0}
                                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveSpec(index, "down")}
                                  disabled={
                                    index === formData.specifications.length - 1
                                  }
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
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Preview
                            </h4>
                            <div className="transform scale-90 origin-top-left w-[110%]">
                              <ProductSpecifications
                                specifications={formData.specifications}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Variants */}
                      <div className="border-t border-gray-200 pt-4 mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium text-gray-900">
                            Variants (optional)
                          </h4>
                          <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Variant
                          </button>
                        </div>
                        {formData.variants.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">
                            No variants added.
                          </p>
                        ) : (
                          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                            {formData.variants.map((v, vidx) => (
                              <div
                                key={vidx}
                                className="border rounded-md p-3 bg-gray-50"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      SKU
                                    </label>
                                    <input
                                      type="text"
                                      value={v.sku}
                                      onChange={(e) =>
                                        updateVariantField(
                                          vidx,
                                          "sku",
                                          e.target.value
                                        )
                                      }
                                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Image URL
                                    </label>
                                    <input
                                      type="text"
                                      value={v.image}
                                      onChange={(e) =>
                                        updateVariantField(
                                          vidx,
                                          "image",
                                          e.target.value
                                        )
                                      }
                                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Regular Price
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={v.originalPrice}
                                      onChange={(e) =>
                                        updateVariantField(
                                          vidx,
                                          "originalPrice",
                                          e.target.value
                                        )
                                      }
                                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 mt-6 sm:mt-0">
                                    <input
                                      id={`v_isOnSale_${vidx}`}
                                      type="checkbox"
                                      checked={!!v.isOnSale}
                                      onChange={(e) =>
                                        updateVariantField(
                                          vidx,
                                          "isOnSale",
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                                    />
                                    <label
                                      htmlFor={`v_isOnSale_${vidx}`}
                                      className="text-sm text-gray-700"
                                    >
                                      On Sale
                                    </label>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Sale Price
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={v.salePrice}
                                      onChange={(e) =>
                                        updateVariantField(
                                          vidx,
                                          "salePrice",
                                          e.target.value
                                        )
                                      }
                                      disabled={!v.isOnSale}
                                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm disabled:bg-gray-100"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Stock
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={v.stock}
                                      onChange={(e) =>
                                        updateVariantField(
                                          vidx,
                                          "stock",
                                          parseInt(e.target.value || "0", 10)
                                        )
                                      }
                                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <label className="text-sm font-medium text-gray-700">
                                        Attributes
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          addVariantAttribute(vidx)
                                        }
                                        className="text-xs px-2 py-1 rounded-md bg-white border text-gray-700 hover:bg-gray-50"
                                      >
                                        Add Attribute
                                      </button>
                                    </div>
                                    <div className="mt-2 space-y-2">
                                      {Array.isArray(v.attributes) &&
                                      v.attributes.length > 0 ? (
                                        v.attributes.map((a, aidx) => (
                                          <div
                                            key={aidx}
                                            className="flex gap-2"
                                          >
                                            <input
                                              type="text"
                                              placeholder="Name (e.g., Color)"
                                              value={a.name}
                                              onChange={(e) =>
                                                updateVariantAttribute(
                                                  vidx,
                                                  aidx,
                                                  "name",
                                                  e.target.value
                                                )
                                              }
                                              className="flex-1 border border-gray-300 rounded-md py-1 px-2 text-sm"
                                            />
                                            <input
                                              type="text"
                                              placeholder="Value (e.g., Red)"
                                              value={a.value}
                                              onChange={(e) =>
                                                updateVariantAttribute(
                                                  vidx,
                                                  aidx,
                                                  "value",
                                                  e.target.value
                                                )
                                              }
                                              className="flex-1 border border-gray-300 rounded-md py-1 px-2 text-sm"
                                            />
                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeVariantAttribute(
                                                  vidx,
                                                  aidx
                                                )
                                              }
                                              className="px-2 text-red-500 hover:text-red-700"
                                              title="Remove"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-gray-500">
                                          No attributes
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(vidx)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    Remove Variant
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-6 flex gap-3">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                        >
                          {editingProduct ? "Update Product" : "Create Product"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingProduct(null);
                          }}
                          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm"
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

          {/* Delete Confirmation Modal */}
          {showDeleteModal && productToDelete && (
            <div
              className="fixed inset-0 z-50 overflow-y-auto"
              aria-labelledby="delete-modal"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  onClick={() => setShowDeleteModal(false)}
                ></div>
                <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Delete Product
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-gray-700">
                              "{productToDelete.name}"
                            </span>
                            ? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setProductToDelete(null);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
