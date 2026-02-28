import { useState, useEffect } from "react";
import {
  Clock,
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
import Loader from "../../../components/shared/Loader";

const UserPlacedRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchPlacedRequests = async () => {
      try {
        const res = await api.get(`/api/v1/users/placed-requests/${userId}`, {
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
    fetchPlacedRequests();
  }, [userId]);

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

  if (loading) {
    return <Loader />;
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
    <div className="min-h-screen bg-gradient-to-br p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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
                            <span>৳{request.product.pricePerDay}/day</span>
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
                    <div className="col-span-2">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">
                          {formatDate(request.rentalStartDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(request.rentalEndDate)}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {request.totalDays} days
                        </div>
                      </div>
                    </div>

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

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>৳{request.product.pricePerDay}/day</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{request.totalDays} days</span>
                          </div>
                        </div>
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
                              <span className="text-gray-600">Total Cost:</span>
                              <span className="ml-2 font-medium text-green-600">
                                ৳
                                {request.product.pricePerDay *
                                  request.totalDays}
                              </span>
                            </div>
                          </div>
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

export default UserPlacedRequests;
