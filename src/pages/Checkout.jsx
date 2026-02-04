import { useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Package, Wallet, Plus, Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { AuthContext } from "../context/AuthContext";
const razorpay_key = import.meta.env.VITE_RAZORPAY_KEY;

export const Checkout = () => {
  const { theme, serverUrl, checkoutItems, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // BOT VERIFICATION
  const [showBotPopup, setShowBotPopup] = useState(false);
  const [botCode, setBotCode] = useState("");
  const [userBotInput, setUserBotInput] = useState("");
  const [isVerifyingBot, setIsVerifyingBot] = useState(false);

  // Theme-based text colors
  const textPrimary = theme === "dark" ? "text-white" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textMuted = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const textInverted = theme === "dark" ? "text-gray-900" : "text-white";

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.productPrice * item.productQuantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Redirect if cart is empty
  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) navigate("/cart");
  }, [checkoutItems, navigate]);

  // Load saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/address`, {
          withCredentials: true,
        });
        const fetched = res.data || [];
        setAddresses(fetched);
        if (fetched.length > 0) setSelectedAddressId(fetched[0]._id);
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
        showToast("Unable to load saved addresses", "error");
      }
    };
    fetchAddresses();
  }, [serverUrl, showToast]);

  // Sync selected address into shippingInfo
  useEffect(() => {
    if (!isAddingNew && selectedAddressId) {
      const selected = addresses.find((a) => a._id === selectedAddressId);
      if (selected) {
        setShippingInfo({
          name: selected.name || "",
          phone: selected.phone || "",
          street: selected.street || "",
          city: selected.city || "",
          state: selected.state || "",
          pincode: selected.pincode || "",
          country: selected.country || "India",
        });
      }
    }
  }, [selectedAddressId, isAddingNew, addresses]);

  // PHONE VERIFICATION
  const handleVerifyPhone = async () => {
    const phone = (shippingInfo.phone || "").trim();
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phone) {
      showToast("Please enter phone number first", "error");
      return;
    }

    setIsVerifying(true);
    setIsPhoneVerified(false);

    try {
      if (!phoneRegex.test(phone)) {
        showToast("❌ Invalid phone number format", "error");
        return;
      }

      const res = await axios.post(
        `${serverUrl}/api/auth/phone-check`,
        { number: phone },
        { withCredentials: true }
      );

      if (res?.data?.isValid) {
        setIsPhoneVerified(true);
        showToast("✅ Phone number verified successfully!", "success");
      } else {
        showToast("❌ Phone verification failed", "error");
      }
    } catch (err) {
      console.error("Phone verify error:", err);
      showToast("Error verifying phone number", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  // BOT CODE GENERATION
  const generateBotCode = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setBotCode(code);
    setUserBotInput("");
  }, []);

  const handleOpenBotPopup = () => {
    generateBotCode();
    setShowBotPopup(true);
  };

  // close popup by backdrop click
  const handleBackdropClick = (e) => {
    if (e.target.dataset && e.target.dataset.backdrop === "true") {
      setShowBotPopup(false);
    }
  };

  // close via ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && showBotPopup) {
        setShowBotPopup(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showBotPopup]);

  // VERIFY BOT CODE
  const handleVerifyBotCode = async () => {
    if (!userBotInput.trim()) {
      showToast("Please enter the code first.", "error");
      return;
    }

    setIsVerifyingBot(true);
    try {
      if (userBotInput.trim().toUpperCase() === botCode.trim().toUpperCase()) {
        showToast("✅ Verification successful!", "success");
        setShowBotPopup(false);

        // small delay for UX, then submit
        setTimeout(() => {
          const fakeEvent = { preventDefault: () => {} };
          handleSubmit(fakeEvent);
        }, 350);
      } else {
        showToast("❌ Incorrect code, please try again.", "error");
        generateBotCode();
      }
    } catch (err) {
      console.error("Bot verify error:", err);
      showToast("Error verifying code. Try again.", "error");
    } finally {
      setIsVerifyingBot(false);
    }
  };

  // SAVE ADDRESS
  const handleSaveAddress = async () => {
    if (
      !shippingInfo.name ||
      !shippingInfo.phone ||
      !shippingInfo.street ||
      !shippingInfo.city ||
      !shippingInfo.state ||
      !shippingInfo.pincode
    ) {
      showToast("Please fill all required address fields", "error");
      return;
    }

    if (!isPhoneVerified) {
      showToast("Please verify your phone number first", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/user/address`,
        shippingInfo,
        { withCredentials: true }
      );

      const newAddress = res.data.addresses || [];
      if (!newAddress) {
        showToast("Unexpected response while saving address", "error");
        return;
      }
      
      setAddresses(newAddress);
      setSelectedAddressId(newAddress._id);
      setIsAddingNew(false);
      showToast("Address saved successfully", "success");
    } catch (error) {
      console.error("Save address error:", error);
      showToast("Error saving address", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // SUBMIT ORDER
  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.street) {
      showToast("Please fill out all required shipping fields", "error");
      return;
    }

    // If online payment selected, use razorpay flow
    if (selectedPayment === "razorpay") {
      handleRazorpay();
      return;
    }

    const today = new Date();
    const dateAfter7Days = new Date(today);
    dateAfter7Days.setDate(today.getDate() + 7);

    try {
      const payload = {
        products: checkoutItems.map((item) => ({
          product: item.productId,
          quantity: item.productQuantity,
          price: item.productPrice,
          name: item.productName,
          picture: item.productImage,
        })),
        shippingAddress: shippingInfo,
        paymentMode: "COD",
        totalPrice: total,
        paymentStatus: false,
        paymentId: "not paid",
        paymentDate: new Date(),
        deliveryDate: dateAfter7Days,
      };

      const res = await axios.post(`${serverUrl}/api/orders`, payload, {
        withCredentials: true,
      });

      if (res.status === 201 || res.data?.ok) {
        showToast("Order placed successfully!", "success");
        setShowSuccessModal(true);
        setTimeout(() => navigate("/history"), 1400);
      } else {
        console.error("Unexpected order response:", res);
        showToast("Failed to place order. Please try again.", "error");
      }
    } catch (err) {
      console.error("Place order error:", err);
      showToast("Error placing order. Please try later.", "error");
    }
  };

  // RAZORPAY
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  useEffect(() => {
    loadRazorpayScript();
  }, [serverUrl]);

  const handleRazorpay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      showToast("Unable to load payment gateway. Try again later.", "error");
      return;
    }

    const today = new Date();
    const dateAfter7Days = new Date(today);
    dateAfter7Days.setDate(today.getDate() + 7);

    try {
      const options = {
        key: razorpay_key, // use env in production
        amount: Math.round(total * 100),
        currency: "INR",
        name: "My Store",
        description: "Order Payment",
        handler: async function (response) {
          try {
            const payload = {
              products: checkoutItems.map((item) => ({
                product: item.productId,
                quantity: item.productQuantity,
                price: item.productPrice,
                name: item.productName,
                picture: item.productImage,
              })),
              shippingAddress: shippingInfo,
              paymentMode: "Online",
              totalPrice: total,
              paymentStatus: true,
              paymentId: response.razorpay_payment_id,
              paymentDate: new Date(),
              deliveryDate: dateAfter7Days,
            };

            const res = await axios.post(`${serverUrl}/api/orders`, payload, {
              withCredentials: true,
            });

            if (res.data?.ok || res.status === 201) {
              showToast("Payment successful! Order placed.", "success");
              setShowSuccessModal(true);
              setTimeout(() => navigate("/history"), 1400);
            } else {
              console.error("Order creation after payment failed:", res);
              showToast("Order creation failed after payment", "error");
            }
          } catch (err) {
            console.error("Order after payment error:", err);
            showToast("Order creation failed after payment", "error");
          }
        },
        prefill: {
          name: shippingInfo.name,
          email: user?.email || "",
          contact: shippingInfo.phone,
        },
        theme: { color: "#2563eb" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay flow error:", err);
      showToast("Payment failed to initialize", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-4xl font-bold ${textPrimary} mb-8`}
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-600" size={24} />
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>
                    Shipping Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(true);
                    setSelectedAddressId(null);
                    setShippingInfo({
                      name: "",
                      phone: "",
                      street: "",
                      city: "",
                      state: "",
                      pincode: "",
                      country: "India",
                    });
                    setIsPhoneVerified(false);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Plus size={20} className="mr-1" /> Add New
                </button>
              </div>

              {addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id || Math.floor(Math.random() * 1000) + 1} 
                      className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition ${
                        selectedAddressId === addr._id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr._id}
                        onChange={() => {
                          setSelectedAddressId(addr._id);
                          setIsAddingNew(false);
                        }}
                        className="mt-1 accent-blue-600"
                      />
                      <div className={`text-sm ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                        <p className="font-semibold">{addr.name}</p>
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p>{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {isAddingNew && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                >
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
                    Add New Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name *"
                      value={shippingInfo.name}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, name: e.target.value })
                      }
                      required
                      theme={theme}
                    />

                    <div className="flex gap-2 items-end">
                      <Input
                        label="Phone *"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, phone: e.target.value });
                          setIsPhoneVerified(false);
                        }}
                        required
                        className="flex-1"
                        theme={theme}
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={isVerifying}
                      >
                        {isVerifying ? "Verifying..." : isPhoneVerified ? "Verified ✅" : "Verify"}
                      </Button>
                    </div>

                    <Input
                      label="Street *"
                      value={shippingInfo.street}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, street: e.target.value })
                      }
                      required
                      className="md:col-span-2"
                      theme={theme}
                    />
                    <Input
                      label="City *"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, city: e.target.value })
                      }
                      required
                      theme={theme}
                    />
                    <Input
                      label="State *"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, state: e.target.value })
                      }
                      required
                      theme={theme}
                    />
                    <Input
                      label="ZIP Code *"
                      value={shippingInfo.pincode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, pincode: e.target.value })
                      }
                      required
                      theme={theme}
                    />
                    <Input 
                      label="Country" 
                      value="India" 
                      disabled 
                      theme={theme}
                    />
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Button type="button" onClick={handleSaveAddress} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Address"}
                      <Save className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Payment Options */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-blue-600" size={24} />
                <h2 className={`text-2xl font-bold ${textPrimary}`}>
                  Payment Method
                </h2>
              </div>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 cursor-pointer ${textSecondary}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPayment === "cod"}
                    onChange={() => setSelectedPayment("cod")}
                    className="accent-blue-600"
                  />
                  <span className="font-medium">Cash on Delivery (COD)</span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer ${textSecondary}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={selectedPayment === "razorpay"}
                    onChange={() => setSelectedPayment("razorpay")}
                    className="accent-blue-600"
                  />
                  <span className="font-medium">Razorpay (Online Payment)</span>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <Package className="text-blue-600" size={24} />
                <h2 className={`text-2xl font-bold ${textPrimary}`}>
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${textSecondary}`}>{item.productName}</p>
                      <p className={`text-sm ${textMuted}`}>Qty: {item.productQuantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        ₹{(item.productPrice * item.productQuantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3 mb-6">
                <div className={`flex justify-between ${textMuted}`}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between ${textMuted}`}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className={`flex justify-between ${textMuted}`}>
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-semibold ${textPrimary}`}>
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button type="button" className="w-full text-lg py-3" onClick={handleOpenBotPopup}>
                Place Order
              </Button>
            </div>
          </motion.div>
        </div>
      </form>

      {/* Bot Verification Popup */}
      <AnimatePresence>
        {showBotPopup && (
          <motion.div
            data-backdrop="true"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center relative"
            >
              <h2 className={`text-2xl font-bold ${textPrimary} mb-3`}>
                🤖 Bot Verification
              </h2>
              <p className={`text-sm ${textMuted} mb-4`}>
                Enter the code below to confirm you're human.
              </p>

              <div className="select-none text-3xl font-extrabold tracking-widest text-blue-600 bg-blue-50 dark:bg-gray-800 py-3 rounded-lg mb-5">
                {botCode}
              </div>

              <Input
                placeholder="Type the code shown above"
                value={userBotInput}
                onChange={(e) => setUserBotInput(e.target.value)}
                className="mb-4"
                theme={theme}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleVerifyBotCode}
                  disabled={isVerifyingBot}
                  className="flex-1"
                >
                  {isVerifyingBot ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => generateBotCode()}
                  className="px-4"
                >
                  🔄
                </Button>
              </div>

              <button
                className={`absolute top-3 right-4 ${theme === "dark" ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-800"}`}
                onClick={() => setShowBotPopup(false)}
                aria-label="Close verification popup"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success overlay (no external modal) */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg w-[90%] max-w-sm text-center"
            >
              <div className="text-4xl mb-2">🎉</div>
              <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>
                Order Placed
              </h3>
              <p className={`text-sm ${textMuted} mb-4`}>
                Your order was placed successfully — redirecting to order history.
              </p>
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate("/history");
                  }}
                >
                  Go to Orders
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;