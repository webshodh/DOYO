// components/Forms/SubscriptionPlanSelector.js

import React, { useState, useEffect } from "react";
import { subscriptionServices } from "../services/api/subscriptionPlanServices";
import { Check, Crown, Zap, Star } from "lucide-react";

const SubscriptionPlanSelector = ({
  selectedPlanId,
  onPlanSelect,
  disabled = false,
  className = "",
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadActivePlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId && plans.length > 0) {
      const plan = plans.find((p) => p.planId === selectedPlanId);
      setSelectedPlan(plan);
    }
  }, [selectedPlanId, plans]);

  const loadActivePlans = async () => {
    try {
      setLoading(true);
      const activePlans = await subscriptionServices.getActivePlans();
      setPlans(activePlans);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    onPlanSelect(plan);
  };

  const getPlanIcon = (planName) => {
    const name = planName.toLowerCase();
    if (name.includes("enterprise")) return Crown;
    if (name.includes("premium")) return Zap;
    return Star;
  };

  const getFeatureCount = (plan) => {
    const features = plan.features || {};
    return Object.values(features).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          Subscription Plan
        </label>
        <div className="flex space-x-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 p-4 border rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">
        Choose Subscription Plan *
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.planName);
          const isSelected = selectedPlan?.planId === plan.planId;
          const featureCount = getFeatureCount(plan);

          return (
            <div
              key={plan.planId}
              onClick={() => !disabled && handlePlanSelect(plan)}
              className={`
                relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected ? "text-blue-600" : "text-gray-600"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {plan.planName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {featureCount} features included
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{plan.pricing?.monthlyPrice || plan.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    /{plan.duration || 1}mo
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {plan.description}
              </p>

              {/* Key Features Preview */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  Key Features:
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {plan.features?.isOrderDashboard && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Order Management</span>
                    </div>
                  )}
                  {plan.features?.isCaptainDashboard && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Captain Dashboard</span>
                    </div>
                  )}
                  {plan.features?.isKitchenDashboard && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Kitchen Display</span>
                    </div>
                  )}
                  {plan.features?.isCustomerOrderEnable && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Online Ordering</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Limits Preview */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>Menu Items: {plan.limits?.maxMenuItems || 50}</div>
                  <div>Tables: {plan.limits?.maxTables || 10}</div>
                  <div>Admins: {plan.limits?.maxAdmins || 1}</div>
                  <div>Captains: {plan.limits?.maxCaptains || 2}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">
                {selectedPlan.planName} Selected
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                This hotel will have access to all features included in the{" "}
                {selectedPlan.planName}
                with usage limits as specified.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlanSelector;
