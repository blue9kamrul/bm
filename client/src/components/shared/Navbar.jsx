import { Link, NavLink, useNavigate } from "react-router-dom";
import brittoLogo from "../../assets/brittoo-logo.png";
import { IoLogOut } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { useEffect, useState, useRef } from "react";
import Avatar from "boring-avatars";
import Swal from "sweetalert2";
import useRegModalStore from "../../stores/authStores/useRegModalStore";
import useLoginModalStore from "../../stores/authStores/useLoginModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import api from "../../lib/api";
import { Bell, Coins, CreditCard, ExternalLink, X } from "lucide-react";

const Navbar = () => {
  const menuClassname =
    "block rounded-lg px-4 py-2 text-xs md:text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700";
  const [isUserDropDownOpen, setIsUserDropDownOpen] = useState(false);
  const [isHamMenuOpen, setIsHamMenuOpen] = useState(false);
  const { openRegModal } = useRegModalStore();
  const { openLoginModal } = useLoginModalStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [totalCredits, setTotalCredits] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
    };

    if (showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationDropdown]);

  const fetchNotifications = async () => {
    const res = await api.get('/api/v1/notifications');
    setNotifications(res.data.data);
    setUnreadCount(res.data.data.filter(n => !n.isRead).length);
  };

  const handleClick = async () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    if (!showNotificationDropdown && unreadCount > 0) {
      for (const n of notifications.filter(n => !n.isRead)) {
        await api.put(`/api/v1/notifications/${n.id}/read`);
      }
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationDropdown(false);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return 'just now';
  };

  useEffect(() => {
    const fetchUserTotalCredits = async () => {
      try {
        const res = await api.get("/api/v1/users/total-credits", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.data.success) {
          setTotalCredits({
            totalAvailableBcc: 0,
            totalAvailableRcc: 0,
          });
          return;
        }
        setTotalCredits(res.data.data);
      } catch (error) {
        console.log("Error in fetching user total credits: ", error);
      }
    };
    if (currentUser) {
      fetchUserTotalCredits();
    }
  }, [currentUser]);

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
        setIsUserDropDownOpen(false);
        Swal.fire({
          title: "Session Terminated",
          text: "Unlike your CG, this completed successfully.",
          icon: "success",
        });
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        setIsUserDropDownOpen(false);
      }
    });
  };

  return (
    <>
      <header className="bg-white shadow-md z-10 relative">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 md:h-16 items-center justify-between">
            <div className="flex-1 md:flex md:items-center md:gap-12">
              <Link to={"/"}>
                <img
                  src={brittoLogo}
                  className="h-8 md:h-10 object-contain"
                  alt="Britto"
                />
              </Link>
            </div>

            <div className="md:flex md:items-center md:gap-6">
              <nav className="hidden md:block">
                <div className="flex items-center gap-6 text-sm">
                  <NavLink
                    to="/"
                    className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/browse"
                    className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                  >
                    Browse Items
                  </NavLink>
                  <NavLink
                    to="/buy-credits"
                    className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                  >
                    Buy Credits
                  </NavLink>
                  <NavLink
                    to="/dashboard/overview"
                    className="text-gray-600 text-[16px] cursor-pointer hover:text-green-500"
                  >
                    Dashboard
                  </NavLink>
                </div>
              </nav>

              {currentUser ? (
                <div className="flex items-center gap-3 sm:gap-6 mr-2.5 sm:mr-0">
                  <div className="flex items-center gap-2 md:gap-4 bg-gray-50 rounded-full px-3 py-2 border border-gray-200">
                    <div className="flex items-center gap-1">
                      <div className="sm:w-6 sm:h-6 w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <Coins className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-600 hidden sm:inline">
                        {totalCredits?.totalAvailableBcc || 0}
                      </span>
                      <span className="text-xs font-medium text-blue-600 sm:hidden">
                        {totalCredits?.totalAvailableBcc || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <div className="sm:w-6 sm:h-6 w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-3 h-3 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-red-600 hidden sm:inline">
                        {totalCredits?.totalAvailableRcc || 0}
                      </span>
                      <span className="text-xs font-medium text-red-600 sm:hidden">
                        {totalCredits?.totalAvailableRcc || 0}
                      </span>
                    </div>
                  </div>

                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={handleClick}
                      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Bell size={22} className="text-gray-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotificationDropdown && (
                      <div className="fixed md:absolute right-2 left-2 md:right-0 md:left-auto mt-2 md:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 flex items-center justify-between">
                          <h3 className="text-white font-semibold text-sm md:text-base">Notifications</h3>
                          {notifications.length > 0 && (
                            <span className="text-white text-xs bg-white/20 px-2 py-1 rounded-full">
                              {notifications.length}
                            </span>
                          )}
                        </div>

                        <div className="max-h-[70vh] md:max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                              <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map(n => {
                                const content = (
                                  <div className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-green-50/50' : ''}`}>
                                    <div className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${!n.isRead ? 'bg-green-500' : 'bg-gray-300'}`} />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                          <h4 className="font-semibold text-sm text-gray-800 truncate">{n.title}</h4>
                                          {n.data.url && <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-4">{n.body}</p>
                                        <p className="text-xs text-gray-400 mt-2">{getTimeAgo(n.createdAt)}</p>
                                      </div>
                                    </div>
                                  </div>
                                );

                                if (n.data.url) {
                                  return n.data.url.startsWith('/') ? (
                                    <Link key={n.id} to={n.data.url} onClick={() => setShowNotificationDropdown(false)}>
                                      {content}
                                    </Link>
                                  ) : (
                                    <a key={n.id} href={n.data.url} target="_blank" rel="noopener noreferrer" onClick={() => setShowNotificationDropdown(false)}>
                                      {content}
                                    </a>
                                  );
                                }
                                return <div key={n.id} onClick={() => handleNotificationClick(n)}>{content}</div>;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Avatar
                      name={currentUser.email}
                      colors={[
                        "#482344",
                        "#2b5166",
                        "#429867",
                        "#fab243",
                        "#e02130",
                      ]}
                      variant="beam"
                      size={35}
                      className="cursor-pointer"
                      onClick={() =>
                        setIsUserDropDownOpen((prevState) => !prevState)
                      }
                    />
                    {isUserDropDownOpen && (
                      <div className="absolute end-0 z-20 mt-0.5 w-48 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg overflow-x-hidden top-10 lg:-left-3">
                        <div className="p-2">
                          <Link to="/dashboard/overview" className={menuClassname}>
                            My Dashboard
                          </Link>
                          {currentUser.role === "ADMIN" && (
                            <Link
                              to="/dashboard/admin/manage-users"
                              className={menuClassname}
                            >
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        {currentUser && (
                          <button
                            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50 cursor-pointer mb-2 mx-2"
                            onClick={handleLogOut}
                          >
                            <IoLogOut size={20} />
                            Logout
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={openLoginModal}
                    className="text-xs md:text-base mr-3 lg:mr-0 px-3 py-2 border border-gray-300 text-gray-700 hover:border-green-600 hover:bg-green-600 rounded-lg hover:text-white cursor-pointer bg-transparent"
                  >
                    Log In
                  </button>
                  <button
                    onClick={openRegModal}
                    className="px-3 py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 hidden md:block"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              {isHamMenuOpen && (
                <div className="absolute end-0 z-10 mt-0.5 w-40 divide-gray-100 rounded-md border border-gray-100 bg-white shadow-lg top-12 overflow-x-hidden right-2">
                  <div className="p-2">
                    <NavLink onClick={() => setIsHamMenuOpen(false)} to="/" className={menuClassname}>
                      Home
                    </NavLink>
                    <NavLink onClick={() => setIsHamMenuOpen(false)} to="/browse" className={menuClassname}>
                      Browse Items
                    </NavLink>
                    <NavLink onClick={() => setIsHamMenuOpen(false)} to="/buy-credits" className={menuClassname}>
                      Buy Credits
                    </NavLink>
                    <NavLink onClick={() => setIsHamMenuOpen(false)}
                      to="/dashboard/overview"
                      className={menuClassname}
                    >
                      Dashboard
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
            <GiHamburgerMenu
              onClick={() => setIsHamMenuOpen((prevState) => !prevState)}
              className="block md:hidden"
              size={24}
            />
          </div>
        </div>
      </header>

      {/* Notification Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Notification Details</h3>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedNotification.title}
                </h4>
                <p className="text-sm text-gray-500">
                  {getTimeAgo(selectedNotification.createdAt)}
                </p>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.body}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;