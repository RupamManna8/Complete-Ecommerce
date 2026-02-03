import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { AuthContext, useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { GoogleLogin } from '@react-oauth/google';

export const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup,handleGoogleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      console.log("ful:",fullName,"email:",email,"pass:",password)
      const data = await signup(fullName, email, password);
      if(data.ok){
        showToast('Account created successfully!', 'success');
        navigate('/');
      }else{
        showToast(data.message,'error');
      }
      
    } catch (error) {
      showToast('Signup failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="text-blue-600 dark:text-blue-400" size={32} />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">ShopHub</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Join us and start shopping</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              <span className="absolute bg-white dark:bg-gray-800 px-3 text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>

            <div className="flex justify-center">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={(response) => handleGoogleLogin(response.credential)}
                  onError={() => showToast('Google login failed. Please try again.', 'error')}
                  shape="rectangular"
                  theme="outline"
                  text="signin_with"
                  width="300"
                />
              </div>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          This is a demo. Use any email and password to create an account.
        </p>
      </motion.div>
    </div>
  );
};
