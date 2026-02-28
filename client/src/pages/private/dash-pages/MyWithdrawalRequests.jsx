import { useState, useEffect } from "react";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  X,
} from "lucide-react";
import api from "../../../lib/api";
import Swal from "sweetalert2";
import Loader from "../../../components/shared/Loader";

const MyWithdrawalRequests = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showRejectReason, setShowRejectReason] = useState("");

  console.log(withdrawalRequests)

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  useEffect(() => {
    if (filter === "PENDING") {
      setFilteredRequests(
        withdrawalRequests.filter((request) => request.status === "PENDING"),
      );
    } else if (filter === "COMPLETED") {
      setFilteredRequests(
        withdrawalRequests.filter((request) => request.status === "COMPLETED"),
      );
    } else if (filter === "REJECTED") {
      setFilteredRequests(
        withdrawalRequests.filter((request) => request.status === "REJECTED"),
      );
    } else {
      setFilteredRequests(withdrawalRequests);
    }
  }, [filter, withdrawalRequests]);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/withdrawal-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "OOPS!!",
          text: "Error in fetching requests",
        });
      }
      setWithdrawalRequests(res.data.data);
      setFilteredRequests(res.data.data);
    } catch (err) {
      console.error("Error fetching withdrawal requests:", err);
      Swal.fire({
        icon: "error",
        title: "OOPS!!",
        text: err.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 sm:px-3 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Withdrawal Requests
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Track your withdrawal requests and their status
              </p>
            </div>
            <button
              onClick={fetchWithdrawalRequests}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base mt-4 sm:mt-0"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
                <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {
                    withdrawalRequests.filter((r) => r.status === "PENDING")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {
                    withdrawalRequests.filter((r) => r.status === "COMPLETED")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                <XCircle className="w-5 sm:w-6 h-5 sm:h-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {
                    withdrawalRequests.filter((r) => r.status === "REJECTED")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="mt-4 sm:mt-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 sm:px-6 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
          {filteredRequests.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <AlertCircle className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-base sm:text-lg">
                No withdrawal requests found
              </p>
              <p className="text-xs sm:text-sm mt-1">
                Your withdrawal requests will appear here once you make them.
              </p>
            </div>
          ) : (
            <div
              className="overflow-x-auto"
              style={{ overflowX: "auto", touchAction: "pan-x" }}
            >
              <table className="w-full min-w-[320px] sm:min-w-[480px] md:min-w-[640px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Gateway
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Phone Number
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Refund Phone No.
                    </th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Requested At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900">
                          {request.withdrawalAmount}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {request.paymentGateway}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {request.phoneNumber}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                          {request.status === "REJECTED" && (
                            <Info
                              onClick={() =>
                                setShowRejectReason(request.rejectReason)
                              }
                              className="cursor-pointer hover:scale-105 hover:shadow-md rounded-full"
                              color="blue"
                              size={15}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {
                            request.status === "COMPLETED" ? request?.bccTransaction?.numberUsedInTrx : "N/A"
                          }
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-xs sm:text-sm text-gray-900">
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showRejectReason && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Reason
              </h2>
              <X size={18} color="red" className="hover:scale-105 cursor-pointer" onClick={() => setShowRejectReason("")} />
            </div>
            <p className="text-sm text-gray-600">{showRejectReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWithdrawalRequests;
