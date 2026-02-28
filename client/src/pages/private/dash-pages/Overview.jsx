import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Shield,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../../../lib/api";

const Overview = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserOverview();
  }, []);

  const fetchUserOverview = async () => {
    try {
      const response = await api.get("/api/v1/user-dashboard/overview", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.data.success) throw new Error("Failed to fetch user data");
      setUserData(response.data.data);
    } catch (err) {
      console.log(err);
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "VALID":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "INVALID":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getSecurityScoreColor = (score) => {
    const colors = {
      VERY_HIGH: "text-green-600 bg-green-50",
      HIGH: "text-green-500 bg-green-50",
      MID: "text-yellow-600 bg-yellow-50",
      LOW: "text-red-500 bg-red-50",
      VERY_LOW: "text-red-600 bg-red-50",
    };
    return colors[score] || colors.MID;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">Welcome back, {userData.user.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200/70 p-6 border-l-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">BCC Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {userData.wallet?.availableBalance}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200/70 p-6 border-l-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Rentals
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {userData.stats.activeRentals}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200/70 p-6 border-l-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Products Listed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {userData.stats.productsListed}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200/70 p-6 border-l-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RCC Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {userData.stats.totalRccCredits}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200/70 p-6">
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Status
              </h2>
            </div>
            {userData?.user.isVerified === "UNVERIFIED" && (
              <Link to={"/verify-user"}>
                <p className="text-green-500 underline text-sm">
                  Verify yourself
                </p>
              </Link>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Verification</span>
              <div className="flex items-center gap-2">
                {getVerificationBadge(
                  userData.user.emailVerified ? "VERIFIED" : "UNVERIFIED",
                )}
                <span className="text-sm font-medium">
                  {userData.user.emailVerified ? <span>Verified</span> : <span className="">Unverified</span>}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Institutional Email Validity</span>
              <div className="flex items-center gap-2">
                {getVerificationBadge(
                  userData.user.isValidRuetMail ? "VALID" : "INVALID",
                )}
                <span className={`text-sm font-medium ${!userData.user.isValidRuetMail && "text-red-500"}`}>
                  {userData.user.isValidRuetMail ? "Valid" : "Invalid"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Verification Status</span>
              <div className="flex items-center gap-2">
                {getVerificationBadge(userData.user.isVerified)}
                <span className="text-sm font-medium capitalize">
                  {userData.user.isVerified.toLowerCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Security Score</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getSecurityScoreColor(
                  userData.user.securityScore,
                )}`}
              >
                {userData.user.securityScore.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Suspension Count</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium`}>
                {userData.user.suspensionCount}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200/70 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="space-y-3">
            {userData.recentActivity.length > 0 ? (
              userData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200/70 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>

          <div className="flex flex-col gap-3 text-center">
            <Link
              to={"/dashboard/list-items"}
              className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              List New Product
            </Link>
            <Link
              to={"/browse"}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              Browse Products
            </Link>
            <Link
              to={"/buy-credits"}
              className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg transition-colors text-sm font-medium"
            >
              Buy Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
