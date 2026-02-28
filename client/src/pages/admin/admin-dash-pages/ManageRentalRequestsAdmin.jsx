import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronUp,
  ChevronDown,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Shield,
  Box,
} from "lucide-react";
import api from "../../../lib/api";

const RentalRequestsDashboard = () => {
  const [rentalRequests, setRentalRequests] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    productId: "",
    ownerId: "",
    requesterId: "",
  });
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const baseUrl = import.meta.env.VITE_BASE_URL;

  console.log(rentalRequests)

  const fetchRentalRequests = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/v1/admin/rental-requests", {
        params: { ...filters, page, limit: meta.limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRentalRequests(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Error fetching rental requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalRequests();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(
        `/api/v1/admin/rental-requests/${id}/update-status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchRentalRequests(meta.page);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await api.put(
        `/api/v1/admin/rental-requests/${id}/reject`,
        { brittooRejectReason: reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchRentalRequests(meta.page);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handlePageChange = (newPage) => {
    fetchRentalRequests(newPage);
  };

  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "REQUESTED_BY_RENTER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACCEPTED_BY_OWNER":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED_BY_OWNER":
        return "bg-red-100 text-red-800 border-red-200";
      case "REJECTED_FROM_BRITTOO":
        return "bg-red-200 text-red-900 border-red-300";
      case "PRODUCT_SUBMITTED_BY_OWNER":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PRODUCT_COLLECTED_BY_RENTER":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PRODUCT_RETURNED_BY_RENTER":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "PRODUCT_RETURNED_TO_OWNER":
        return "bg-green-200 text-green-900 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  const formatStatus = (status) =>
    status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const formatDate = (date) => format(new Date(date), "PP");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6">
          Rental Requests Dashboard
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">All Statuses</option>
              {[
                "REQUESTED_BY_RENTER",
                "ACCEPTED_BY_OWNER",
                "REJECTED_BY_OWNER",
                "REJECTED_FROM_BRITTOO",
                "PRODUCT_SUBMITTED_BY_OWNER",
                "PRODUCT_COLLECTED_BY_RENTER",
                "PRODUCT_RETURNED_BY_RENTER",
                "PRODUCT_RETURNED_TO_OWNER",
              ].map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by product or user name..."
              className="p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
            />
            <input
              name="productId"
              value={filters.productId}
              onChange={handleFilterChange}
              placeholder="Product ID"
              className="p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
            />
            <input
              name="requesterId"
              value={filters.requesterId}
              onChange={handleFilterChange}
              placeholder="Renter ID"
              className="p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>

        {/* Rental Requests Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 p-4">Loading...</div>
          ) : rentalRequests.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              No rental requests found
            </div>
          ) : (
            rentalRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow hover:bg-green-50 transition-colors duration-150"
              >
                {/* Desktop Grid View */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-6 items-center">
                  {/* Product */}
                  <div className="col-span-3">
                    <a
                      href={`/product-details/${request.product.id}`}
                      className="flex items-center gap-3 border border-gray-100 hover:bg-gray-100 hover:p-2 hover:scale-105 transition-all hover:border-gray-200 rounded-lg"
                    >
                      <img
                        src={
                          request.product.optimizedImages[0]
                            ? `${baseUrl}${request.product.optimizedImages[0]}`
                            : "https://via.placeholder.com/48"
                        }
                        alt={request.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {request.product.name}
                        </h3>
                      </div>
                    </a>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        request.status,
                      )}`}
                    >
                      <span>{formatStatus(request.status)}</span>
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
                        {request.requester.name}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Shield className="w-3 h-3 text-gray-400" />
                        <span
                          className={`font-medium ${getSecurityScoreColor(
                            request.requester.securityScore,
                          )}`}
                        >
                          {request.requester.securityScore.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-gray-500">(Renter)</span>
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

                {/* Mobile Card View */}
                <div className="lg:hidden p-4">
                  <div className="flex items-start gap-3">
                    <a href={`/product-details/${request.product.id}`}>
                      <img
                        src={
                          request.product.optimizedImages[0]
                            ? `${baseUrl}${request.product.optimizedImages[0]}`
                            : "https://via.placeholder.com/64"
                        }
                        alt={request.product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    </a>
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
                  <div className="border-t border-green-100 bg-green-50 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Contact Information */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Renter Contact Info
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name Phone:</span>
                            <span className="ml-2 font-medium">
                              {request.requester.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Renter Phone:</span>
                            <span className="ml-2 font-medium">
                              {request.renterPhoneNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Renter Email:</span>
                            <span className="ml-2 font-medium">
                              {request.requester.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Renter Email Validity:</span>
                            <span className="ml-2 font-medium">
                              {request.requester.isValidRuetMail ? "Valid" : "Invalid"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Owner Contact Info
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Owner Name:</span>
                            <span className="ml-2 font-medium">
                              {request.owner.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Owner Phone:</span>
                            <span className="ml-2 font-medium">
                              {request.ownerPhoneNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Owner Email:</span>
                            <span className="ml-2 font-medium">
                              {request.owner.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Owner Email Validity:</span>
                            <span className="ml-2 font-medium">
                              {request.owner.isValidRuetMail ? "Valid" : "Invalid"}
                            </span>
                          </div>
                        </div>
                      </div>


                      {/* Product Details */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Product Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <span className="ml-2 font-medium">
                              {request.product.productType.replace("_", " ")}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Condition:</span>
                            <span className="ml-2 font-medium">
                              {request.product.productCondition}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Age:</span>
                            <span className="ml-2 font-medium">
                              {request.product.productAge} years
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">OMV:</span>
                            <span className="ml-2 font-medium">
                              ৳{request.product.omv}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Second-hand Price:
                            </span>
                            <span className="ml-2 font-medium">
                              ৳{request.product.secondHandPrice}
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
                                  ৳{parseFloat(request.pricePerHour).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Cost:</span>
                                <span className="ml-2 font-medium text-green-600">
                                  ৳{(parseFloat(request.pricePerHour) * request.totalHours).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">BCC Paid:</span>
                                <span className="ml-2 font-medium">
                                  {request.paidWithBcc
                                    ? request.usedBccAmount + " BCC"
                                    : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">RCC Used:</span>
                                <span className="ml-2 font-medium">
                                  {request.paidWithRcc ? "Yes" : "No"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Coupon Used:</span>
                                <span className="ml-2 font-medium">
                                  {request.coupon ? request.coupon.code + `(${request.coupon.discount}%)` : "No Coupon Used"}
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
                                  ৳{(parseFloat(request.pricePerDay) || request.product.pricePerDay)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total Cost:</span>
                                <span className="ml-2 font-medium text-green-600">
                                  ৳{((parseFloat(request.pricePerDay) || request.product.pricePerDay) * request.totalDays).toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">BCC Paid:</span>
                                <span className="ml-2 font-medium">
                                  {request.paidWithBcc
                                    ? request.usedBccAmount + " BCC"
                                    : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">RCC Used:</span>
                                <span className="ml-2 font-medium">
                                  {request.paidWithRcc ? "Yes" : "No"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Coupon Used:</span>
                                <span className="ml-2 font-medium">
                                  {request.coupon ? request.coupon.code + `(${request.coupon.discount}%)` : "No Coupon Used"}
                                </span>
                              </div>
                            </div>
                          )
                        }
                      </div>
                      {/* RCC Details */}
                      {
                        request.paidWithRcc && (
                          <div className="bg-white rounded-lg col-span-2 p-4 border border-green-100 overflow-y-auto">
                            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Red Cache Credit Details
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {
                                request.rccUsageDetails.map((rccUsage) => (
                                  <a target="_blank" rel="noopener noreferrer" href={`/product-details/${rccUsage.redCacheCredit.sourceProduct.id}`} key={rccUsage.id}>
                                    <div className="bg-red-100 py-1 px-4 rounded-md flex justify-between items-center hover:scale-102 hover:shadow-xs transition-all duration-300 cursor-pointer border border-red-300">
                                      <div className="flex items-center gap-1 justify-center border border-red-100 p-0.5 rounded-md justify-self-start">
                                        <Box size={13} color="red" />
                                        <span className="font-semibold text-red-500">{rccUsage.redCacheCredit.sourceProduct.productSL.slice(0, 8)}</span>
                                        <span className="text-sm text-red-500">- {rccUsage.redCacheCredit.sourceProduct.productType}</span>
                                      </div>
                                      <span className="text-xs text-red-600">{rccUsage.redCacheCredit.amount}</span>
                                      <span className="text-xs text-red-600">{rccUsage.usedAmount}</span>
                                    </div>
                                  </a>
                                ))
                              }
                            </div>
                          </div>
                        )
                      }

                      {/* Collection/Return Details */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Collection
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Requested:</span>
                            <span className="ml-2 font-medium">
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Collection Method:
                            </span>
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
                                Pickup Terminal:
                              </span>
                              <span className="ml-2 font-medium">
                                {request.renterPickupTerminal.replace("_", " ")}
                              </span>
                            </div>
                          )}
                          {request.renterDeliveryAddress && (
                            <div>
                              <span className="text-gray-600">
                                Delivery Address:
                              </span>
                              <span className="ml-2 text-xs font-medium">
                                {request.renterDeliveryAddress}
                              </span>
                            </div>
                          )}
                          {/* <div>
                            <span className="text-gray-600">
                              Return Method:
                            </span>
                            <span className="ml-2 font-medium">
                              {request.renterReturnMethod === "BRITTOO_TERMINAL"
                                ? "Terminal Return"
                                : "Home Pickup"}
                            </span>
                          </div> */}
                          {request.renterReturnTerminal && (
                            <div>
                              <span className="text-gray-600">
                                Return Terminal:
                              </span>
                              <span className="ml-2 font-medium">
                                {request.renterReturnTerminal.replace("_", " ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Owner Submission Details */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Owner Submission
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">
                              Submit Method:
                            </span>
                            <span className="ml-2 font-medium">
                              {request.ownerSubmitMethod === "BRITTOO_TERMINAL"
                                ? "Terminal Drop-off"
                                : "Home Pickup"}
                            </span>
                          </div>
                          {request.ownerSubmitTerminal && (
                            <div>
                              <span className="text-gray-600">
                                Submit Terminal:
                              </span>
                              <span className="ml-2 font-medium">
                                {request.ownerSubmitTerminal.replace("_", " ")}
                              </span>
                            </div>
                          )}
                          {request.ownerSubmitAddress && (
                            <div>
                              <span className="text-gray-600">
                                Submit Address:
                              </span>
                              <span className="ml-2 text-xs font-medium">
                                {request.ownerSubmitAddress}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>


                      {/* Actions */}
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin Actions
                        </h4>
                        <div className="space-y-2">
                          <select
                            onChange={(e) =>
                              handleStatusUpdate(request.id, e.target.value)
                            }
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 text-sm"
                            disabled={
                              request.status === "REJECTED_FROM_BRITTOO"
                            }
                          >
                            <option value="">Update Status</option>
                            <option value="PRODUCT_SUBMITTED_BY_OWNER">
                              Submitted By Owner
                            </option>
                            <option value="PRODUCT_COLLECTED_BY_RENTER">
                              Collected By Renter
                            </option>
                            <option value="PRODUCT_RETURNED_BY_RENTER">
                              Returned From Renter
                            </option>
                            <option value="PRODUCT_RETURNED_TO_OWNER">
                              Returned to Owner
                            </option>
                          </select>
                          <button
                            onClick={() => {
                              const reason = prompt("Enter reject reason:");
                              if (reason) handleReject(request.id, reason);
                            }}
                            className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            disabled={
                              request.status === "REJECTED_FROM_BRITTOO"
                            }
                          >
                            Reject Request
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {(meta.page - 1) * meta.limit + 1} to{" "}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
            requests
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page === 1}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={meta.page === meta.totalPages}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRequestsDashboard;
