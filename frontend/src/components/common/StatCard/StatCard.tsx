import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  textColor,
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 hover:scale-[1.02] cursor-default">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          <span className="text-3xl font-bold text-gray-900 mt-1">{value}</span>
          {trend && (
            <span
              className={`text-xs font-semibold mt-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <div className={`${bgColor} ${textColor} p-4 rounded-lg flex items-center justify-center`}>
          <div className="w-8 h-8 flex items-center justify-center">
            {React.isValidElement(icon) ? (
              React.cloneElement(icon as React.ReactElement, {
                className: `w-6 h-6 ${icon.props.className || ''}`,
              })
            ) : (
              icon
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
