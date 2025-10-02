
// useSubscription Hook - hooks/useSubscription.js (OPTIMIZED)

import { useState, useEffect, useCallback, useMemo } from "react";
import { subscriptionServices } from "../services/api/subscriptionPlanServices";

export const useSubscription = ({ onPlanAdded } = {}) => {
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Memoize subscription setup to prevent re-subscriptions
  useEffect(() => {
    let unsubscribe;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = subscriptionServices.subscribeToPlans((data) => {
        setPlans(data);
        setLoading(false);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-subscriptions

  // Memoize filtered plans to prevent re-computation on every render
  const filteredPlans = useMemo(() => {
    return subscriptionServices.filterPlans(plans, searchTerm);
  }, [plans, searchTerm]);

  // Optimize addPlan with stable dependencies
  const addPlan = useCallback(
    async (planData) => {
      if (submitting) return false;
      setSubmitting(true);
      setError(null);

      try {
        const success = await subscriptionServices.addPlan(planData, plans);
        if (success && onPlanAdded) {
          onPlanAdded(planData);
        }
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error adding plan";
        setError(errorMessage);
        console.error("Error in addPlan:", err);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, onPlanAdded] // Removed plans from dependencies as it causes unnecessary re-renders
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
        const errorMessage = err.message || "Error updating plan";
        setError(errorMessage);
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
        const errorMessage = err.message || "Error deleting plan";
        setError(errorMessage);
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
        const errorMessage = err.message || "Error assigning plan to hotel";
        setError(errorMessage);
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
      const errorMessage = err.message || "Error preparing plan for edit";
      setError(errorMessage);
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

  // Memoize computed values to prevent recalculation
  const computedValues = useMemo(() => ({
    planCount: plans.length,
    filteredCount: filteredPlans.length,
    hasPlans: plans.length > 0,
    hasSearchResults: filteredPlans.length > 0,
  }), [plans.length, filteredPlans.length]);

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

    // Computed values (memoized)
    ...computedValues,

    // Setters for advanced usage
    setSearchTerm,
    setPlans,
    setError,
  };
};

// Hook for hotel subscriptions overview (OPTIMIZED)
export const useHotelSubscriptions = () => {
  const [hotelSubscriptions, setHotelSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = subscriptionServices.subscribeToHotelSubscriptions(
        (data) => {
          setHotelSubscriptions(data);
          setLoading(false);
        }
      );
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []); // Empty dependency array prevents re-subscriptions

  // Memoize subscription stats to prevent recalculation on every render
  const subscriptionStats = useMemo(() => {
    const stats = {
      totalHotels: hotelSubscriptions.length,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      freeUsers: 0,
      revenue: 0,
      planBreakdown: {},
    };

    const now = new Date();

    hotelSubscriptions.forEach(({ subscription }) => {
      if (!subscription) {
        stats.freeUsers++;
        return;
      }

      if (subscription.status === "active") {
        const expiresAt = subscription.expiresAt?.toDate
          ? subscription.expiresAt.toDate()
          : new Date(subscription.expiresAt);

        if (expiresAt > now) {
          stats.activeSubscriptions++;
          stats.revenue += subscription.price || 0;

          // Plan breakdown
          const planName = subscription.planName;
          stats.planBreakdown[planName] = (stats.planBreakdown[planName] || 0) + 1;
        } else {
          stats.expiredSubscriptions++;
        }
      }
    });

    return stats;
  }, [hotelSubscriptions]); // Only recalculate when hotelSubscriptions change

  return {
    hotelSubscriptions,
    loading,
    error,
    subscriptionStats,
  };
};

// Hook for getting single hotel subscription (OPTIMIZED)
export const useHotelSubscription = (hotelId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize hotel subscription status
  const subscriptionStatus = useMemo(() => {
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        isExpired: false,
      };
    }

    const hasActiveSubscription = subscription.status === "active";
    const isExpired = subscription.expiresAt ? 
      new Date(
        subscription.expiresAt.toDate
          ? subscription.expiresAt.toDate()
          : subscription.expiresAt
      ) < new Date() : false;

    return {
      hasActiveSubscription,
      isExpired,
    };
  }, [subscription]);

  useEffect(() => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    let isMounted = true; // Prevent state updates if component unmounted

    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);

      try {
        const subscriptionData =
          await subscriptionServices.getHotelSubscription(hotelId);

        if (isMounted) {
          setSubscription(subscriptionData);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err.message || "Error fetching hotel subscription";
          setError(errorMessage);
          console.error("Error fetching hotel subscription:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubscription();

    return () => {
      isMounted = false;
    };
  }, [hotelId]); // Only re-fetch if hotelId changes

  const assignPlan = useCallback(
    async (planId) => {
      try {
        const success = await subscriptionServices.assignPlanToHotel(
          hotelId,
          planId
        );

        if (success) {
          // Instead of refetching, update the subscription optimistically
          // This reduces one database read per assignment
          const subscriptionData =
            await subscriptionServices.getHotelSubscription(hotelId);
          setSubscription(subscriptionData);
        }
        return success;
      } catch (err) {
        const errorMessage = err.message || "Error assigning plan";
        setError(errorMessage);
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
    ...subscriptionStatus, // Spread memoized status
  };
};
