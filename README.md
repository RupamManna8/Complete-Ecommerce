# UrbanVoltt | Complete E-commerce Frontend

UrbanVoltt is a high-performance, responsive e-commerce storefront built with **React 18** and **Vite**. It features a seamless shopping experience with integrated authentication, dynamic product discovery, and a secure checkout flow using Razorpay.

## 🚀 Features

* **Product Discovery**: Product listing with search, advanced filtering, and infinite scroll.
* **User Experience**: Detailed product views, wishlist management, and "Add to Cart" or "Buy Now" flows.
* **Cart Management**: Optimistic UI updates and debounced quantity adjustments for a snappy feel.
* **Secure Checkout**: Address management, phone verification, bot detection, and **Razorpay** payment gateway integration.
* **Authentication**: Social login via **Google OAuth** integration.
* **UI System**: A custom library of reusable primitives including Cards, Inputs, Modals, Buttons, and Toasts.
* **SEO Ready**: Optimized `index.html` featuring Open Graph meta tags and JSON-LD for enhanced search visibility.

---

## 🛠️ Technology Stack

* **Framework**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **State Management**: React Context API (Auth & Global State)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Routing**: [React Router DOM](https://reactrouter.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Styling**: CSS/SCSS (refer to components)
* **HTTP Client**: Fetch API / Axios

---

## 📂 Repository Layout



```text
├── index.html              # HTML entry, SEO, and branding metadata
├── package.json            # Project dependencies and scripts
├── src/
│   ├── main.jsx            # App bootstrap & GoogleOAuthProvider
│   ├── App.jsx             # Root component & Route definitions
│   ├── pages/              # ProductListing, ProductDetails, Cart, Checkout, Wishlist
│   ├── components/ui/      # Atomic UI primitives (Card, Button, Modal, etc.)
│   ├── context/            # AuthContext and Global providers
│   └── service/            # Helper services (Validators, Address fetching)
