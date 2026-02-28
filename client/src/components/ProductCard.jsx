import { Calendar, Clock2, Tag, TagIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    pricePerDay,
    productType,
    productCondition,
    tags,
    optimizedImages,
  } = product;

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const conditionColor =
    {
      NEW: "bg-green-200 text-green-800",
      LIKE_NEW: "bg-emerald-100 text-emerald-800",
      GOOD: "bg-yellow-100 text-yellow-800",
      FAIR: "bg-orange-100 text-orange-800",
      POOR: "bg-red-100 text-red-800",
    }[productCondition] || "bg-gray-100 text-gray-800";

  const conditionLabel =
    {
      NEW: "New",
      LIKE_NEW: "Like New",
      GOOD: "Good",
      FAIR: "Fair",
      POOR: "Poor",
    }[productCondition] || productCondition;

  return (
    <Link
      to={`/product-details/${id}`}
      className="w-full max-w-72 mx-auto group hover:scale-105 transition duration-300"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative h-40 overflow-hidden">
          <img
            loading="lazy"
            src={`${baseUrl}${optimizedImages[0]}`}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-400 group-hover:translate-x-2"
          />
          {
            product?.isForSaleOnly && (
              <div className="absolute top-2 right-2">
                <span
                  className="
          relative inline-flex items-center gap-1.5
          bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600
          text-white text-[10px] font-semibold
          px-3 py-1.5 rounded-full shadow-md transition-all
        "
                >
                  <Tag className="w-3 h-3 text-white drop-shadow-sm" />
                  <span>Exclusive Sale</span>
                  <span className="absolute inset-0 rounded-full bg-white/10 blur-md opacity-40 animate-ping"></span>
                </span>
              </div>

            )
          }
          <div className="absolute top-2 left-2">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${conditionColor}`}
            >
              {conditionLabel}
            </div>
          </div>
          {
            product?.isForSaleOnly ? (
              <div className="absolute bottom-2 right-2">
                <div className="bg-amber-600 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} strokeWidth={3} /> BDT{" "}
                  {parseFloat(product?.askingPrice).toFixed(2)} Only
                </div>
              </div>
            ) : (
              <div className="absolute bottom-2 right-2">
                {productType === "GADGET" || productType === "VEHICLE" ? (
                  <div className="bg-teal-600 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                    <Clock2 size={14} strokeWidth={3} /> BDT{" "}
                    {parseFloat(product?.pricePerHour).toFixed(2)}/hr
                  </div>
                ) : (
                  <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                    <Calendar size={14} strokeWidth={3} /> BDT{" "}
                    {parseFloat(pricePerDay).toFixed(2)}/day
                  </div>
                )}
              </div>
            )
          }
          {!product?.isAvailable && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/60 py-3 text-center">
              <span className="text-white text-xl font-bold tracking-wide">
                UNAVAILABLE
              </span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {name}
          </h3>
          <div className="text-sm text-gray-500">
            {productType.replace("_", " ")}
          </div>
          {tags && (
            <div className="flex items-center gap-2">
              <TagIcon size={16} className="text-gray-500" />
              <div className="flex gap-1 max-h-6 overflow-hidden">
                {tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
                  .slice(0, 3)
                  .map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200 truncate max-w-[80px]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>

            </div>
          )}
        </div>

        <div className="px-4 pb-4 flex space-x-2">
          <button className="flex-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center justify-center space-x-1">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
