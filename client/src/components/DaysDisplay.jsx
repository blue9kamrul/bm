import React from "react";
import { Calendar, Clock, CalendarDays, Info, Sparkle } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Tooltip } from "flowbite-react";
import ProgressBarWithScale from "./ProgressBarWithScale";

const DaysDisplay = ({
  numberOfDays,
  price,
  range,
  setRange,
  initial,
  final,
  isHourlyRental,
  setIsHourlyRental,
  type
}) => {
  console.log(type)
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-gray-700" />
          <h2 className="text-gray-700 font-semibold text-lg">
            Select Rental Period
          </h2>
        </div>
      </div>
      <div className="px-6 py-4 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative">
              <div className="w-16 h-16 bg-white rounded-xl border-2 border-green-200 flex items-center justify-center shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-3 bg-green-500 rounded-t-xl"></div>
                <div className="absolute top-1 left-2 right-2 flex justify-between">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <div className="text-center mt-1">
                  <div className="text-xl font-bold text-green-700 transition-all duration-300">
                    {numberOfDays}
                  </div>
                  <div className="text-xs font-medium text-green-600 -mt-1">
                    {numberOfDays === 1 ? "Day" : "Days"}
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block w-full flex-1">
              <ProgressBarWithScale numberOfDays={numberOfDays} />
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">BDT {price}</div>
            <div className="text-sm text-gray-600 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" />
              per day
            </div>
          </div>
        </div>
        <div className="block mt-4 sm:hidden">
          <ProgressBarWithScale numberOfDays={numberOfDays} />
        </div>

        {initial && final && (
          <div className="mt-6 p-3 bg-white rounded-md border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-700">
                  Selected Period:
                </span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">
                  {initial.toLocaleDateString()}
                </span>
                <span className="mx-2">→</span>
                <span className="font-medium">
                  {final.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {
        numberOfDays === 1 && (initial && final) && !isHourlyRental && (type === "GADGET" || type === "VEHICLE") && (
          <div className="flex font-semibold items-center mb-2 border-b border-gray-300 pt-4 pb-4 justify-center text-green-600 bg-cyan-50 relative">
            <div onClick={() => {
              setIsHourlyRental(true);
              window.scrollTo({
                top: window.scrollY + 480,
                behavior: 'smooth'
              });
            }} className="flex gap-1 items-center cursor-pointer">
              <p className="underline italic">Rent On Hourly Basis</p>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs whitespace-nowrap text-purple-700 flex items-center gap-1 absolute top-2 left-2 animate-pulse duration-1000">
                New <Sparkle size={10} />
              </span>
              <Clock size={14} />
            </div>
          </div>
        )
      }
      {
        numberOfDays === 1 && (initial && final) && isHourlyRental && (
          <div className="flex font-semibold items-center mb-2 border-b border-gray-300 pt-4 pb-4 justify-center text-green-600 bg-cyan-50">
            <div onClick={() => setIsHourlyRental(false)} className="flex gap-1 items-center cursor-pointer">
              <p className="underline italic">Rent On Daily Basis</p>
              <Calendar size={14} />
            </div>
          </div>
        )
      }
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Tooltip
            placement="top-start"
            style="dark"
            content="Select the range of dates you wanna rent for."
          >
            <Info className="w-4 h-4 text-blue-500" />
          </Tooltip>
          <span className="text-sm text-gray-700 font-semibold">
            Select your rental dates (max 15 days):
          </span>
        </div>

        <div className="flex justify-center">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            max={14}
            disabled={{
              before: new Date(),
            }}
          />
        </div>
      </div>

      {
        !isHourlyRental && (
          <div className="px-6 py-4 bg-gray-100 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
              <div className="text-gray-600">
                <span className="font-medium">Total Cost: </span>
                <span className="text-green-700 font-bold">
                  BDT {(price * numberOfDays).toFixed(2)}
                </span>
              </div>
              <div className="text-gray-500">
                {numberOfDays > 7 ? (
                  <span className="text-green-500">
                    ✓ Long-term discount applied
                  </span>
                ) : numberOfDays > 1 ? (
                  <span className="text-green-500">
                    ✓ Discount applied
                  </span>
                ) : (
                  <span>Standard pricing</span>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default DaysDisplay;
