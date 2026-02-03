import { useContext, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  CreditCard,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { AuthContext } from "../context/AuthContext";

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    serverUrl,
    cartItems,
    setCartItems,
    wishlistItems,
    setWishlistItems,
    setCheckoutItems,
  } = useContext(AuthContext);

  const { showToast } = useToast();

  // ✅ All hooks at the top — stable order
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // ✅ Fetch product data
  const getProduct = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/products/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      showToast("Error fetching product", "error");
    }
  };

  useEffect(() => {
    getProduct();
  }, [id]);

  // ✅ Sync wishlist/cart status
  useEffect(() => {
    if (!product) return;
    setIsInWishlist(
      wishlistItems.some(
        (item) => item.productId === product._id || item._id === product._id
      )
    );
    setIsInCart(
      cartItems.some(
        (item) => item.productId === product._id || item._id === product._id
      )
    );
  }, [wishlistItems, cartItems, product]);

  // ✅ Wishlist toggle
  const handleToggleWishlist = useCallback(async () => {
    if (!user) return showToast("Please login to manage wishlist", "info");

    try {
      if (isInWishlist) {
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
      console.error("Error updating wishlist:", error);
      showToast("Error updating wishlist", "error");
    }
  }, [isInWishlist, user, serverUrl, product, showToast, setWishlistItems]);

  // ✅ Cart toggle
  const handleAddToCart = useCallback(async () => {
    if (!user) return showToast("Please login to manage cart", "info");

    const stock = product.stock ?? 0;

    try {
      if (isInCart) {
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
        if (stock < 1) return showToast("Product is out of stock", "info");

        const response = await fetch(`${serverUrl}/api/user/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product._id,
            productName: product.name,
            productPrice: product.price,
            productImage: product.images?.[0],
            productQuantity: quantity,
          }),
          credentials: "include",
        });
        const data = await response.json();
        setCartItems(data?.cart || []);
        showToast("Added to cart", "success");
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      showToast("Error updating cart", "error");
    }
  }, [isInCart, user, serverUrl, product, quantity, showToast, setCartItems]);

  // ✅ Buy Now → Checkout
  const handleBuyNow = useCallback(() => {
    if (!user) return showToast("Please login to continue checkout", "info");

    setCheckoutItems([
      {
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.images?.[0],
        productQuantity: quantity,
      },
    ]);
    navigate("/checkout");
  }, [user, product, quantity, setCheckoutItems, navigate, showToast]);

  // ✅ Return loading UI only after hooks are declared
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-white">
          Loading product...
        </h1>
      </div>
    );
  }

  // ✅ Safe field handling
  const price = product.price ? product.price.toFixed(2) : "N/A";
  const compareAtPrice = product.compareAtPrice
    ? product.compareAtPrice.toFixed(2)
    : null;
  const stock = product.stock ?? 0;

  const mockReviews = [
    {
      id: "1",
      author: "John Doe",
      rating: 5,
      comment: "Excellent product!",
      date: "2024-09-15",
    },
    {
      id: "2",
      author: "Jane Smith",
      rating: 4,
      comment: "Good quality, fast shipping.",
      date: "2024-09-10",
    },
    {
      id: "3",
      author: "Mike Johnson",
      rating: 5,
      comment: "Worth every penny!",
      date: "2024-09-05",
    },
  ];

  // ✅ Render
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
      >
        <ChevronLeft size={20} />
        Back
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
            <img
              src={product.images?.[currentImageIndex] || "/placeholder.png"}
              alt={product.name || "Product image"}
              className="w-full h-full object-cover"
            />
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (currentImageIndex - 1 + product.images.length) %
                        product.images.length
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (currentImageIndex + 1) % product.images.length
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex
                      ? "border-blue-600"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name || "Image"} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {product.name || "Unnamed Product"}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.floor(product.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              {product.rating || 0} ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              ${price}
            </span>
            {compareAtPrice && (
              <span className="text-2xl text-gray-500 line-through">
                ${compareAtPrice}
              </span>
            )}
          </div>

          {/* Description */}
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* ✅ Specifications Section */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Specifications
                </h3>
                <dl className="space-y-2">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-400">
                          {key}:
                        </dt>
                        <dd className="font-medium text-gray-900 dark:text-white">
                          {value}
                        </dd>
                      </div>
                    )
                  )}
                </dl>
              </div>
            )}

          {/* Quantity + Stock */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                -
              </button>
              <span className="px-6 py-2 border-x border-gray-300 dark:border-gray-700">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stock} available
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              size="lg"
              className={`flex-1 ${isInCart ? "bg-gray-700 text-white" : ""}`}
            >
              <ShoppingCart className="mr-2" size={20} />
              {isInCart ? "Remove from Cart" : "Add to Cart"}
            </Button>

            <Button
              onClick={handleToggleWishlist}
              variant={isInWishlist ? "primary" : "outline"}
              size="lg"
            >
              <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
            </Button>

            <Button
              onClick={handleBuyNow}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <CreditCard size={20} />
              Buy Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <motion.section
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Customer Reviews
        </h2>
        <div className="space-y-6">
          {mockReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {review.author}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {review.comment}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
