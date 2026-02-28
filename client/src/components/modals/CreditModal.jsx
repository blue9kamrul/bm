import { X } from "lucide-react";
import useCreditModalStore from "../../stores/creditModalStores/useCreditModalStore";
import useUserStore from "../../stores/authStores/useUserStore";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../shared/Loader";
import BCC from "../CacheCreditCard/BCC";
import RCC from "../CacheCreditCard/RCC";
import CCDisplay from "../CacheCreditCard/CCDisplay";
import Swal from "sweetalert2";
import useConfirmRentalRequestModalStore from "../../stores/creditModalStores/useConfirmRentalRequestModalStore";
import { Link } from "react-router-dom";

const CreditModal = () => {
  const { closeCreditModal, isCreditModalOpen, data } = useCreditModalStore();
  const { openConfirmRentalRequestModal } = useConfirmRentalRequestModalStore();
  const { currentUser } = useUserStore();
  const [bccWallet, setBccWallet] = useState(0);
  const [rcc, setRcc] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBcc, setSelectedBcc] = useState(0);
  const [selectedRCCs, setSelectedRCCs] = useState([]);

  const handleCloseCreditModal = () => {
    closeCreditModal();
    setSelectedBcc(0);
    setSelectedRCCs([]);
  }

  useEffect(() => {
    const getAvailableBcc = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/api/v1/credit/bcc/available/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.data.success) {
          return;
        }
        setBccWallet(res.data.data);
      } catch (error) {
        console.log(error);
        alert("error in getting users bcc");
      } finally {
        setLoading(false);
      }
    };

    const getAvailableRcc = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(
          `/api/v1/credit/rcc/available/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!res.data.success) {
          return;
        }
        setRcc(res.data.data);
      } catch (error) {
        console.log(error);
        alert("error in getting users rcc");
      } finally {
        setLoading(false);
      }
    };

    if (isCreditModalOpen) {
      getAvailableBcc();
      getAvailableRcc();
    }
  }, [currentUser?.id, isCreditModalOpen]);

  const availableBcc = bccWallet?.availableBalance;
  const totalSelectedRcc = selectedRCCs.reduce(
    (sum, selectedRcc) => sum + selectedRcc.selectedAmount,
    0,
  );
  const selected = selectedBcc + totalSelectedRcc;
  const remaining = data?.product?.secondHandPrice - selected;

  const handleBccSelect = () => {
    if (availableBcc === 0) {
      return alert("No available credit in this card")
    }
    if (remaining > 0 && availableBcc - selectedBcc >= remaining) {
      setSelectedBcc(remaining);
    } else if (remaining > 0 && selectedBcc === 0) {
      setSelectedBcc(availableBcc);
    } else {
      setSelectedBcc(0);
    }
  };
  const handleRccSelect = (rccParams) => {
    const alreadySelected = selectedRCCs.find(
      (selectedRcc) => selectedRcc.rcc.id === rccParams.id,
    );
    if (rccParams.amount - rccParams.inUse === 0) {
      return alert("No available credit in this card")
    }
    if (alreadySelected) {
      setSelectedRCCs(
        selectedRCCs.filter(
          (selectedRcc) => selectedRcc.rcc.id !== rccParams.id,
        ),
      );
    } else if (remaining > 0 && (rccParams.amount - rccParams.inUse) >= remaining) {
      setSelectedRCCs([
        ...selectedRCCs,
        { rcc: rccParams, selectedAmount: remaining },
      ]);
    } else if (remaining > 0) {
      setSelectedRCCs([
        ...selectedRCCs,
        { rcc: rccParams, selectedAmount: (rccParams.amount - rccParams.inUse) },
      ]);
    }
  };

  const handleDeposit = async () => {
    if (!selectedBcc && !selectedRCCs) {
      Swal.fire({
        icon: "error",
        title: "Hey Nigga!",
        text: "No deposit amount selected",
      });
      return;
    }
    if (remaining > 0) {
      Swal.fire({
        icon: "error",
        title: "Deposit not fulfilled",
        text: "Please fulfill your deposit. You can view it from the progress bar",
      });
      return;
    }
    openConfirmRentalRequestModal({
      rentalDetails: data,
      bccWallet,
      selectedBcc,
      selectedRCCs,
      setSelectedBcc,
      setSelectedRCCs,
      
    });
  };

  if (loading) return <Loader />;
  if (!isCreditModalOpen) return null;

  return (
    <div
      id="authentication-modal"
      className="fixed inset-0 z-50 flex justify-center items-center bg-black/70"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCreditModal();
        }
      }}
    >
      <div className="relative p-3 sm:p-4 w-full max-w-[760px] max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between mx-4 md:mx-5 border-b rounded-t border-gray-200 flex-shrink-0 pb-4">
            <div
              id="credit-calc"
              className="flex flex-col items-center text-center w-full"
            >
              <h3 className="text-lg font-semibold text-gray-700 mt-2">
                Deposit Cache Credit
              </h3>
              <p className="text-xs text-gray-600">
                No worries! you'll get this back after you return the
                product
              </p>
              <CCDisplay
                required={data?.product?.secondHandPrice}
                selectedBcc={selectedBcc}
                selectedRCCs={selectedRCCs}
                remaining={remaining}
                selected={selected}
              />
            </div>
            <button
              type="button"
              className="absolute top-1 cursor-pointer right-1 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xs md:text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="authentication-modal"
              onClick={handleCloseCreditModal}
            >
              <X />
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-3 md:px-5 mt-2">
              <h3 className="mt-1 text-sm font-semibold text-center sm:text-left">
                🔵Available Blue Cache Credits
              </h3>
              <div className="mt-4 flex flex-col sm:flex-row items-center">
                <BCC
                  handleSelect={handleBccSelect}
                  bccWallet={bccWallet}
                  selectedBcc={selectedBcc}
                  inCreditModal={true}
                />
              </div>
              <h3 className="mt-6 text-sm font-semibold text-center sm:text-left">
                🔴Available Red Cache Credits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 justify-self-center place-items-center sm:justify-self-start sm:place-items-start">
                {rcc?.map((credit) => (
                  <RCC
                    handleSelect={handleRccSelect}
                    key={credit.id}
                    rcc={credit}
                    selectedRCCs={selectedRCCs}
                    inCreditModal={true}
                  />
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/buy-credits"
                  className="text-sm text-green-600 hover:text-green-700 underline font-semibold"
                  onClick={() => {closeCreditModal();}}
                >
                  Need more credits? Buy here
                </Link>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5 border-t border-gray-200 flex-shrink-0">
            <button
              type="submit"
              onClick={handleDeposit}
              className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs md:text-sm px-5 py-2.5 text-center cursor-pointer"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditModal;
