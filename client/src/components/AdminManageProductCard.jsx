import { Trash2, Edit3, TagIcon, Clock2, Calendar, MoveVertical } from "lucide-react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../lib/api";
import { useState } from "react";
import ScalePriceModal from "../pages/admin/admin-components/ScalePriceModal";

const AdminManageProductCard = ({ product, products, setProducts }) => {
  const {
    id,
    name,
    pricePerDay,
    productSL,
    productCondition,
    productType,
    tags,
    optimizedImages,
  } = product;
  const [showScaleModal, setShowScaleModal] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const res = await api.delete(`/api/v1/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.data.success) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: res.data.message || "Something Went Wrong!",
            });
            return;
          }
          setProducts(products.filter((product) => product.id !== id));
          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            title: "Error!",
            icon: "error",
            text: error?.response?.data?.message || "Something went wrong! Maybe credit in use."
          });
        }
      }
    });
  };

  const conditionColor =
    {
      NEW: "bg-gray-100 text-gray-800",
      LIKE_NEW: "bg-gray-100 text-gray-800",
      GOOD: "bg-gray-100 text-gray-800",
      FAIR: "bg-gray-200 text-gray-800",
      POOR: "bg-gray-200 text-gray-800",
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
    <div className="w-full max-w-sm mx-auto group hover:shadow-md transition duration-300">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative h-40 overflow-hidden">
          <img
            loading="lazy"
            src={`${baseUrl}${optimizedImages[0]}`}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <div
              className={`px-2 py-1 rounded text-xs font-medium ${conditionColor}`}
            >
              {conditionLabel}
            </div>
          </div>
          <div className="absolute bottom-2 right-2">
            {productType === "GADGET" || productType === "VEHICLE" ? (
              <div className="bg-teal-800 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                <Clock2 size={14} strokeWidth={3} /> BDT{" "}
                {parseFloat(product.pricePerHour).toFixed(2)}/hr
              </div>
            ) : (
              <div className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                <Calendar size={14} strokeWidth={3} /> BDT{" "}
                {parseFloat(pricePerDay).toFixed(2)}/day
              </div>
            )}
          </div>
          {!product.isAvailable && (
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
          <div className="text-sm text-gray-500 font-medium">
            {productSL}
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

        <div className="px-4 pb-2 flex space-x-2">
          {/* //TODO: update also rcc with it */}
          <Link
            to={`/dashboard/admin/update-item/${id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center cursor-pointer justify-center space-x-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={() => setShowScaleModal(true)}
            className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center justify-center space-x-1"
          >
            <MoveVertical color="#3b82f6" className="w-4 h-4" />
            <span className="text-blue-500">Scale Price</span>
          </button>
        </div>
        <div className="px-4 pb-2">
          <button
            onClick={handleDelete}
            className="w-full flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 text-xs rounded font-medium border border-gray-300 flex items-center justify-center space-x-1"
          >
            <Trash2 color="#ef4444" className="w-4 h-4" />
            <span className="text-red-500">Delete</span>
          </button>
        </div>
        <div className="flex justify-center mb-4 ">
          <Link to={`/product-details/${id}`}>
            <button
              className="w-fit text-sm text-green-600 underline cursor-pointer"
            >
              View Details
            </button>
          </Link>
        </div>
      </div>
      {
        showScaleModal && (
          <ScalePriceModal 
            product={product}
            setShowModal={setShowScaleModal}
            products={products}
            setProducts={setProducts}
            key={product.id}
          />
        )
      }
    </div>
  );
};

export default AdminManageProductCard;
