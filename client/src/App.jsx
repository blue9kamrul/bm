import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/shared/Navbar";
import RegisterModal from "./components/auth/RegisterModal";
import LoginModal from "./components/auth/LoginModal";
import Test from "./pages/Test";
import VerifyOTP from "./pages/VerifyOTP";
import VerifyUser from "./pages/VerifyUser";
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";
import DashboardLayout from "./pages/private/DashboardLayout";
import ListItems from "./pages/private/dash-pages/ListItems";
import Overview from "./pages/private/dash-pages/Overview";
import ManageItems from "./pages/private/dash-pages/ManageItems";
import UserAnalytics from "./pages/private/dash-pages/UserAnalytics";
import ProductDetails from "./components/ProductDetails";
import CreditModal from "./components/modals/CreditModal";
import BuyBccModal from "./components/modals/BuyBccModal";
import useBuyBccModalStore from "./stores/creditModalStores/useBuyBccModalStore";
import useUserStore from "./stores/authStores/useUserStore";
import BuyCredits from "./pages/BuyCredits";
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import AdminOverview from "./pages/admin/admin-dash-pages/AdminOverview";
import ManageUsers from "./pages/admin/admin-dash-pages/ManageUsers";
import AllProducts from "./pages/AllProducts";
import BlueCCRequests from "./pages/admin/admin-dash-pages/BlueCCRequests";
import useShowRccModalStore from "./stores/creditModalStores/useShowRccModalStore";
import ShowRccModal from "./components/modals/ShowRccModal";
import ConfirmRentalRequestModal from "./components/modals/ConfirmRentalRequestModal";
import Swal from "sweetalert2";
import PlacedRequests from "./pages/private/dash-pages/PlacedRequests";
import ReceivedRequests from "./pages/private/dash-pages/ReceivedRequests";
import MyCredits from "./pages/private/dash-pages/MyCredits";
import AdminDashUserDetails from "./pages/admin/admin-dash-pages/AdminDashUserDetails";
import WithdrawalRequests from "./pages/admin/admin-dash-pages/WithdrawalRequests";
import RequestWithdrawalModal from "./components/modals/RequestWithdrawalModal";
import ManageRentalRequestsAdmin from "./pages/admin/admin-dash-pages/ManageRentalRequestsAdmin";
import { useEffect, useState } from "react";
import Footer from "./components/shared/Footer";
import TermsAndConditions from "./pages/TermsAndConditions";
import ResetPasswordModal from "./components/auth/ResetPasswordModal";
import ResetPassword from "./components/auth/ResetPassword";
import ManageProducts from "./pages/admin/admin-dash-pages/ManageProducts";
import UpdateItemAdmin from "./pages/admin/admin-dash-pages/UpdateItemAdmin";
import ManageCoupons from "./pages/admin/admin-dash-pages/ManageCoupons";
import ScrollToTop from "./components/ScrollToTop";
import AdminManagePurchaseRequests from "./pages/admin/admin-dash-pages/AdminManagePurchaseRequests";
import ManagePlacedPurchaseRequests from "./pages/private/dash-pages/ManagePlacedPurchaseRequests";
import ManageReceivedPurchaseRequests from "./pages/private/dash-pages/ManageReceivedPurchaseRequests";
import IncomingChats from "./pages/private/dash-pages/IncomingChats";
import OutgoingChats from "./pages/private/dash-pages/OutgoingChats";
import AdminManageChats from "./pages/admin/admin-dash-pages/AdminManageChats";
import NegotiationHistory from "./pages/admin/admin-dash-pages/NegotiationHistory";
import ManageNotifications from "./pages/admin/admin-dash-pages/ManageNotifications";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, setCurrentUser } = useUserStore();
  const { isBuyBccModalOpen } = useBuyBccModalStore();
  const { isShowRccModalOpen } = useShowRccModalStore();
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState("");


  useEffect(() => {
    // Terminate session if JWT expires
    const loginDtStr = localStorage.getItem("login-dt");
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      localStorage.clear();
    } else if (token && loginDtStr) {
      const loginDT = new Date(loginDtStr);
      const now = new Date();
      const diff = now - loginDT;
      const diffInDays = diff / (1000 * 60 * 60 * 24);
      if (diffInDays >= 28) {
        setCurrentUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("login-dt");
        Swal.fire({
          title: "Session Terminated",
          text: "This session is expired. Login again to start renting",
          icon: "success",
        });
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    }
  }, [navigate, setCurrentUser])


  const noNavbarRoutes = [
    "/dashboard",
    "/verify-otp",
    "/verify-user",
    "/dashboard/admin",
    "/reset-password",
  ];
  const hideNavbar = noNavbarRoutes.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <>
      {!loading && !hideNavbar && <Navbar />}

      {/* Auth Modals */}
      <RegisterModal />
      <LoginModal />
      <ResetPasswordModal />

      {/* Credit Modals */}
      <CreditModal />
      <ConfirmRentalRequestModal />
      <RequestWithdrawalModal />
      <ScrollToTop />

      {isBuyBccModalOpen && <BuyBccModal />}
      {isShowRccModalOpen && <ShowRccModal />}

      <div className="overflow-x-hidden">
        <Routes>
          <Route
            path="/"
            element={
              <Home setProductType={setProductType} setSearch={setSearch} />
            }
          />
          <Route path="/test" element={<Test />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/verify-user" element={<VerifyUser />} />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/buy-credits" element={<BuyCredits />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/browse"
            element={
              <AllProducts
                productType={productType}
                setProductType={setProductType}
                search={search}
                setSearch={setSearch}
              />
            }
          />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/admin" element={<AdminDashboardLayout />}>
              <Route path="blue-cc-requests" element={<BlueCCRequests />} />
              <Route path="admin-overview" element={<AdminOverview />} />
              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="manage-products" element={<ManageProducts />} />
              <Route path="manage-coupons" element={<ManageCoupons />} />
              <Route path="update-item/:id" element={<UpdateItemAdmin />} />
              <Route
                path="user-details/:userId"
                element={<AdminDashUserDetails />}
              />
              <Route
                path="withdrawal-requests"
                element={<WithdrawalRequests />}
              />
              <Route
                path="manage-rental-requests"
                element={<ManageRentalRequestsAdmin />}
              />
              <Route
                path="manage-purchase-requests"
                element={<AdminManagePurchaseRequests />}
              />
              <Route
                path="manage-chats"
                element={<AdminManageChats />}
              />
              <Route
                path="negotiation-history"
                element={<NegotiationHistory />}
              />
              <Route
                path="manage-notifications"
                element={<ManageNotifications />}
              />
            </Route>
          </Route>

          {/* Private Routes (User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="overview" element={<Overview />} />
              <Route path="list-items" element={<ListItems />} />
              <Route path="manage-items" element={<ManageItems />} />
              <Route path="placed-requests" element={<PlacedRequests />} />
              <Route path="my-credits" element={<MyCredits />} />
              <Route path="received-requests" element={<ReceivedRequests />} />
              <Route path="user-analytics" element={<UserAnalytics />} />
              <Route path="incoming-chats" element={<IncomingChats />} />
              <Route path="outgoing-chats" element={<OutgoingChats />} />
              <Route path="placed-purchase-requests" element={<ManagePlacedPurchaseRequests />} />
              <Route path="received-purchase-requests" element={<ManageReceivedPurchaseRequests />} />
            </Route>
          </Route>
        </Routes>
      </div>
      {!loading && !hideNavbar && <Footer />}
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
