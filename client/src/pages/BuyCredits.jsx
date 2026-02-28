import money from "../assets/money.png";
import { ArrowRightLeftIcon, ArrowUpDown } from "lucide-react";
import nodemcu from "../assets/nodemcu.png";
import Swal from "sweetalert2";
import useBuyBccModalStore from "../stores/creditModalStores/useBuyBccModalStore";
import useLoginModalStore from "../stores/authStores/useLoginModalStore";
import useUserStore from "../stores/authStores/useUserStore";
import { Link } from "react-router-dom";

const BuyCredits = () => {
  const { currentUser } = useUserStore();
  const { openLoginModal } = useLoginModalStore();
  const { openBuyBccModal } = useBuyBccModalStore();

  const currentUserCheckSwal = () => {
    Swal.fire({
      icon: "info",
      text: "You Need to login before buying Credits!",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Goto Login",
      showCancelButton: true,
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        openLoginModal();
      } else {
        Swal.fire("Login Denied, Just Like your project Proposal");
      }
    });
  };

  const handleBuyBcc = () => {
    if (!currentUser) {
      currentUserCheckSwal();
    } else {
      openBuyBccModal();
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-white">
      <h2 className="text-xl md:text-2xl text-gray-800 font-bold">
        Buy Credits & Start Your Rental Journey
      </h2>
      <p className="text-gray-500 text-xs md:text-sm mt-1">
        Choose from RED or Blue Credits to access a seamless rental experience.
        Whether you're earning from your unused items or renting what <br /> you
        need, our credit system makes it simple, secure, and efficient. Start
        today and unlock the full potential of peer-to-peer rentals.
      </p>
      <div className="w-full flex flex-col sm:flex-row gap-4 md:gap-8 mt-8 text-center sm:text-left">
        <div className="w-full md:w-1/2 bg-blue-50 p-2 sm:p-4 rounded-lg pb-8 md:pb-6 border border-blue-300 shadow-md">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            BCC - BLUE CACHE CREDIT
          </h2>
          <p className="text-gray-700 text-xs md:text-sm mt-1">
            Blue Credits are purchased with money via online payment methods
            such as bKash or Nagad. To acquire Blue Credits, simply make a
            payment to the designated account, then complete the form with the
            payment amount and transaction ID. Credits will be added to your
            account within 1–2 hours. These credits can be reconverted to cash
            once your rental period ends.
          </p>
          <div className="flex flex-col lg:flex-row justify-evenly gap-2 md:gap-0 items-center mt-8">
            <img src={money} className="h-32" alt="money" />
            <ArrowRightLeftIcon
              className="hidden lg:block"
              strokeWidth={2}
              color="#1f2937"
              size={40}
            />
            <ArrowUpDown
              className="block lg:hidden"
              strokeWidth={2}
              color="#1f2937"
              size={40}
            />
            <div
              className={`text-white w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md bg-gradient-to-r from-blue-600 to-blue-200`}
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xs md:text-sm"> CC Amount </h2>
                  <p className="text-lg md:text-xl font-bold"> 5000 </p>
                </div>
                <img src="brittoofav.png" alt="fav" className="w-10 h-10" />
              </div>

              <div className="flex justify-between mt-5">
                <div>
                  <h3 className="text-xs"> Issued At </h3>
                  <p className="font-semibold text-sm"> 10/06/25 </p>
                </div>
                <div className="text-gray-600">
                  <h3 className="text-xs"> Valid Till </h3>
                  <p className={"font-semibold text-sm italic"}>Unlimited</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              🔵 Features of BCC :
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Unlimited Validity</li>
              <li>• Your Money Our Responsibility</li>
              <li>• No Hassle of Product transportation</li>
              <li>• No Service Charge for Collateral Product.</li>
              <li>• Withdraw Anytime</li>
            </ul>
          </div>
          <button
            onClick={handleBuyBcc}
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer mt-4 shadow-md"
          >
            Get BCC Now
          </button>
        </div>

        <div className="w-full md:w-1/2 bg-red-50 p-2 sm:p-4 rounded-lg pb-8 md:pb-6 border border-red-300 shadow-md">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            RCC - RED CACHE CREDIT
          </h2>
          <p className="text-gray-700 text-xs md:text-sm mt-1">
            RED Credits are awarded when users deposit products or when their
            listed products are successfully rented, based on the item's
            second-hand value. These credits are valid for the duration of the
            rental period and are ideal for maximizing the value of owned items
            through rentals. Please note that RED Credits are not redeemable for
            cash.
          </p>
          <div className="flex flex-col lg:flex-row justify-evenly gap-2 md:gap-0 items-center mt-8">
            <img src={nodemcu} className="w-48" alt="money" />
            <ArrowRightLeftIcon
              className="hidden lg:block"
              strokeWidth={2}
              color="#1f2937"
              size={40}
            />
            <ArrowUpDown
              className="block lg:hidden"
              strokeWidth={2}
              color="#1f2937"
              size={40}
            />
            <div className="text-white w-[210px]  p-5 rounded-xl hover:scale-105 cursor-pointer transition duration-300 shadow-md bg-gradient-to-r from-red-600 to-red-200">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xs md:text-sm"> CC Amount </h2>
                  <p className="text-lg md:text-xl font-bold"> 5000 </p>
                </div>
                <img src="brittoofav.png" alt="fav" className="w-10 h-10" />
              </div>

              <div className="flex justify-between mt-5">
                <div>
                  <h3 className="text-xs"> Issued At </h3>
                  <p className="font-semibold text-sm"> 10/06/25 </p>
                </div>
                <div className="text-gray-600">
                  <h3 className="text-xs"> Valid Till </h3>
                  <p className={"font-semibold text-sm"}>14/6/25</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-white p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">
              🔴 Features of RCC :
            </h3>
            <ul className="text-sm text-red-700 space-y-1 text-left">
              <li>• Limited Validity</li>
              <li>• Earn by depositing or renting your products</li>
              <li>• Maximizes value of your unused items</li>
              <li>• No cash conversion available</li>
              <li>• Ideal for peer-to-peer rental leverage</li>
            </ul>
          </div>

          <Link to={'/dashboard/list-items'}>
            <button className="w-full text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer mt-4 shadow-md">
              List Items & Get RCC
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;
