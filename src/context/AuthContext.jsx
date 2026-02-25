import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const serverUrl = import.meta.env.VITE_SERVER_URL;


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [previousMail, setPreviousMail] = useState(null);
  const [theme,setTheme] = useState("light");
  const navigate = useNavigate();
 
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  /* ---------------- THEME TOGGLE ---------------- */
  const updateTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/auth/current-user`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data) {
          setIsAuthenticated(true);
          setUser(data.user);
          setCartItems(data.user.cart);
          setWishlistItems(data.user.wishlist);
          
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        isAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${serverUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password,"AttemptMail":email }),
        credentials: "include",
      });
      const data = await response.json();
      if (data) {
        setCartItems(data.user.cart);
        setWishlistItems(data.user.wishlist);
        setIsAuthenticated(true);
        setUser(data.user);
      }
      return {ok: true,message: data.message};
    } catch (error) {
      console.error("Error during login:", error);
      return { ok: false, error: "An error occurred during login" };
    }
  };

  const handleGoogleLogin = async (credential) => {
    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/google`,
        { credential },
        { withCredentials: true }
      );

      if (response.data.ok) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setCartItems(response.data.user.cart);
        setWishlistItems(response.data.user.wishlist);

        navigate("/");
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  
  const signup = async (name, email, password) => {
    try {
      if (!email || !password || !name) {
        return { ok: false, message: "Please fill all fields" };
      }
      if (previousMail === email && previousMail !== null) {
        return { ok: false, message: "Enter a valid email id" };
      }
      const res = await fetch(`${serverUrl}/api/auth/check-mail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await res.json();

      if (checkData.result === false) {
        setPreviousMail(email);
        return { ok: false, message: "Enter a valid email id" };
      }

      const response = await fetch(`${serverUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include", // ✅ ensures cookie is set
      });

      const data = await response.json();
      

      if (!response.ok) {
        return { ok: false, message: data.message || "Signup failed" };
      }

      // ✅ If successful
      setIsAuthenticated(true);
      setUser(data.user);
      return { ok: true, message: "Signup successful" };
    } catch (error) {
      console.error("Error during signup:", error);
      return { ok: false, message: "An error occurred during signup" };
    }
  };

  const logout = () => {
    try {
      fetch(`${serverUrl}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setUser(null);
      setCartItems([]);
      setWishlistItems([]);
      setCheckoutItems([]);
      setProducts([]);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        products,
        setProducts,
        setUser,
        handleGoogleLogin,
        cartItems,
        setCartItems,
        wishlistItems,
        setWishlistItems,
        setIsAuthenticated,
        checkoutItems,
        setCheckoutItems,
        login,
        signup,
        logout,
        loading,
        serverUrl,
        theme,
        updateTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
