import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const Wishlist = () => {
  const { user, serverUrl, wishlistItems, setWishlistItems, cartItems } =
    useContext(AuthContext);
 
  const { showToast } = useToast();
  const navigate = useNavigate()

  // ✅ Fetch wishlist from API
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${serverUrl}/api/user/wishlist`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();
        
        if (res) setWishlistItems(data || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };
    fetchWishlist();
  }, [serverUrl]);

  // ✅ Check if item is in cart
  const isItemInCart=(itemId)=> {
    const result  = cartItems.some((item) => item.productId === itemId);
    
    return  result
  }

  // ✅ Remove item from wishlist (API)
  const handleRemove = async (id) => {
    try {
      const res = await fetch(`${serverUrl}/api/user/wishlist/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res) {
        setWishlistItems(data.wishlist);
        showToast("Removed from wishlist", "info");
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // ✅ Move item to cart (API)
  const handleMoveToCart = async (item) => {
    try {
      const cartRes = await fetch(`${serverUrl}/api/user/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage,
          productQuantity: 1,
        }),
      });

      if (cartRes) {
        await handleRemove(item.id);
        showToast("Moved to cart", "success");
      }
    } catch (err) {
      console.error("Error moving item to cart:", err);
    }
  };

  // 🩶 Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Save your favorite items for later!
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // 🩵 Wishlist items
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
      >
        My Wishlist
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden group"
            
          >
            <div className="relative aspect-square"
             onClick={()=>navigate(`/product/${item.productId}`)}
            >
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {item.productName}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ${item.productPrice?.toFixed(2)}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (isItemInCart(item.productId))
                      showToast("Item already in cart", "info");
                    else {
                      handleMoveToCart(item);
                    }
                  }}
                  size="sm"
                  className="flex-1"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  {isItemInCart(item.productId) ? "Already in Cart" :"Add to Cart" }
                </Button>
                <Button
                  onClick={() => handleRemove(item.productId)}
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
