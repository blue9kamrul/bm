import { X } from "lucide-react"


const PurchaseRequestModal = ({ offerFormData, setShowModal, setOfferFormData, handlePlaceRequest, isPlacingRequest, offerPrice }) => {
  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div>
          <div className='flex justify-between'>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Accept Rental Request
            </h3>
            <X onClick={() => setShowModal(false)} size={16} color='#374151' className='hover:scale-105 transition-all duration-300 cursor-pointer' />
          </div>
          <div className="space-y-4">
            <label
              htmlFor="offer"
              className="flex flex-col gap-1.5 w-full mt-4"
            >
              <span className="text-xs font-medium text-gray-700">
                Accepted Offer
              </span>
              <div className="flex items-center border bg-white border-gray-300 rounded-md w-full focus-within:border-gray-400">
                <input
                  type="tel"
                  required
                  disabled
                  value={offerPrice}
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      offerPrice: e.target.value,
                    })
                  }
                  id="offer"
                  className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-xs rounded-r-md"
                />
              </div>
            </label>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Collection Method
              </label>
              <select
                value={offerFormData.buyerCollectionMethod}
                onChange={(e) =>
                  setOfferFormData({
                    ...offerFormData,
                    buyerCollectionMethod: e.target.value,
                  })
                }
                className="w-full px-2 py-2 md:py-3 md:px-4  border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select collection method</option>
                <option value="HOME">Home Delivery</option>
                <option value="BRITTOO_TERMINAL">
                  Terminal Collection
                </option>
              </select>
            </div>
            <label
              htmlFor="phone"
              className="flex flex-col gap-1.5 w-full mt-4"
            >
              <span className="text-xs font-medium text-gray-700">
                Enter Phone Number
              </span>
              <div className="flex items-center border bg-white border-gray-300 rounded-md w-full focus-within:border-gray-400">
                <span className="flex items-center gap-1 px-3 text-xs md:text-xs text-gray-600 bg-gray-100 border-r border-gray-300 rounded-l-md">
                  <img
                    src="https://flagcdn.com/w40/bd.png"
                    alt="BD Flag"
                    className="w-5 h-4 object-cover"
                  />
                  +880
                </span>

                <input
                  type="tel"
                  required
                  value={offerFormData.buyerPhoneNumber}
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      buyerPhoneNumber: e.target.value,
                    })
                  }
                  maxLength={10}
                  id="phone"
                  className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-xs rounded-r-md"
                  placeholder="1XXXXXXXXX"
                />
              </div>
            </label>
            {offerFormData.buyerCollectionMethod === "BRITTOO_TERMINAL" ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Pickup Point
                </label>
                <select
                  value={offerFormData.buyerPickupTerminal}
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      buyerPickupTerminal: e.target.value,
                    })
                  }
                  className="w-full px-2 py-2 md:py-3 md:px-4  border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select pickup point</option>
                  <option value="CSE_1">CSE Building</option>
                  <option value="ADMIN_1">Admin Building</option>
                  <option value="BANGABANDHU_HALL_1">
                    Bangabandhu Hall
                  </option>
                  <option value="ZIA_HALL_1">Zia Hall</option>
                  <option value="LIBRARY_1">Library</option>
                </select>
              </div>
            ) : (
              offerFormData.buyerCollectionMethod === "HOME" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={offerFormData.buyerDeliveryAddress}
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        buyerDeliveryAddress: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="4"
                    placeholder="Please provide your delivery address here..."
                  />
                </div>
              )
            )}
          </div>
          <button
            onClick={handlePlaceRequest}
            disabled={
              !offerFormData.buyerCollectionMethod ||
              !offerFormData.buyerPhoneNumber ||
              isPlacingRequest
            }
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full mt-5"
          >
            {isPlacingRequest ? "Please wait..." : "Place Request"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseRequestModal