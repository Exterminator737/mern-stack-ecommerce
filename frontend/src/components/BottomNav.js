import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartItemCount } = useCart();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 md:hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-3 text-xs">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-2 ${
            isActive("/") ? "text-primary-600" : "text-gray-600"
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="mt-1">Home</span>
        </Link>
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center py-2 ${
            isActive("/cart") ? "text-primary-600" : "text-gray-600"
          }`}
        >
          <ShoppingBag className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="absolute top-1 right-6 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full">
              {cartItemCount}
            </span>
          )}
          <span className="mt-1">Cart</span>
        </Link>
        <Link
          to={isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center py-2 ${
            isActive("/profile") ? "text-primary-600" : "text-gray-600"
          }`}
        >
          <User className="h-6 w-6" />
          <span className="mt-1">Account</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
