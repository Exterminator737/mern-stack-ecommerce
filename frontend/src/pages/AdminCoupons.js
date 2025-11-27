import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { TicketPercent, Plus, Edit2, Trash2, RefreshCw, X } from "lucide-react";

const initialForm = {
  code: "",
  type: "percent", // percent | fixed
  value: 10,
  minSubtotal: 0,
  usageLimit: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

const AdminCoupons = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState("");

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }
    fetchCoupons();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/coupons");
      setCoupons(res.data || []);
    } catch (e) {
      console.error("Error fetching coupons", e);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    [c.code, c.type].some((t) =>
      String(t || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code || "",
      type: c.type || "percent",
      value: c.value ?? 0,
      minSubtotal: c.minSubtotal ?? 0,
      usageLimit: c.usageLimit ?? "",
      startsAt: c.startsAt
        ? new Date(c.startsAt).toISOString().slice(0, 16)
        : "",
      endsAt: c.endsAt ? new Date(c.endsAt).toISOString().slice(0, 16) : "",
      isActive: c.isActive !== false,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: String(form.code || "")
          .trim()
          .toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minSubtotal: Number(form.minSubtotal) || 0,
        usageLimit:
          form.usageLimit === "" ? undefined : Number(form.usageLimit),
        startsAt: form.startsAt ? new Date(form.startsAt) : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt) : undefined,
        isActive: !!form.isActive,
      };
      if (editing) {
        await axios.put(`/api/coupons/${editing._id}`, payload);
      } else {
        await axios.post("/api/coupons", payload);
      }
      setShowModal(false);
      setEditing(null);
      fetchCoupons();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to save coupon");
    }
  };

  const toggleActive = async (c) => {
    try {
      await axios.put(`/api/coupons/${c._id}`, { isActive: !c.isActive });
      fetchCoupons();
    } catch (e) {
      alert("Failed to update coupon");
    }
  };

  const askDelete = (c) => {
    setCouponToDelete(c);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await axios.delete(`/api/coupons/${couponToDelete._id}`);
      fetchCoupons();
    } catch (e) {
      alert("Failed to delete coupon");
    } finally {
      setShowDeleteModal(false);
      setCouponToDelete(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="md:pl-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TicketPercent className="h-8 w-8" /> Coupons
            </h1>
            <div className="flex items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by code or type..."
                className="hidden sm:block h-10 px-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={fetchCoupons}
                className="inline-flex items-center px-3 py-2 border rounded-md bg-white hover:bg-gray-50 text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" /> New Coupon
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conditions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No coupons
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {c.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {c.type}
                          </span>
                          <span>
                            {c.type === "percent"
                              ? `${c.value}%`
                              : `R${c.value}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>Min: R{c.minSubtotal || 0}</span>
                          <span>
                            {c.startsAt
                              ? `From ${new Date(c.startsAt).toLocaleString()}`
                              : "From: Any"}
                          </span>
                          <span>
                            {c.endsAt
                              ? `To ${new Date(c.endsAt).toLocaleString()}`
                              : "To: Any"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {c.usedCount || 0}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleActive(c)}
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            c.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => openEdit(c)}
                          className="inline-flex items-center text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => askDelete(c)}
                          className="inline-flex items-center text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Create/Edit Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  onClick={() => setShowModal(false)}
                ></div>
                <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {editing ? "Edit Coupon" : "New Coupon"}
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Code
                        </label>
                        <input
                          type="text"
                          name="code"
                          value={form.code}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500 uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="percent">Percent</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Value
                          </label>
                          <input
                            type="number"
                            name="value"
                            value={form.value}
                            min={0}
                            step={1}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Min Subtotal
                          </label>
                          <input
                            type="number"
                            name="minSubtotal"
                            value={form.minSubtotal}
                            min={0}
                            step={1}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Usage Limit
                          </label>
                          <input
                            type="number"
                            name="usageLimit"
                            value={form.usageLimit}
                            min={1}
                            step={1}
                            onChange={handleChange}
                            placeholder="Unlimited"
                            className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Starts At
                          </label>
                          <input
                            type="datetime-local"
                            name="startsAt"
                            value={form.startsAt}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Ends At
                          </label>
                          <input
                            type="datetime-local"
                            name="endsAt"
                            value={form.endsAt}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="isActive"
                          type="checkbox"
                          name="isActive"
                          checked={form.isActive}
                          onChange={handleChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="isActive"
                          className="ml-2 block text-sm text-gray-900"
                        >
                          Active
                        </label>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="submit"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 sm:text-sm"
                        >
                          {editing ? "Save Changes" : "Create Coupon"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:text-sm"
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

          {/* Delete Modal */}
          {showDeleteModal && couponToDelete && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  onClick={() => setShowDeleteModal(false)}
                ></div>
                <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete Coupon
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Are you sure you want to delete "{couponToDelete.code}"?
                    </p>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-white hover:bg-red-700 sm:w-auto sm:text-sm"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
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

export default AdminCoupons;
