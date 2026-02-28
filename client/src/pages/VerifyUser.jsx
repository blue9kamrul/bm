import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Upload, Check, X, Loader2 } from "lucide-react";
import api from "../lib/api.js";
import useUserStore from "../stores/authStores/useUserStore.js";
import VerifiedUser from "./VerifiedUser.jsx";
import Swal from "sweetalert2";
import Loader from "../components/shared/Loader.jsx";
import VerificationPending from "./VerifiactionPending.jsx";

const VerifyUser = () => {
  const [idCardImage, setIdCardImage] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [captureType, setCaptureType] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUserStore();

  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async (type) => {
    try {
      setMessage("");
      setCaptureType(type);
      const isSelfie = type === "selfie";

      let constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: isSelfie ? "user" : "environment",
        },
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstError) {
        console.log(
          "First attempt failed, trying basic constraints:",
          firstError,
        );
        constraints = {
          video: { facingMode: isSelfie ? "user" : "environment" },
        };
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (secondError) {
          console.log("Second attempt failed, trying any camera:", secondError);
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      if (!stream) {
        throw new Error("No camera stream available");
      }

      setCameraStream(stream);
      setIsCameraOpen(true);

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        const setupVideo = () => {
          return new Promise((resolve, reject) => {
            const video = videoRef.current;
            if (!video) {
              reject(new Error("Video element not found"));
              return;
            }

            const timeout = setTimeout(() => {
              reject(new Error("Video loading timeout"));
            }, 10000);

            video.onloadedmetadata = () => {
              clearTimeout(timeout);
              video.play().then(resolve).catch(reject);
            };

            video.onerror = () => {
              clearTimeout(timeout);
              reject(new Error("Video loading error"));
            };
          });
        };

        await setupVideo();
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }

      let errorMessage = "❌ Camera access failed. ";
      if (err.name === "NotAllowedError") {
        errorMessage += "Please allow camera permissions.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found.";
      } else if (err.name === "NotSupportedError") {
        errorMessage += "Camera not supported.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage += "Camera constraints not supported. Retrying...";
        setTimeout(() => startCamera(type), 1000);
        return;
      } else if (err.message?.includes("timeout")) {
        errorMessage += "Camera timed out.";
      } else {
        errorMessage += err.message || "Please try again.";
      }

      setMessage(errorMessage);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraReady(false);
    setCaptureType(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      setMessage("❌ Camera not ready. Please try again.");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setMessage("❌ Camera not ready. Please wait and try again.");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const isSelfie = captureType === "selfie";
    if (isSelfie) {
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0);
    } else {
      context.drawImage(video, 0, 0);
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setMessage("❌ Failed to capture photo. Please try again.");
          return;
        }

        if (isSelfie) {
          setSelfieImage(blob);
          setSelfiePreview(URL.createObjectURL(blob));
        } else {
          setIdCardImage(blob);
          setIdCardPreview(URL.createObjectURL(blob));
        }
        stopCamera();
        setMessage("✅ Photo captured successfully!");
      },
      "image/jpeg",
      0.8,
    );
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("❌ File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setMessage("❌ Please select a valid image file");
        return;
      }
      setIdCardImage(file);
      setIdCardPreview(URL.createObjectURL(file));
    }
  };

  const resetIdCard = () => {
    setIdCardImage(null);
    setIdCardPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetSelfie = () => {
    setSelfieImage(null);
    setSelfiePreview(null);
  };

  const handleSubmit = async () => {
    if (!idCardImage || !selfieImage) {
      setMessage("❌ Please provide both ID card and selfie images");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const formData = new FormData();
      formData.append("idCard", idCardImage, "idCard.jpg");
      formData.append("selfie", selfieImage, "selfie.jpg");
      formData.append("email", currentUser.email);

      const token = localStorage.getItem("token");
      const response = await api.post("/api/v1/auth/verify-user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "✅ Documents submitted successfully",
          text: 'Awaiting review within 2-3 hours.',
        })
        await setCurrentUser({
          ...currentUser,
          is_verified: "PENDING",
        });
        setTimeout(() => navigate("/"), 500);
      } else {
        setMessage(
          `❌ ${response.data.message || "Submission failed. Please try again."
          }`,
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      setMessage(`❌ ${errorMessage}`);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/auth/get-current-user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (!res.data.success) {
          alert("Something went wrong");
          navigate("/");
        }
        setLoggedInUser(res.data.data);
      } catch (error) {
        console.log(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
    if (currentUser) {
      getLoggedInUser();
    }
  }, [currentUser, navigate, setCurrentUser, setLoading]);

  if (loading) {
    return <Loader />
  }

  if (loggedInUser?.isVerified === "PENDING") {
    return <VerificationPending />
  }

  if (loggedInUser?.isVerified === "VERIFIED") {
    return <VerifiedUser currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Identity Verification
        </h1>
        <p className="text-gray-600 text-center">
          Please provide your student ID card and a selfie to verify your
          identity
        </p>
        <div className="flex justify-center flex-col items-center mt-2">
          <p className="text-gray-500">Or,</p>
          <Link to={'/dashboard/overview'}>
            <p className="mt-2  mb-6 text-white bg-green-500 p-2 text-xs md:text-sm border rounded-md w-fit justify-self-center">Verify Later😴</p>
          </Link>
        </div>

        {/* ID Card Section */}
        <div className="mb-8">
          <h2 className="text-sm md:text-lg border-b border-gray-200 pb-1 font-semibold text-gray-700 mb-4 flex items-center">
            Student ID Card (Front)
          </h2>
          {!idCardPreview ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center px-4 py-2 border rounded-lg border-gray-400 text-gray-500 text-sm hover:bg-gray-200 cursor-pointer transition-all"
                >
                  <Upload className="mr-2" size={18} />
                  Upload from Gallery
                </button>
                <button
                  onClick={() => startCamera("idCard")}
                  className="flex items-center px-4 py-2 border rounded-lg border-gray-400 text-gray-500 text-sm hover:bg-gray-200 cursor-pointer transition-all"
                >
                  <Camera className="mr-2" size={18} />
                  Take Photo
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={idCardPreview}
                alt="ID Card Preview"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
              <button
                onClick={resetIdCard}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Selfie Section */}
        <div className="mb-8">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h2 className="text-sm md:text-lg font-semibold text-gray-700">
              Selfie Photo
            </h2>
            <span className="text-xs">(Take any random photo if you feel uncomfortable)</span>
          </div>

          {!selfiePreview ? (
            <div className="text-center">
              <button
                onClick={() => startCamera("selfie")}
                className="flex items-center px-4 py-2 border rounded-lg border-gray-400 text-gray-500 text-sm hover:bg-gray-200 cursor-pointer transition-all mx-auto"
              >
                <Camera className="mr-2" size={18} />
                Take Selfie
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Camera access required for selfie verification
              </p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={selfiePreview}
                alt="Selfie Preview"
                className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
              />
              <button
                onClick={resetSelfie}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {captureType === "selfie"
                      ? "Take Selfie"
                      : "Capture ID Card"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {captureType === "selfie"
                      ? "Position your face in the center with good lighting"
                      : "Ensure your ID card is clearly visible and readable"}
                  </p>
                </div>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-[60vh] object-cover"
                    style={{
                      transform:
                        captureType === "selfie" ? "scaleX(-1)" : "none",
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p className="text-lg">Starting camera...</p>
                        <p className="text-sm text-gray-300 mt-2">
                          This may take a few moments
                        </p>
                        <button
                          onClick={stopCamera}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none">
                    {captureType === "selfie" ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-80 border-2 border-white border-dashed rounded-full opacity-50"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-80 h-48 border-2 border-white border-dashed rounded-lg opacity-50"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-xs md:text-sm"
                  >
                    <Check className="mr-2" size={18} />
                    Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-xs md:text-sm"
                  >
                    <X className="mr-2" size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !idCardImage || !selfieImage}
            className="w-full max-w-md text-sm md:text-base px-4 md:px-8 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
        {
          isSubmitting && (
            <div className="mt-3 flex items-center justify-center gap-1 text-teal-600">
              <Loader2 size={12} className="animate-spin" />
              <p className="text-xs text-center">Please do not close the browser.</p>
            </div>
          )
        }

        {/* Message Display */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-center ${message.includes("success")
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
              }`}
          >
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            📋 Instructions:
          </h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>
              - Ensure your student ID card is clearly visible and readable
            </li>
            <li>- Take a clear selfie with good lighting</li>
            <li>- Make sure your face is clearly visible in the selfie</li>
            <li>- Files should be less than 5MB each</li>
            <li>- Verification process takes 15 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyUser;
