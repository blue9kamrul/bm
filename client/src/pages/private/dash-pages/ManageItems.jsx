import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ManageItemCard from "../../../components/ManageItemCard";
import api from "../../../lib/api";
import Loader from "../../../components/shared/Loader";
import useUserStore from "../../../stores/authStores/useUserStore";
import { Sparkle, X } from "lucide-react";
import LocationPicker from "../../../components/LocationPicker";

const ManageItems = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState(null);
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (updatingProduct) {
      setUpdatedData({
        askingPrice: updatingProduct.askingPrice ?? 0,
        minPrice: updatingProduct.minPrice ?? 0,
        isForSale: updatingProduct.isForSale,
        isForSaleOnly: updatingProduct.isForSaleOnly,
        isAvailable: updatingProduct.isAvailable ?? true,
        isAiEnabled: updatingProduct.isAiEnabled,
        latitude: updatingProduct.latitude ?? 24.3635683,
        longitude: updatingProduct.longitude ?? 88.6258024,
      });
    }
  }, [updatingProduct]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token || !currentUser.id) {
        throw new Error("Please log in to view your products.");
      }

      const response = await api.get(`/api/v1/products?ownerId=${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser.id]);

  const handleProductUpdate = async (e) => {
    e.preventDefault();
    if (updatedData.isForSale && updatedData.askingPrice == 0 && updatedData.minPrice == 0) {
      alert('Price can not be zero');
      return;
    }
    if (parseInt(updatedData.askingPrice) < parseInt(updatedData.minPrice)) {
      alert('Asking price can not be less than min price');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.put(`/api/v1/products/update/user/${updatingProduct.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            res.data.message || "An error occurred while updating the item.",
        });
        return;
      }
      setShowUpdateModal(false);
      setUpdatedData(null);
      Swal.fire({
        icon: "success",
        title: "Product Updated",
        text: "Your item has been updated successfully!",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error updating item:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Manage Your Products
        </h1>
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-600">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-600">
            You haven't listed any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ManageItemCard
                setShowUpdateModal={setShowUpdateModal}
                setUpdatingProduct={setUpdatingProduct}
                key={product.id}
                product={product}
                setProducts={setProducts}
                products={products}
              />
            ))}
          </div>
        )}

        {/*  ------------- HERES THE MODALLLLLL -------------- */}
      </div>
      {
        showUpdateModal && updatedData && (
          <div
            id="authentication-modal"
            className="fixed overflow-y-scroll inset-0 z-50 flex justify-center items-center bg-black/70"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUpdateModal(false);
            }}
          >
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between p-4 md:p-5 rounded-t border-b border-gray-300">
                  <div className="flex flex-col items-center text-center w-full">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 mt-1 md:mt-3">
                      Update Product
                    </h3>
                    <p className="text-xs text-gray-500">{updatingProduct?.name}</p>
                  </div>
                  <button
                    type="button"
                    className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                    data-modal-hide="authentication-modal"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    <X />
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="p-4 md:p-5">
                  <form className="space-y-4" onSubmit={handleProductUpdate}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Change Availability Status
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="isAvailable"
                            value="true"
                            checked={updatedData.isAvailable}
                            onChange={() => setUpdatedData({ ...updatedData, isAvailable: true })}
                          />
                          <span>{updatedData.isAvailable ? "Listed" : "List Now 🥰"}</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="isAvailable"
                            value="false"
                            checked={!updatedData.isAvailable}
                            onChange={() => setUpdatedData({ ...updatedData, isAvailable: false })}
                          />
                          <span>{updatedData.isAvailable ? "Unlist 🥺" : "Unlisted"}</span>
                        </label>
                      </div>
                    </div>
                    {
                      updatedData.isAvailable && (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Is this item also for sale?
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="isForSale"
                                  value="true"
                                  checked={updatedData.isForSale}
                                  onChange={() => setUpdatedData({ ...updatedData, isForSale: true })}
                                />
                                <span>Yes</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="isForSale"
                                  value="false"
                                  checked={!updatedData.isForSale}
                                  onChange={() => setUpdatedData({ ...updatedData, isForSale: false })}
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </div>
                          {
                            updatedData?.isForSale && (
                              <>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">
                                    Is this item <span className="font-bold text-gray-800 text-[15px]">only</span> for sale (not for rent)?
                                  </label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center space-x-2 text-sm">
                                      <input
                                        type="radio"
                                        name="isForSaleOnly"
                                        value="true"
                                        checked={updatedData.isForSaleOnly}
                                        onChange={() => setUpdatedData({ ...updatedData, isForSaleOnly: true })}
                                      />
                                      <span>Yes For Sale Only</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-sm">
                                      <input
                                        type="radio"
                                        name="isForSaleOnly"
                                        value="false"
                                        checked={!updatedData.isForSaleOnly}
                                        onChange={() => setUpdatedData({ ...updatedData, isForSaleOnly: false })}
                                      />
                                      <span>No (For rent + For Sale)</span>
                                    </label>
                                  </div>
                                </div>
                                <label htmlFor="askingPrice" className="flex flex-col gap-1.5 w-full">
                                  <span className="text-sm font-medium text-gray-700">
                                    Asking Price
                                  </span>
                                  <input
                                    type="number"
                                    required
                                    id="askingPrice"
                                    className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                                    value={updatedData.askingPrice}
                                    onChange={(e) => setUpdatedData({ ...updatedData, askingPrice: e.target.value })}
                                  />
                                </label>
                                <label htmlFor="minPrice" className="flex flex-col gap-1.5 w-full">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">
                                      Minimum threshold price - Below which you'll not sell
                                    </span>
                                    <span className="text-xs text-gray-600">(This is not visible to others)</span>
                                  </div>
                                  <input
                                    type="number"
                                    required
                                    id="minPrice"
                                    className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                                    value={updatedData.minPrice}
                                    onChange={(e) => setUpdatedData({ ...updatedData, minPrice: e.target.value })}
                                  />
                                </label>
                                <div className="space-y-2 w-full">
                                  <label className="flex items-start gap-2">
                                    <p className="text-sm font-medium text-gray-700 flex flex-col items-start">
                                      <span>Want to use AI for negotiating price for you?</span>
                                      <span className="text-xs font-normal">(1% from your selling price will be taken as charge)</span>
                                    </p>
                                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs whitespace-nowrap text-purple-700 flex items-center gap-1">
                                      New <Sparkle size={10} />
                                    </span>
                                  </label>
                                  <div className="flex gap-4">
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="isAiEnabled"
                                        value="true"
                                        checked={updatedData.isAiEnabled}
                                        onChange={() => setUpdatedData({ ...updatedData, isAiEnabled: true })}
                                      />
                                      <span>Yes</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                      <input
                                        type="radio"
                                        name="isAiEnabled"
                                        value="false"
                                        checked={!updatedData.isAiEnabled}
                                        onChange={() => setUpdatedData({ ...updatedData, isAiEnabled: false })}
                                      />
                                      <span>No</span>
                                    </label>
                                  </div>
                                </div>
                              </>
                            )
                          }
                          <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-700">
                              Product Location
                            </label>
                            <LocationPicker
                              formData={{
                                latitude: updatedData.latitude ?? updatingProduct.latitude ?? 24.3635683,
                                longitude: updatedData.longitude ?? updatingProduct.longitude ?? 88.6258024,
                              }}
                              setFormData={(locData) =>
                                setUpdatedData({
                                  ...updatedData,
                                  latitude: Number(locData.latitude),
                                  longitude: Number(locData.longitude),
                                })
                              }
                            />
                            <p className="text-xs text-gray-500">
                              Click on the map to select the product's location.
                            </p>
                          </div>
                        </>
                      )
                    }
                    <button
                      type="submit"
                      className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
                    >
                      Update Item
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default ManageItems;