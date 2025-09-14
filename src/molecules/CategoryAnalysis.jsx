// components/shared/CategoryAnalysis.jsx
import React from "react";
import { PieChart } from "lucide-react";

export const CategoryAnalysis = ({
  categoryData,
  title = "Category-wise Orders",
}) => {
  const maxCount = Math.max(...Object.values(categoryData));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      <div className="space-y-3">
        {Object.entries(categoryData)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([category, count]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-gray-700 truncate flex-1 pr-2">
                {category}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-sm w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        {Object.keys(categoryData).length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No category data available
          </div>
        )}
      </div>
    </div>
  );
};
