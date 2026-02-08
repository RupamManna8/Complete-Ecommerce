import { useContext, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Package, Wallet, Plus, Save } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/Toast";
import { AuthContext } from "../context/AuthContext";
import PinValidator from "../service/fetchAddress";
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
  const [fetchedAddressData, setFetchedAddressData] = useState(null);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

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
        setIsPhoneVerified(true); // Assume saved addresses are verified
      }
    }
  }, [selectedAddressId, isAddingNew, addresses]);

  // Debounce function
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch address by pincode with debounce
  const fetchAddressByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setFetchedAddressData(null);
      setShippingInfo((prev) => ({
        ...prev,
        state: "",
        city: "",
        street: "",
      }));
      return;
    }

    setIsLoadingPincode(true);
    try {
      const res = await PinValidator(pincode);
      if (res && res.message === "Invalid Pin") {
        setFetchedAddressData(null);
        showToast("❌ Invalid pincode or unable to fetch address", "error");
        return;
      }
      if (res) {
        setFetchedAddressData({
          Blocks: res.Blocks || [],
          Street: res.Street || [],
          State: res.State || "",
        });

        // Auto-fill state if available
        if (res.State) {
          setShippingInfo((prev) => ({ ...prev, state: res.State }));
        }

        showToast("✅ Address details fetched successfully", "success");
      }
    } catch (err) {
      console.log(err);
      showToast("❌ Invalid pincode or unable to fetch address", "error");
      setFetchedAddressData(null);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  // Debounced version of fetchAddressByPincode
  const debouncedFetchAddress = useCallback(
    debounce((pincode) => {
      fetchAddressByPincode(pincode);
    }, 500),
    []
  );

  // Handle pincode change
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setShippingInfo({
      ...shippingInfo,
      pincode: value,
      state: "",
      city: "",
      street: "",
    });

    // Clear fetched data when pincode changes
    if (value.length !== 6) {
      setFetchedAddressData(null);
    }

    // Trigger debounced fetch if pincode is complete
    if (value.length === 6) {
      debouncedFetchAddress(value);
    }
  };

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
      console.log(res);
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
    // Check if we're adding new address and if it's valid
    if (isAddingNew && (!fetchedAddressData || !isPhoneVerified)) {
      showToast("Please complete the address details first", "error");
      return;
    }

    // Check if address is selected when not adding new
    if (!isAddingNew && !selectedAddressId) {
      showToast("Please select or add a shipping address", "error");
      return;
    }

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

    if (!fetchedAddressData) {
      showToast("Please enter a valid pincode first", "error");
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
      // Find the newly added address by pincode and name
      const savedAddr = newAddress.find(
        (addr) =>
          addr.pincode === shippingInfo.pincode &&
          addr.name === shippingInfo.name
      );
      if (savedAddr) {
        setSelectedAddressId(savedAddr._id);
      }
      setIsAddingNew(false);
      showToast("Address saved successfully", "success");
      // Reset fetched data
      setFetchedAddressData(null);
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

    // If adding new address, ensure it's valid
    if (isAddingNew) {
      if (!fetchedAddressData || !isPhoneVerified) {
        showToast("Please complete and verify the new address first", "error");
        return;
      }
    } else {
      // If not adding new, ensure an address is selected
      if (!selectedAddressId) {
        showToast("Please select a shipping address", "error");
        return;
      }
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
        key: razorpay_key,
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${textPrimary} mb-6 sm:mb-8`}
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Shipping Address */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-600" size={22} />
                  <h2
                    className={`text-xl sm:text-2xl font-bold ${textPrimary}`}
                  >
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
                    setFetchedAddressData(null);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base"
                >
                  <Plus size={18} className="mr-1" /> Add New
                </button>
              </div>

              {/* Address List */}
              {addresses.length > 0 && !isAddingNew && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex flex-col sm:flex-row items-start gap-3 border rounded-lg p-3 sm:p-4 cursor-pointer transition ${
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
                        className="accent-blue-600 mt-1"
                      />
                      <div
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
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

              {/* Add New Address Form */}
              {isAddingNew && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pincode */}
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pincode *
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={shippingInfo.pincode}
                          onChange={handlePincodeChange}
                          className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Enter 6-digit pincode"
                          maxLength="6"
                        />
                        {isLoadingPincode && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>

                    <Input
                      label="Full Name *"
                      value={shippingInfo.name}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          name: e.target.value,
                        })
                      }
                      required
                      theme={theme}
                      disabled={!fetchedAddressData}
                    />

                    {/* Phone */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                      <Input
                        label="Phone *"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            phone: e.target.value,
                          });
                          setIsPhoneVerified(false);
                        }}
                        required
                        className="flex-1"
                        theme={theme}
                        disabled={!fetchedAddressData}
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={
                          isVerifying ||
                          !fetchedAddressData ||
                          shippingInfo.phone.length !== 10
                        }
                        className="w-full sm:w-auto"
                      >
                        {isVerifying
                          ? "Verifying..."
                          : isPhoneVerified
                          ? "Verified ✅"
                          : "Verify"}
                      </Button>
                    </div>

                    {/* State */}
                    <input
                      type="text"
                      value={fetchedAddressData?.State || shippingInfo.state}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-not-allowed dark:border-gray-600 dark:text-white"
                    />

                    {/* City */}
                    <select
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          city: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={!fetchedAddressData}
                    >
                      <option value="">Select City/District</option>
                      {fetchedAddressData?.Blocks?.map((block, index) => (
                        <option key={index} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>

                    {/* Street */}
                    <select
                      value={shippingInfo.street}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          street: e.target.value,
                        })
                      }
                      className="w-full sm:col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={!fetchedAddressData}
                    >
                      <option value="">Select Street/Locality</option>
                      {fetchedAddressData?.Street?.map((street, index) => (
                        <option key={index} value={street}>
                          {street}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                    <Button type="button" className="w-full sm:w-auto">
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Payment */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6"
            >
              <h2
                className={`text-xl sm:text-2xl font-bold ${textPrimary} mb-4`}
              >
                Payment Method
              </h2>

              <div className="space-y-3 text-sm sm:text-base">
                <label className="flex items-center gap-3">
                  <input type="radio" className="accent-blue-600" />
                  Cash on Delivery (COD)
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" className="accent-blue-600" />
                  Razorpay (Online Payment)
                </label>
              </div>
            </motion.div>
          </div>

          {/* ORDER SUMMARY */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
              <h2
                className={`text-xl sm:text-2xl font-bold ${textPrimary} mb-4`}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-start">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.productQuantity}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        ₹{(item.productPrice * item.productQuantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full text-base sm:text-lg py-3">
                Place Order
              </Button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
