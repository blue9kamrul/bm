import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Phone,
  Shield,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Check,
  X,
} from "lucide-react";
import api from "../../../lib/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../../components/shared/Loader";

const ReceivedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acceptFormData, setAcceptFormData] = useState({
    ownerSubmitMethod: "",
    ownerPhoneNumber: "",
    ownerSubmitTerminal: "",
    ownerSubmitAddress: "",
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchRentalRequests();
  }, []);

  const fetchRentalRequests = async () => {
    try {
      const res = await api.get("/api/v1/rental-requests/owner-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.data.success) {
        throw new Error("Failed to fetch requests");
      }

      setRequests(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessingRequest(selectedRequest.id);
    try {
      const response = await api.put(
        `/api/v1/rental-requests/accept/${selectedRequest.id}`,
        acceptFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.data.success) {
        throw new Error("Failed to accept request");
      }
      // Update the request in the state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? { ...req, status: "ACCEPTED_BY_OWNER" }
            : req,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Request accepted successfully!",
      });
      closeModal();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ERROR!",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Swal.fire({
        icon: "warning",
        text: "Please provide a reason for rejection",
      });
      return;
    }

    setProcessingRequest(selectedRequest.id);
    try {
      const response = await api.put(
        `/api/v1/rental-requests/reject/${selectedRequest.id}`, { rejectReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.data.success) {
        throw new Error("Failed to reject request");
      }
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? { ...req, status: "REJECTED_BY_OWNER", rejectReason }
            : req,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Request rejected successfully!",
      });
      closeModal();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "ERROR!",
        text: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const openModal = (type, request) => {
    setModalType(type);
    setSelectedRequest(request);
    setShowModal(true);
    if (type === "accept") {
      setAcceptFormData({
        ownerSubmitMethod: "",
        ownerPhoneNumber: "",
        ownerSubmitTerminal: "",
        ownerSubmitAddress: "",
      });
    } else {
      setRejectReason("");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedRequest(null);
    setRejectReason("");
    setAcceptFormData({
      ownerSubmitMethod: "",
      ownerPhoneNumber: "",
      ownerSubmitTerminal: "",
      ownerSubmitAddress: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "REQUESTED_BY_RENTER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACCEPTED_BY_OWNER":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED_BY_OWNER":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSecurityScoreColor = (score) => {
    switch (score) {
      case "VERY_HIGH":
        return "text-green-600 bg-green-100";
      case "HIGH":
        return "text-green-500 bg-green-50";
      case "MID":
        return "text-yellow-500 bg-yellow-50";
      case "LOW":
        return "text-orange-500 bg-orange-50";
      case "VERY_LOW":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <div className="flex h-screen w-full justify-center items-center">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b pb-4 border-gray-300">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Received Rental Requests
            </h1>
            <p className="text-gray-600">
              Manage rental requests for your products
            </p>
          </div>
          <div></div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                No Requests Found
              </h3>
              <p className="text-green-600">
                You haven't received any rental requests yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Product Image */}
                    <Link
                      to={`/product-details/${request?.product?.id}`}
                      className="lg:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 border border-gray-300 hover:p-2 hover:shadow-md hover:scale-105 cursor-pointer transition-all duration-300"
                    >
                      <img
                        src={`${baseUrl}${request.product.optimizedImages[0]}`}
                        alt={request.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">
                            {request.product.name}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>৳{(parseFloat(request.pricePerDay) || request.product.pricePerDay)}/day</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              <span>{request.product.productType}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          <Clock className="w-4 h-4" />
                          {formatStatus(request.status)}
                        </div>
                      </div>

                      {/* Renter Information */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-xs text-green-700 mb-3">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              Renter Information
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-sm mb-1 text-gray-800">
                                {request.requester.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {request.requester.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-xs mt-1 text-gray-600">
                                {request.renterPhoneNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded ${getSecurityScoreColor(
                                  request.requester.securityScore,
                                )}`}
                              >
                                {request.requester.securityScore.replace(
                                  "_",
                                  " ",
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>
                                  {request.requester.emailVerified
                                    ? "Verified"
                                    : "Not Verified"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>
                                  {request.requester.isVerified === "VERIFIED"
                                    ? "Verified"
                                    : "Not Verified"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rental Details */}
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-xs text-blue-700 mb-3">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Rental Details</span>
                          </div>
                          {
                            request.isHourlyRental ? (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-purple-600 p-1 bg-purple-100 rounded-md">
                                    Hourly Rental
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Start Date:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {formatDate(request.rentalStartDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Start Hour:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {request.startingHour}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Duration:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {request.totalHours} hours
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Price Per Hour:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    BDT {parseFloat(request.pricePerHour).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Total Amount:
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    ৳
                                    {(
                                      request.pricePerHour *
                                      request.totalHours
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Collection:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {request.renterCollectionMethod ===
                                      "BRITTOO_TERMINAL"
                                      ? "Terminal Pickup"
                                      : "Home Delivery"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Start Date:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {formatDate(request.rentalStartDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    End Date:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {formatDate(request.rentalEndDate)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Duration:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {request.totalDays} days
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Total Amount:
                                  </span>
                                  <span className="text-xs font-medium text-green-600">
                                    ৳
                                    {(
                                      (parseFloat(request.pricePerDay) || request.product.pricePerDay) *
                                      request.totalDays
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Collection:
                                  </span>
                                  <span className="text-xs font-medium text-gray-800">
                                    {request.renterCollectionMethod ===
                                      "BRITTOO_TERMINAL"
                                      ? "Terminal Pickup"
                                      : "Home Delivery"}
                                  </span>
                                </div>
                              </div>
                            )
                          }
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {request.status === "REQUESTED_BY_RENTER" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => openModal("accept", request)}
                            disabled={processingRequest === request.id}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="w-4 h-4" />
                            {processingRequest === request.id
                              ? "Processing..."
                              : "Accept"}
                          </button>
                          <button
                            onClick={() => openModal("reject", request)}
                            disabled={processingRequest === request.id}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            {processingRequest === request.id
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              {modalType === "accept" ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Accept Rental Request
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Deposit Method
                      </label>
                      <select
                        value={acceptFormData.ownerSubmitMethod}
                        onChange={(e) =>
                          setAcceptFormData({
                            ...acceptFormData,
                            ownerSubmitMethod: e.target.value,
                          })
                        }
                        className="w-full px-2 py-2 md:py-3 md:px-4  border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select deposit method</option>
                        <option value="HOME">Home Deposit</option>
                        <option value="BRITTOO_TERMINAL">
                          Terminal Deposit
                        </option>
                      </select>
                    </div>
                    <label
                      htmlFor="phone"
                      className="flex flex-col gap-1.5 w-full mt-4"
                    >
                      <span className="text-xs font-medium text-gray-700">
                        Phone Number
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
                          value={acceptFormData.ownerPhoneNumber}
                          onChange={(e) =>
                            setAcceptFormData({
                              ...acceptFormData,
                              ownerPhoneNumber: e.target.value,
                            })
                          }
                          maxLength={10}
                          id="phone"
                          className="w-full px-2 py-2 md:py-3 md:px-4 focus:outline-none text-xs md:text-xs rounded-r-md"
                          placeholder="1XXXXXXXXX"
                        />
                      </div>
                    </label>
                    {acceptFormData.ownerSubmitMethod === "BRITTOO_TERMINAL" ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Pickup Point
                        </label>
                        <select
                          value={acceptFormData.ownerSubmitTerminal}
                          onChange={(e) =>
                            setAcceptFormData({
                              ...acceptFormData,
                              ownerSubmitTerminal: e.target.value,
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
                      acceptFormData.ownerSubmitMethod === "HOME" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Deposit Address
                          </label>
                          <textarea
                            value={acceptFormData.ownerSubmitAddress}
                            onChange={(e) =>
                              setAcceptFormData({
                                ...acceptFormData,
                                ownerSubmitAddress: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows="4"
                            placeholder="Please provide your deposit address here..."
                          />
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleAccept}
                      disabled={
                        !acceptFormData.ownerSubmitMethod ||
                        !acceptFormData.ownerPhoneNumber
                      }
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Reject Rental Request
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Reason for Rejection
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows="4"
                        placeholder="Please provide a reason for rejecting this request..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleReject}
                      disabled={!rejectReason.trim()}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedRequests;
