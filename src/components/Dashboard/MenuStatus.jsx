// components/dashboard/MenuStatus.jsx
import React from "react";
import { Eye, CheckCircle, AlertCircle, Zap, Flame } from "lucide-react";

const MenuStatus = ({ menuStats }) => {
  if (!menuStats) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Menu Status</h3>
          <Eye className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Available Menu</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {menuStats.available}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-900">Unavailable</span>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {menuStats.unavailable}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">New This Week</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {menuStats.newItems}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
          <Flame className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Featured Items</span>
            <span className="font-semibold text-gray-900">
              {menuStats.featuredItems}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Categories</span>
            <span className="font-semibold text-gray-900">
              {menuStats.uniqueCategories}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Special Offers</span>
            <span className="font-semibold text-gray-900">
              {menuStats.discounted}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-gray-600 font-medium">Availability Rate</span>
            <span className="font-bold text-green-600">
              {((menuStats.available / menuStats.total) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuStatus;
