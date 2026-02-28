import { useState } from "react";
import useBuyBccModalStore from "../../stores/creditModalStores/useBuyBccModalStore";
import bkash from "../../assets/logos/bkash.png";
import nagad from "../../assets/logos/nagad.svg";
import api from "../../lib/api";
import Swal from "sweetalert2";
import { X } from "lucide-react";

const BuyBccModal = () => {
  const { closeBuyBccModal } = useBuyBccModalStore();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [trxNo, setTrxNo] = useState("");
  const [trxId, setTrxId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod || !amount || !trxId) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/api/v1/credit/bcc/buy",
        {
          paymentGateway: paymentMethod.toUpperCase(),
          amount,
          transactionId: trxId,
          trxNo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Purchase Successfull.",
        text: response.data.message || "Waiting for verification. It takes 20-30 mins for verification"
      });
      closeBuyBccModal();
    } catch (error) {
      console.error("BCC purchase error:", error);
      if (error.response?.data?.errorType === "VERIFICATION_ERROR") {
        Swal.fire({
          icon: "error",
          title: "Verfiy yourself first!",
          text: error.response?.data?.message || "Something went wrong",
          footer:
          '<a href="/verify-user" style="color: #2563eb; text-decoration: underline;">Verify Now</a>'
        });
      } else alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="authentication-modal"
      className="fixed overflow-y-scroll inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBuyBccModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mt-1 md:mt-3">
                Get Your Blue Cache Credit
              </h3>
              <p className="text-gray-500 text-xs font-medium">
                1.00 TK = 1 BCC
              </p>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeBuyBccModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <h4 className="mb-2 text-xs md:text-sm font-medium text-gray-900 pb-1 pt-2 border-b-2 mx-4 border-gray-300">
            🔵 Available BCC: {0}
          </h4>
          <div className="bg-white px-4 rounded-lg mt-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              📋 Instructions :
            </h3>
            <ul className="text-xs md:text-sm text-blue-700 space-y-1 text-left">
              <li>• Send Money (Not Payment)</li>
              <li>• Number: <strong>+8801860064433</strong></li>
              <li>• Add Your roll at reference</li>
              <li>• Select the gateway and Enter you sent amount</li>
              <li>• Carefully paste the trxId below</li>
            </ul>
          </div>
          <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <h4 className="block mb-2 text-xs md:text-sm font-medium text-gray-900">
                  Select Gateway
                </h4>
                <div className="flex items-center gap-4 mt-2">
                  {["bkash", "nagad"].map((method) => (
                    <label
                      key={method}
                      className="cursor-pointer bg-gray-100 shadow-md hover:scale-105 transition duration-300 hover:bg-blue-200"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        className="hidden peer"
                        onChange={() => setPaymentMethod(method)}
                      />
                      <img
                        src={
                          method === "bkash"
                            ? bkash
                            : nagad
                        }
                        alt={method}
                        className="w-14 h-9 p-1 object-contain border-2 border-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-200 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Enter Paid amount (Send Money)
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

              <label
                htmlFor="trxNo"
                className="flex flex-col gap-1.5 w-full mt-4"
              >
                <span className="text-sm font-medium text-gray-700">
                  Phone Number
                </span>
                <div className="flex items-center border bg-white border-gray-300 rounded-md w-full focus-within:border-gray-400">
                  <span className="flex items-center gap-1 px-3 text-xs md:text-sm text-gray-600 bg-gray-100 border-r border-gray-300 rounded-l-md">
                    <img
                      src="https://flagcdn.com/w40/bd.png"
                      alt="BD Flag"
                      className="w-5 h-4 object-cover"
                    />
                    +880
                  </span>

                  <input
                    type="text"
                    name="trxNo"
                    id="trxNo"
                    required
                    value={trxNo}
                    maxLength={10}
                    className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-sm rounded-r-md"
                    placeholder="1XXXXXXXXX"
                    onChange={(e) => setTrxNo(e.target.value)}
                  />
                </div>
              </label>
              <div>
                <label
                  htmlFor="trxId"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Transaction ID
                </label>
                <input
                  type="text"
                  name="trxId"
                  id="trxId"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 md:p-2.5"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyBccModal;
