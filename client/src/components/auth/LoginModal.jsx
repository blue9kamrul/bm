
import brittoLogo from "../../assets/brittoo-logo.png";

import { useState } from "react";
import api from "../../lib/api";
import Swal from "sweetalert2";
import Loader from "../shared/Loader";
import useLoginModalStore from "../../stores/authStores/useLoginModalStore";
import useRegModalStore from "../../stores/authStores/useRegModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import useResetPasswordModalStore from "../../stores/authStores/useResetPasswordModalStore";
import { Eye, EyeOff } from "lucide-react";

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useLoginModalStore();
  const { openRegModal } = useRegModalStore();
  const { setCurrentUser, loading, setLoading } = useUserStore();
  const { openResetPasswordModal } = useResetPasswordModalStore();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/v1/auth/login", formData);
      if (!res.data.success) {
        closeLoginModal();
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: res.message || "An error occurred while Logging in.",
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Login Successfull",
      });
      await setCurrentUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("login-dt", new Date().toISOString());
    } catch (error) {
      console.error("Registration Error:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
      closeLoginModal();
    }
  };

  if (!isLoginModalOpen) return null;

  if (loading) {
    return <Loader />;
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
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
                Login Now & Get Started
              </h3>
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeLoginModal}
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
            <form onSubmit={handleLogin} className="space-y-4" action='#'>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleChange}
                  value={formData.email}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 md:p-2.5"
                  placeholder="name@company.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-xs md:text-sm font-medium text-gray-900"
                >
                  Your password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    onChange={handleChange}
                    value={formData.password}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs md:text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2 md:p-2.5"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <p onClick={() => {
                closeLoginModal();
                openResetPasswordModal();
              }} className="text-green-600 text-sm font-semibold cursor-pointer hover:text-green-800 w-fit">Forgot Password ?</p>
              <button
                type="submit"
                className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center"
              >
                Login
              </button>
              <div className="text-xs md:text-sm font-medium text-gray-500">
                New to Brittoo?{" "}
                <a
                  onClick={() => {
                    closeLoginModal();
                    openRegModal();
                  }}
                  className="text-green-700 hover:underline cursor-pointer"
                >
                  Sign Up
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
