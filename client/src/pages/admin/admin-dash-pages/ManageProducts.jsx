import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import api from "../../../lib/api";
import AdminManageProductCard from "../../../components/AdminManageProductCard";

const ManangeProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [productType, setProductType ] = useState("");

  // Filter states
  // const [search, setSearch] = useState("");
  // const [productType, setProductType] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [productAge, setProductAge] = useState("");
  const [productSL, setProductSL] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

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
      setError("");
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(productType && { productType }),
        ...(productCondition && { productCondition }),
        ...(productAge && { productAge }),
        ...(productSL && { productSL }
        ),
      });

      const res = await api.get(`/api/v1/products?${params}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, productType, productCondition, productAge, productSL]);

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
    setProductSL("");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
              <p className="text-gray-500 mt-1 text-sm">
                How was your day today? Shit right? 😓
              </p>
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
                {(search || productType || productCondition || productAge) && (
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
                <AdminManageProductCard key={product.id} product={product} products={products} setProducts={setProducts} />
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
    </div>
  );
};

export default ManangeProducts;
