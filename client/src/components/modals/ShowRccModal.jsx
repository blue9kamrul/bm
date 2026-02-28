import { X } from "lucide-react";
import useShowRccModalStore from "../../stores/creditModalStores/useShowRccModalStore";
import { useNavigate } from "react-router-dom";
import RCC from "../CacheCreditCard/RCC";

const ShowRccModal = () => {
  const { closeShowRccModal, rcc } = useShowRccModalStore();
  const navigate = useNavigate();

  const goToRent = () => {
    closeShowRccModal();
    navigate('/browse');
  }

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeShowRccModal();
      }}
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 md:p-5 rounded-t">
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="text-2xl md:text-3xl font-semibold text-purple-700 mt-1 md:mt-3">
                Congratulations!!
              </h3>
              <p className="text-gray-500 text-sm mt-3">
                You have received a{" "}
                <span className="text-red-500 font-semibold">
                  Red Cache Credit
                </span>{" "}
                Card
              </p>
            </div>

            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1  text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={closeShowRccModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="mt-6 flex flex-col items-center pb-10">
            <RCC rcc={rcc} handleSelect={() => {}} key={rcc.id} />
            <p onClick={goToRent} className="mt-4 text-sm underline text-purple-600 cursor-pointer hover:text-green-700 font-semibold">Use it for renting items</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowRccModal;
