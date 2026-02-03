import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "./ui/Toast";
import { Card } from "./ui/Card";
import { useContext, useCallback, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export const ProductCard = ({ product }) => {
  const { showToast } = useToast();
  const {
    user,
    serverUrl,
    cartItems,
    setCartItems,
    wishlistItems,
    setWishlistItems,
  } = useContext(AuthContext);

  // ✅ Sync local wishlist/cart state with global context
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const inWishlist = wishlistItems.some(
      (item) => item.productId === product._id || item._id === product._id
    );
    const inCart = cartItems.some(
      (item) => item.productId === product._id || item._id === product._id
    );
    setIsInWishlist(inWishlist);
    setIsInCart(inCart);
  }, [wishlistItems, cartItems, product._id]);

  // ✅ Toggle wishlist
  const handleToggleWishlist = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        showToast("Please login to manage wishlist", "info");
        return;
      }

      try {
        if (isInWishlist) {
          // Remove
          const response = await fetch(
            `${serverUrl}/api/user/wishlist/${product._id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const data = await response.json();
          setWishlistItems(data?.wishlist || []);
          showToast("Removed from wishlist", "info");
        } else {
          // Add
          const response = await fetch(`${serverUrl}/api/user/wishlist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product._id,
              productName: product.name,
              productPrice: product.price,
              productImage: product.images?.[0],
            }),
            credentials: "include",
          });
          const data = await response.json();
          setWishlistItems(data?.wishlist || []);
          showToast("Added to wishlist", "success");
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        showToast("Error updating wishlist", "error");
      }
    },
    [isInWishlist, product, user, serverUrl, showToast, setWishlistItems]
  );

  // ✅ Toggle cart (add / remove)
  const handleToggleCart = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user) {
        showToast("Please login to manage cart", "info");
        return;
      }

      try {
        if (isInCart) {
          // Remove from cart
          const response = await fetch(
            `${serverUrl}/api/user/cart/${product._id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const data = await response.json();
          setCartItems(data?.cart || []);
          showToast("Removed from cart", "info");
        } else {
          // Add to cart
          if (product.stock < 1) {
            showToast("Product is out of stock", "info");
            return;
          }

          const response = await fetch(`${serverUrl}/api/user/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product._id,
              productName: product.name,
              productPrice: product.price,
              productImage: product.images?.[0],
              productQuantity: 1,
            }),
            credentials: "include",
          });
          const data = await response.json();
          setCartItems(data?.cart || []);
          showToast("Added to cart", "success");
        }
      } catch (error) {
        console.error("Error toggling cart:", error);
        showToast("Error updating cart", "error");
      }
    },
    [isInCart, product, user, serverUrl, showToast, setCartItems]
  );

  // ✅ UI
  return (
    <Link to={`/product/${product._id}`}>
      <Card hover className="group">
        {/* Product Image */}
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Sale Tag */}
          {product.compareAtPrice && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              Save ${(product.compareAtPrice - product.price).toFixed(2)}
            </div>
          )}

          {/* Hover Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Wishlist Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isInWishlist
                  ? "bg-red-500 text-white hover:bg-white hover:text-red-500"
                  : "bg-white text-black hover:bg-red-500 hover:text-white"
              }`}
            >
              <Heart size={18} />
            </motion.button>

            {/* Cart Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleCart}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isInCart
                  ? "bg-blue-600 text-white hover:bg-white hover:text-blue-600"
                  : "bg-white text-gray-700 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <ShoppingCart size={18} />
            </motion.button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={
                    i < Math.floor(product.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Low Stock */}
          {product.stock < 10 && (
            <p className="text-sm text-red-500 mt-2">
              Only {product.stock} left in stock!
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
};
