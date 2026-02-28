import { useState, useEffect } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  HashIcon,
  Info,
} from "lucide-react";
import api from "../../../lib/api";
import BCC from "../../../components/CacheCreditCard/BCC";
import RCC from "../../../components/CacheCreditCard/RCC";
import { Link } from "react-router-dom";
import Loader from "../../../components/shared/Loader";
import { BiMoneyWithdraw } from "react-icons/bi";
import useRequestWithdrawalModalStore from "../../../stores/creditModalStores/useRequestWithdrawalModalStore";
import MyWithdrawalRequests from "./MyWithdrawalRequests";
import { Tooltip } from "flowbite-react";

const MyCredits = () => {
  const [creditHistory, setCreditHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { openRequestWithdrawalModal } = useRequestWithdrawalModalStore();

  useEffect(() => {
    const fetchCreditHistory = async () => {
      try {
        const response = await api.get(
          "/api/v1/user-dashboard/credits/credit-history",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch Credits data");
        }
        setCreditHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditHistory();
  }, []);

  const refetchData = () => {
    setLoading(true);
    setError(null);
    const fetchCreditHistory = async () => {
      try {
        const response = await api.get(
          "/api/v1/user-dashboard/credits/credit-history",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch Credits data");
        }
        setCreditHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching Credits data:", error);
        setError(error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditHistory();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "RENT_DEPOSIT":
        return "text-blue-600";
      case "DEPOSIT_WITHDRAWAL":
        return "text-green-600";
      case "BONUS_CREDIT":
        return "text-emerald-500";
      case "PURCHASE_BCC":
        return "text-purple-500";
      case "MONEY_WITHDRAWAL":
        return "text-red-500";
      case "ADJUSTMENT":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  const getTransactionReference = (transaction) => {
    switch (transaction.transactionType) {
      case "RENT_DEPOSIT":
        return `RR-${transaction.rentalRequestId?.slice(0, 8) || "N/A"}`;
      case "DEPOSIT_REFUND":
        return `RR-${transaction.rentalRequestId?.slice(0, 8) || "N/A"}`;
      case "BONUS_CREDIT":
        return "BONUS";
      case "ADJUSTMENT":
        return "MANUAL";
      default:
        return "—";
    }
  };

  const getRentalRequestStatusColor = (status) => {
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

  const getRentalRequestStatusIcon = (status) => {
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            Error Loading Credits
          </h2>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={refetchData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!creditHistory) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 text-center">
            Unable to load Credits data at this time.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "bcc-transactions", label: "BCC Transactions" },
    { key: "withdrawal-requests", label: "Withdrawal Requests" },
    { key: "rcc-details", label: "RCC Details" },
    { key: "rcc-usage", label: "RCC Usage" }
  ];

  return (
    <div className="w-full max-w-full mx-auto p-3 sm:p-4 lg:p-6 min-h-screen bg-white overflow-x-hidden">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-3">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Credits Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your Blue Cache Credits and Red Cache Credits
            </p>
          </div>
          <button
            onClick={refetchData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Available BCC
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.availableBalance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Available RCC
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rcc?.availableAmount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Rentals
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rentals?.totalRentals || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Pending BCC
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.totalPendingBcc || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-200" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                In Use RCC
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rcc?.totalInUse || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-200" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                In Use BCC
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.lockedBalance || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Fixed to always wrap */}
      <div className="mb-4 sm:mb-6 overflow-x-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-1 sm:gap-2 lg:gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap ${activeTab === tab.key
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content Container - Fixed overflow issues */}
      <div className="w-full overflow-x-hidden">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex-1 pb-4">
              <div className="px-2 sm:px-3 md:px-5 mt-2">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                    🔵Available Blue Cache Credits
                  </h3>
                  <button
                    onClick={() =>
                      openRequestWithdrawalModal(
                        creditHistory?.bccWallet
                          ? {
                            bccWallet: creditHistory.bccWallet,
                            setCreditHistory,
                            creditHistory,
                          }
                          : {
                            bccWallet: {
                              availableBalance: 0,
                              lockedBalance: 0,
                            },
                            setCreditHistory,
                          },
                      )
                    }
                    className="py-1 px-3 sm:px-4 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:shadow-md cursor-pointer flex gap-1 items-center mt-2 sm:mt-0"
                  >
                    <span>Withdraw Money</span> <BiMoneyWithdraw />
                  </button>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-center">
                  <BCC
                    handleSelect={() => { }}
                    bccWallet={
                      creditHistory?.bccWallet || {
                        availableBalance: 0,
                        lockedBalance: 0,
                      }
                    }
                  />
                </div>
                <h3 className="mt-4 sm:mt-6 text-sm font-semibold text-center sm:text-left">
                  🔴Available Red Cache Credits
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 justify-center sm:justify-start">
                  {creditHistory?.redCacheCredits?.map((credit) => (
                    <RCC handleSelect={() => { }} key={credit.id} rcc={credit} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RCC Details Tab */}
        {activeTab === "rcc-details" && (
          <div className="w-full overflow-x-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Red Cache Credits Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source Product
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          In Use
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Hold Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {creditHistory?.redCacheCredits?.map((rcc) => (
                        <tr key={rcc.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-2 sm:py-4">
                            <div className="flex items-center max-w-36">
                              <Package className="w-4 h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                              <Link to={`/product-details/${rcc.sourceProduct.id}`} className="p-1 sm:p-2 border border-gray-200 rounded-lg w-full hover:scale-105 hover:bg-gray-200 hover:text-white transition-all duration-300 hover:ml-1 sm:ml-2 min-w-36">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                  {(rcc.sourceProduct.name).slice(0, 16)}..
                                </div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <div className="text-xs text-gray-500">
                                    {(rcc.sourceProduct.productSL).slice(0, 10) || "DEMOID"}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                              {rcc.amount}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            <span className="text-xs sm:text-sm text-gray-900">
                              {rcc.inUse}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            <span
                              className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${rcc.inUse > 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                                }`}
                            >
                              {rcc.inUse > 0 ? "On Hold" : "Not Hold"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "withdrawal-requests" && (
          <div className="w-full overflow-x-hidden">
            <MyWithdrawalRequests />
          </div>
        )}

        {/* BCC Transactions Tab */}
        {activeTab === "bcc-transactions" && (
          <div className="w-full overflow-x-hidden">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    BCC Transaction History
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Gateway
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Status
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {creditHistory?.bccTransactions?.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 sm:py-4">
                              <div className="min-w-0">
                                {["PURCHASE_BCC", "MONEY_WITHDRAWAL"].includes(
                                  transaction.transactionType,
                                ) ? (
                                  <span className="flex items-center gap-0.5 text-xs font-mono text-teal-600 break-all">
                                    <HashIcon size={12} className="flex-shrink-0" />
                                    <span className="truncate">{transaction.transactionId}</span>
                                  </span>
                                ) : transaction.rentalRequestId ? (
                                  <button className="text-xs text-purple-600 border py-0.5 px-2 rounded-lg border-purple-100 hover:bg-purple-500 hover:text-white transition-all">
                                    {getTransactionReference(transaction)}
                                  </button>
                                ) : (
                                  <button className="text-xs text-gray-600 border py-0.5 px-2 rounded-lg border-gray-100 hover:bg-gray-500 hover:text-white transition-all">
                                    RR-PENDING
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4">
                              <span
                                className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 ${getTransactionTypeColor(
                                  transaction.transactionType,
                                )} break-all`}
                              >
                                <span className="truncate">{transaction.transactionType}</span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {transaction.transactionType === "RENT_DEPOSIT" ||
                                  transaction.transactionType === "MONEY_WITHDRAWAL"
                                  ? "-"
                                  : "+"}
                                {transaction.amount}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                              <span
                                className={`text-xs sm:text-sm ${transaction.paymentGateway
                                  ? "text-gray-900"
                                  : "text-green-600"
                                  }`}
                              >
                                {transaction.paymentGateway || "BR_CIRC"}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                              <div className="flex items-center">
                                {getStatusIcon(transaction.status)}
                                <span
                                  className={`ml-1 sm:ml-2 text-xs sm:text-sm ${getStatusColor(
                                    transaction.status,
                                  )}`}
                                >
                                  {transaction.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {formatDate(transaction.createdAt)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RCC Usage Tab */}
        {activeTab === "rcc-usage" && (
          <div className="w-full overflow-x-hidden">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Credit Usage in Rentals
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            BCC Used
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            RCC Used
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Period
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {creditHistory?.rentalHistory?.map((rental) => (
                          <tr key={rental.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 sm:py-4">
                              <div className="flex items-center min-w-0">
                                <Package className="w-4 h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                                <Link
                                  to={`/product-details/${rental.product.id}`}
                                  className="p-1 sm:p-2 border border-gray-200 rounded-lg w-full hover:scale-105 hover:bg-gray-200 hover:text-white transition-all duration-300 hover:ml-1 sm:ml-2"
                                >
                                  <div className="text-xs sm:text-sm font-medium text-gray-900">
                                    {(rental.product.name || "Product").slice(0, 14)}...
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="text-xs text-gray-500">
                                      {(rental.product.productSL || "D123").slice(0, 4)}
                                    </div>
                                  </div>
                                </Link>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                              <span className="text-xs sm:text-sm text-gray-900">
                                {rental.totalDays} days
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {rental.usedBccAmount || 0}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="text-xs sm:text-sm text-gray-900 max-w-xs">
                                {rental.rccUsageDetails?.map((usage, index) => (
                                  <div key={index} className="mb-1">
                                    <span className="font-medium">
                                      {usage.usedAmount}
                                    </span>
                                    <span className="text-gray-500 ml-1 text-xs">
                                      (from{" "}
                                      {usage.redCacheCredit.sourceProduct.productSL})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap">
                              <div
                                className={`hidden sm:inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 lg:px-3 py-1 rounded-full text-xs font-medium border ${getRentalRequestStatusColor(
                                  rental.status,
                                )}`}
                              >
                                {getRentalRequestStatusIcon(rental.status)}
                                <span className="overflow-x-auto">
                                  {formatStatus(rental.status)}
                                </span>
                              </div>
                              <Tooltip
                                placement="top-start"
                                style="dark"
                                content={formatStatus(rental.status)}
                              >
                                <Info className="w-4 h-4 text-blue-500 sm:hidden" />
                              </Tooltip>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="text-xs sm:text-sm text-gray-900">
                                {formatDate(rental.rentalStartDate)} -{" "}
                                {formatDate(rental.rentalEndDate)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCredits;
