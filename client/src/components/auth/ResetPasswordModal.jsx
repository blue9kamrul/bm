
import brittoLogo from "../../assets/brittoo-logo.png";

import { useState } from "react";
import api from "../../lib/api";
import Swal from "sweetalert2";
import Loader from "../shared/Loader";
import useResetPasswordModalStore from "../../stores/authStores/useResetPasswordModalStore";
import useLoginModalStore from "../../stores/authStores/useLoginModalStore";

const ResetPasswordModal = () => {
  const { isResetPasswordModalOpen, closeResetPasswordModal } = useResetPasswordModalStore();
  const { openLoginModal } = useLoginModalStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGetResetLink = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/v1/auth/forgot-password", formData);
      if (!res.data.success) {
        closeResetPasswordModal();
        Swal.fire({
          icon: "error",
          title: "Reset Password Failed",
          text: res.message || "An error occurred.",
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Reset Link Sent",
        text: "Please check your inbox and spam/junk folders.",
        showConfirmButton: false,
        footer: '<p>Note: Delivery may take up to 4–5 minutes. Thank you for your patience.</p>'
      });
      closeResetPasswordModal();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
      closeResetPasswordModal();
    } finally {
      setLoading(false);
      closeResetPasswordModal();
    }
  };

  if (!isResetPasswordModalOpen) return null;

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeResetPasswordModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <div className="flex flex-col items-center text-center w-full">
              <img
                src={brittoLogo}
                className="h-8 md:h-12 object-contain"
                alt="Brittoo"
              />
              <h3 className="text-xs md:text-lg font-semibold text-gray-700 mt-1 md:mt-4">
                Reset Password
              </h3>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeResetPasswordModal}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5">
            <form onSubmit={handleGetResetLink} className="space-y-4" action='#'>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Enter Your Registered Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleChange}
                  value={formData.email}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 md:p-2.5"
                  placeholder="2010033@student.ruet.ac.bd"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
              >
                Get Reset Link
              </button>
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  Please have patience. For some reason institutional mail servers are too slow 😩. If you are still facing any issue please <a className="text-green-600 mt-2 text-sm font-semibold underline" href="https://wa.me/8801772967677?text=I%20am%20having%20trouble%20recieving%20password%20reset%20email" target="_blank" rel="noopener noreferrer">
                    Contact Here.
                  </a>
                </p>

              </div>
              <div className="text-xs md:text-sm font-medium text-gray-500">
                Remembered Password?{" "}
                <a
                  onClick={() => {
                    closeResetPasswordModal();
                    openLoginModal();
                  }}
                  className="text-green-700 hover:underline cursor-pointer"
                >
                  Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
