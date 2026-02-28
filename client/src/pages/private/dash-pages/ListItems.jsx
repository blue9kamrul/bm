import { Plus, Sparkle, Upload, X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import Loader from "../../../components/shared/Loader";
import api from "../../../lib/api";
import useShowRccModalStore from "../../../stores/creditModalStores/useShowRccModalStore";
import LocationPicker from "../../../components/LocationPicker";

const ListItems = () => {
  const [selectedImages, setSelectedImages] = useState([]);
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
    isForSaleOnly: false,
    minPrice: 0,
    askingPrice: 0,
    isAiEnabled: false,
    latitude: 24.3635683,
    longitude: 88.6258024,
  });

  const { openShowRccModal, setRcc } = useShowRccModalStore();

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

    const total = selectedImages.length + validFiles.length;

    if (total <= 4) {
      const filesWithPreview = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedImages((prev) => [...prev, ...filesWithPreview]);
    } else {
      alert("You can only upload up to 4 images in total.");
    }
  };


  const deleteImage = (indexToDelete) => {
    setSelectedImages((prevImages) => {
      URL.revokeObjectURL(prevImages[indexToDelete].preview);
      return prevImages.filter((_, index) => index !== indexToDelete);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      selectedImages.forEach((image) => {
        formDataToSend.append("productImages", image.file);
      });

      const res = await api.post("/api/v1/products", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "Listing Failed",
          text: res.message || "An error occurred while adding the item.",
        });
        return;
      }
      setFormData({
        name: "",
        productType: "",
        productCondition: "",
        productAge: "",
        tags: "",
        omv: "",
        productDescription: "",
        isForSale: false,
        isForSaleOnly: false,
        isAiEnabled: false,
        askingPrice: 0,
        minPrice: 0,
        latitude: 24.3635683,
        longitude: 88.6258024,
      });
      // Show cache credit
      await setRcc(res.data.rcc);
      openShowRccModal();

    } catch (error) {
      console.error("Error in Listing Item:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setSelectedImages([]);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-10 bg-white">
      <div>
        <h1 className="text-lg text-center md:text-left sm:text-2xl font-semibold text-gray-800">
          List Your Items & Start Earning 🤑
        </h1>
        <p className="text-xs text-center md:text-left sm:text-sm text-gray-600 mt-1">
          So you don&apos;t have to survive on only shingara from the tong.
        </p>
      </div>
      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
          <div>
            {selectedImages.length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 border border-gray-300 rounded-md p-4">
                  {selectedImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.preview}
                        alt={`preview-${idx}`}
                        className="object-cover rounded-md border border-gray-500 h-28 md:h-40"
                      />
                      <button
                        type="button"
                        required
                        onClick={() => deleteImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {selectedImages.length < 4 && (
                    <label
                      htmlFor="File"
                      className={`flex flex-col  h-28 md:h-40 items-center justify-center rounded md:border md:border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer hover:bg-gray-100`}
                    >
                      <Plus size={32} />
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
              <div className="flex justify-center items-center md:border rounded-2xl md:border-gray-200 md:bg-gray-50 h-full">
                <label
                  htmlFor="File"
                  className={`flex flex-col max-w-sm items-center rounded border border-gray-300 p-4 text-gray-900 shadow-sm sm:p-6 cursor-pointer`}
                >
                  <Upload />
                  <span className="mt-4 font-medium gap-2">
                    Upload Item Images
                    <span className="text-[11px] ml-1">(max 4)</span>
                  </span>
                  <span className="mt-2 inline-block rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-center text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-200">
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
              <span className="text-sm font-medium text-gray-700">
                Item Name
              </span>
              <input
                type="name"
                required
                id="name"
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                placeholder="Name of your product.."
                onChange={handleInputChange}
              />
            </label>
            <label
              htmlFor="productType"
              className="flex flex-col gap-1.5 w-full"
            >
              <span className="text-sm font-medium text-gray-700">
                Select Item Type
              </span>
              <select
                name="productType"
                id="productType"
                required
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
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
                <option value="OTHERS">Others</option>
              </select>
            </label>
            <label htmlFor="omv" className="flex flex-col gap-1.5 w-full">
              <span className="text-sm font-medium text-gray-700">
                Original Market Price
              </span>
              <input
                type="number"
                required
                id="omv"
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                placeholder="At what price was this product bought?"
                onChange={handleInputChange}
              />
            </label>
            <label
              htmlFor="productCondition"
              className="flex flex-col gap-1.5 w-full"
            >
              <span className="text-sm font-medium text-gray-700">
                ⚖️ Product Condition
              </span>
              <select
                name="productCondition"
                id="productCondition"
                required
                className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                onChange={handleInputChange}
              >
                <option value="">Please select</option>
                <option value="NEW">✨ New</option>
                <option value="LIKE_NEW">🌟 Like New</option>
                <option value="GOOD">👍 Good</option>
                <option value="FAIR">👌 Fair</option>
                <option value="POOR">😔 Poor</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <label htmlFor="productAge" className="flex flex-col gap-1.5 w-full">
            <span className="text-sm font-medium text-gray-700">
              📅 Age of the Item (Approx.)
            </span>
            <select
              name="productAge"
              id="productAge"
              required
              className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
              onChange={handleInputChange}
            >
              <option value="">Please select</option>
              <option value="1"> Less than 1 year</option>
              <option value="2"> Less than 2 years</option>
              <option value="3"> Less than 3 years</option>
              <option value="5"> Less than 5 years</option>
              <option value="8"> Less than 8 years</option>
              <option value="10"> Less than 10 years</option>
            </select>
          </label>
        </div>
        <label htmlFor="tags" className="flex flex-col gap-1.5 w-full">
          <span className="text-sm font-medium text-gray-700">
            Add Tags (Comma ',' separated values)
          </span>
          <input
            type="text"
            required
            id="tags"
            className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
            placeholder="e.g.  gadget,electronics,arduino,uno,project"
            onChange={handleInputChange}
          />
        </label>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Is this item also available for sale?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="isForSale"
                value="true"
                checked={formData.isForSale}
                onChange={() => setFormData({ ...formData, isForSale: true })}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
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
        {
          formData.isForSale && (
            <div className="flex flex-col gap-5">
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
                      checked={formData.isForSaleOnly}
                      onChange={() => setFormData({ ...formData, isForSaleOnly: true })}
                    />
                    <span>Yes For Sale Only</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="isForSaleOnly"
                      value="false"
                      checked={!formData.isForSaleOnly}
                      onChange={() => setFormData({ ...formData, isForSaleOnly: false })}
                    />
                    <span>No (For rent + For Sale)</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-5 items-center">
                <label htmlFor="askingPrice" className="flex flex-col gap-1.5 w-full">
                  <span className="text-sm font-medium text-gray-700">
                    Your Asking Price
                  </span>
                  <input
                    type="number"
                    required
                    id="askingPrice"
                    className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                    value={formData.askingPrice}
                    onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                  />
                </label>
                <label htmlFor="minPrice" className="flex flex-col gap-1.5 w-full">
                  <div className="md:flex md:flex-row md:items-center gap-0.5 md:gap-2 flex flex-col items-start">
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
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  />
                </label>
              </div>
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
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="isAiEnabled"
                      value="true"
                      checked={formData.isAiEnabled}
                      onChange={() => setFormData({ ...formData, isAiEnabled: true })}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="radio"
                      name="isAiEnabled"
                      value="false"
                      checked={!formData.isAiEnabled}
                      onChange={() => setFormData({ ...formData, isAiEnabled: false })}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          )
        }
        <label
          htmlFor="productDescription"
          className="flex flex-col gap-1.5 w-full"
        >
          <span className="text-sm font-medium text-gray-700">
            Product Description
          </span>
          <textarea
            type="text"
            required
            id="productDescription"
            className="border h-24 bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
            placeholder="Say something about the product..."
            onChange={handleInputChange}
          />
        </label>
        <h2 className="text-sm font-medium text-gray-700">Enter Product Location:</h2>
        <LocationPicker formData={formData} setFormData={setFormData} />
        <button
          type="submit"
          className="py-2 px-4 bg-green-600 text-white rounded-md border border-green-600 hover:bg-green-500 hover:text-white/90 cursor-pointer shadow-md text-center"
        >
          List Item
        </button>
      </form>
    </div>
  );
};

export default ListItems;
