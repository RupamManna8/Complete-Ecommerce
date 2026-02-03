import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
          className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4"
        >
          404
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/">
            <Button size="lg">
              <Home className="mr-2" size={20} />
              Go Home
            </Button>
          </Link>
          <Link to="/products">
            <Button size="lg" variant="outline">
              <Search className="mr-2" size={20} />
              Browse Products
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
