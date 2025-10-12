// components/customers/CustomerSegmentation.jsx
import React from "react";
import { Users, Star, Award, Trophy, Crown, Filter } from "lucide-react";

const CustomerSegmentation = ({
  oneTimeCustomers,
  repeatCustomers,
  frequentCustomers,
  superFrequentCustomers,
  eliteCustomers,
  selectedSegment,
  onSegmentChange,
}) => {
  const segments = [
    {
      id: "one-time",
      label: "One-Time",
      value: oneTimeCustomers,
      icon: Users,
      color: "gray",
      description: "1 order",
    },
    {
      id: "repeat",
      label: "Repeat",
      value: repeatCustomers,
      icon: Star,
      color: "yellow",
      description: "2 orders",
    },
    {
      id: "frequent",
      label: "Frequent",
      value: frequentCustomers,
      icon: Award,
      color: "green",
      description: "3-4 orders",
    },
    {
      id: "super-frequent",
      label: "Super",
      value: superFrequentCustomers,
      icon: Trophy,
      color: "pink",
      description: "5-9 orders",
    },
    {
      id: "elite",
      label: "Elite",
      value: eliteCustomers,
      icon: Crown,
      color: "purple",
      description: "10+ orders",
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Filter className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Customer Segmentation
          </h2>
          <p className="text-gray-500 text-sm">
            Analyze customers by behavior and value
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {segments.map((segment) => {
          const Icon = segment.icon;
          const isSelected = selectedSegment === segment.id;

          return (
            <button
              key={segment.id}
              onClick={() => onSegmentChange(segment.id)}
              className={`text-center p-4 rounded-xl transition-all duration-200 ${
                isSelected
                  ? `bg-${segment.color}-100 border-2 border-${segment.color}-400`
                  : `bg-${segment.color}-50 hover:bg-${segment.color}-100`
              }`}
            >
              <Icon
                className={`w-8 h-8 mx-auto mb-2 text-${segment.color}-600`}
              />
              <p className={`text-2xl font-bold text-${segment.color}-900`}>
                {segment.value}
              </p>
              <p className={`text-sm text-${segment.color}-700 font-medium`}>
                {segment.label}
              </p>
              <p className={`text-xs text-${segment.color}-600`}>
                {segment.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerSegmentation;
