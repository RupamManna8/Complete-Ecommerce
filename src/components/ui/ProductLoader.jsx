import { motion } from "framer-motion";

export const ProductLoader = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: i * 0.1,
            duration: 0.4,
            ease: "easeOut",
          }}
          className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm"
        >
          {/* Image */}
          <motion.div
            className="w-full h-40 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: "easeInOut",
            }}
          />

          {/* Title */}
          <motion.div
            className="h-4 w-3/4 mt-4 rounded bg-gray-300 dark:bg-gray-700"
            animate={{ scaleX: [0.6, 1, 0.6] }}
            transition={{
              repeat: Infinity,
              duration: 1.3,
              ease: "easeInOut",
            }}
            style={{ originX: 0 }}
          />

          {/* Price */}
          <motion.div
            className="h-4 w-1/3 mt-3 rounded bg-blue-400/70"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: 1.1,
              ease: "easeInOut",
            }}
          />

          {/* Button */}
          <motion.div
            className="h-10 w-full mt-5 rounded-lg bg-gray-300 dark:bg-gray-700"
            animate={{ scaleY: [0.7, 1, 0.7] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
            }}
            style={{ originY: 0 }}
          />
        </motion.div>
      ))}
    </div>
  );
};
