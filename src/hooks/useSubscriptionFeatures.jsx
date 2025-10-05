// hooks/useSubscriptionFeatures.js

import { useState, useEffect } from "react";
import { subscriptionServices } from "../services/api/subscriptionServices";

export function useSubscriptionFeatures(hotelId) {
  const [features, setFeatures] = useState({
    // Main 3 features - defaults to false (no features enabled)
    onlyMenu: false,
    isOrderDashboard: false,
    isCustomerOrderEnable: false,

    // Additional features (for future use)
    isCaptainDashboard: false,
    isKitchenDashboard: false,
    isReportsExport: false,
    isMultiLanguage: false,
    isWhatsAppIntegration: false,
    isEmailReports: false,

    // Usage limits (default free tier)
    maxAdmins: 1,
    maxCategories: 5,
    maxMenuItems: 50,
    maxCaptains: 2,
    maxTables: 10,
    maxOrders: 500,
    maxStorage: 1024, // MB

    // Plan information
    planName: "No Plan",
    planType: "none",
    monthlyPrice: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchFeatures() {
      try {
        setLoading(true);
        setError(null);

        // First try to get hotel data with embedded subscription
        const hotelData = await subscriptionServices.getHotelById?.(hotelId);

        let subscriptionFeatures = null;

        if (hotelData?.subscription) {
          // Use embedded subscription data
          subscriptionFeatures = hotelData.subscription;
        } else {
          // Fallback to separate subscription lookup
          const subscription = await subscriptionServices.getHotelSubscription(
            hotelId
          );
          subscriptionFeatures = subscription;
        }

        if (isMounted && subscriptionFeatures) {
          // Extract features and limits
          const planFeatures = subscriptionFeatures.features || {};
          const planLimits = subscriptionFeatures.limits || {};

          setFeatures({
            // Main features
            onlyMenu: Boolean(
              planFeatures.onlyMenu || subscriptionFeatures.onlyMenu
            ),
            isOrderDashboard: Boolean(
              planFeatures.isOrderDashboard ||
                subscriptionFeatures.isOrderDashboard
            ),
            isCustomerOrderEnable: Boolean(
              planFeatures.isCustomerOrderEnable ||
                subscriptionFeatures.isCustomerOrderEnable
            ),

            // Additional features
            isCaptainDashboard: Boolean(
              planFeatures.isCaptainDashboard ||
                subscriptionFeatures.isCaptainDashboard
            ),
            isKitchenDashboard: Boolean(
              planFeatures.isKitchenDashboard ||
                subscriptionFeatures.isKitchenDashboard
            ),
            isReportsExport: Boolean(
              planFeatures.isReportsExport ||
                subscriptionFeatures.isReportsExport
            ),
            isMultiLanguage: Boolean(
              planFeatures.isMultiLanguage ||
                subscriptionFeatures.isMultiLanguage
            ),
            isWhatsAppIntegration: Boolean(
              planFeatures.isWhatsAppIntegration ||
                subscriptionFeatures.isWhatsAppIntegration
            ),
            isEmailReports: Boolean(
              planFeatures.isEmailReports || subscriptionFeatures.isEmailReports
            ),

            // Usage limits
            maxAdmins:
              parseInt(
                planLimits.maxAdmins || subscriptionFeatures.maxAdmins
              ) || 1,
            maxCategories:
              parseInt(
                planLimits.maxCategories || subscriptionFeatures.maxCategories
              ) || 5,
            maxMenuItems:
              parseInt(
                planLimits.maxMenuItems || subscriptionFeatures.maxMenuItems
              ) || 50,
            maxCaptains:
              parseInt(
                planLimits.maxCaptains || subscriptionFeatures.maxCaptains
              ) || 2,
            maxTables:
              parseInt(
                planLimits.maxTables || subscriptionFeatures.maxTables
              ) || 10,
            maxOrders:
              parseInt(
                planLimits.maxOrders || subscriptionFeatures.maxOrders
              ) || 500,
            maxStorage:
              parseInt(
                planLimits.maxStorage || subscriptionFeatures.maxStorage
              ) || 1024,

            // Plan information
            planName: subscriptionFeatures.planName || "Custom Plan",
            planType:
              subscriptionFeatures.planType || determinePlanType(planFeatures),
            monthlyPrice:
              subscriptionFeatures.monthlyPrice ||
              subscriptionFeatures.price ||
              0,
          });
        }
      } catch (err) {
        console.error("Error loading subscription features:", err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFeatures();

    return () => {
      isMounted = false;
    };
  }, [hotelId]);

  // Helper function to determine plan type based on features
  function determinePlanType(planFeatures) {
    if (planFeatures.isCustomerOrderEnable) return "premium";
    if (planFeatures.isOrderDashboard) return "standard";
    if (planFeatures.onlyMenu) return "basic";
    return "none";
  }

  // Helper methods for easier feature checking
  const hasFeature = (featureName) => Boolean(features[featureName]);

  const hasMenuAccess = () =>
    features.onlyMenu ||
    features.isOrderDashboard ||
    features.isCustomerOrderEnable;

  const hasOrderManagement = () =>
    features.isOrderDashboard || features.isCustomerOrderEnable;

  const hasCustomerOrdering = () => features.isCustomerOrderEnable;

  const isWithinLimit = (limitType, currentValue) => {
    const limit =
      features[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`];
    return currentValue <= limit;
  };

  const getRemainingLimit = (limitType, currentValue) => {
    const limit =
      features[`max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`];
    return Math.max(0, limit - currentValue);
  };

  return {
    features,
    loading,
    error,

    // Helper methods
    hasFeature,
    hasMenuAccess,
    hasOrderManagement,
    hasCustomerOrdering,
    isWithinLimit,
    getRemainingLimit,
  };
}
