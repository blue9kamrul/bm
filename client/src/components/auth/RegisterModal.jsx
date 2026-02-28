import brittoLogo from "../../assets/brittoo-logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../lib/api";
import Swal from "sweetalert2";
import Loader from "../shared/Loader";
import useRegModalStore from "../../stores/authStores/useRegModalStore";
import useLoginModalStore from "../../stores/authStores/useLoginModalStore";
import useUserStore from "../../stores/authStores/useUserStore";

const RegisterModal = () => {
  const { isRegModalOpen, closeRegModal } = useRegModalStore();
  const { openLoginModal } = useLoginModalStore();
  const { setLoading, loading, setTempUser } = useUserStore();

  const navigate = useNavigate();

  const isValidRuetEmail = (email) => {
    const patterns = [
      /^[0-9]+@student\.ruet\.ac\.bd$/i,       // RUET: 2010033@student.ruet.ac.bd
      /^s[0-9]+@ru\.ac\.bd$/i,                 // RU: s2310876102@ru.ac.bd
      /^[0-9]{7}@[a-z]+\.buet\.ac\.bd$/i,      // BUET: 2212011@cse.buet.ac.bd
      /^[0-9]{10}@student\.sust\.edu$/i,       // SUST: 2024134111@student.sust.edu
    ];
    return patterns.some((regex) => regex.test(email));
  };


  //const { getGeoLocation } = useGeoLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Mismatch",
        text: "Passwords do not match. Please re-enter them.",
      });
      return;
    }

    try {
      setLoading(true);
      const coords = {};
      coords.latitude = 33.33;
      coords.longitude = 33.33;

      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipResponse.json();

      const res = await api.post("/api/v1/auth/register", {
        ...formData,
        latitude: coords.latitude,
        longitude: coords.longitude,
        ipAddress: ip || "xxx.xxx.xxx.xxx",
      });

      console.log(res);

      if (!res.data.success) {
        closeRegModal();
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: res.message || "An error occurred while registering.",
        });
        return;
      }
      closeRegModal();
      await setTempUser(res.data.user);
      navigate("/verify-otp");
    } catch (error) {
      console.error("Registration Error:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isRegModalOpen) return null;

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      id="authentication-modal"
      className={`fixed inset-0 z-30 flex justify-center items-center bg-black/70 overflow-y-scroll`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRegModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className={`relative bg-white rounded-lg shadow-sm`}>
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            <div className="flex flex-col items-center text-center w-full">
              <img
                src={brittoLogo}
                className="h-8 md:h-12 object-contain"
                alt="Brittoo"
              />
              <h3 className="text-xs md:text-lg font-semibold text-gray-700 mt-1 md:mt-4">
                Create Your Brittoo Account
              </h3>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeRegModal}
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
            <form onSubmit={handleRegister} className="space-y-3 md:space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-1.5 md:p-2.5"
                  placeholder="Mr. Sanda"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Your Student Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-1.5 md:p-2.5"
                  placeholder="2010033@student.ruet.ac.bd"
                  required
                />
                {
                  formData.email.length > 0 && !isValidRuetEmail(formData.email) && (
                    <p className="text-red-500 text-xs">This is not a valid Edu (BUET/RUET/RU/SUST) mail. But you can still register, rental features for other institutions are coming soon.</p>
                  )
                }
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Set password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-1.5 md:p-2.5"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="repassword"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Re-enter password
                </label>
                <input
                  type="password"
                  name="repassword"
                  id="repassword"
                  value={formData.repassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-1.5 md:p-2.5"
                  required
                />
              </div>
              <div className="flex justify-between mt-4 md:mt-8">
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      type="checkbox"
                      value=""
                      className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-green-300"
                      required
                    />
                  </div>
                  <label
                    htmlFor="remember"
                    className="ms-2 text-xs font-medium text-gray-900"
                  >
                    I have read and agree to the{" "}
                    <a
                      href="/terms-and-conditions"
                      target="_blank" rel="noopener noreferrer"
                      className="text-green-600 underline dark:text-green-500"
                    >
                      terms and conditions.
                    </a>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center"
              >
                Create Account
              </button>
              <div className="text-xs md:text-sm font-medium text-gray-500">
                Have an account?{" "}
                <a
                  onClick={() => {
                    closeRegModal();
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

export default RegisterModal;
