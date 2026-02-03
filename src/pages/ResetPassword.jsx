import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";

function ResetPassword() {
  const { id: token } = useParams();
  const navigate = useNavigate();
  const { serverUrl } = useContext(AuthContext);
  const { showToast } = useToast();

  /* ------------------ STATE ------------------ */
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0); // ⬅ FIXED (no null)
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [redirectTime, setRedirectTime] = useState(5);

  const [passwords, setPasswords] = useState({
    newPass: "",
    confirmPass: "",
  });

  /* ------------------ VERIFY TOKEN ------------------ */
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/user/verify-reset-token/${token}`
        );

        setTokenValid(true);

        const expiresAt = res.data.expiresAt;
        console.log("expiresAt:", expiresAt);

        // convert ISO string → milliseconds
        const expiresAtMs = new Date(expiresAt).getTime();

        const remainingSeconds = Math.max(
          Math.floor((expiresAtMs - Date.now()) / 1000),
          0
        );

        console.log("remainingSeconds:", remainingSeconds);

        setTimeLeft(remainingSeconds);
      } catch (error) {
        setInvalidToken(true);
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [token, serverUrl]);

  /* ------------------ REDIRECT IF INVALID TOKEN ------------------ */
  useEffect(() => {
    if (!invalidToken) return;
    navigate("/login", { replace: true });
  }, [invalidToken, navigate]);

  /* ------------------ EXPIRY COUNTDOWN ------------------ */
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          showToast("Reset link expired", "error");
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isSubmitted, navigate, showToast]);

  /* ------------------ REDIRECT AFTER SUCCESS ------------------ */
  useEffect(() => {
    if (!isSubmitted) return;

    const timer = setInterval(() => {
      setRedirectTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, navigate]);

  /* ------------------ HANDLERS ------------------ */
  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPass !== passwords.confirmPass) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(`${serverUrl}/api/user/reset-password`, {
        token,
        newPassword: passwords.newPass,
      });

      showToast(res.data.message, "success");
      setIsSubmitted(true);
    } catch (error) {
      showToast(
        error?.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ BLOCK RENDER ------------------ */
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Verifying reset link...</p>
      </div>
    );
  }

  if (invalidToken) return null;

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Lock className="text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            {isSubmitted ? "Password Updated" : "Reset Your Password"}
          </h2>

          {!isSubmitted && (
            <p className="text-xs text-red-500 mt-2">
              Link expires in {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          )}
        </div>

        {/* FORM */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPass"
                  value={passwords.newPass}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPass"
                value={passwords.confirmPass}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center">
            <p className="text-gray-700 mb-2 font-medium">
              Password reset successful 🎉
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Redirecting to login in{" "}
              <span className="font-semibold">{redirectTime}</span> seconds
            </p>

            <Link
              to="/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Go to Login Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
