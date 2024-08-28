import React, { useState } from "react";
import { colors } from "theme/theme";

const TabButtons = ({ tabs, width }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div
        className={`flex overflow-x-auto ${width ? `w-[${width}]` : "w-full"}`}
      >
        {tabs.map((tab) => (
          <button
            style={{ border: `1px solid ${colors.Orange}` }}
            key={tab.label}
            className={`flex-shrink-0 px-6 py-2 mx-2 text-lg font-semibold transition-transform duration-300 transform 
              ${
                activeTab === tab.label
                  ? "text-white bg-orange-500 scale-105 shadow-lg"
                  : "text-orange-500 bg-white hover:bg-orange-200"
              }
              rounded-full focus:outline-none`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="p-4 mt-4 ">
        {tabs.map((tab) => (activeTab === tab.label ? tab.content : null))}
      </div>
    </div>
  );
};

export default TabButtons;
