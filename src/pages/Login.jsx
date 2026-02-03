import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { GoogleLogin } from "@react-oauth/google";

export const Login = () => {
  const { login, handleGoogleLogin } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);

      if (res?.ok) {
        showToast(res.message || "Login successful", "success");
        navigate("/profile");
      } else {
        showToast("Login failed. Please try again.", "error");
      }
    } catch (error) {
      showToast("Login failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ShoppingBag
                className="text-blue-600 dark:text-blue-400"
                size={32}
              />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ShopHub
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Login to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" size="lg" fullWidth disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-right">
              <Link
                to="/auth/forget_password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              <span className="absolute bg-white dark:bg-gray-800 px-3 text-sm text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) =>
                  handleGoogleLogin(res.credential)
                }
                onError={() =>
                  showToast("Google login failed", "error")
                }
                shape="round"
                theme="outline"
                text="signin_with"
                width="300"
              />
            </div>
          </form>

          {/* Signup */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
