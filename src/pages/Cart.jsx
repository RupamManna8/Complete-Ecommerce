import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/Toast";
import { useContext, useEffect, useRef, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";

/* ------------------ Debounce Helper ------------------ */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const Cart = () => {
  const {
    serverUrl,
    cartItems,
    setCartItems,
    setCheckoutItems,
  } = useContext(AuthContext);

  const navigate = useNavigate();
  const { showToast } = useToast();

  /* ---------------- Fetch Cart ---------------- */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${serverUrl}/api/user/cart`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setCartItems(data || []);
        }
      } catch (err) {
        console.error("❌ Fetch cart error:", err);
      }
    };

    fetchCart();
  }, [serverUrl, setCartItems]);

  /* ---------------- API: Update Quantity ---------------- */
  const updateQuantityApi = useCallback(
    async (productId, quantity) => {
      try {
        console.log("🚀 API HIT:", productId, quantity);

        await fetch(`${serverUrl}/api/user/cart`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId, quantity }),
        });
      } catch (err) {
        console.error("❌ Update quantity error:", err);
        showToast("Failed to update quantity", "error");
      }
    },
    [serverUrl, showToast]
  );

  /* ---------------- Debounced API ---------------- */
  const debouncedUpdateRef = useRef(null);

  useEffect(() => {
    debouncedUpdateRef.current = debounce(updateQuantityApi, 400);
  }, [updateQuantityApi]);

  /* ---------------- Quantity Handler ---------------- */
  const handleUpdateQuantity = (productId, newQty, stock) => {
    if (newQty < 1 || newQty > stock) return;

    // ✅ Optimistic UI
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, productQuantity: newQty }
          : item
      )
    );

    // ✅ Debounced API call (NOW WORKS)
    debouncedUpdateRef.current(productId, newQty);
  };

  /* ---------------- Remove Item ---------------- */
  const handleRemove = async (productId) => {
    try {
      const res = await fetch(
        `${serverUrl}/api/user/cart/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (res.ok) {
        setCartItems(data.cart || []);
        showToast("Item removed from cart", "info");
      }
    } catch (err) {
      console.error("❌ Remove item error:", err);
    }
  };

  /* ---------------- Checkout ---------------- */
  const handleCheckout = () => {
    if (!cartItems.length) {
      showToast("Your cart is empty", "info");
      return;
    }
    setCheckoutItems(cartItems);
    navigate("/checkout");
  };

  /* ---------------- Calculations ---------------- */
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + item.productPrice * item.productQuantity,
    0
  );

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  /* ---------------- Empty Cart ---------------- */
  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-3xl font-bold mb-4">
            Your cart is empty
          </h2>
          <Link to="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <motion.div
              key={item.productId}
              className="bg-white rounded-xl p-6 shadow flex gap-6"
            >
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-32 h-32 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {item.productName}
                </h3>

                <p className="text-2xl font-bold text-blue-600">
                  ${item.productPrice.toFixed(2)}
                </p>

                <div className="flex justify-between items-center mt-4">
                  {/* Quantity Controls */}
                  <div className="flex border rounded-lg">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.productQuantity - 1,
                          item.productStock
                        )
                      }
                      disabled={item.productQuantity <= 1}
                      className="p-2"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="px-4 py-2">
                      {item.productQuantity}
                    </span>

                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.productQuantity + 1,
                          item.productStock
                        )
                      }
                      disabled={
                        item.productQuantity >= item.productStock
                      }
                      className="p-2"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="text-red-500"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow sticky top-24">
          <h2 className="text-2xl font-bold mb-6">
            Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? "FREE" : `$${shipping}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button onClick={handleCheckout} fullWidth className="mt-6">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
