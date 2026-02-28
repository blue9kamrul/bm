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
  CreditCard,
} from "lucide-react";
import api from "../../../lib/api";
import BCC from "../../../components/CacheCreditCard/BCC";
import RCC from "../../../components/CacheCreditCard/RCC";
import Loader from "../../../components/shared/Loader";
import { Link } from "react-router-dom";
import UserWithdrawalRequests from "./UserWithdrawalRequests";
import GiftCreditModal from "../admin-components/GiftCreditModal";

const UserCreditDetails = ({ userId }) => {
  const [creditHistory, setCreditHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGiftCreditModalOpen, setIsGiftCreditModalOpen] = useState(false);

  // Fetch Credits data from API
  useEffect(() => {
    const fetchCreditHistory = async () => {
      try {
        const response = await api.get(`/api/v1/users/admin/credit-history/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

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
  }, [userId]);

  const refetchData = () => {
    setLoading(true);
    setError(null);
    // Re-run the fetch effect
    const fetchCreditHistory = async () => {
      try {
        const response = await api.get(`/api/v1/users/admin/credit-history/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

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
      case "DEPOSIT_REFUND":
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
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Credits
          </h2>
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={refetchData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
      <div className="w-full justify-center items-center p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">
            Unable to load Credits data at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6  min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              User Credits Details
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGiftCreditModalOpen(true)}
              className="flex items-center px-4 py-2 text-xs bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Gift Credits
            </button>
            <button
              onClick={refetchData}
              className="flex items-center px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>

      <GiftCreditModal isGiftCreditModalOpen={isGiftCreditModalOpen} setIsGiftCreditModalOpen={setIsGiftCreditModalOpen} userId={userId} />

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Available BCC
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.availableBalance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available RCC</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rcc?.availableAmount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rentals?.totalRentals || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Pending BCC
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.totalPendingBcc || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-6 h-6 text-red-200" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Use RCC</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.rcc?.totalInUse || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-200" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Use BCC</p>
              <p className="text-2xl font-bold text-gray-900">
                {creditHistory?.summary?.bcc?.lockedBalance || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 justify-center sm:justify-start sm:space-x-8">
            {["overview", "bcc-transactions", "withdrawal-requests", "rcc-details", "rcc-usage"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize cursor-pointer ${activeTab === tab
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  {tab
                    .replace("-", " ")
                    .replace("rcc", "RCC")
                    .replace("bcc", "BCC")}
                </button>
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Credit Cards */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-3 md:px-5 mt-2">
              <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                🔵Available Blue Cache Credits
              </h3>
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
              <h3 className="mt-6 text-sm font-semibold text-center sm:text-left">
                🔴Available Red Cache Credits
              </h3>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-2 justify-self-center sm:justify-self-start">
                {creditHistory?.redCacheCredits?.map((credit) => (
                  <RCC handleSelect={() => { }} key={credit.id} rcc={credit} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rcc details tab */}
      {activeTab === "rcc-details" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Red Cache Credits Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In Use
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hold Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditHistory?.redCacheCredits?.map((rcc) => (
                  <tr key={rcc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <Link
                          to={`/product-details/${rcc.sourceProduct.id}`}
                          className="p-2 border border-gray-200 rounded-lg w-full hover:scale-105 hover:bg-gray-200 hover:text-white transition-all duration-300 hover:ml-2"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {rcc.sourceProduct.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="text-sm text-gray-500">
                              {rcc.sourceProduct.productSL}
                            </div>
                            <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                            <div className="text-xs text-gray-500">
                              BDT {rcc.sourceProduct.pricePerDay}/Day
                            </div>
                          </div>
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {rcc.amount}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{rcc.inUse}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rcc.inUse > 0
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
      )}

      {/* Transactions Tab */}
      {activeTab === "bcc-transactions" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                BCC Transaction History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditHistory?.bccTransactions?.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">
                          {["PURCHASE_BCC", "MONEY_WITHDRAWAL"].includes(
                            transaction.transactionType,
                          ) ? (
                            <span className="flex items-center gap-0.5 uppercase text-teal-600">
                              <HashIcon size={14} />
                              {transaction.transactionId}
                            </span>
                          ) : transaction.rentalRequestId ? (
                            <Link to={'/dashboard/placed-requests'} className="uppercase text-purple-600 border py-0.5 px-3 rounded-lg border-purple-100 hover:bg-purple-500 hover:text-white transition-all">
                              {getTransactionReference(transaction)}
                            </Link>
                          ) : (
                            <Link to={'/dashboard/placed-requests'} className="uppercase text-gray-600 border py-0.5 px-3 rounded-lg border-gray-100 hover:bg-gray-500 hover:text-white transition-all">RR-PENDING</Link>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 ${getTransactionTypeColor(
                            transaction.transactionType,
                          )}`}
                        >
                          {transaction.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.transactionType === "RENT_DEPOSIT" ||
                            transaction.transactionType === "MONEY_WITHDRAWAL"
                            ? "-"
                            : "+"}
                          {transaction.amount}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${transaction.paymentGateway
                              ? "text-gray-900"
                              : "text-green-600"
                            }`}
                        >
                          {transaction.paymentGateway || "BR_CIRC"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <span
                            className={`ml-2 text-sm ${getStatusColor(
                              transaction.status,
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
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
      )}

      {
        activeTab === "withdrawal-requests" &&
        (
          <div>
            <UserWithdrawalRequests userId={userId} />
          </div>
        )
      }

      {/* Usage Tab */}
      {activeTab === "rcc-usage" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Credit Usage in Rentals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BCC Used
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RCC Used
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditHistory?.rentalHistory?.map((rental) => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <Link
                            to={`/product-details/${rental.product.id}`}
                            className="p-2 border border-gray-200 rounded-lg w-full hover:scale-105 hover:bg-gray-200 hover:text-white transition-all duration-300 hover:ml-2"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              {rental.product.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="text-sm text-gray-500">
                                {rental.product.productSL}
                              </div>
                              <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                              <div className="text-xs text-gray-500">
                                BDT {rental.product.pricePerDay}/Day
                              </div>
                            </div>
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {rental.totalDays} days
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {rental.usedBccAmount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {rental.rccUsageDetails?.map((usage, index) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">
                                {usage.usedAmount}
                              </span>
                              <span className="text-gray-500 ml-1">
                                (from{" "}
                                {usage.redCacheCredit.sourceProduct.productSL})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRentalRequestStatusColor(
                            rental.status,
                          )}`}
                        >
                          {getRentalRequestStatusIcon(rental.status)}
                          <span className="hidden md:inline">
                            {formatStatus(rental.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
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
      )}
    </div>
  );
};

export default UserCreditDetails;
