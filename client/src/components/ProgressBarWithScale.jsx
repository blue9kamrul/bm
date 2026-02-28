import { TrendingUp } from "lucide-react";

const ProgressBarWithScale = ({ numberOfDays = 3 }) => {
  const scaleMarks = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span className="text-xs font-medium text-gray-700">
          Duration (Days)
        </span>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((numberOfDays / 15) * 100, 100)}%`,
            }}
          ></div>
        </div>
        <div className="relative w-full h-3 mt-1">
          {scaleMarks.map((day) => (
            <div
              key={day}
              className="absolute flex flex-col items-center"
              style={{
                left: `${((day - 1) / 14) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className={`w-px h-1.5 ${
                  day <= numberOfDays ? "bg-green-600" : "bg-gray-300"
                }`}
              />
              {(day === 1 || day === 5 || day === 10) && (
                <span className="text-[9px] text-gray-500 mt-0.5 leading-none">
                  {day}
                </span>
              )}
              {day === 15 && (
                <span className="text-[9px] text-gray-500 mt-0.5 leading-none">
                  {day} <span className="text-[8px] ml-0.5">(max)</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBarWithScale;
