import { ArrowDown, ArrowUp, X } from "lucide-react"
import { useState } from "react";
import Swal from "sweetalert2";
import api from "../../../lib/api";
import { useEffect } from "react";
import { usePriceCalculate } from "../../../hooks/usePriceCalculate";
import { useVehiclePriceCalculate } from "../../../hooks/useVehiclePriceCalculate";
import { useGadgetPriceCalculate } from "../../../hooks/useGadgetPriceCalculate";
import { useHourlyPrice } from "../../../hooks/useHourlyPrice";


const ScalePriceModal = ({ setShowModal, product, products, setProducts }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [isScaling, setIsScaling] = useState(false);
  const [scale, setScale] = useState(product.scale);
  const [pricePerDay, setPricePerDay] = useState(0);
  const [hourlyPrice, setHourlyPrice] = useState(0);

  console.log("ppd: ", pricePerDay)
  console.log("pph: ", hourlyPrice)
  console.log("p.ppd: ", product?.pricePerDay)
  console.log("p.pph: ", product?.pricePerHour)

  const { calculatePricePerDay } = usePriceCalculate();
  const { calculateVehiclePricePerDay } = useVehiclePriceCalculate();
  const { calculateGadgetPricePerDay } = useGadgetPriceCalculate();
  const { calculateHourlyPrice } = useHourlyPrice();

  useEffect(() => {
    if (product) {
      setScale(product.scale);
      setPricePerDay(product.pricePerDay);
      setHourlyPrice(product.pricePerHour)
    }
  }, [product])

  useEffect(() => {
    let newPricePerDay;
    let newPricePerHour;
    if (product && scale) {
      if (product.productType === "GADGET") {
        newPricePerDay = calculateGadgetPricePerDay(
          product.omv,
          product.productCondition,
          product.productAge,
          product.owner.securityScore,
          3,
          scale
        );
      } else if (product.productType === "VEHICLE") {
        newPricePerDay = calculateVehiclePricePerDay(
          product.omv,
          product.productCondition,
          product.productAge,
          product.owner.securityScore,
          3,
          scale
        );
      } else {
        newPricePerDay = calculatePricePerDay(
          product.omv,
          product.productCondition,
          product.productAge,
          product.owner.securityScore,
          3,
          scale
        );
      }
      setPricePerDay(newPricePerDay);
      newPricePerHour = calculateHourlyPrice(newPricePerDay, 2);
      setHourlyPrice(newPricePerHour);
    }
  }, [calculateGadgetPricePerDay, calculateHourlyPrice, calculatePricePerDay, calculateVehiclePricePerDay, product, scale]);

  const conditionColor =
    {
      NEW: "text-green-400",
      LIKE_NEW: "text-emerald-400",
      GOOD: "text-teal-400",
      FAIR: "text-yellow-400",
      POOR: "text-red-400",
    }[product?.productCondition] || "bg-gray-100 text-gray-800";

  const conditionLabel =
    {
      NEW: "🆕 New",
      LIKE_NEW: "✨ Like New",
      GOOD: "👍 Good",
      FAIR: "👌 Fair",
      POOR: "⚠️ Poor",
    }[product?.productCondition] || product?.productCondition;

  const handleScalePrice = async () => {
    try {
      setIsScaling(true);
      const res = await api.put(`/api/v1/products/update/admin/${product.id}`, { scale });
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            res.data.message || "An error occurred while updating the item.",
        });
        return;
      }
      setProducts(products.map((p) => {
        if (p.id === product.id) {
          return res.data.product; 
        } else {
          return p;
        }
      }));
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Price Scaled Successfully",
      });
    } catch (error) {
      console.error('Error Scaling Price:', error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setIsScaling(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="overflow-y-auto max-h-[90vh]">
          <div className='flex justify-between'>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Scale Product
            </h3>
            <X onClick={() => setShowModal(false)} size={16} color='#374151' className='hover:scale-105 transition-all duration-300 cursor-pointer' />
          </div>
          <div className="mt-3 sm:mt-6 flex gap-4 items-start pb-4">
            <img
              src={`${baseUrl}${product?.optimizedImages[0]}`}
              alt="image"
              className="w-24 h-24 object-cover"
            />
            <div>
              <h2 className="text-lg p-0 font-semibold">
                {product?.name}
              </h2>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">Condition:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-md text-xs ${conditionColor}`}
                >
                  {conditionLabel}
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">Used: </span>{" "}
                <span className={`px-2 py-1 rounded-md text-xs`}>
                  Less than {product?.productAge}{" "}
                  {product?.productAge == 1
                    ? "Year"
                    : "Years"}
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">Original Market Price: </span>{" "}
                <span className={`px-2 py-1 rounded-md text-xs`}>
                  BDT {product?.omv}.00
                </span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-semibold">Owner Asking Price: </span>{" "}
                <span className={`px-2 py-1 rounded-md text-xs`}>
                  {product?.askingPrice}
                </span>
              </p>
            </div>
          </div>
          <div className="p-2 border border-gray-300 space-y-2 rounded-md">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-600">Price Per Day: <span className="font-bold text-gray-800">
                {pricePerDay}</span></h2>
              {
                product?.pricePerDay > pricePerDay ? (
                  <ArrowDown color="red" size={17} />
                ) : product.pricePerDay < pricePerDay ? (
                  <ArrowUp color="green" size={17} />
                ) : (<></>)
              }
            </div>
            {
              (product?.productType === "VEHICLE" || product?.productType === "GADGET") && (
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-600">Price Per Hour: <span className="font-bold text-gray-800">{hourlyPrice}</span></h2>
                  {
                    product?.pricePerHour > hourlyPrice ? (
                      <ArrowDown color="red" size={17} />
                    ) : product.pricePerHour < hourlyPrice ? (
                      <ArrowUp color="green" size={17} />
                    ) : (<></>)
                  }
                </div>
              )
            }
          </div>
          <div className="space-y-4">
            <label
              htmlFor="offer"
              className="flex flex-col gap-1.5 w-full mt-4"
            >
              <span className="text-xs font-medium text-gray-700">
                Scale
              </span>
              <div className="flex items-center border bg-white border-gray-300 rounded-md w-full focus-within:border-gray-400">
                <input
                  type="number"
                  required
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  id="offer"
                  className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-xs rounded-r-md"
                />
              </div>
            </label>
          </div>
          <button
            onClick={handleScalePrice}
            disabled={isScaling}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full mt-5 cursor-pointer"
          >
            {isScaling ? "Please wait..." : "Scale Price"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScalePriceModal