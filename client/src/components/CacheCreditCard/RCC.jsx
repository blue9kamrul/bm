import rccLogo from "../../assets/logos/rcc-logo.png";

const RCC = ({
  rcc,
  handleSelect,
  selectedRCCs,
  inRRModal = false,
  inCreditModal = false,
}) => {
  const selectedRcc = selectedRCCs?.find((r) => r.rcc.id === rcc.id);

  return (
    <div
      onClick={() => handleSelect(rcc)}
      className={`relative w-[250px] h-[150px] rounded-2xl ${inCreditModal &&
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        } overflow-hidden ${selectedRcc && !inRRModal
          ? "bg-gradient-to-br from-red-600 via-red-700 to-red-800 ring-4 ring-green-200 shadow-xl"
          : "bg-gradient-to-br from-red-600 via-red-400 to-red-600 shadow-lg"
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl" />
      {
        rcc.isGiftCredit && (
          <div className="h-full w-full flex items-center justify-center">
            <h1 className="text-6xl opacity-35 mr-6">🎁</h1>
          </div>
        )
      }

      <div className="absolute top-5 left-6 right-6 flex justify-between items-center">
        <div>
          <h3 className="text-white/70 text-xs font-medium tracking-wider uppercase">
            RED CACHE CREDIT
          </h3>
          <div className="text-white text-lg font-bold tracking-wide mt-1">
            {rcc.amount - rcc.inUse || "0.00"}
            {selectedRcc && (
              <span className="text-red-300 text-sm ml-2">
                -{selectedRcc.selectedAmount}
              </span>
            )}
          </div>
        </div>
        <img
          src={rccLogo}
          alt="RCC Logo"
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
                {rcc.inUse || "0.00"}
                {selectedRcc && (
                  <span className="text-emerald-300 text-xs ml-2">
                    +{selectedRcc.selectedAmount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-white/60 text-xs font-medium tracking-wide uppercase">
              REF Product SL
            </div>
            <div className="text-white text-sm font-semibold">
              {rcc.sourceProduct.productSL.slice(0, 10) || "DEMOID123"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RCC;
