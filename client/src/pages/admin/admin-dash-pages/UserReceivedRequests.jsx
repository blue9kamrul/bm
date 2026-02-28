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

const UserReceivedRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchRentalRequests = async () => {
      try {
        const res = await api.get(`/api/v1/users/received-requests/${userId}`, {
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
    fetchRentalRequests();
  }, [userId]);


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
    <div className="min-h-screen bg-gradient-to-br p-6">
      <div className="max-w-7xl mx-auto">
        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                No Requests Found
              </h3>
              <p className="text-green-600">
                This User haven't received any rental requests yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow duration-300 hover:border-gray-300"
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
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {request.product.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>৳{request.product.pricePerDay}/day</span>
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
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
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
                          <div className="flex items-center gap-2 text-sm text-green-700 mb-3">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              Renter Information
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="font-medium text-gray-800">
                                {request.requester.name}
                              </p>
                              <p className="text-sm text-gray-600">
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
                                className={`text-sm font-medium px-2 py-1 rounded ${getSecurityScoreColor(
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
                          <div className="flex items-center gap-2 text-sm text-blue-700 mb-3">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Rental Details</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Start Date:
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {formatDate(request.rentalStartDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                End Date:
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {formatDate(request.rentalEndDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Duration:
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {request.totalDays} days
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Total Amount:
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                ৳
                                {(
                                  request.product.pricePerDay *
                                  request.totalDays
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Collection:
                              </span>
                              <span className="text-sm font-medium text-gray-800">
                                {request.renterCollectionMethod ===
                                "BRITTOO_TERMINAL"
                                  ? "Terminal Pickup"
                                  : "Home Delivery"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReceivedRequests;
