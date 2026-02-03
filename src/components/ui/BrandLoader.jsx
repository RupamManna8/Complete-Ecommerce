import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export const AppLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-6">

        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <ShoppingBag size={64} className="text-blue-600" />

          {/* Glow ring */}
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-blue-500"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeOut",
            }}
          />
        </motion.div>

        {/* Pulse Line */}
        <motion.div
          className="flex gap-1"
          initial="hidden"
          animate="visible"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-3 h-3 rounded-full bg-blue-600"
              variants={{
                hidden: { opacity: 0.3 },
                visible: {
                  opacity: [0.3, 1, 0.3],
                },
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-sm tracking-widest text-gray-600 dark:text-gray-400"
        >
          PREPARING YOUR EXPERIENCE
        </motion.p>
      </div>
    </div>
  );
};
