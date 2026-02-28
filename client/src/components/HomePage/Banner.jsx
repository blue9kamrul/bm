import { useEffect } from "react";
import { IoSearchCircle } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { promptNotifications, promptPwaInstall } from "../../lib/promptPwaOrNotificationEnable";
import useUserStore from "../../stores/authStores/useUserStore";
import { Download, MapPin } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import NearbyProductsModal from "../modals/NearbyProductsModal";

const Banner = ({ setProductType, setSearch }) => {
  const [isPWA, setIsPWA] = useState(false);
  const [canPromptPWA, setCanPromptPWA] = useState(false);
  const { currentUser } = useUserStore();
  const [showNearbyModal, setShowNearbyModal] = useState(false);


  useEffect(() => {
    const checkIsPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIosStandalone = 'standalone' in window.navigator && window.navigator.standalone;
      return isStandalone || isIosStandalone;
    };
    setIsPWA(checkIsPWA());
    //console.log('Running as PWA:', checkIsPWA());
    //console.log('DeferredPrompt available:', !!window.deferredPrompt);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setCanPromptPWA(true);
      console.log('Ready to prompt PWA:', e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePWAInstall = async () => {
    console.log(canPromptPWA)
    if (!canPromptPWA) return;
    Swal.fire({
      title: 'Install Brittoo?',
      text: 'Add to your home screen for real-time updates!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, Install!',
      cancelButtonText: 'No, Thanks',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log('Attempting PWA prompt...');
          await promptPwaInstall();
          setCanPromptPWA(false);
        } catch (error) {
          console.error('Failed to prompt PWA install:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to install. Please try again or use the browser menu.',
            icon: 'error',
          });
        }
      }
    });
  };



  useEffect(() => {
    const hasPrompted = localStorage.getItem('hasPromptedNotifications');
    if (currentUser && !hasPrompted && Notification.permission !== 'granted') {
      const timer = setTimeout(async () => {
        try {
          await promptNotifications();
        } catch (error) {
          console.error('Failed to prompt notifications:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to enable notifications. Please try again later.',
            icon: 'error',
          });
        }
        localStorage.setItem('hasPromptedNotifications', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const navigate = useNavigate();
  const tagClassNames = `border border-gray-300 rounded-3xl py-[6px] px-4 text-gray-800 font-semibold bg-white cursor-pointer hover:bg-green-200 md:text-sm text-xs`;

  return (
    <div className="bg-gradient-to-b from-green-100 to-transparent px-4">
      <div className="flex flex-col items-center mx-auto lg:max-w-7xl">
        <h1 className="text-3xl md:text-7xl font-bold mt-14 sm:mt-24 text-center">
          <span className="text-green-500">Own Less,</span> Access More
        </h1>
        <p className="text-gray-500  text-xs md:text-xl mt-4 sm:mt-8 text-center mx-2 md:mx-0">
          Rent, Barter, and Share items in your community. Earn credits by{" "}
          <br className="hidden md:block" /> lending your items or pay with
          cash. Join the circular economy today.
        </p>
        <div className="text-xs md:text-base flex flex-col md:flex-row items-center gap-4 mt-8">
          <Link to={'/browse'} className="py-2 border border-green-600 bg-green-600 rounded-lg text-white cursor-pointer hover:bg-green-700 hover:border-green-700 px-6">
            Find Items to Rent
          </Link>

          <Link to={'/dashboard/list-items'} className="text-xs md:text-base border py-2 border-green-500 hover:text-gray-500 text-green-500 hover:bg-green-100 rounded-lg cursor-pointer bg-transparent px-6">
            List Your Items
          </Link>
          <button
            onClick={() => setShowNearbyModal(true)}
            className="
    text-xs md:text-base
    border border-gray-400
    text-gray-700
    hover:text-gray-500 hover:bg-gray-100
    rounded-lg
    cursor-pointer
    bg-transparent
    px-6 py-2
    flex items-center gap-2
    transition-colors duration-150
  "
          >
            <MapPin className="w-5 h-5 text-gray-700" />
            Nearby Products
          </button>

          {
            !isPWA && (
              <motion.button
                onClick={handlePWAInstall}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 
                 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5
                 bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500
                 text-white font-semibold rounded-md sm:rounded-lg shadow-lg
                 hover:from-emerald-600 hover:to-lime-600
                 focus:outline-none focus:ring-4 focus:ring-green-300
                 transition-all duration-300 z-50 cursor-pointer"
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Download size={22} className="sm:w-5 sm:h-5 w-4 h-4" />
                </motion.span>
                <span className="text-sm hidden sm:block">Install Brittoo</span>
                <span className="text-sm block sm:hidden">Install</span>
              </motion.button>
            )
          }
        </div>
        <div className="relative mt-8">
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            id="Search"
            className="border bg-white border-gray-300 rounded-3xl w-[250px] md:w-[400px] lg:w-[700px] px-2 py-2 md:py-3 p md:px-4 focus:border-green-600 focus:outline-none text-xs md:text-sm"
            placeholder="What do you want to rent?"
          />

          <button
            onClick={() => setTimeout(() => navigate("/browse"), 100)}
            className="absolute inset-y-0 right-0 md:right-2 grid w-8 place-content-center"
          >
            <IoSearchCircle className="text-green-500 cursor-pointer size-6 md:size-12" />
          </button>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide relative mt-8">
          <ul className="flex gap-4 whitespace-nowrap px-2 animate-scroll">
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("GADGET");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Gadgets
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("FURNITURE");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Furniture
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("VEHICLE");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Vehicles
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("STATIONARY");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Stationary
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("MUSICAL_INSTRUMENT");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Musical Instruments
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("CLOTHING");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Clothing
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("BOOK");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Books
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("ACADEMIC_BOOK");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Academic Books
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("ELECTRONICS");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Electronics
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("APARTMENTS");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Apartments
            </li>
            {/* Duplicate items for seamless loop */}
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("GADGET");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Gadgets
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("FURNITURE");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Furniture
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("VEHICLE");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Vehicles
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("STATIONARY");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Stationary
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("MUSICAL_INSTRUMENT");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Musical Instruments
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("CLOTHING");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Clothing
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("BOOK");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Books
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("ACADEMIC_BOOK");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Academic Books
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("ELECTRONICS");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Electronics
            </li>
            <li
              className={tagClassNames}
              onClick={() => {
                setProductType("APARTMENTS");
                setTimeout(() => {
                  navigate("/browse");
                }, 200);
              }}
            >
              Apartments
            </li>
          </ul>
        </div>
      </div>
      <NearbyProductsModal isOpen={showNearbyModal} onClose={() => setShowNearbyModal(false)} />
    </div>
  );
};

export default Banner;
