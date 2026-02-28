import { useState, useEffect } from "react";
import {
  Clock,
  User,
  Calendar,
  MapPin,
  Phone,
  Shield,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../../lib/api";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../../../components/shared/Loader";

const PlacedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [cancellingRequest, setCancellingRequest] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchPlacedRequests();
  }, []);

  const fetchPlacedRequests = async () => {
    try {
      const res = await api.get("/api/v1/rental-requests/placed-requests", {
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

  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "REQUESTED_BY_RENTER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACCEPTED_BY_OWNER":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED_BY_OWNER":
        return "bg-red-100 text-red-800 border-red-200";
      case "PRODUCT_SUBMITTED_BY_OWNER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "REQUESTED_BY_RENTER":
        return <Clock className="w-4 h-4" />;
      case "ACCEPTED_BY_OWNER":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED_BY_OWNER":
        return <XCircle className="w-4 h-4" />;
      case "PRODUCT_SUBMITTED_BY_OWNER":
        return <Package className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatStatus = (status) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getSecurityScoreColor = (score) => {
    switch (score) {
      case "VERY_HIGH":
        return "text-green-600";
      case "HIGH":
        return "text-green-500";
      case "MID":
        return "text-yellow-500";
      case "LOW":
        return "text-orange-500";
      case "VERY_LOW":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const cancelRequest = async (request) => {
    if (!request) {
      alert("Request not selected!");
      return;
    }
    if (request.status === "CANCELLED_BY_RENTER") {
      alert("Already Cancelled!");
      return;
    }
    try {
      setCancelLoading(true);
      const res = await api.put(
        `/api/v1/rental-requests/cancel/${request.id}`,
        { cancelReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "ERROR!",
          text: "Something went wrong",
        });
      }

      Swal.fire({
        icon: 'success',
        title: "Success",
        text: "request cancelled successfully"
      });
      setCancellingRequest(null);

      setRequests((prev) =>
        prev.map((req) =>
          req.id === cancellingRequest
            ? { ...req, status: "CANCELLED_BY_RENTER", cancelReason }
            : req,
        ),
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ERROR!",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setCancelLoading(false);
      setTimeout(() => {
        setCancelReason(null);
      }, 500);
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-6">
        <div className="w-full flex h-screen justify-center items-center">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            My Placed Requests
          </h1>
          <p className="text-gray-600">
            Track your placed rental requests and their status
          </p>
        </div>

        {cancellingRequest && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Reject Rental Request
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Rejection
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="4"
                      placeholder="Please provide a reason for rejecting this request..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => cancelRequest(cancellingRequest)}
                    disabled={!cancelReason || cancelLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-2 text-xs cursor-pointer rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelLoading ? "Cancelling..." : "Cancel Request"}
                  </button>
                  <button
                    onClick={() => setCancellingRequest(null)}
                    className="flex-1 bg-gray-600 text-white py-2 px-2 text-xs cursor-pointer rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                No Requests Found
              </h3>
              <p className="text-green-600">
                You haven't placed any rental requests yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 bg-green-50 border-b border-gray-200 font-semibold text-green-800">
              <div className="col-span-3">Product</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Rental Period</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Collection</div>
              <div className="col-span-1">Actions</div>
            </div>

            <div className="divide-y divide-green-100">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="hover:bg-green-25 transition-colors duration-150"
                >
                  {/* Only visible in lg devices */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 items-center">
                    {/* Product */}
                    <Link
                      to={`/product-details/${request.product.id}`}
                      className="col-span-3"
                    >
                      <div className="flex items-center gap-3 border border-gray-50 hover:bg-gray-200 hover:p-2 hover:scale-105 transition-all hover:border-gray-200 cursor-pointer hover:rounded-lg">
                        <img
                          src={`${baseUrl}${request.product.optimizedImages[0]}`}
                          alt={request.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm">
                            {request.product.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>৳{(parseFloat(request.pricePerDay) || request.product.pricePerDay)}/day</span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* Status */}
                    <div className="col-span-2">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          request.status,
                        )}`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="hidden md:inline">
                          {formatStatus(request.status)}
                        </span>
                      </div>
                    </div>

                    {/* Rental Period */}
                    {
                      request.isHourlyRental ? (
                        <div className="col-span-2">
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">
                              {formatDate(request.rentalStartDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              From {request.startingHour}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              for {request.totalHours} {request.totalHours === 1 ? "Hour" : "Hours"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-2">
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">
                              {formatDate(request.rentalStartDate)}
                            </div>
                            <div className="text-xs text-gray-500">
                              to {formatDate(request.rentalEndDate)}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              {request.totalDays} {request.totalDays === 1 ? "Day" : "Days"}
                            </div>
                          </div>
                        </div>
                      )
                    }

                    {/* Owner */}
                    <div className="col-span-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">
                          {request.owner.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Shield className="w-3 h-3 text-gray-400" />
                          <span
                            className={`font-medium ${getSecurityScoreColor(
                              request.owner.securityScore,
                            )}`}
                          >
                            {request.owner.securityScore.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Collection */}
                    <div className="col-span-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">
                          {request.renterCollectionMethod === "BRITTOO_TERMINAL"
                            ? "Terminal Pickup"
                            : "Home Delivery"}
                        </div>
                        {request.renterPickupTerminal && (
                          <div className="text-xs text-gray-500">
                            {request.renterPickupTerminal.replace("_", " ")}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <button
                        onClick={() => toggleRowExpansion(request.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        {expandedRows.has(request.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="lg:hidden p-4">
                    <div className="flex items-start gap-3">
                      <Link to={`/product-details/${request.product.id}`}>
                        <img
                          src={`${baseUrl}${request.product.optimizedImages[0]}`}
                          alt={request.product.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {request.product.name}
                          </h3>
                          <button
                            onClick={() => toggleRowExpansion(request.id)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors ml-2"
                          >
                            {expandedRows.has(request.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border mb-2 ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          <span>{formatStatus(request.status)}</span>
                        </div>

                        {
                          request.isHourlyRental ? (
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>৳{parseFloat(request.pricePerHour).toFixed(2)}/hour</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{request.totalHours} hours</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>৳{((parseFloat(request.pricePerDay) || parseFloat(request.product.pricePerDay))).toFixed(2)}/day</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{request.totalDays} days</span>
                              </div>
                            </div>
                          )
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRows.has(request.id) && (
                    <div className="border-t border-green-100 bg-green-25 p-4 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Contact Information */}
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2 font-medium">
                                {request.renterPhoneNumber}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                Owner Email:
                              </span>
                              <span className="ml-2 font-medium">
                                {request.owner.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rental Details */}
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Rental Details
                          </h4>
                          {
                            request.isHourlyRental ? (
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Start Date:</span>
                                  <span className="ml-2 font-medium">
                                    {formatDate(request.rentalStartDate)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Starting Hour:</span>
                                  <span className="ml-2 font-medium">
                                    {request.startingHour}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Hours:</span>
                                  <span className="ml-2 font-medium">
                                    {request.totalHours}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Price Per Hour:</span>
                                  <span className="ml-2 font-medium">
                                    {(parseFloat(request.pricePerHour)).toFixed(2)}/hr
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Cost:</span>
                                  <span className="ml-2 font-medium text-green-600">
                                    ৳
                                    {(parseFloat(request.pricePerHour) *
                                      request.totalHours).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Start Date:</span>
                                  <span className="ml-2 font-medium">
                                    {formatDate(request.rentalStartDate)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">End Date:</span>
                                  <span className="ml-2 font-medium">
                                    {formatDate(request.rentalEndDate)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Price Per Day:</span>
                                  <span className="ml-2 font-medium">
                                    ৳{parseFloat(request.pricePerDay) || request.product.pricePerDay}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Total Cost:</span>
                                  <span className="ml-2 font-medium text-green-600">
                                    ৳
                                    {((parseFloat(request.pricePerDay) || request.product.pricePerDay) *
                                      request.totalDays).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )
                          }
                        </div>

                        {/* Collection Method */}
                        <div className="bg-white rounded-lg p-4 border border-green-100">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Collection Method
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Requested:</span>
                              <span className="ml-2 font-medium">
                                {formatDate(request.createdAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Method:</span>
                              <span className="ml-2 font-medium">
                                {request.renterCollectionMethod ===
                                  "BRITTOO_TERMINAL"
                                  ? "Terminal Pickup"
                                  : "Home Delivery"}
                              </span>
                            </div>
                            {request.renterPickupTerminal && (
                              <div>
                                <span className="text-gray-600">
                                  Pickup Point:
                                </span>
                                <span className="ml-2 font-medium">
                                  {request.renterPickupTerminal.replace(
                                    "_",
                                    " ",
                                  )}
                                </span>
                              </div>
                            )}
                            {request.renterDeliveryAddress && (
                              <div>
                                <span className="text-gray-600">
                                  Delivery Address:
                                </span>
                                <span className="ml-2 text-xs text-black">
                                  {request.renterDeliveryAddress.replace(
                                    "_",
                                    " ",
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {request.status != "CANCELLED_BY_RENTER" && (
                        <button
                          onClick={() => setCancellingRequest(request)}
                          className="py-1 text-xs px-3 border mt-4 rounded-md border-gray-400 text-gray-500 hover:text-white hover:bg-gray-500 cursor-pointer transition-all"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacedRequests;
