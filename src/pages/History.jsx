import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export const History = () => {
  const { serverUrl } = useAuth();
  const [history, setHistory] = useState([]);

  // Fetch order history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/history`, {
        withCredentials: true,
      });
      setHistory(res.data || []);
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
      >
        Order History
      </motion.h1>

      <div className="space-y-6">
        {history.length > 0 ? (
          history.map((order, index) => (
            <motion.div
              key={order.orderId}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-w-full"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Order ID: {order.orderId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Oreder Date: {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium mt-2 sm:mt-0 ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  Order Status: {order.orderStatus}
                </span>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">Product</th>
                      <th className="px-2 py-1">Quantity</th>
                      <th className="px-2 py-1">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-2 py-1 flex items-center gap-2">
                          <img
                            src={p.picture}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                          />
                          <span className="truncate">{p.name}</span>
                        </td>
                        <td className="px-2 py-1">{p.quantity}</td>
                        <td className="px-2 py-1">${p.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment & Total */}
              <div className="flex justify-between items-center mt-2 text-sm sm:text-base">
                <p className="text-gray-600 dark:text-gray-400">
                  Payment: {order.paymentMode}
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  Total: $
                  {order.products
                    .reduce((sum, p) => sum + p.price * p.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Payment Status: {order.paymentStatus ? "Paid" : "Pending"}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                Payment ID: {order.paymentId}
              </p>
              {/* Delivery Date */}
              {order.deliveryDate && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                  Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                </p>
              )}
              {/*shipping address */}
              {order.shippingAddress && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Phone: {order.shippingAddress.phone}, City: {order.shippingAddress.city},
                    Street: {order.shippingAddress.street}, Zipcode: {order.shippingAddress.pincode},
                    State: {order.shippingAddress.state}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
};
