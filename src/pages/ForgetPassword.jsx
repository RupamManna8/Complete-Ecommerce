import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { Link, useLocation, useNavigate, matchPath } from "react-router-dom";

function ForgetPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { serverUrl } = useContext(AuthContext);
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      // Custom rule
      if (matchPath(location.pathname, "/auth/forget_password")) {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;

    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/user/initiate-reset-password`,
        { email }
      );

      showToast(response?.data?.message || "Reset link sent", "success");
      setIsSubmitted(true);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Something went wrong. Try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Mail className="text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            {isSubmitted ? "Check your email" : "Forgot your password?"}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {isSubmitted
              ? "We’ve sent a password reset link to your email address."
              : "Enter your registered email to receive a reset link."}
          </p>
        </div>

        {/* FORM */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="example@gmail.com"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg shadow-md transition"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              If an account exists, you’ll receive an email shortly.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
