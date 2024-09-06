import React, { useState } from 'react';

const Tabs = ({ tabs, width }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div className="w-full custom-scrollbar">
    {/* Tabs Header */}
    <div className={`flex custom-scrollbar overflow-x-auto border-b-2 border-gray-300 ${width ? `w-[${width}]` : 'w-full'}`}>
      {tabs.map((tab) => (
        <button
          key={tab.label}
          className={`flex-shrink-0 px-4 py-2 text-lg font-semibold transition-colors duration-300 whitespace-nowrap 
            ${activeTab === tab.label ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-600'}
            hover:text-orange-500 focus:outline-none`}
          onClick={() => setActiveTab(tab.label)}
        >
          {tab.label}
        </button>
      ))}
    </div>
    {/* Tab Content */}
    <div className="p-4 mt-4 bg-white rounded-lg shadow-md">
      {tabs.map((tab) => (
        activeTab === tab.label ? tab.content : null
      ))}
    </div>
  </div>
  
  );
};

export default Tabs;
