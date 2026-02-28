import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  SearchIcon,
  MapPin,
} from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import Swal from "sweetalert2";
import NearbyProductsModal from "../components/modals/NearbyProductsModal";

const AllProducts = ({ productType, setProductType, search, setSearch }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  // const [search, setSearch] = useState("");
  // const [productType, setProductType] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [productAge, setProductAge] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [aiFindLoading, setAiFindLoading] = useState(false);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const [showNearbyModal, setShowNearbyModal] = useState(false);

  const productTypes = [
    "GADGET",
    "FURNITURE",
    "VEHICLE",
    "STATIONARY",
    "MUSICAL_INSTRUMENT",
    "CLOTHING",
    "BOOK",
    "ELECTRONICS",
    "APARTMENTS",
  ];

  const conditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"];

  const fetchProducts = useCallback(async () => {
    try {
      if (prompt) {
        return;
      }
      setError("");
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(productType && { productType }),
        ...(productCondition && { productCondition }),
        ...(productAge && { productAge }),
      });
      const res = await api.get(`/api/v1/products?${params}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to fetch products");
      Swal.fire({
        icon: "error",
        title: "Oops!!",
        text: "Something went wrong."
      })
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [prompt, currentPage, search, productType, productCondition, productAge]);


  const buildWithAI = async () => {
    try {
      if (!prompt) {
        alert("Enter a prompt first!")
      }
      setError("");
      setLoading(true);
      setAiFindLoading(true);
      setIsBuildModalOpen(false);
      const params = new URLSearchParams({
        ...(prompt && { prompt }),
      });
      console.log("Prompt being sent:", prompt);

      const res = await api.get(`/api/v1/products?${params}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to fetch products");
      Swal.fire({
        icon: "error",
        title: "Oops!!",
        text: "Something went wrong."
      })
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
      setAiFindLoading(false);
    }
  }


  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch("");
    setProductType("");
    setProductCondition("");
    setProductAge("");
    setCurrentPage(1);
    setIsFilterOpen(false);
    setPrompt("");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 relative">
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-red-500 mb-4">
            <Package className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Products
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-7">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Curated selections from our community
                </p>
              </div>
              <div className="relative inline-block">
                <button
                  onClick={() => setIsBuildModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2 text-white font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5" />
                  Build
                </button>
                <span className="absolute -top-2 -right-2 text-[10px] bg-yellow-300 text-black font-semibold px-1.5 py-[1px] rounded-sm">
                  Beta
                </span>
              </div>
            </div>
            {/* Filters on the Right */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-48 md:w-sm">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (setCurrentPage(1), fetchProducts())
                    }
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1 p-2 text-gray-600 hover:text-green-500 transition-colors sm:hidden"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
              <div
                className={`${isFilterOpen ? "block" : "hidden"
                  } sm:flex sm:items-center sm:gap-2 sm:static bg-white sm:bg-transparent p-4 sm:p-0 sm:w-auto`}
              >
                {(search || productType || productCondition || productAge || prompt) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-500 transition-colors mb-2 sm:mb-0"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full sm:w-32 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm mb-2 sm:mb-0"
                >
                  <option value="">All Types</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={productCondition}
                  onChange={(e) => setProductCondition(e.target.value)}
                  className="w-full sm:w-32 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm mb-2 sm:mb-0"
                >
                  <option value="">All Conditions</option>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                <select
                  value={productAge}
                  onChange={(e) => setProductAge(e.target.value)}
                  className="w-full sm:w-32 p-2 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                >
                  <option value="">Age</option>
                  <option value="1">Less than 1 year</option>
                  <option value="2">Less than 2 years</option>
                  <option value="3">Less than 3 years</option>
                  <option value="5">Less than 5 years</option>
                  <option value="8">Less than 8 years</option>
                  <option value="10">Less than 10 years</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-100 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search terms to find what you're
              looking for.
            </p>
            <button
              onClick={clearFilters}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * limit + 1} to{" "}
                    {Math.min(currentPage * limit, total)} of {total} products
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-green-500 bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm rounded-md ${currentPage === page
                                ? "bg-green-500 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 py-2 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-green-500 bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {
        isBuildModalOpen && !aiFindLoading ? (
          <div
            id="authentication-modal"
            className="fixed overflow-y-scroll inset-0 z-50 flex justify-center items-center bg-black/70"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsBuildModalOpen(false);
            }}
          >
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between p-4 md:p-5 rounded-t border-b border-gray-300">
                  <div className="flex flex-col items-center text-center w-full">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 mt-1 md:mt-3">
                      Tell us what do you wanna build
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    data-modal-hide="authentication-modal"
                    onClick={() => setIsBuildModalOpen(false)}
                  >
                    <X />
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="p-4 md:p-5">
                  <div className="space-y-4">

                    <label htmlFor="prompt" className="flex flex-col gap-1.5 w-full">
                      <span className="text-sm font-medium text-gray-700">
                        Enter prompt
                      </span>
                      <textarea
                        type="text"
                        required
                        id="prompt"
                        placeholder="I want to build an LFR..."
                        className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm h-24"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </label>
                    <button
                      onClick={() => buildWithAI()}
                      type="submit"
                      className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
                    >
                      Let's Go
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : aiFindLoading && (
          <div
            id="authentication-modal"
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/20"
          >
            <div className="relative z-[60] flex items-center gap-2 text-indigo-500 font-semibold text-3xl md:text-4xl">
              <SearchIcon className="w-8 md:h-9 h-8 md:w-9 animate-pulse" />
              <span className="animate-pulse text-white drop-shadow-lg">
                Finding the Best Products for you...
              </span>
            </div>
          </div>
        )
      }
      <div className="fixed bottom-8 left-8">
        <button
        onClick={() => setShowNearbyModal(true)}
        className="
        group relative inline-flex items-center gap-2
        px-5 py-2.5 
        bg-gradient-to-r from-blue-600 to-indigo-600
        text-white font-medium
        rounded-xl shadow-md
        hover:shadow-lg hover:scale-[1.02]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-400
      "
      >
        <div
          className="
          absolute inset-0 bg-white/10 opacity-0 
          group-hover:opacity-100 rounded-xl transition
        "
        ></div>
        <MapPin
          className="w-5 h-5 text-white group-hover:rotate-6 transition-transform duration-200"
        />
        <span className="relative z-10">Nearby Products</span>
      </button>
      </div>
      <NearbyProductsModal isOpen={showNearbyModal} onClose={() => setShowNearbyModal(false)} />
    </div>
  );
};

export default AllProducts;
