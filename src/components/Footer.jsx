import { ShoppingBag, Facebook, Twitter, Instagram, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">ShopHub</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your one-stop shop for quality t-shirts, pants, and electronics. Shop with confidence.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products/tshirts"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link
                  to="/products/pants"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Pants
                </Link>
              </li>
              <li>
                <Link
                  to="/products/electronics"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ShopHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
