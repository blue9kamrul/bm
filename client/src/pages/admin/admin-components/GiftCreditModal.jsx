import Swal from "sweetalert2";
import { X } from "lucide-react";
import { useState } from "react";
import api from "../../../lib/api";

const GiftCreditModal = ({ isGiftCreditModalOpen, setIsGiftCreditModalOpen, userId }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [giftReason, setGiftReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validityDays || !amount) {
        alert("Please fill in all fields.");
        return;
      }

      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/v1/credit/rcc/gift-rcc",
        {
          amount,
          validityDays,
          userId,
          giftReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.data.success) {
        Swal.fire({
          icon: "error",
          title: "OOPS!!",
          text: "Something went wrong",
        });
      }
      Swal.fire({
        icon: "success",
        title: "Successfull!",
      });
      setIsGiftCreditModalOpen(false);
    } catch (error) {
      console.error("Gift Credit error:", error);
      Swal.fire({
        icon: "error",
        title: "OOPS!!",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isGiftCreditModalOpen) return null;

  return (
    <div
      id="authentication-modal"
      className="fixed overflow-y-scroll inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) () => setIsGiftCreditModalOpen(false);
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mt-1 md:mt-3">
                Gift RCC to Your Janeman User 😍
              </h3>
              <p className="text-gray-500 text-xs font-medium">
                You can limit the validity. Remember if the validity expires during rental period the user can not choose to rent that product for that period.
              </p>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={() => setIsGiftCreditModalOpen(false)}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Enter amount
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Enter validity (in Days)
                </label>
                <input
                  type="number"
                  name="validityDays"
                  id="validityDays"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Gift Reason
                </label>
                <textarea
                  type="number"
                  name="giftReason"
                  id="giftReason"
                  value={giftReason}
                  onChange={(e) => setGiftReason(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs h-24 md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
              >
                {loading ? "Processing..." : "Gift Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCreditModal;
