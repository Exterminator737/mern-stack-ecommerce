import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { User, MapPin, Shield } from "lucide-react";

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "",
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await axios.put("/api/auth/profile", {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      });
      if (updateUser) updateUser(res.data);
      setSaveMessage("Address saved");
    } catch (err) {
      setSaveMessage(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              Personal Information
            </h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              {user?.isAdmin && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 flex items-center">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Administrator
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              Shipping Address
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              This address will be used as your default shipping address.
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {user?.address ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Street address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.address.street || "Not set"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">City</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.address.city || "Not set"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    State / Province
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.address.state || "Not set"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    ZIP / Postal code
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.address.zipCode || "Not set"}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.address.country || "Not set"}
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No address saved yet.</p>
              </div>
            )}
            <form onSubmit={handleSaveAddress} className="mt-6">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Street address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP / Postal code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md h-10 px-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              {saveMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-sm ${
                    saveMessage.includes("saved")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {saveMessage}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
