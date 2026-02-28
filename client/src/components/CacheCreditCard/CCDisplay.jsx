const CCDisplay = ({ required, selectedBcc, selectedRCCs, remaining, selected }) => {
  const totalSelectedRcc = selectedRCCs.reduce(
    (sum, selectedRcc) => sum + (selectedRcc.selectedAmount),
    0,
  );
  
  const progressPercentage = (selected / required) * 100;

  return (
    <div className="w-full mt-3">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Progress</span>
              <span className="text-xs font-medium">
                <span className="text-gray-700">{selected}</span><span className='font-bold text-black text-sm'>/</span><span className="text-gray-700">{required}</span> Selected
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progressPercentage === 100
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : progressPercentage >= 50
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-r from-blue-500 to-blue-600"
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 mx-8">
            {/* Required */}
            <div className="text-center border-r border-gray-300 w-full">
              <div className="text-xs text-gray-500 mb-1">Total Required</div>
              <div className="text-base font-semibold text-gray-900">
                {required.toLocaleString()}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  CC
                </span>
              </div>
            </div>

            {/* Selected */}
            <div className="text-center border-r border-gray-300 w-full">
              <div className="text-xs text-gray-500 mb-1">Selected</div>
              <h3 className="text-base font-semibold">
                <span className={`text-blue-600`}>
                  {selectedBcc.toLocaleString()}
                </span>
                {selectedRCCs.length > 0 && (
                  <>
                    <span className="text-gray-500">+</span>
                    <span className={`text-red-600`}>
                      {totalSelectedRcc.toLocaleString()}
                    </span>
                  </>
                )}
              </h3>
            </div>

            {/* Remaining */}
            <div className="text-center w-full">
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div className={`text-base font-semibold text-amber-600`}>
                {remaining.toLocaleString()}
                <span className="text-xs font-normal text-gray-500 ml-1">
                  CC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
          {/* Progress Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">Credit Progress</span>
              <span className="text-xs text-gray-700 font-medium">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  progressPercentage === 100
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : progressPercentage >= 50
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-r from-blue-500 to-blue-600"
                }`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Required</div>
              <div className="text-base font-semibold text-gray-900">
                {required >= 1000
                  ? `${(required / 1000).toFixed(1)}k`
                  : required}
              </div>
            </div>

            <div className="text-center border-l border-r border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Selected</div>
              <div
                className={`text-base font-semibold ${
                  progressPercentage === 100
                    ? "text-emerald-600"
                    : "text-blue-600"
                }`}
              >
                {selected >= 1000
                  ? `${(selected / 1000).toFixed(1)}k`
                  : selected}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div
                className={`text-base font-semibold ${
                  remaining === 0 ? "text-gray-400" : "text-amber-600"
                }`}
              >
                {remaining >= 1000
                  ? `${(remaining / 1000).toFixed(1)}k`
                  : remaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCDisplay;
