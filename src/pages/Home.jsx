import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Truck,
  Sparkles,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/Button";
import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";

// 3D Floating Card Component
const FloatingCard3D = ({ children, className = "", intensity = 10 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  const rotateY = mousePosition.x * intensity;
  const rotateX = mousePosition.y * -intensity;

  return (
    <motion.div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.1s ease-out",
      }}
    >
      {children}
    </motion.div>
  );
};

// Animated Background Particles
const AnimatedParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
          }}
          transition={{
            duration: 20 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

// Floating Icon Component
const FloatingIcon = ({ icon: Icon, delay = 0 }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ scale: 1.2, rotate: 360 }}
    className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
  >
    <Icon className="text-white" size={32} />
  </motion.div>
);

export const Home = () => {
  const { serverUrl } = useContext(AuthContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  useEffect(() => {
    const controller = new AbortController();
  
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(
          `${serverUrl}/api/products?featured=true`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            signal: controller.signal,
          }
        );
  
        const data = await response.json();
  
        if (!response.ok || !data.success) {
          throw new Error("Failed to fetch featured products");
        }
  
        setFeaturedProducts(data.data); // ✅ FIXED
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("❌ Error fetching featured products:", error);
        }
      }
    };
  
    fetchFeaturedProducts();
  
    return () => controller.abort();
  }, [serverUrl]);
  

  const categories = [
    {
      name: "T-Shirts",
      slug: "tshirts",
      image:
        "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=400",
      gradient: "from-orange-400 to-pink-500",
    },
    {
      name: "Pants",
      slug: "pants",
      image:
        "https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg?auto=compress&cs=tinysrgb&w=400",
      gradient: "from-green-400 to-blue-500",
    },
    {
      name: "Electronics",
      slug: "electronics",
      image:
        "https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=400",
      gradient: "from-purple-400 to-indigo-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className=" min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 overflow-hidden "
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ opacity, scale, y }}
        className="absolute w-[100%] z-20 top-0 h-screen overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat h-[800px] "
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg")',
          }}
        />

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
        <AnimatedParticles />

        {/* Animated Background Shapes */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />

        <motion.div
          animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            rotate: {
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl "
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20"
            >
              <Sparkles className="text-yellow-300" size={16} />
              <span className="text-white/90 text-sm font-medium">
                Premium Shopping Experience
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight"
            >
              Discover
              <motion.span
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] block"
              >
                Your Style
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed max-w-2xl"
            >
              Immerse yourself in our curated collection of premium fashion and
              cutting-edge electronics. Where quality meets innovation.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <Link to="/products">
                <FloatingCard3D intensity={15}>
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white shadow-2xl "
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center"
                    >
                      Shop Now
                      <ArrowRight
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                        size={20}
                      />
                    </motion.div>
                  </Button>
                </FloatingCard3D>
              </Link>

              <Link to="/products?featured=true">
                <Button
                  size="lg"
                  variant="outline"
                  className="group bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-blue-600 shadow-2xl"
                >
                  <Star
                    className="mr-2 group-hover:scale-110 transition-transform"
                    size={20}
                  />
                  Featured Collection
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className={`text-center mb-16 ${window.innerWidth < 800 ? "mt-[200%]" : "mt-[50%]"} z-[1]`}
        >
          <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Us?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience shopping redefined with our premium services and
            unmatched quality
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              title: "Free Shipping",
              description: "On all orders over $50",
              delay: 0.1,
            },
            {
              icon: Shield,
              title: "Secure Payment",
              description: "100% secure encrypted transactions",
              delay: 0.2,
            },
            {
              icon: TrendingUp,
              title: "Best Prices",
              description: "Price match guarantee on all items",
              delay: 0.3,
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: feature.delay,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ y: -10 }}
            >
              <FloatingCard3D intensity={8}>
                <div className="relative p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 group hover:shadow-3xl transition-all duration-300">
                  <div className="absolute top-4 right-4">
                    <FloatingIcon icon={feature.icon} delay={feature.delay} />
                  </div>
                  <div className="mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </FloatingCard3D>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
            Shop by{" "}
            <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our carefully curated collections across different
            categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.2,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <FloatingCard3D intensity={12}>
                <Link to={`/products/${category.slug}`}>
                  <motion.div
                    whileHover={{ y: -15 }}
                    className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group cursor-pointer border-4 border-white dark:border-gray-800"
                  >
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-60 transition-opacity duration-300`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                      <div className="p-8 w-full">
                        <motion.h3
                          className="text-4xl font-black text-white mb-4"
                          whileHover={{ x: 10 }}
                        >
                          {category.name}
                        </motion.h3>
                        <motion.p
                          className="text-blue-200 flex items-center gap-3 text-lg font-semibold group-hover:gap-5 transition-all duration-300"
                          whileHover={{ x: 5 }}
                        >
                          Explore Collection
                          <ArrowRight size={24} />
                        </motion.p>
                      </div>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </motion.div>
                </Link>
              </FloatingCard3D>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-4">
            Featured{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Products
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hand-picked selection of our best-selling and most loved items
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <FloatingCard3D intensity={5}>
                <ProductCard product={product} />
              </FloatingCard3D>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link to="/products">
            <FloatingCard3D intensity={10}>
              <Button
                size="lg"
                variant="outline"
                className="group bg-transparent border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:border-blue-500 hover:text-white shadow-2xl px-8 py-4 text-lg"
              >
                Discover All Products
                <ArrowRight
                  className="ml-3 group-hover:translate-x-2 transition-transform"
                  size={24}
                />
              </Button>
            </FloatingCard3D>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};
