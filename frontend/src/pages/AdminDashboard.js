import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/currency";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  Download,
  CheckCircle2,
  Truck,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    avgOrderValue: 0,
    customersCount: 0,
  });
  const [trend, setTrend] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [paidFilter, setPaidFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
    } else {
      fetchData();
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get("/api/products"),
        axios.get("/api/orders/admin/all"),
      ]);
      setOrders(ordersRes.data);
      const ls = (productsRes.data.products || [])
        .filter(
          (p) =>
            (typeof p.stock === "number"
              ? p.stock
              : parseInt(p.stock || "0", 10)) <= 5
        )
        .sort((a, b) => (a.stock || 0) - (b.stock || 0))
        .slice(0, 5);
      setLowStock(ls);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setStats({
        totalRevenue: 0,
        ordersCount: 0,
        avgOrderValue: 0,
        customersCount: 0,
      });
      setTrend([]);
      return;
    }
    const paidOrders = orders.filter((o) => o.isPaid);
    const totalRevenue = paidOrders.reduce(
      (sum, o) => sum + (o.totalPrice || 0),
      0
    );
    const ordersCount = orders.length;
    const avgOrderValue = paidOrders.length
      ? totalRevenue / paidOrders.length
      : 0;
    const customers = new Set();
    for (const o of orders) {
      if (o.user && o.user._id) customers.add(`u:${o.user._id}`);
      else if (o.guestEmail) customers.add(`g:${o.guestEmail}`);
    }
    setStats({
      totalRevenue,
      ordersCount,
      avgOrderValue,
      customersCount: customers.size,
    });

    const days = timeRange === "7d" ? 7 : 30;
    const map = new Map();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    for (const o of paidOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, map.get(key) + (o.totalPrice || 0));
    }
    const t = Array.from(map.entries()).map(([date, value]) => ({
      date,
      value,
    }));
    setTrend(t);
  }, [orders, timeRange]);

  const togglePaid = async (order) => {
    try {
      const target = !order.isPaid;
      await axios.put(`/api/orders/admin/${order._id}/paid`, {
        isPaid: target,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                isPaid: target,
                paidAt: target ? new Date().toISOString() : null,
              }
            : o
        )
      );
    } catch (e) {}
  };

  const toggleDelivered = async (order) => {
    try {
      const target = !order.isDelivered;
      await axios.put(`/api/orders/admin/${order._id}/delivered`, {
        isDelivered: target,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id
            ? {
                ...o,
                isDelivered: target,
                deliveredAt: target ? new Date().toISOString() : null,
              }
            : o
        )
      );
    } catch (e) {}
  };

  const exportOrdersCSV = () => {
    const headers = [
      "Order ID",
      "User/Guest",
      "Total",
      "Paid",
      "Delivered",
      "Date",
    ];
    const rows = visibleOrders.map((o) => [
      o._id,
      o.user?.email || o.guestEmail || "N/A",
      (o.totalPrice || 0).toFixed(2),
      o.isPaid ? "Yes" : "No",
      o.isDelivered ? "Yes" : "No",
      new Date(o.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const visibleOrders = orders
    .filter((o) =>
      paidFilter === "all" ? true : paidFilter === "paid" ? o.isPaid : !o.isPaid
    )
    .filter((o) =>
      deliveryFilter === "all"
        ? true
        : deliveryFilter === "delivered"
        ? o.isDelivered
        : !o.isDelivered
    )
    .slice(0, 20);

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
    <div className="bg-gray-50 min-h-screen">
      <AdminSidebar />
      <div className="md:pl-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>

          {lowStock.length > 0 && (
            <div className="mb-6 p-4 rounded-md border border-amber-200 bg-amber-50 text-amber-800">
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} low in
              stock. Review and restock soon.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div
              onClick={() => navigate("/admin/sales")}
              className="bg-white shadow rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            >
              <div>
                <div className="text-sm text-gray-500">Total Revenue</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div
              onClick={() => navigate("/admin/sales")}
              className="bg-white shadow rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            >
              <div>
                <div className="text-sm text-gray-500">Orders</div>
                <div className="text-2xl font-semibold">
                  {stats.ordersCount}
                </div>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div
              onClick={() => navigate("/admin/sales")}
              className="bg-white shadow rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            >
              <div>
                <div className="text-sm text-gray-500">Avg Order Value</div>
                <div className="text-2xl font-semibold">
                  {formatCurrency(stats.avgOrderValue)}
                </div>
              </div>
              <ShoppingBag className="h-8 w-8 text-purple-500" />
            </div>
            <div
              onClick={() => navigate("/admin/sales")}
              className="bg-white shadow rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            >
              <div>
                <div className="text-sm text-gray-500">Customers</div>
                <div className="text-2xl font-semibold">
                  {stats.customersCount}
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Sales (Last {timeRange === "7d" ? "7" : "30"} Days)
                </h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border-gray-300 rounded-md"
                >
                  <option value="7d">7d</option>
                  <option value="30d">30d</option>
                </select>
                <button
                  onClick={() => navigate("/admin/sales")}
                  className="ml-3 text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  Open Sales
                </button>
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
                            stroke="#6366F1"
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
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  Low Stock
                </h2>
                <button
                  onClick={() => navigate("/admin/products?lowStock=1")}
                  className="ml-auto text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  Review Now
                </button>
              </div>
              <div className="p-6 space-y-3">
                {lowStock.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No low stock items
                  </div>
                ) : (
                  lowStock.map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm text-gray-800 truncate">
                        {p.name}
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        {p.stock}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between gap-4">
                <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-gray-400" />
                  Recent Orders ({orders.length})
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value={paidFilter}
                    onChange={(e) => setPaidFilter(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                  <select
                    value={deliveryFilter}
                    onChange={(e) => setDeliveryFilter(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                  >
                    <option value="all">All Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="undelivered">Undelivered</option>
                  </select>
                  <button
                    onClick={exportOrdersCSV}
                    className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" /> Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Order ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Paid
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Delivered
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            #{order._id.slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {order.user?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.isPaid
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.isPaid ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.isDelivered
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.isDelivered ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <button
                            onClick={() => togglePaid(order)}
                            className="inline-flex items-center px-2 py-1 border rounded-md mr-2 hover:bg-gray-50"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />{" "}
                            {order.isPaid ? "Mark Unpaid" : "Mark Paid"}
                          </button>
                          <button
                            onClick={() => toggleDelivered(order)}
                            className="inline-flex items-center px-2 py-1 border rounded-md hover:bg-gray-50"
                          >
                            <Truck className="h-4 w-4 mr-1" />{" "}
                            {order.isDelivered
                              ? "Mark Undelivered"
                              : "Mark Delivered"}
                          </button>
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
    </div>
  );
};

export default AdminDashboard;
