import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "../components/ProductCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AuthContext } from "../context/AuthContext";

/* ---------------- Skeleton Loader ---------------- */
const ProductSkeleton = () => (
  <div className="animate-pulse rounded-xl border p-4 space-y-4">
    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
  </div>
);

/* ------------------------------------------------ */

export const ProductListing = () => {
  const { serverUrl } = useContext(AuthContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "latest";
  const page = Number(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const observerRef = useRef(null);

  /* ---------------- URL PARAM UPDATER ---------------- */
  const updateParams = (params) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (!value || value === "latest") next.delete(key);
        else next.set(key, value);
      });
      return next;
    });
  };

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${serverUrl}/api/products?${searchParams.toString()}`
      );
      const json = await res.json();

      if (!json.success) return;

      setProducts((prev) =>
        page === 1 ? json.data : [...prev, ...json.data]
      );

      setTotalPages(json.meta.pages);
      setTotalProducts(json.meta.total);
    } catch (err) {
      console.error("❌ Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }, [serverUrl, searchParams, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ---------------- SEARCH SUGGESTIONS ---------------- */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${serverUrl}/api/products/suggestions?q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, serverUrl]);

  /* ---------------- SEARCH SUBMIT ---------------- */
  const handleSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${serverUrl}/api/products/search?q=${encodeURIComponent(query)}`
      );
      const json = await res.json();

      if (json.success) {
        setProducts(json.data);
        setTotalPages(1);
        setTotalProducts(json.data.length);
      }
    } catch (err) {
      console.error("❌ Search error:", err);
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  /* ---------------- INFINITE SCROLL ---------------- */
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !loading &&
          page < totalPages
        ) {
          updateParams({ page: page + 1 });
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loading]);

  /* ---------------- JSX ---------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 border-b pb-6"
      >
        <h1 className="text-3xl font-bold">
          {category ? category.toUpperCase() : "ALL PRODUCTS"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {totalProducts} products found
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside
          className={`lg:w-64 ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6 border sticky top-24">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSearch(searchQuery)
                }
                placeholder="Search products..."
                className="pl-10"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg">
                  {suggestions.map((s) => (
                    <div
                      key={s}
                      onMouseDown={() => {
                        setSearchQuery(s);
                        handleSearch(s);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) =>
                updateParams({ sort: e.target.value, page: 1 })
              }
              className="w-full p-2 border rounded"
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="featured">Featured</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                updateParams({ sort: "latest", page: 1 });
              }}
            >
              Clear Filters
            </Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <SlidersHorizontal className="mr-2" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && page === 1 &&
              Array.from({ length: 9 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}

            {products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={observerRef} className="h-10" />

          {!loading && products.length === 0 && (
            <div className="text-center py-24 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
