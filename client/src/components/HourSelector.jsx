import { Clock, Plus, Minus, Sparkle, ReceiptIcon, Calculator } from 'lucide-react';
import Picker from 'react-mobile-picker';

const selections = {
  hour: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  period: ['AM', 'PM'],
}

const baseRates = {
  1: 1.00,
  2: 0.91,
  3: 0.85,
  4: 0.81,
  5: 0.76,
  6: 0.70,
  7: 0.66,
  8: 0.60,
  9: 0.57,
  10: 0.52,
};

export default function HourSelector({ pickerValue, setPickerValue, numberOfHours, setNumberOfHours, hourlyPrice }) {



  const incrementHours = () => {
    if (numberOfHours < 10) {
      setNumberOfHours(numberOfHours + 1);
    }
  };

  const decrementHours = () => {
    if (numberOfHours > 1) {
      setNumberOfHours(numberOfHours - 1);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg border border-gray-200 overflow-hidden mt-6 relative">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg">
          <Clock className="w-6 h-6 text-gray-700" />
        </div>
        <h2 className="text-gray-700 font-semibold text-lg">Select Rental Time</h2>
      </div>
      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs whitespace-nowrap text-purple-700 flex items-center gap-1 absolute top-3 right-3">
        New <Sparkle size={10} />
      </span>
      <div className="space-y-1">
        {/* Starting Time Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Starting Time
          </label>

          {/* Time Wheel */}
          <div className="flex gap-2 justify-center">
            <div className='border border-gray-300 rounded-md mt-1 mb-1 w-52 min-w-fit'>
              <Picker value={pickerValue} onChange={setPickerValue} wheelMode="natural" height={144}>
                {Object.keys(selections).map((name) => (
                  <Picker.Column key={name} name={name}>
                    {selections[name].map((option) => {
                      const isActive = pickerValue[name] === option;
                      return (
                        <Picker.Item key={option} value={option}>
                          <div
                            className={
                              `py-2 px-3 text-center min-w-[72px] whitespace-nowrap transition-transform duration-200 ease-out transform ` +
                              (isActive
                                ? "scale-105 text-base font-semibold text-gray-900"
                                : "scale-95 text-sm text-gray-500")
                            }
                          >
                            {option}
                          </div>
                        </Picker.Item>
                      );
                    })}
                  </Picker.Column>
                ))}
              </Picker>
            </div>
          </div>
        </div>

        {/* Number of Hours Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Number of Hours
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={decrementHours}
              disabled={numberOfHours <= 1}
              className={`p-3 rounded-xl transition-all duration-200 ${numberOfHours <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-50 text-green-600 hover:bg-green-100 hover:cursor-pointer active:scale-95'
                }`}
            >
              <Minus className="w-3 h-3" />
            </button>

            <div className="flex items-center justify-center w-14 h-12 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <span className="text-xl font-bold text-green-700">{numberOfHours}</span>
            </div>

            <button
              onClick={incrementHours}
              disabled={numberOfHours >= 10}
              className={`p-3 rounded-xl transition-all duration-200 ${numberOfHours >= 10
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-50 text-green-600 hover:bg-green-100 hover:cursor-pointer active:scale-95'
                }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="text-center mt-2">
            <span className="text-sm text-gray-500">Maximum 10 hours</span>
          </div>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-100 border-t border-gray-100">
          <div className="flex flex-col gap-2 text-sm">
            <div className="text-gray-600 flex items-center gap-1">
              <span className="font-medium flex items-center gap-1"><Clock size={12} /> Price Per Hour: </span>
              <span className="text-green-700 font-bold">
                BDT {(hourlyPrice).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-600 flex items-center gap-1">
              <span className="font-medium flex items-center gap-1"><Calculator size={12} /> Total: </span>
              <span className="text-green-700 font-bold">
                BDT {(hourlyPrice * numberOfHours).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500">
              {numberOfHours > 5 ? (
                <span className="text-green-500">
                  ✓ Long-term discount applied ({(100 - (baseRates[numberOfHours] * 100)).toFixed(2)}%)
                </span>
              ) : numberOfHours > 1 ? (
                <span className="text-green-500">
                  ✓ {(100 - (baseRates[numberOfHours] * 100)).toFixed(2)}% Discount applied
                </span>
              ) : (
                <span>Standard pricing</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}