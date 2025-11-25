import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  ShoppingBag,
  Menu,
  X,
  LogOut,
  User,
  Package,
  Heart,
  Settings,
  ChevronDown,
  Box,
  Search,
} from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const profileMenuRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const suggestBoxRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsProfileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsMobileMenuOpen(false);
      setShowSuggest(false);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced fetch of search suggestions
  useEffect(() => {
    const term = searchTerm.trim();
    if (!term) {
      setSuggestions([]);
      setShowSuggest(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setIsSuggestLoading(true);
        const { data } = await axios.get("/api/products/suggest", {
          params: { q: term, limit: 6 },
        });
        setSuggestions(data?.suggestions || []);
        setShowSuggest(true);
      } catch (err) {
        // ignore
      } finally {
        setIsSuggestLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleDocClick = (e) => {
      const clickedOutsideBox =
        suggestBoxRef.current && !suggestBoxRef.current.contains(e.target);
      const clickedOutsideInput =
        searchInputRef.current && !searchInputRef.current.contains(e.target);
      if (clickedOutsideBox && clickedOutsideInput) {
        setShowSuggest(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
            >
              <Package className="h-8 w-8 text-primary-600" />
              <span className="hidden sm:block tracking-tight">
                Wholesale ZA
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                onFocus={() => setShowSuggest(true)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button type="submit" className="hidden">
                Search
              </button>

              {showSuggest && (suggestions.length > 0 || isSuggestLoading) && (
                <ul
                  ref={suggestBoxRef}
                  className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-auto"
                >
                  {isSuggestLoading && suggestions.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      Searching...
                    </li>
                  ) : (
                    suggestions.map((s, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            if (s.type === "category") {
                              navigate(
                                `/products?category=${encodeURIComponent(
                                  s.text
                                )}`
                              );
                            } else {
                              navigate(
                                `/products?search=${encodeURIComponent(s.text)}`
                              );
                            }
                            setShowSuggest(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span className="text-gray-400 uppercase text-xs">
                            {s.type}
                          </span>
                          <span className="text-gray-800">{s.text}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Shop
            </Link>

            <div className="flex items-center gap-1">
              {isAuthenticated && (
                <Link
                  to="/wishlists"
                  className="text-gray-600 hover:text-primary-600 transition-colors p-2"
                  title="Wishlist"
                >
                  <Heart className="h-6 w-6" />
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                title="Cart"
              >
                <ShoppingBag className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden lg:block">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isProfileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform opacity-100 scale-100 transition-all duration-200 ease-out">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Box className="h-4 w-4" /> Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" /> Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary shadow-sm shadow-primary-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/wishlists"
                className="p-2 text-gray-600 hover:text-primary-600"
              >
                <Heart className="h-6 w-6" />
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-gray-600">
              <ShoppingBag className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="p-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSuggest(true)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

              {showSuggest && (suggestions.length > 0 || isSuggestLoading) && (
                <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-auto">
                  {isSuggestLoading && suggestions.length === 0 ? (
                    <li className="px-4 py-2 text-sm text-gray-500">
                      Searching...
                    </li>
                  ) : (
                    suggestions.map((s, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            if (s.type === "category") {
                              navigate(
                                `/products?category=${encodeURIComponent(
                                  s.text
                                )}`
                              );
                            } else {
                              navigate(
                                `/products?search=${encodeURIComponent(s.text)}`
                              );
                            }
                            setShowSuggest(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span className="text-gray-400 uppercase text-xs">
                            {s.type}
                          </span>
                          <span className="text-gray-800">{s.text}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </form>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Shop
            </Link>
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="px-3 py-2 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-800">
                        {user?.name}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Box className="h-4 w-4" /> Orders
                  </Link>
                  <Link
                    to="/wishlists"
                    className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" /> Wishlists
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-gray-50"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
