import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Truck,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1 - Shop */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Electronics"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Clothing"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Clothing
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Books"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Home"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=Sports"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link
                  to="/products?isOnSale=true"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  On Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Account */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlists"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Wishlists
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Log in
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Help */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/returns-policy"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@wholesaleza.co.za"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:billing@wholesaleza.co.za"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Payment & Billing
                </a>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/checkout"
                  className="text-sm text-gray-600 hover:text-primary-600 hover:underline"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 - Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a
                  href="mailto:support@wholesaleza.co.za"
                  className="hover:text-primary-600 hover:underline"
                >
                  support@wholesaleza.co.za
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href="tel:+27-000-0000"
                  className="hover:text-primary-600 hover:underline"
                >
                  +27 00 000 0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Secure Payments
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                Fast Delivery
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                Multiple Payment Options
              </li>
            </ul>
          </div>
        </div>

        {/* App Download & Social */}
        <div className="border-t border-gray-200 pt-8 pb-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Newsletter */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <input
                type="email"
                placeholder="Subscribe for deals and new arrivals"
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
              >
                Subscribe
              </button>
            </form>

            {/* Social Media */}
            <div className="flex items-center gap-6">
              <a
                href="https://www.facebook.com/wholesaleza"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wholesale ZA on Facebook"
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com/wholesaleza"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wholesale ZA on Twitter"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/wholesaleza"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Wholesale ZA on Instagram"
                className="text-gray-400 hover:text-pink-600 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Category Links */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            {[
              { label: "All Products", href: "/products" },
              { label: "Electronics", href: "/products?category=Electronics" },
              { label: "Clothing", href: "/products?category=Clothing" },
              { label: "Books", href: "/products?category=Books" },
              { label: "Home", href: "/products?category=Home" },
              { label: "Sports", href: "/products?category=Sports" },
              { label: "Other", href: "/products?category=Other" },
            ].map((item, index, arr) => (
              <React.Fragment key={item.label}>
                <Link
                  to={item.href}
                  className="hover:text-primary-600 hover:underline whitespace-nowrap"
                >
                  {item.label}
                </Link>
                {index < arr.length - 1 && (
                  <span className="text-gray-300">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Wholesale ZA. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
