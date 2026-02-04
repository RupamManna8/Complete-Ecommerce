import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  HomeIcon,
  Sun,
  Moon,
  ShoppingBag,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useToast } from "./ui/Toast.jsx";


export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { user, logout, cartItems, wishlistItems,theme,updateTheme} = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const categories = [
    {
      name: "T-Shirts",
      slug: "tshirts",
      image:
        "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Pants",
      slug: "pants",
      image:
        "https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      name: "Electronics",
      slug: "electronics",
      image:
        "https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ];



 
  const handleCartClick = () => {
    if (user) {
      navigate("/cart");
    } else {
      showToast("Please login to view your cart.", "info");
    }
    setIsMenuOpen(false);
  };

  const handleWishlistClick = () => {
    if (user) {
      navigate("/wishlist");
    } else {
      showToast("Please login to view your wishlist.", "info");
    }
    setIsMenuOpen(false);
  };

  // 🧠 hover delay fix using ref
  const hoverTimeout = useRef(null);

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1 }}
      className="sticky z-30 top-3 flex justify-center items-center"
    >
      <nav className={`${window.innerWidth < 900 ? "w-[85%]" : "w-[60%]"} rounded-3xl bg-gradient-to-b from-slate-50 to-blue-50 dark:from-gray-800 dark:to-blue-400 backdrop-blur-lg border-b border-gray-200 dark:border-gray-400`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ---------- LEFT SECTION ---------- */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2" onClick={()=>setIsMenuOpen(false)}>
                <img
                  src="/logo1.png"
                  alt="Logo"
                  className="h-[50px] w-[50px] rounded-full object-cover"
                />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  urbanVolt
                </span>
              </Link>

              {/* Categories + All Products */}
              <div className="hidden md:flex items-center gap-6">
                {/* ---------- CATEGORIES DROPDOWN ---------- */}
                <div
                  className="relative"
                  onMouseEnter={() => {
                    clearTimeout(hoverTimeout.current);
                    setShowCategories(true);
                  }}
                  onMouseLeave={() => {
                    hoverTimeout.current = setTimeout(
                      () => setShowCategories(false),
                      200 // delay 200ms prevents flicker
                    );
                  }}
                >
                  <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                    Categories
                  </button>

                  {showCategories && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                      onMouseEnter={() => {
                        clearTimeout(hoverTimeout.current);
                        setShowCategories(true);
                      }}
                      onMouseLeave={() => {
                        hoverTimeout.current = setTimeout(
                          () => setShowCategories(false),
                          200
                        );
                      }}
                    >
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          to={`/products/${category.slug}`}
                          className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowCategories(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>

                <Link
                  to="/products"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  All Products
                </Link>
              </div>
            </div>

            {/* ---------- RIGHT SECTION ---------- */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/"
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Home"
              >
                <HomeIcon size={20} />
              </Link>

              <button
                onClick={()=>updateTheme()}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title= {theme === "light"? "Dark Mode" : "Light Mode"}
              >
                {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
              </button>

              <div
                onClick={handleWishlistClick}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Wishlist"
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>

              <div
                onClick={handleCartClick}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Cart"
              >
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>

              {user ? (
                <div className="relative group">
                  <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                   title={`${user.name}`}
                  >
                     { user.picture ? <img src={user.picture} className="h-[30px] w-[30px] object-cover rounded-full text-gray-700 dark:text-gray-300 transition-colors "/> : <User size={20} /> }
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                    <Link
                      to="/history"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      My Orders
                    </Link>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </motion.button>
                </Link>
              )}
            </div>

            {/* ---------- MOBILE MENU BUTTON ---------- */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ---------- MOBILE MENU ---------- */}
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/products"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
              >
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/products/${category.slug}`}
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/search"
                className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
              >
                Search
              </Link>
              <div
                onClick={handleWishlistClick}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Heart size={20} />Wishlist
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>

              
              <div
                onClick={handleCartClick}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ShoppingCart size={20} />Cart
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      navigate("/");
                    }}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                  >
                    Logout
                  </button>
                  <Link
                    to="/history"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                  >
                    My Orders
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 py-2"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </nav>
    </motion.div>
  );
};
