import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = false }) => {
  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }
          : {}
      }
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};
