import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Smartphone, Apple, PlayCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Column 1 - Shop */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link to="/products?sort=sale" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Deals</Link></li>
              <li><Link to="/products?sort=clearance" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Clearance Sale</Link></li>
              <li><Link to="/gift-vouchers" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Gift Vouchers</Link></li>
            </ul>
          </div>

          {/* Column 2 - Account */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-3">
              <li><Link to="/profile" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">My Account</Link></li>
              <li><Link to="/orders" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Track Order</Link></li>
              <li><Link to="/returns" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Returns</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Personal Details</Link></li>
              <li><Link to="/invoices" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Invoices</Link></li>
              <li><Link to="/takealot-more" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">TakealotMORE</Link></li>
            </ul>
          </div>

          {/* Column 3 - Help */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Help Centre</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Contact Us</Link></li>
              <li><Link to="/submit-idea" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Submit an Idea</Link></li>
              <li><Link to="/suggest-product" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Suggest a Product</Link></li>
              <li><Link to="/shipping" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Shipping & Delivery</Link></li>
              <li><Link to="/pickup-points" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Takealot Pickup Points</Link></li>
              <li><Link to="/returns-help" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Returns</Link></li>
              <li><Link to="/ip-complaint" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Log Intellectual Property Complaint</Link></li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">About Us</Link></li>
              <li><Link to="/careers" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Careers</Link></li>
              <li><Link to="/sell" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Sell on Takealot</Link></li>
              <li><Link to="/deliver" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Deliver for Takealot</Link></li>
              <li><Link to="/press" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Press & News</Link></li>
              <li><Link to="/competitions" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Competitions</Link></li>
              <li><Link to="/business" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Takealot for Business</Link></li>
              <li><Link to="/mr-d" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Mr D</Link></li>
            </ul>
          </div>

          {/* Column 5 - Takealot Policy */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Takealot Policy</h3>
            <ul className="space-y-3">
              <li><Link to="/returns-policy" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Returns Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Privacy Policy</Link></li>
              <li><Link to="/human-rights" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Human Rights Statement</Link></li>
              <li><Link to="/advertising-code" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Code of Advertising Practice</Link></li>
              <li><Link to="/speak-up" className="text-sm text-gray-600 hover:text-primary-600 hover:underline">Speak Up Process</Link></li>
            </ul>
          </div>
        </div>

        {/* App Download & Social */}
        <div className="border-t border-gray-200 pt-8 pb-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* App Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] leading-none">Download on the</div>
                  <div className="text-sm font-bold leading-none">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                <PlayCircle className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] leading-none">GET IT ON</div>
                  <div className="text-sm font-bold leading-none">Google Play</div>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] leading-none">EXPLORE IT ON</div>
                  <div className="text-sm font-bold leading-none">AppGallery</div>
                </div>
              </a>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Category Links */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            {[
              "Baby & Toddler", "Beauty", "Books", "Cameras", "Camping & Outdoors", 
              "Cellphones & Wearables", "Computers & Tablets", "Fashion", "Gaming", 
              "Garden, Pool & Patio", "Health", "Home & Kitchen", "Luggage & Travel", 
              "Movies & Series", "Music", "Office & Stationery", "Pets", "Sport", 
              "TV, Audio & Video", "Toys", "Vouchers"
            ].map((category, index) => (
              <React.Fragment key={category}>
                <Link to={`/products?category=${category}`} className="hover:text-primary-600 hover:underline whitespace-nowrap">
                  {category}
                </Link>
                {index < 20 && <span className="text-gray-300">|</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Takealot Online (Pty) Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
