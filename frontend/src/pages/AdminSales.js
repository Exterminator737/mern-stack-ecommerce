import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { TrendingUp, RefreshCw } from "lucide-react";
import { formatCurrency } from "../utils/currency";
import AdminSidebar from "../components/AdminSidebar";

const AdminSales = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [paidOnly, setPaidOnly] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
    } else {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders/admin/all");
      setOrders(res.data || []);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const rangeDays = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const filtered = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (rangeDays - 1));
    return (orders || []).filter((o) => {
      const d = new Date(o.createdAt);
      if (d < start) return false;
      if (paidOnly && !o.isPaid) return false;
      return true;
    });
  }, [orders, rangeDays, paidOnly]);

  const kpis = useMemo(() => {
    const rev = filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const cnt = filtered.length;
    const aov = cnt > 0 ? rev / cnt : 0;
    const customers = new Set();
    for (const o of filtered) {
      if (o.user && o.user._id) customers.add("u:" + o.user._id);
      else if (o.guestEmail) customers.add("g:" + o.guestEmail);
    }
    return { revenue: rev, orders: cnt, aov, customers: customers.size };
  }, [filtered]);

  const trend = useMemo(() => {
    const days = rangeDays;
    const map = new Map();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    for (const o of filtered) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, map.get(key) + (o.totalPrice || 0));
    }
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
  }, [filtered, rangeDays]);

  const topProducts = useMemo(() => {
    const m = new Map();
    for (const o of filtered) {
      for (const it of o.orderItems || []) {
        if (!it.product) continue;
        const k = it.product._id || it.product;
        const rec = m.get(k) || { name: it.product.name, qty: 0, revenue: 0 };
        rec.qty += it.quantity || 0;
        rec.revenue += (it.price || 0) * (it.quantity || 0);
        m.set(k, rec);
      }
    }
    return Array.from(m.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filtered]);

  const revenueByCategory = useMemo(() => {
    const m = new Map();
    for (const o of filtered) {
      for (const it of o.orderItems || []) {
        const cat = it.product?.category || "Other";
        m.set(cat, (m.get(cat) || 0) + (it.price || 0) * (it.quantity || 0));
      }
    }
    const arr = Array.from(m.entries()).map(([category, value]) => ({
      category,
      value,
    }));
    arr.sort((a, b) => b.value - a.value);
    return arr;
  }, [filtered]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <AdminSidebar />
        <div className="md:pl-64 py-8 flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="md:pl-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Sales Analytics
            </h1>
            <button
              onClick={fetchOrders}
              className="inline-flex items-center px-3 py-2 border rounded-md bg-white hover:bg-gray-50 text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Range</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="py-2 px-3 border rounded-md w-full"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={paidOnly}
                onChange={(e) => setPaidOnly(e.target.checked)}
              />{" "}
              Paid orders only
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(kpis.revenue)}
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Orders</div>
              <div className="text-2xl font-semibold">{kpis.orders}</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Avg Order Value</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(kpis.aov)}
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-sm text-gray-500">Unique Customers</div>
              <div className="text-2xl font-semibold">{kpis.customers}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Revenue Trend
                </h2>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="p-6">
                {trend.length === 0 ? (
                  <div className="text-gray-500 text-sm">No data</div>
                ) : (
                  (() => {
                    const max = Math.max(1, ...trend.map((d) => d.value));
                    const points = trend
                      .map(
                        (d, i) =>
                          `${i},${100 - Math.round((d.value / max) * 100)}`
                      )
                      .join(" ");
                    const labels = trend.map((d) => d.date.slice(5));
                    return (
                      <div className="w-full">
                        <svg
                          viewBox={`0 0 ${trend.length - 1} 100`}
                          preserveAspectRatio="none"
                          className="w-full h-24"
                        >
                          <polyline
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="2"
                            points={points}
                          />
                        </svg>
                        <div className="mt-2 grid grid-cols-6 text-xs text-gray-400">
                          {labels
                            .filter(
                              (_, i) => i % Math.ceil(labels.length / 6) === 0
                            )
                            .map((l, idx) => (
                              <div key={idx}>{l}</div>
                            ))}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Revenue by Category
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {revenueByCategory.length === 0 ? (
                  <div className="text-sm text-gray-500">No data</div>
                ) : (
                  revenueByCategory.map((row) => (
                    <div key={row.category} className="flex items-center gap-3">
                      <div className="w-32 text-sm text-gray-700">
                        {row.category}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                        <div
                          className="h-3 bg-primary-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (row.value / revenueByCategory[0].value) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-28 text-right text-sm font-medium">
                        {formatCurrency(row.value)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Top Products
              </h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No data
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {p.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {p.qty}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(p.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSales;
