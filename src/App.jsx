import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { Footer } from "./components/Footer.jsx";

import ForgetPassword from "./pages/ForgetPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { History } from "./pages/History.jsx";
import { AppLoader } from "./components/ui/BrandLoader.jsx";

// Lazy-loaded pages (unchanged)
const Home = lazy(() => import("./pages/Home.jsx").then(m => ({ default: m.Home })));
const ProductListing = lazy(() => import("./pages/ProductListing.jsx").then(m => ({ default: m.ProductListing })));
const ProductDetails = lazy(() => import("./pages/ProductDetails.jsx").then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import("./pages/Cart.jsx").then(m => ({ default: m.Cart })));
const Wishlist = lazy(() => import("./pages/Wishlist.jsx").then(m => ({ default: m.Wishlist })));
const Checkout = lazy(() => import("./pages/Checkout.jsx").then(m => ({ default: m.Checkout })));
const Login = lazy(() => import("./pages/Login.jsx").then(m => ({ default: m.Login })));
const Signup = lazy(() => import("./pages/Signup.jsx").then(m => ({ default: m.Signup })));
const Profile = lazy(() => import("./pages/Profile.jsx").then(m => ({ default: m.Profile })));
const NotFound = lazy(() => import("./pages/NotFound.jsx").then(m => ({ default: m.NotFound })));

/* ------------------ Scroll To Top (FIXED) ------------------ */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* ------------------ Layouts ------------------ */
const MainLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 transition-colors">
    <Navbar />
    <ScrollToTop />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center">
    <ScrollToTop />
    <Outlet />
  </div>
);

/* ------------------ AppContent ------------------ */
function AppContent() {
  return (
    <Suspense fallback={<AppLoader/>}>
      <Routes>

        {/* MAIN APP LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:category" element={<ProductListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* AUTH PAGES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/forget_password" element={<ForgetPassword />} />
          <Route path="/auth/reset_password/:id" element={<ResetPassword />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}


/* ------------------ App Root ------------------ */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
