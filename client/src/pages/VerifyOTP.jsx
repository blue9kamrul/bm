import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import useUserStore from "../stores/authStores/useUserStore";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  const { setCurrentUser, tempUser, setTempUser, currentUser } = useUserStore();

  useEffect(() => {
    if (currentUser && currentUser.email) {
      navigate("/verify-user", { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setMessage("❌ Please enter the OTP.");
      return;
    }

    try {
      setVerifying(true);
      setMessage("");

      const res = await api.post("/api/v1/auth/verify-otp", {
        otp: otp.trim(),
        email: tempUser.email,
      });

      if (!res.data.success) {
        setMessage("❌ Invalid OTP. Please try again.");
        return;
      }

      setMessage("✅ OTP verified successfully!");
      await setCurrentUser(res.data.user);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("login-dt", new Date().toISOString());
      setTempUser(null);
    } catch (err) {
      setMessage("❌ Invalid OTP. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    try {
      setResending(true);
      setMessage("");

      await api.post("/api/v1/auth/resend-otp", {
        email: tempUser.email,
      });

      setMessage("📩 OTP resent successfully! Check your email.");
      setTimer(60);
    } catch (err) {
      setMessage("❌ Failed to resend OTP. Try again later.");
      console.error("Resend OTP error:", err);
    } finally {
      setResending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !verifying) {
      handleVerify();
    }
  };

  if (!tempUser || !tempUser.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-gray-700 text-lg">
          What are you looking for?
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md bg-green-50 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-black text-center mb-6">
          Enter OTP
        </h2>

        <p className="text-sm text-gray-600 text-center mb-4">
          We've sent a verification code to{" "}
          <span className="font-semibold italic"> {tempUser?.email} </span>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          onKeyPress={handleKeyPress}
          maxLength={5}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-center text-xl tracking-widest mb-4"
          placeholder="*****"
          disabled={verifying}
        />

        <button
          onClick={handleVerify}
          disabled={verifying || !otp.trim()}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-6 text-sm text-gray-700">
          {timer > 0 ? (
            <p className="text-sm">
              Didn't receive the code?{" "}
              <span className="text-green-600 font-semibold">
                Try again in {timer}s
              </span>
            </p>
          ) : (
            <div>
              <p className="text-sm">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-green-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              </p>
              <p className="text-xs mt-2 text-gray-700">
                Please have patience. For some reason institutional mail servers are too slow 😩
              </p>
              <a className="text-green-600 mt-2 text-sm font-semibold underline" href="https://wa.me/8801772967677?text=I%20am%20having%20trouble%20recieving%20OTP" target="_blank" rel="noopener noreferrer">
                Contact Support
              </a>
            </div>
          )}
        </div>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${message.includes("✅") ? "text-green-600" : "text-green-500"
              }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
