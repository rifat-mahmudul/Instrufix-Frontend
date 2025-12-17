import React from "react";

interface BusinessHour {
  day: string;
  startTime: string;
  startMeridiem: string;
  endTime: string;
  endMeridiem: string;
  enabled: boolean;
}

interface WorkingHoursProps {
  singleBusiness: {
    businessHours: BusinessHour[];
  };
  formatTime: (time: string, meridiem: string) => string;
}

const WorkingHours: React.FC<WorkingHoursProps> = ({
  singleBusiness,
  formatTime,
}) => {
  return (
    <div className="border-b border-gray-300 pb-6">
      <h3 className="text-lg font-semibold mb-4">Working Hours</h3>
      <div className="space-y-2">
        {singleBusiness.businessHours.map((hour, index) => {
          const hasAnyEnabledDay = singleBusiness.businessHours.some(
            (hour) => hour.enabled
          );

          return (
            <div key={index} className="flex flex-col">
              <span className="font-medium text-[#139a8e]">
                {hour.day.slice(0, 3)}
              </span>
              <span
                className={`${
                  hour.enabled ? "text-gray-700" : "text-red-500"
                } font-medium`}
              >
                {hour.enabled
                  ? `${formatTime(
                      hour.startTime,
                      hour.startMeridiem
                    )} - ${formatTime(hour.endTime, hour.endMeridiem)}`
                  : hasAnyEnabledDay
                  ? "Closed"
                  : "Not Provided"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkingHours;
