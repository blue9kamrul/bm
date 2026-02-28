import { useState, useEffect } from "react";
import {
  Search,
  Check,
  X,
  Clock,
  User,
  CreditCard,
  Calendar,
  Hash,
} from "lucide-react";
import api from "../../../lib/api";
import Swal from "sweetalert2";

const BlueCCRequests = () => {
  const [creditRequests, setCreditRequests] = useState([]);
  const [searchTxnId, setSearchTxnId] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchPendingBcc = async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/v1/credit/bcc/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.data.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message || "Something went wrong",
        });
        return null;
      }
      console.log(res);
      setCreditRequests(res.data.data);
      setFilteredRequests(res.data.data);
    };
    fetchPendingBcc();
  }, []);

  useEffect(() => {
    if (searchTxnId.trim() === "") {
      setFilteredRequests(creditRequests);
    } else {
      const filtered = creditRequests.filter((request) =>
        request.transactionId
          ?.toLowerCase()
          .includes(searchTxnId.toLowerCase()),
      );
      setFilteredRequests(filtered);
    }
  }, [searchTxnId, creditRequests]);

  const handleAccept = async (request) => {
    const creditId = request.id;
    Swal.fire({
      title: "Accepting BCC req for trxId:",
      text: `#${request.transactionId}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Abort",
      confirmButtonText: "Accept!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessingId(creditId);
        try {
          const token = localStorage.getItem("token");
          const res = await api.post(
            `/api/v1/credit/bcc/accept/${creditId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (!res.data.success) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: res.data.message || "Something went wrong",
            });
            return null;
          }
          setCreditRequests((prev) =>
            prev.map((request) =>
              request.id === creditId
                ? { ...request, isActive: true }
                : request,
            ),
          );
          setTimeout(() => {
            setCreditRequests((prev) =>
              prev.filter((request) => request.id !== creditId),
            );
          }, 300);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: res.data.message || "Accepted Successfully",
          });
        } catch (error) {
          console.error("Error accepting credit request:", error);
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleReject = async (creditId) => {
    setProcessingId(creditId);
    try {
      const token = localStorage.getItem("token");

      const { value: formValues } = await Swal.fire({
        html: `
      <div style="padding: 0 10px; box-sizing: border-box;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; text-align: left; font-weight: 500; margin-bottom: 8px; color: #374151;" for="swal-input1">
            Withdrawal Transaction ID
          </label>
          <input 
            id="swal-input1" 
            class="swal2-input" 
            style="width: 100%; margin: 0; padding: 8px 12px; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 4px;" 
            placeholder="Enter transaction ID"
          />
        </div>
        
        <div style="margin-bottom: 10px;">
          <label style="display: block; text-align: left; font-weight: 500; margin-bottom: 8px; color: #374151;" for="swal-input2">
            Reject Reason
          </label>
          <textarea 
            id="swal-input2" 
            class="swal2-textarea" 
            style="width: 100%; height: 80px; margin: 0; padding: 8px 12px; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 4px; resize: vertical;" 
            placeholder="Enter reason for rejection"
          ></textarea>
        </div>
      </div>
    `,
        width: "500px",
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Reject",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          const trxId = document.getElementById("swal-input1").value.trim();
          const reason = document.getElementById("swal-input2").value.trim();

          if (!trxId || !reason) {
            Swal.showValidationMessage("Both fields are required");
            return false;
          }

          return [trxId, reason];
        },
      });

      if (formValues) {
        const res = await api.put(
          `/api/v1/credit/bcc/reject/${creditId}`,
          {
            withdrawalTrxId: formValues[0],
            rejectReason: formValues[1],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.data.success) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res.data.message || "Something went wrong",
          });
          return null;
        }
        Swal.fire({
          icon: "success",
          title: "Rejected",
        });
        setCreditRequests((prev) =>
          prev.filter((request) => request.id !== creditId),
        );
      }
    } catch (error) {
      console.error("Error rejecting credit request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getPaymentGatewayColor = (gateway) => {
    switch (gateway) {
      case "BKASH":
        return "bg-pink-100 text-pink-800";
      case "NAGAD":
        return "bg-orange-100 text-orange-800";
      case "ROCKET":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Credit Requests
          </h1>
          <p className="text-gray-600">Manage pending cache credit requests</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Transaction ID..."
                value={searchTxnId}
                onChange={(e) => setSearchTxnId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{filteredRequests.length} pending requests</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending requests
              </h3>
              <p className="text-gray-500">
                {searchTxnId
                  ? "No requests match your search criteria."
                  : "All credit requests have been processed."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              BDT {request.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentGatewayColor(
                              request.paymentGateway,
                            )}`}
                          >
                            {request.paymentGateway}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-mono text-gray-900">
                            {request.transactionId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>
                              {request.numberUsedInTrx}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAccept(request)}
                            disabled={processingId === request.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={processingId === request.id}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </button>
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
    </div>
  );
};

export default BlueCCRequests;
