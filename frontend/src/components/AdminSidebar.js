import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  TicketPercent,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/sales", icon: BarChart3, label: "Sales" },
    { path: "/admin/coupons", icon: TicketPercent, label: "Coupons" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex md:fixed md:inset-y-0 md:w-64 md:flex-col bg-white border-r border-gray-200 z-40">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <span className="text-lg font-bold tracking-tight text-gray-900">
          Admin Panel
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
              isActive(item.path)
                ? "bg-primary-50 text-primary-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full inline-flex items-center gap-2 justify-center px-3 py-2 rounded-md border text-sm text-red-600 hover:bg-red-50 hover:border-red-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
