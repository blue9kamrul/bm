import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  User,
  MapPin,
  Shield,
  FileText,
  History,
  CreditCard,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Wallet,
  Package,
  Star,
  BoxIcon,
} from "lucide-react";
import api from "../../../lib/api";
import UserCreditDetails from "./UserCreditDetails";
import UserPlacedRequests from "./UserPlacedRequests";
import UserReceivedRequests from "./UserReceivedRequests";
import Loader from "../../../components/shared/Loader";
import Swal from "sweetalert2";

const AdminDashUserDetails = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    setActionLoading(true);
    try {
      const response = await api.put(`/api/v1/users/verify/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.data.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error in verifying user."
        });
        return;
      }
      fetchUserDetails();
    } catch (error) {
      console.error("Error verifying user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    setActionLoading(true);
    try {
      const response = await api.put(`/api/v1/users/suspend/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.data.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error in suspending user."
        });
        return;
      }
      fetchUserDetails();
    } catch (error) {
      console.error("Error suspending user:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "SUSPENDED":
        return "text-red-600 bg-red-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSecurityScoreColor = (score) => {
    switch (score) {
      case "VERY_HIGH":
        return "text-green-700 bg-green-200";
      case "HIGH":
        return "text-green-600 bg-green-100";
      case "MID":
        return "text-yellow-600 bg-yellow-100";
      case "LOW":
        return "text-orange-600 bg-orange-100";
      case "VERY_LOW":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };
  const getSecurityScorePercentage = (score) => {
    switch (score) {
      case "VERY_HIGH":
        return 1;
      case "HIGH":
        return 0.8;
      case "MID":
        return 0.7;
      case "LOW":
        return 0.5;
      case "VERY_LOW":
        return 0.3;
      default:
        return 0.2;
    }
  };

  const getVerificationScore = () => {
    if (!userData) return 0;
    let score = 0;
    if (userData.documentStatus.hasSelfie) score += 35;
    if (userData.documentStatus.hasIdCardFront) score += 40;
    if (userData.locationInfo.hasLocation) score += 25;
    score = score * getSecurityScorePercentage(userData.user.securityScore);
    return score;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "security", label: "Security", icon: Shield },
    { id: "placed-requests", label: "Placed Requests", icon: History },
    { id: "received-requests", label: "Received Requests", icon: BoxIcon },
    { id: "credits", label: "Credit History", icon: CreditCard },
  ];

  if (loading) {
    return (
      <Loader />
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  const {
    user,
    walletSummary,
    creditSummary,
    locationInfo,
    documentStatus,
    stats,
  } = userData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        {/* Header */}
        <div className="mb-8">
          <Link
            to={"/dashboard/admin/manage-users"}
            className="text-green-600 hover:text-green-700 font-medium mb-4 flex items-center"
          >
            ← Back to Users
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {user.name}
                  {user.brittooVerified && (
                    <ShieldCheck className="h-6 w-6 text-blue-500 ml-2" />
                  )}
                </h1>
                <p className="text-gray-600 text-sm">
                  {user.email} • {user.roll}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {user.isVerified !== "VERIFIED" && (
                <button
                  onClick={handleVerifyUser}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-xs cursor-pointer hover:shadow-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Verify User</span>
                </button>
              )}
              <div className="flex space-x-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs cursor-pointer hover:shadow-sm rounded-lg flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Brittoo Verify</span>
                </button>
                <button
                  onClick={handleSuspendUser}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-xs cursor-pointer hover:shadow-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <UserX className="h-4 w-4" />
                  <span>Suspend User</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Wallet className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-600">Blue Credits</p>
                <p className="text-xl font-bold text-gray-600 mt-0.5">
                  {walletSummary.totalBalance} BCC
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-600">Red Credits</p>
                <p className="text-xl font-bold text-gray-600 mt-0.5">
                  {creditSummary.availableRedCredits}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Products Rented</p>
                <p className="text-xl font-bold text-gray-600 mt-0.5">
                  {stats.totalProductsRented}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Security Score</p>
                <span className="text-xl font-bold text-gray-600 mt-0.5">
                  {getVerificationScore()}%
                  <span
                    className={`text-sm ml-2 ${getSecurityScoreColor(
                      user.securityScore,
                    )}`}
                  >
                    ({user.securityScore})
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex cursor-pointer items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-medium">{user.role}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Verification Status:
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          user.isVerified,
                        )}`}
                      >
                        {user.isVerified}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Security Score:</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getSecurityScoreColor(
                          user.securityScore,
                        )}`}
                      >
                        {user.securityScore}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email Verified:</span>
                      <span
                        className={
                          user.emailVerified ? "text-green-600" : "text-red-600"
                        }
                      >
                        {user.emailVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Institutional Mail</span>
                      <span
                        className={
                          user.isValidRuetMail ? "text-green-600" : "text-red-600"
                        }
                      >
                        {user.isValidRuetMail ? "Valid" : "Invalid"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Brittoo Verified:</span>
                      <span
                        className={
                          user.brittooVerified
                            ? "text-blue-600"
                            : "text-gray-600"
                        }
                      >
                        {user.brittooVerified ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Suspension Count:</span>
                      <span
                        className={
                          user.isSuspended ? "text-red-600" : "text-green-600"
                        }
                      >
                        {user.suspensionCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Join Date:</span>
                      <span className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location & Network
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-mono text-sm">
                        {user.ipAddress || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-mono text-sm">
                        {user.latitude || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-mono text-sm">
                        {user.longitude || "N/A"}
                      </span>
                    </div>
                    {user.latitude && user.longitude && (
                      <div className="mt-4">
                        <a
                          href={`https://maps.google.com/?q=${user.latitude},${user.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          View on Google Maps →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Document Verification
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      documentStatus.documentsComplete
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {documentStatus.documentsComplete
                      ? "Complete"
                      : "Incomplete"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Selfie</h4>
                      {documentStatus.hasSelfie ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    {documentStatus.hasSelfie && (
                      <div className="aspect-square rounded-lg flex items-center justify-center">
                        <img
                          src={`${baseUrl}${user.selfie}`}
                          alt="Selfie"
                          className="max-w-full max-h-full rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">ID Card Front</h4>
                      {documentStatus.hasIdCardFront ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    {documentStatus.hasIdCardFront && (
                      <div className="aspect-video rounded-lg flex items-center justify-center">
                        <img
                          src={`${baseUrl}${user.idCardFront}`}
                          alt="ID Front"
                          className="max-w-full max-h-full rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">ID Card Back</h4>
                      {documentStatus.hasIdCardBack ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    {documentStatus.hasIdCardBack && (
                      <div className="aspect-video rounded-lg flex items-center justify-center">
                        <img
                          src={`${baseUrl}${user.idCardBack}`}
                          alt="ID Back"
                          className="max-w-full max-h-full rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Security Score
                </h3>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium">
                      Overall Security Score
                    </span>
                    <span className="text-2xl font-bold">
                      {getVerificationScore()}%
                      <span
                        className={`text-sm ml-2 ${getSecurityScoreColor(
                          user.securityScore,
                        )}`}
                      >
                        ({user.securityScore})
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getVerificationScore()}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Verification Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Selfie Uploaded</span>
                        {documentStatus.hasSelfie ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ID Card Front</span>
                        {documentStatus.hasIdCardFront ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">ID Card Back</span>
                        {documentStatus.hasIdCardBack ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Phone Verified</span>
                        {user.phoneVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">
                          Location Available
                        </span>
                        {locationInfo.hasLocation ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Account Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Email Verified</span>
                        {user.emailVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account Status</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            user.status,
                          )}`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "placed-requests" && (
              <div>
                <UserPlacedRequests userId={userId} />
              </div>
            )}
            {activeTab === "received-requests" && (
              <div>
                <UserReceivedRequests userId={userId} />
              </div>
            )}

            {activeTab === "credits" && (
              <div>
                <UserCreditDetails userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashUserDetails;
