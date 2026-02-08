import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Pencil, Trash2, Plus, Upload, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import PinValidator from "../service/fetchAddress.js";
import axios from "axios";

export const Profile = () => {
  const { user, serverUrl } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.picture || "");
  const [addresses, setAddresses] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [fetchedAddressData, setFetchedAddressData] = useState(null);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

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
      setNewAddress((prev) => ({ ...prev, state: "", city: "" }));
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
          setNewAddress((prev) => ({ ...prev, state: res.State }));
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
    setNewAddress({
      ...newAddress,
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

  // ✅ Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/address`, {
          withCredentials: true,
        });
        setAddresses(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddresses();
  }, [serverUrl]);

  // 📤 Upload profile picture
  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("picture", file);

    try {
      const res = await axios.put(
        `${serverUrl}/api/user/update-picture`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setProfileImage(res.data.imageUrl);
      showToast("Profile picture updated successfully", "success");
    } catch (err) {
      showToast("Failed to update picture", "error");
      console.error(err);
    }
  };

  // 💾 Save profile info (local demo)
  const handleSaveProfile = () => {
    setIsEditing(false);
    showToast("Profile updated successfully", "success");
  };

  // ✅ Verify phone number
  const handleVerifyPhone = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const phone = newAddress.phone.trim();

    if (!phone) {
      showToast("Enter phone number first", "error");
      return;
    }

    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1000)); // fake delay for UX

    if (phoneRegex.test(phone)) {
      const res = await axios.post(
        `${serverUrl}/api/auth/phone-check`,
        { number: phone },
        { withCredentials: true }
      );
      console.log(res);
      if (res.data.isValid) {
        showToast("✅ Phone number verified!", "success");
        setIsPhoneVerified(true);
      }
      setIsVerifying(false);
    } else {
      showToast("❌ Invalid phone number", "error");
      setIsPhoneVerified(false);
    }

    setIsVerifying(false);
  };

  // 🏠 Add Address
  const handleAddAddress = async () => {
    if (!isPhoneVerified) {
      showToast("Please verify the phone number before saving", "error");
      return;
    }

    // Validate required fields
    if (!newAddress.name || !newAddress.city || !newAddress.street) {
      showToast("Please fill all address fields", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${serverUrl}/api/user/address`,
        newAddress,
        { withCredentials: true }
      );
      setAddresses(res.data.addresses);
      setIsAddingAddress(false);
      showToast("Address added successfully", "success");
      setNewAddress({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
      });
      setIsPhoneVerified(false);
      setFetchedAddressData(null);
    } catch (err) {
      showToast("Failed to add address", "error");
      console.error(err);
    }
  };

  // 🗑️ Delete Address
  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`${serverUrl}/api/user/address/${addressId}`, {
        withCredentials: true,
      });
      setAddresses(addresses.filter((addr) => addr._id !== addressId));
      showToast("Address deleted", "success");
    } catch (err) {
      showToast("Failed to delete address", "error");
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8"
      >
        My Profile
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* 🧍 Profile Info */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="text-blue-600 dark:text-blue-400" size={22} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Profile Info
              </h2>
            </div>

            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={user.picture || profileImage || "not found"}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-blue-500 shadow"
              />
              <label className="mt-2 flex items-center gap-2 cursor-pointer text-blue-600 hover:underline text-sm sm:text-base">
                <Upload size={16} />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    className="w-full sm:flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Name
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profileData.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profileData.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profileData.phone || "Not provided"}
                  </p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Pencil className="mr-2" size={16} /> Edit Profile
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* 🏠 Addresses */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-2 space-y-6 sm:space-y-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <MapPin
                  className="text-blue-600 dark:text-blue-400"
                  size={22}
                />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Saved Addresses
                </h2>
              </div>
              <Button
                onClick={() => setIsAddingAddress(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="mr-1" size={16} /> Add
              </Button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pincode */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pincode *
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={handlePincodeChange}
                        className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter 6-digit pincode"
                        maxLength="6"
                      />
                      {isLoadingPincode && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>

                  <Input
                    label="Name *"
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                    disabled={!fetchedAddressData}
                  />

                  {/* Phone */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => {
                        setNewAddress({
                          ...newAddress,
                          phone: e.target.value,
                        });
                        setIsPhoneVerified(false);
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter 10-digit number"
                      disabled={!fetchedAddressData}
                      maxLength="10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyPhone}
                      disabled={
                        isVerifying ||
                        !fetchedAddressData ||
                        newAddress.phone.length !== 10
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
                    value={fetchedAddressData?.State || newAddress.state}
                    readOnly
                    className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                  />

                  {/* City */}
                  <select
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="w-full sm:col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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

                <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-end">
                  <Button
                    onClick={handleAddAddress}
                    disabled={!isPhoneVerified || !fetchedAddressData}
                    className="w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingAddress(false);
                      setNewAddress({
                        name: "",
                        phone: "",
                        street: "",
                        city: "",
                        state: "",
                        pincode: "",
                      });
                      setIsPhoneVerified(false);
                      setFetchedAddressData(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Addresses */}
            <div className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((address, index) => (
                  <motion.div
                    key={address._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {address.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.street}, {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteAddress(address._id)}
                      className="self-start sm:self-auto"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No addresses saved.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
