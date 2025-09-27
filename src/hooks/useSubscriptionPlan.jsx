// useSubscription Hook - hooks/useSubscription.js

import { useState, useEffect, useCallback } from "react";
import { subscriptionServices } from "../services/api/subscriptionPlanServices";

export const useSubscription = ({ onPlanAdded } = {}) => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscriptionServices.subscribeToPlans((data) => {
      setPlans(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPlans = subscriptionServices.filterPlans(plans, searchTerm);

  const addPlan = useCallback(
    async (planData) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await subscriptionServices.addPlan(planData, plans);
        if (success) {
          // Call the onPlanAdded callback if provided
          if (onPlanAdded) {
            onPlanAdded(planData);
          }
        }
        return success;
      } catch (err) {
        setError(err.message || "Error adding plan");
        console.error("Error in addPlan:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [plans, submitting, onPlanAdded]
  );

  const updatePlan = useCallback(
    async (planData, planId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await subscriptionServices.updatePlan(planId, planData);
        return success;
      } catch (err) {
        setError(err.message || "Error updating plan");
        console.error("Error in updatePlan:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const deletePlan = useCallback(
    async (plan) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await subscriptionServices.deletePlan(plan);
        return success;
      } catch (err) {
        setError(err.message || "Error deleting plan");
        console.error("Error in deletePlan:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const assignPlanToHotel = useCallback(
    async (hotelId, planId) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await subscriptionServices.assignPlanToHotel(
          hotelId,
          planId
        );
        return success;
      } catch (err) {
        setError(err.message || "Error assigning plan to hotel");
        console.error("Error in assignPlanToHotel:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting]
  );

  const prepareForEdit = useCallback(async (plan) => {
    try {
      return await subscriptionServices.prepareForEdit(plan);
    } catch (err) {
      setError(err.message || "Error preparing plan for edit");
      console.error("Error in prepareForEdit:", err);
      return null;
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (planData, planId = null) => {
      if (planId) {
        return await updatePlan(planData, planId);
      } else {
        return await addPlan(planData);
      }
    },
    [addPlan, updatePlan]
  );

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    plans,
    filteredPlans,
    searchTerm,

    // State
    loading,
    submitting,
    error,

    // Actions
    addPlan,
    updatePlan,
    deletePlan,
    assignPlanToHotel,
    prepareForEdit,
    handleFormSubmit,
    handleSearchChange,
    clearError,

    // Computed values
    planCount: plans.length,
    filteredCount: filteredPlans.length,
    hasPlans: plans.length > 0,
    hasSearchResults: filteredPlans.length > 0,

    // Setters for advanced usage
    setSearchTerm,
    setPlans,
    setError,
  };
};

// Hook for hotel subscriptions overview
export const useHotelSubscriptions = () => {
  const [hotelSubscriptions, setHotelSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscriptionServices.subscribeToHotelSubscriptions(
      (data) => {
        setHotelSubscriptions(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getSubscriptionStats = useCallback(() => {
    const stats = {
      totalHotels: hotelSubscriptions.length,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      freeUsers: 0,
      revenue: 0,
      planBreakdown: {},
    };

    hotelSubscriptions.forEach(({ subscription }) => {
      if (!subscription) {
        stats.freeUsers++;
        return;
      }

      if (subscription.status === "active") {
        const now = new Date();
        const expiresAt = subscription.expiresAt?.toDate
          ? subscription.expiresAt.toDate()
          : new Date(subscription.expiresAt);

        if (expiresAt > now) {
          stats.activeSubscriptions++;
          stats.revenue += subscription.price || 0;

          // Plan breakdown
          if (stats.planBreakdown[subscription.planName]) {
            stats.planBreakdown[subscription.planName]++;
          } else {
            stats.planBreakdown[subscription.planName] = 1;
          }
        } else {
          stats.expiredSubscriptions++;
        }
      }
    });

    return stats;
  }, [hotelSubscriptions]);

  return {
    hotelSubscriptions,
    loading,
    error,
    subscriptionStats: getSubscriptionStats(),
  };
};

// Hook for getting single hotel subscription
export const useHotelSubscription = (hotelId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);

      try {
        const subscriptionData =
          await subscriptionServices.getHotelSubscription(hotelId);
        setSubscription(subscriptionData);
      } catch (err) {
        setError(err.message || "Error fetching hotel subscription");
        console.error("Error fetching hotel subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [hotelId]);

  const assignPlan = useCallback(
    async (planId) => {
      try {
        const success = await subscriptionServices.assignPlanToHotel(
          hotelId,
          planId
        );
        if (success) {
          // Refetch subscription data
          const subscriptionData =
            await subscriptionServices.getHotelSubscription(hotelId);
          setSubscription(subscriptionData);
        }
        return success;
      } catch (err) {
        setError(err.message || "Error assigning plan");
        console.error("Error assigning plan:", err);
        return false;
      }
    },
    [hotelId]
  );

  return {
    subscription,
    loading,
    error,
    assignPlan,
    hasActiveSubscription: subscription?.status === "active",
    isExpired:
      subscription &&
      subscription.expiresAt &&
      new Date(
        subscription.expiresAt.toDate
          ? subscription.expiresAt.toDate()
          : subscription.expiresAt
      ) < new Date(),
  };
};
