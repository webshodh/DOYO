// components/dashboard/TabNavigation.jsx
import React, { memo } from "react";

const TabNavigation = memo(({ activeTab, onTabChange, tabs }) => (
  <div className="border-b border-gray-200 mb-6">
    <nav className="flex space-x-1 overflow-x-auto pb-2 -mb-px scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
            activeTab === tab.id
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </div>
        </button>
      ))}
    </nav>
  </div>
));

TabNavigation.displayName = "TabNavigation";
export default TabNavigation;
