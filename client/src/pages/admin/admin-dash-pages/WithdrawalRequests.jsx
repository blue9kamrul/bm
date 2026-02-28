import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Info, X } from "lucide-react";

const WithdrawalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [statusFilter, setStatusFilter] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectReason, setShowRejectReason] = useState("");

  const fetchRequests = async () => {
    try {
      const response = await api.get("/api/v1/withdrawal-requests/admin", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter,
          phoneNumber: phoneSearch,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRequests(response.data.data);
      setPagination((prev) => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, statusFilter, phoneSearch]);

  const handleComplete = async (id) => {
    try {
      await api.put(
        `/api/v1/withdrawal-requests/${id}/complete`,
        { transactionId, numberUsedInTrx: phoneNumber },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setTransactionId("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error completing withdrawal:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(
        `/api/v1/withdrawal-requests/${id}/reject`,
        { rejectReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRejectReason("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Withdrawal Requests
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by phone number"
          className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
          value={phoneSearch}
          onChange={(e) => setPhoneSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm font-medium">
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Wallet Balance</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Gateway</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 text-gray-800">{request.user.name}</td>
                <td className="p-3 text-gray-800">
                  {request.wallet.availableBalance}
                </td>
                <td className="p-3 text-gray-600">{request.phoneNumber}</td>
                <td className="p-3 text-gray-800">
                  {request.withdrawalAmount}
                </td>
                <td className="p-3 text-gray-600">{request.paymentGateway}</td>
                <td className="p-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : request.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {request.status}
                  </span>
                  {request.status === "REJECTED" && (
                    <Info
                      onClick={() => setShowRejectReason(request.rejectReason)}
                      className="cursor-pointer hover:scale-105 hover:shadow-md rounded-full"
                      color="blue"
                      size={15}
                    />
                  )}
                </td>
                <td className="p-3">
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        onClick={() =>
                          setSelectedRequest({
                            id: request.id,
                            action: "complete",
                          })
                        }
                      >
                        Complete
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        onClick={() =>
                          setSelectedRequest({
                            id: request.id,
                            action: "reject",
                          })
                        }
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-gray-700">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          disabled={pagination.page === 1}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
        >
          Previous
        </button>
        <span className="text-sm">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          disabled={pagination.page === pagination.totalPages}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
        >
          Next
        </button>
      </div>

      {/* Modal for Complete/Reject */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRequest.action === "complete"
                ? "Complete Withdrawal"
                : "Reject Withdrawal"}
            </h2>
            {selectedRequest.action === "complete" ? (
              <div>
                <input
                  type="text"
                  placeholder="Enter Phone Number"
                  className="w-full px-3 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Enter Transaction ID"
                  className="w-full px-3 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            ) : (
              <textarea
                placeholder="Enter reject reason"
                className="w-full px-3 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() =>
                  selectedRequest.action === "complete"
                    ? handleComplete(selectedRequest.id)
                    : handleReject(selectedRequest.id)
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showRejectReason && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Reason
              </h2>
              <X
                size={18}
                color="red"
                className="hover:scale-105 cursor-pointer"
                onClick={() => setShowRejectReason("")}
              />
            </div>
            <p className="text-sm text-gray-600">{showRejectReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;
