import Avatar from "boring-avatars";
import { Link, Outlet, useLocation } from "react-router-dom";
import useUserStore from "../../stores/authStores/useUserStore";
import brittoLogo from "../../assets/brittoo-logo.png";
import { IoExit, IoHomeSharp } from "react-icons/io5";
import { BiSolidCreditCardAlt } from "react-icons/bi";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import useDashDrawertore from "../../stores/drawerStores/useDashDrawerStore";
import { Bot, BoxesIcon, BoxIcon, FolderKanban, Menu, MonitorCog, Ticket, Users, X } from "lucide-react";
import { useEffect } from "react";
import { GiBellShield, GiReceiveMoney } from "react-icons/gi";

const AdminDashboardLayout = () => {
  const { currentUser } = useUserStore();
  const location = useLocation();
  const path = location.pathname;
  const { isDrawerOpen, openDrawer, closeDrawer } = useDashDrawertore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        openDrawer();
      } else {
        closeDrawer();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [closeDrawer, openDrawer]);




  return (
    <div className="relative flex min-h-screen overflow-x-scroll">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 md:w-80 bg-gray-100 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col justify-between`}
      >
        <div className="px-4 py-6 flex-1 flex flex-col">
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
          <hr className="w-full border-t border-gray-300 my-4 mx-auto" />

          <ul className="mt-6 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <li>
              <Link
                to="/dashboard/admin/admin-overview"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/admin-overview")
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
                to="/dashboard/admin/manage-rental-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-rental-requests")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <BoxIcon size={14} /> Manage Rental Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/manage-purchase-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-purchase-requests")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <FolderKanban size={13} /> Manage Purchase Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/blue-cc-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/blue-cc-requests")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <BiSolidCreditCardAlt /> Blue CC Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/withdrawal-requests"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/withdrawal-requests")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <GiReceiveMoney /> Withdrawal Requests
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/manage-users"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-users")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <Users size={13} /> Manage Users
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/manage-products"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-products")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <BoxesIcon size={14} /> Manage Products
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/manage-chats"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-chats")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <MonitorCog size={14} /> Manage Chats
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/negotiation-history"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/negotiation-history")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <Bot size={14} /> Negotiation History
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/manage-coupons"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-coupons")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <Ticket size={14} /> Manage Coupons
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/admin/manage-notifications"
                className={`block rounded-lg px-4 py-2 text-xs  hover:bg-green-500 hover:text-white transition-colors duration-200 ${path.includes("/manage-notifications")
                    ? "bg-green-600 text-white"
                    : "text-gray-700"
                  } flex items-center gap-2`}
                onClick={() => {
                  if (window.innerWidth <= 425) {
                    closeDrawer();
                  }
                }}
              >
                <GiBellShield size={14} /> Manage notifications
              </Link>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-100">
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
                onClick={closeDrawer}
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
                <strong className="block font-medium">{currentUser?.name}</strong>
                <span>{currentUser?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        className={`fixed bottom-4 left-4 z-50 p-3 md:p-3 rounded-full shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer bg-gray-100 border border-gray-200 ${isDrawerOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        aria-label="Open drawer"
        onClick={openDrawer}
      >
        <Menu className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-180 text-green-600" />
      </button>

      <div
        className={`flex-1 transition-all duration-300 ${isDrawerOpen ? "ml-0 md:ml-80 relative" : "ml-0"
          }`}
      >
        {
          (isDrawerOpen && window.innerWidth < 500) && <div className="absolute bg-black/50 opacity-80 h-full w-full"></div>
        }
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboardLayout;