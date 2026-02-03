import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const backgrounds = {
    success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 200, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 200, scale: 0.8 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${backgrounds[toast.type]}`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
