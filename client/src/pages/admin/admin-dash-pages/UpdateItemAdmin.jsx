import { Plus, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Loader from "../../../components/shared/Loader";
import api from "../../../lib/api";
import { useNavigate, useParams } from "react-router-dom";

const UpdateItemAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    productType: "",
    productCondition: "",
    productAge: "",
    tags: "",
    omv: "",
    productDescription: "",
    isForSale: false,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/v1/products/?productId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const product = res.data.products[0];
        setFormData({
          name: product.name,
          productType: product.productType,
          productCondition: product.productCondition,
          productAge: product.productAge.toString(),
          tags: product.tags || "",
          omv: product.omv.toString(),
          productDescription: product.productDescription || "",
          isForSale: product.isForSale || false,
        });
        setExistingImages(
          product.productImages.map((path) => ({
            path,
            preview: `${import.meta.env.VITE_BASE_URL}${path}`,
          })),
        );
      } catch (error) {
        console.error("Error fetching product:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to load product",
          text: error.response?.data?.message || error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // Filter invalid files
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Unsupported Format",
          text: `${file.name} is not supported. Please upload JPG, PNG, or WebP.`,
        });
        return false;
      }
      return true;
    });

    const totalImages =
      existingImages.length +
      selectedImages.length +
      validFiles.length - // ✅ use validFiles, not all files
      imagesToDelete.length;

    if (totalImages <= 4) {
      const filesWithPreview = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedImages((prev) => [...prev, ...filesWithPreview]);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Image Limit",
        text: "You can only have up to 4 images in total.",
      });
    }
  };


  const deleteExistingImage = (index) => {
    setExistingImages((prev) => {
      const imageToDelete = prev[index].path;
      setImagesToDelete((prev) => [...prev, imageToDelete]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteNewImage = (index) => {
    setSelectedImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      selectedImages.forEach((image) => {
        formDataToSend.append("productImages", image.file);
      });

      if (imagesToDelete.length > 0) {
        formDataToSend.append("deleteImages", JSON.stringify(imagesToDelete));
      }

      const res = await api.put(`/api/v1/products/update/admin/${id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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

      Swal.fire({
        icon: "success",
        title: "Product Updated",
        text: "Your item has been updated successfully!",
      });
      navigate("/dashboard/admin/manage-products");
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
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-10">
      <div>
        <h1 className="text-lg text-center md:text-left sm:text-2xl font-medium text-gray-800">
          Update Your Item
        </h1>
        <p className="text-xs text-center md:text-left sm:text-sm text-gray-500 mt-1">
          Edit the details of your listed item.
        </p>
      </div>
      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
          <div>
            {existingImages.length > 0 || selectedImages.length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-4">
                  {existingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative">
                      <img
                        src={img.preview}
                        alt={`existing-${idx}`}
                        className="object-cover rounded-md border border-gray-300 h-28 md:h-40"
                      />
                      <button
                        type="button"
                        onClick={() => deleteExistingImage(idx)}
                        className="absolute -top-1 -right-1 bg-gray-500 text-white p-1 rounded-full hover:bg-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {selectedImages.map((img, idx) => (
                    <div key={`new-${idx}`} className="relative">
                      <img
                        src={img.preview}
                        alt={`new-${idx}`}
                        className="object-cover rounded-md border border-gray-300 h-28 md:h-40"
                      />
                      <button
                        type="button"
                        onClick={() => deleteNewImage(idx)}
                        className="absolute -top-1 -right-1 bg-gray-500 text-white p-1 rounded-full hover:bg-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {existingImages.length +
                    selectedImages.length -
                    imagesToDelete.length <
                    4 && (
                      <label
                        htmlFor="File"
                        className="flex flex-col h-28 md:h-40 items-center justify-center rounded border border-gray-200 p-4 text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        <Plus size={28} />
                        <input
                          multiple
                          type="file"
                          id="File"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center border rounded-lg bg-gray-50 h-full">
                <label
                  htmlFor="File"
                  className="flex flex-col max-w-sm items-center rounded border border-gray-200 p-4 text-gray-700"
                >
                  <Upload size={24} />
                  <span className="mt-3 font-medium">
                    Upload New Images
                    <span className="text-[11px] ml-1">(max 4)</span>
                  </span>
                  <span className="mt-2 inline-block rounded border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                    Browse files
                  </span>
                  <input
                    multiple
                    type="file"
                    id="File"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 flex-1">
            <label htmlFor="name" className="flex flex-col gap-1.5 w-full">
              <span className="text-sm font-medium text-gray-600">
                Item Name
              </span>
              <input
                type="text"
                id="name"
                value={formData.name}
                className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="Name of your product"
                onChange={handleInputChange}
              />
            </label>
            <label
              htmlFor="productType"
              className="flex flex-col gap-1.5 w-full"
            >
              <span className="text-sm font-medium text-gray-600">
                Item Type
              </span>
              <select
                id="productType"
                value={formData.productType}
                className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                onChange={handleInputChange}
              >
                <option value="">Please select</option>
                <option value="GADGET">Gadget</option>
                <option value="FURNITURE">Furniture</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="STATIONARY">Stationary</option>
                <option value="MUSICAL_INSTRUMENT">Musical Instrument</option>
                <option value="CLOTHING">Clothing/Footwear</option>
                <option value="BOOK">Book</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="APARTMENTS">Apartments</option>
              </select>
            </label>
            <label htmlFor="omv" className="flex flex-col gap-1.5 w-full">
              <span className="text-sm font-medium text-gray-600">
                Original Market Price
              </span>
              <input
                type="number"
                id="omv"
                value={formData.omv}
                className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                placeholder="At what price was this product bought?"
                onChange={handleInputChange}
              />
            </label>
            <label
              htmlFor="productCondition"
              className="flex flex-col gap-1.5 w-full"
            >
              <span className="text-sm font-medium text-gray-600">
                Product Condition
              </span>
              <select
                id="productCondition"
                value={formData.productCondition}
                className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                onChange={handleInputChange}
              >
                <option value="">Please select</option>
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <label htmlFor="productAge" className="flex flex-col gap-1.5 w-full">
            <span className="text-sm font-medium text-gray-600">
              Age of the Item (Approx.)
            </span>
            <select
              id="productAge"
              value={formData.productAge}
              className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              onChange={handleInputChange}
            >
              <option value="">Please select</option>
              <option value="1">Less than 1 year</option>
              <option value="2">Less than 2 years</option>
              <option value="3">Less than 3 years</option>
              <option value="5">Less than 5 years</option>
              <option value="8">Less than 8 years</option>
              <option value="10">Less than 10 years</option>
            </select>
          </label>
        </div>
        <label htmlFor="tags" className="flex flex-col gap-1.5 w-full">
          <span className="text-sm font-medium text-gray-600">
            Tags (Comma-separated)
          </span>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            placeholder="e.g. gadget,electronics,arduino,uno,project"
            onChange={handleInputChange}
          />
        </label>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Is this item also available for sale?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="isForSale"
                value="true"
                checked={formData.isForSale}
                onChange={() => setFormData({ ...formData, isForSale: true })}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="isForSale"
                value="false"
                checked={!formData.isForSale}
                onChange={() => setFormData({ ...formData, isForSale: false })}
              />
              <span>No</span>
            </label>
          </div>
        </div>
        <label
          htmlFor="productDescription"
          className="flex flex-col gap-1.5 w-full"
        >
          <span className="text-sm font-medium text-gray-600">
            Product Description
          </span>
          <textarea
            id="productDescription"
            value={formData.productDescription}
            className="border bg-white border-gray-200 rounded-lg w-full px-3 py-2 h-24 text-sm focus:border-gray-400 focus:outline-none"
            placeholder="Say something about the product..."
            onChange={handleInputChange}
          />
        </label>
        <button
          type="submit"
          className="py-2 px-4 bg-gray-600 text-white rounded-lg border border-gray-600 hover:bg-gray-700 cursor-pointer text-sm"
        >
          Update Item
        </button>
      </form>
    </div>
  );
};

export default UpdateItemAdmin;
