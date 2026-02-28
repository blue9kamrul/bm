import Avatar from "boring-avatars";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import useUserStore from "../../stores/authStores/useUserStore";
import brittoLogo from "../../assets/brittoo-logo.png";
import { IoAnalytics, IoExit, IoHomeSharp } from "react-icons/io5";
import {
  MdOutlineManageHistory,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import useDashDrawertore from "../../stores/drawerStores/useDashDrawerStore";
import { ListCheck, Menu, MessageCircle, PackageCheck, Send, ShoppingCart, X } from "lucide-react";
import { AiOutlineProduct } from "react-icons/ai";
import { useEffect } from "react";
import { FaShoppingCart, FaUserCog } from "react-icons/fa";
import useShowRccModalStore from "../../stores/creditModalStores/useShowRccModalStore";
import Swal from "sweetalert2";
import { BiCreditCard } from "react-icons/bi";
import useRequestWithdrawalStore from "../../stores/creditModalStores/useRequestWithdrawalModalStore";

const DashboardLayout = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { isDrawerOpen, openDrawer, closeDrawer } = useDashDrawertore();
  const { isShowRccModalOpen } = useShowRccModalStore();
  const { isRequestWithdrawalModalOpen } = useRequestWithdrawalStore();

  useEffect(() => {
    if (isShowRccModalOpen || isRequestWithdrawalModalOpen) {
      closeDrawer();
    }
  }, [closeDrawer, isRequestWithdrawalModalOpen, isShowRccModalOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && !isShowRccModalOpen && !isRequestWithdrawalModalOpen) {
        openDrawer();
      } else {
        closeDrawer();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [closeDrawer, isShowRccModalOpen, isRequestWithdrawalModalOpen, openDrawer]);

  const handleLogOut = () => {
    Swal.fire({
      title: "Logging Out?",
      text: "Your first year study group lasted longer than this session",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes! Take me outta this shit",
      cancelButtonText: "Let me rot a little longer",
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("login-dt");
        sessionStorage.removeItem("hasFetchedUser");
        Swal.fire({
          title: "Session Terminated",
          text: "Unlike your CG, this completed successfully.",
          icon: "success",
        });
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        closeDrawer(false);
      }
    });
  };

  return (
    <div className="relative flex min-h-screen">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-3/4 md:w-80 bg-gray-100 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col`}
      >
        {/* Fixed Header */}
        <div className="px-4 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Link to="/" onClick={closeDrawer}>
              <img
                src={brittoLogo}
                className="h-8 md:h-10 object-contain"
                alt="Britto"
              />
            </Link>
            <button
              className="group cursor-pointer p-2 lg:hidden"
              onClick={closeDrawer}
              aria-label="Close drawer"
            >
              <X className="w-6 h-6 transition-transform duration-300 hover:scale-110 text-red-600 group-hover:rotate-180" />
            </button>
          </div>
          <hr className="w-full border-t border-gray-300 mt-2 mb-0 mx-auto" />
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
          <ul className="space-y-2 pb-4">
            <li>
              <Link
                to="/dashboard/overview"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/overview")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <MdOutlineSpaceDashboard /> Overview
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/list-items"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/list-items")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <AiOutlineProduct /> List Items
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/manage-items"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-items")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <MdOutlineManageHistory /> Manage Listed Items
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/placed-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/placed-requests")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <FaShoppingCart /> My Placed Rental Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/received-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/received-requests")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <ListCheck size={16} /> Received Rental Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/received-purchase-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/received-purchase-requests")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <PackageCheck size={16} /> Received Purchase Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/placed-purchase-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/placed-purchase-requests")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <ShoppingCart size={16} /> Placed Purchase Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/my-credits"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/my-credits")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <BiCreditCard size={16} /> My Credits
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/incoming-chats"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/incoming-chats")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <MessageCircle size={16} /> Incoming Chats
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/outgoing-chats"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/outgoing-chats")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <Send size={16} /> Outgoing Chats
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/user-analytics"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/user-analytics")
                  ? "bg-green-600 text-white"
                  : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <IoAnalytics /> Analytics
              </Link>
            </li>
          </ul>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-100 flex-shrink-0">
          <ul className="px-4 py-2">
            <li>
              <Link
                to="/"
                className={`rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 flex items-center gap-2 text-gray-700`}
                onClick={closeDrawer}
              >
                <IoHomeSharp /> Home
              </Link>
            </li>
            <li>
              <button
                className={`w-full text-left rounded-lg px-4 py-2 text-xs  hover:bg-red-500 hover:text-white transition-colors duration-200 text-red-600 flex items-center gap-2`}
                onClick={handleLogOut}
              >
                <IoExit /> Logout
              </button>
            </li>
          </ul>
          <div className="flex items-center gap-2 bg-gray-200 p-4">
            <Avatar
              name={currentUser.email}
              colors={["#482344", "#2b5166", "#429867", "#fab243", "#e02130"]}
              variant="beam"
              size={35}
              className="cursor-pointer"
            />
            <div>
              <p className="text-xs">
                <strong className="block font-medium">
                  {currentUser?.name}
                </strong>
                <span>{currentUser?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        className={`fixed bottom-4 left-4 z-50 p-4 rounded-full 
    shadow-md hover:shadow-2xl transition-all duration-400 
    group cursor-pointer bg-emerald-500 
    ${isDrawerOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label="Open drawer"
        onClick={openDrawer}
      >
        <Menu className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180 text-white animate-pulse" />
      </button>


      <div
        className={`flex-1 transition-all duration-300 ${isDrawerOpen ? "ml-0 md:ml-80 relative" : "ml-0"
          }`}
      >
        {isDrawerOpen && window.innerWidth < 500 && (
          <div className="absolute bg-black/50 opacity-80 h-full w-full"></div>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;