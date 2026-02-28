import { useCallback, useEffect, useState } from "react";
import api from "../../lib/api";
import { Loader, Package } from "lucide-react";
import ProductCard from "../ProductCard";
import { Link } from "react-router-dom";

const RecentListings = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "8",
      });

      const res = await api.get(`/api/v1/products?${params}`);
      setProducts(res.data.products);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    <div className="mt-32">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-gray-900">Recent Listings</h1>
        <p className="text-gray-500 mt-1 text-sm mx-3">
          Discover newly listed items available for rent, handpicked from
          trusted users.
        </p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
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
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
        <div className="flex justify-center mt-2">
          <Link
            to={"/browse"}
            className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center justify-center"
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentListings;
