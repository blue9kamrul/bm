import { ArrowRight, CreditCard, X } from "lucide-react";
import useRequestWithdrawalModalStore from "../../stores/creditModalStores/useRequestWithdrawalModalStore";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import BCC from "../CacheCreditCard/BCC";
import { useState } from "react";
import bkash from "../../assets/logos/bkash.png";
import nagad from "../../assets/logos/nagad.svg";
import api from "../../lib/api";
import Swal from "sweetalert2";

const RequestWithdrawalModal = () => {
  const {
    isRequestWithdrawalModalOpen,
    closeRequestWithdrawalModal,
    bccWalletData,
  } = useRequestWithdrawalModalStore();
  const [loading, setLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [paymentGateway, setPaymentGateway] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { creditHistory, setCreditHistory } = bccWalletData || {};

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!paymentGateway) {
      Swal.fire({
        icon: "warning",
        title: "Hey Niggaa!!",
        text: "Please select payment gateway",
      });
      return;
    }
    if (withdrawalAmount > bccWalletData?.bccWallet?.availableBalance) {
      Swal.fire({
        icon: "warning",
        title: "Hey Niggaa!!",
        text: "You don't have enough available balance",
      });
      return;
    }
    if (withdrawalAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Hey Niggaa!!",
        text: "Amount must be greater than zero",
      });
      return;
    }
    try {
      setLoading(true);
      const res = await api.post(
        "/api/v1/withdrawal-requests/request",
        {
          walletId: bccWalletData.bccWallet.id,
          withdrawalAmount,
          paymentGateway,
          phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "OOPS!!",
          text: "Error in creating requests",
        });
      }
      setCreditHistory({ ...creditHistory, bccWallet: res.data.data.updatedWallet})
      Swal.fire({
        icon: "success",
        title: "Success",
        text:
          res.data.message ||
          "Request placed successfully. It takes 1-2 hours to process request.",
      });
      setTimeout(() => {
        closeRequestWithdrawalModal();
      }, 500)
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Swal.fire({
        icon: "error",
        title: "OOPS!!",
        text: error.response.data.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isRequestWithdrawalModalOpen || !bccWalletData) {
    return null;
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRequestWithdrawalModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t border-b border-gray-300 mx-4">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-2xl md:text-3xl font-semibold text-black mt-1 md:mt-3">
                Withdraw Money
              </h3>
              <div className="flex items-center gap-3 mt-2">
                <CreditCard color="blue" size={30} />
                <ArrowRight size={30} color="gray" />
                <FaRegMoneyBillAlt color="green" size={30} />
              </div>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeRequestWithdrawalModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="mx-4 pb-6">
            <div className="mt-2">
              <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                🔵Available Blue Cache Credits
              </h3>
              <div className="mt-4 flex flex-col sm:flex-row items-center">
                <BCC
                  handleSelect={() => {}}
                  bccWallet={bccWalletData.bccWallet}
                  selectedBcc={0}
                />
              </div>
            </div>
            <form onSubmit={handleWithdrawalSubmit} className="mt-6 space-y-3">
              <div
                htmlFor="withdrawalAmount"
                className="flex flex-col gap-1.5 w-full"
              >
                <span className="text-sm font-medium text-gray-700">
                  Enter Withdrawal Amount
                </span>
                <input
                  type="number"
                  required
                  id="withdrawalAmount"
                  value={withdrawalAmount}
                  className="border bg-white border-gray-300 rounded-md w-full px-2 py-2 md:py-3 p md:px-4 focus:border-gray-400 focus:outline-none text-xs md:text-sm"
                  placeholder="Enter amount of money you wanna withdraw"
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
              <div>
                <h4 className="block mb-2 text-xs md:text-sm font-medium text-gray-900">
                  Select Gateway
                </h4>
                <div className="flex items-center gap-4 mt-2">
                  {["BKASH", "NAGAD"].map((method) => (
                    <label
                      key={method}
                      className="cursor-pointer bg-gray-100 shadow-md hover:scale-105 transition duration-300 hover:bg-blue-200"
                    >
                      <input
                        type="radio"
                        name="paymentGateway"
                        value={method}
                        className="hidden peer"
                        onChange={() => setPaymentGateway(method)}
                      />
                      <img
                        src={method === "BKASH" ? bkash : nagad}
                        alt={method}
                        className="w-14 h-9 p-1 object-contain border-2 border-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-200 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div
                htmlFor="phone"
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
                    required
                    value={phoneNumber}
                    maxLength={10}
                    id="phone"
                    className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-sm rounded-r-md"
                    placeholder="1XXXXXXXXX"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? "bg-gray-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"} mt-4 py-1 md:py-2 text-xs md:text-sm rounded-lg hover:shadow-md cursor-pointer`}
              >
                {
                  loading ? "Processing..." : "Request Withdrawal"
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestWithdrawalModal;
