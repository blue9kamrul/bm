import bccLogo from "../../assets/logos/bcc-logo.png";

const BCC = ({
  bccWallet,
  handleSelect,
  selectedBcc,
  inRRModal,
  inCreditModal = false,
}) => {
  return (
    <div
      onClick={handleSelect}
      className={`relative w-[250px] h-[150px] rounded-2xl ${
        inCreditModal &&
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      } ${
        selectedBcc > 0 && !inRRModal
          ? "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 ring-4 ring-green-200 shadow-xl"
          : "bg-gradient-to-br from-blue-700 via-blue-400 to-blue-700 shadow-lg"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl" />
      <div className="absolute top-5 left-6 right-6 flex justify-between items-center">
        <div>
          <h3 className="text-white/70 text-xs font-medium tracking-wider uppercase">
            BLUE CREDIT Wallet
          </h3>
          <div className="text-white text-lg font-bold tracking-wide mt-1">
            {bccWallet?.availableBalance || "0.00"}
            {selectedBcc > 0 && (
              <span className="text-red-300 text-sm ml-2">-{selectedBcc}</span>
            )}
          </div>
        </div>
        <img
          src={bccLogo}
          alt="BCC Logo"
          className="h-10 w-10 opacity-90 filter drop-shadow-sm"
        />
      </div>

      <div className="absolute top-20 left-6 right-6">
        <div className="flex space-x-2">
          <div className="w-6 h-0.5 bg-white/30 rounded-full" />
          <div className="w-6 h-0.5 bg-white/30 rounded-full" />
          <div className="w-6 h-0.5 bg-white/30 rounded-full" />
        </div>
      </div>

      <div className="absolute bottom-5 left-6 right-6">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div>
              <div className="text-white/60 text-xs font-medium tracking-wide uppercase">
                In Use
              </div>
              <div className="text-white text-sm font-semibold">
                {bccWallet?.lockedBalance || "0.00"}
                {selectedBcc > 0 && (
                  <span className="text-emerald-300 text-xs ml-2">
                    +{selectedBcc}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-white/60 text-xs font-medium tracking-wide uppercase">
             Refund Pending
            </div>
            <div className="text-white text-sm font-semibold">
              {bccWallet?.requestedForWithdrawal || "0.00"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BCC;
