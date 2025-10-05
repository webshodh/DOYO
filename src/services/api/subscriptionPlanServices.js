// services/api/subscriptionServices.js

import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firestore = getFirestore();

export const subscriptionServices = {
  // Subscribe to all subscription plans with enhanced structure
  subscribeToPlans: (callback) => {
    const plansRef = collection(firestore, "subscription-plans");
    const q = query(plansRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const plansArray = [];
        querySnapshot.forEach((docSnap, index) => {
          const data = docSnap.data();
          plansArray.push({
            ...data,
            srNo: index + 1,
            planId: docSnap.id,
            // Flatten features and limits for easier access
            ...(data.features || {}),
            ...(data.limits || {}),
            // Keep original nested structure
            originalFeatures: data.features || {},
            originalLimits: data.limits || {},
          });
        });
        callback(plansArray);
      },
      (error) => {
        console.error("Error fetching subscription plans:", error);
        toast.error("Error loading subscription plans", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );
    return unsubscribe;
  },

  // Add a new subscription plan with enhanced feature structure
  addPlan: async (planData, existingPlans = []) => {
    try {
      // Check duplicate plan name
      if (
        existingPlans.some(
          (plan) =>
            plan.planName?.toLowerCase() === planData.planName?.toLowerCase()
        )
      ) {
        toast.error("Plan name already exists", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      // Generate planId from plan name (sanitized for Firestore)
      const planId = planData.planName
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();

      // Prepare enhanced plan data structure
      const data = {
        planName: planData.planName,
        description: planData.description,
        status: planData.status || "active",

        // Pricing structure
        pricing: {
          monthlyPrice: parseFloat(planData.price) || 0,
          duration: parseInt(planData.duration) || 1,
          currency: "INR",
        },

        // Core restaurant features
        features: {
          // Customer & Ordering Features
          isCustomerOrderEnable: Boolean(planData.isCustomerOrderEnable),
          isCaptainDashboard: Boolean(planData.isCaptainDashboard),
          isKitchenDashboard: Boolean(planData.isKitchenDashboard),
          isOrderDashboard: Boolean(planData.isOrderDashboard),

          // Management Features
          isInventoryManagement: Boolean(planData.isInventoryManagement),
          isTableManagement: Boolean(planData.isTableManagement),
          isStaffManagement: Boolean(planData.isStaffManagement),

          // Analytics & Reports
          isAnalyticsDashboard: Boolean(planData.isAnalyticsDashboard),
          isReportsExport: Boolean(planData.isReportsExport),
          isSalesReports: Boolean(planData.isSalesReports),
          isCustomerInsights: Boolean(planData.isCustomerInsights),

          // Communication & Integration
          isWhatsAppIntegration: Boolean(planData.isWhatsAppIntegration),
          isSmsNotifications: Boolean(planData.isSmsNotifications),
          isEmailReports: Boolean(planData.isEmailReports),
          isMultiLanguage: Boolean(planData.isMultiLanguage),
          is24x7Support: Boolean(planData.is24x7Support),
        },

        // Usage limits and quotas
        limits: {
          maxAdmins: parseInt(planData.maxAdmins) || 1,
          maxCategories: parseInt(planData.maxCategories) || 5,
          maxMenuItems: parseInt(planData.maxMenuItems) || 50,
          maxCaptains: parseInt(planData.maxCaptains) || 2,
          maxTables: parseInt(planData.maxTables) || 10,
          maxOrders: parseInt(planData.maxOrders) || 1000,
          maxStorage: parseInt(planData.maxStorage) || 1024, // MB
        },

        // Metadata
        planId,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),

        // Legacy support - keep flat price and duration
        price: parseFloat(planData.price) || 0,
        duration: parseInt(planData.duration) || 1,
      };

      const planRef = doc(firestore, "subscription-plans", planId);
      await setDoc(planRef, data);

      toast.success("Subscription plan created successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error adding subscription plan:", error);
      toast.error("Error creating subscription plan. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Update subscription plan with enhanced structure
  updatePlan: async (planId, planData) => {
    try {
      const data = {
        planName: planData.planName,
        description: planData.description,
        status: planData.status || "active",

        pricing: {
          monthlyPrice: parseFloat(planData.price) || 0,
          duration: parseInt(planData.duration) || 1,
          currency: "INR",
        },

        features: {
          // Customer & Ordering Features
          isCustomerOrderEnable: Boolean(planData.isCustomerOrderEnable),
          isCaptainDashboard: Boolean(planData.isCaptainDashboard),
          isKitchenDashboard: Boolean(planData.isKitchenDashboard),
          isOrderDashboard: Boolean(planData.isOrderDashboard),

          // Management Features
          isInventoryManagement: Boolean(planData.isInventoryManagement),
          isTableManagement: Boolean(planData.isTableManagement),
          isStaffManagement: Boolean(planData.isStaffManagement),

          // Analytics & Reports
          isAnalyticsDashboard: Boolean(planData.isAnalyticsDashboard),
          isReportsExport: Boolean(planData.isReportsExport),
          isSalesReports: Boolean(planData.isSalesReports),
          isCustomerInsights: Boolean(planData.isCustomerInsights),

          // Communication & Integration
          isWhatsAppIntegration: Boolean(planData.isWhatsAppIntegration),
          isSmsNotifications: Boolean(planData.isSmsNotifications),
          isEmailReports: Boolean(planData.isEmailReports),
          isMultiLanguage: Boolean(planData.isMultiLanguage),
          is24x7Support: Boolean(planData.is24x7Support),
        },

        limits: {
          maxAdmins: parseInt(planData.maxAdmins) || 1,
          maxCategories: parseInt(planData.maxCategories) || 5,
          maxMenuItems: parseInt(planData.maxMenuItems) || 50,
          maxCaptains: parseInt(planData.maxCaptains) || 2,
          maxTables: parseInt(planData.maxTables) || 10,
          maxOrders: parseInt(planData.maxOrders) || 1000,
          maxStorage: parseInt(planData.maxStorage) || 1024,
        },

        // Legacy support
        price: parseFloat(planData.price) || 0,
        duration: parseInt(planData.duration) || 1,

        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(doc(firestore, "subscription-plans", planId), data);

      toast.success("Subscription plan updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      toast.error("Error updating subscription plan. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Enhanced delete with better validation
  deletePlan: async (plan) => {
    try {
      // Check if plan is assigned to any hotels
      const hotelsRef = collection(firestore, "hotels");
      const hotelsSnapshot = await getDocs(hotelsRef);

      let assignedToHotels = [];
      for (const hotelDoc of hotelsSnapshot.docs) {
        const subscriptionRef = doc(
          firestore,
          "hotels",
          hotelDoc.id,
          "subscription",
          "current"
        );
        const subscriptionDoc = await getDoc(subscriptionRef);

        if (
          subscriptionDoc.exists() &&
          subscriptionDoc.data().planId === plan.planId
        ) {
          assignedToHotels.push(hotelDoc.data().businessName);
        }
      }

      if (assignedToHotels.length > 0) {
        toast.error(
          `Cannot delete plan. It's assigned to: ${assignedToHotels.join(
            ", "
          )}`,
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
        return false;
      }

      await deleteDoc(doc(firestore, "subscription-plans", plan.planId));

      toast.success("Subscription plan deleted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      toast.error("Error deleting subscription plan. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Enhanced assign plan with better data structure
  assignPlanToHotel: async (hotelId, planId) => {
    try {
      const batch = writeBatch(firestore);

      // Get plan details
      const planRef = doc(firestore, "subscription-plans", planId);
      const planDoc = await getDoc(planRef);

      if (!planDoc.exists()) {
        toast.error("Subscription plan not found", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const planData = planDoc.data();
      const duration = planData.pricing?.duration || planData.duration || 1;
      const price = planData.pricing?.monthlyPrice || planData.price || 0;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + duration);

      // Update hotel's current subscription with enhanced structure
      const subscriptionRef = doc(
        firestore,
        "hotels",
        hotelId,
        "subscription",
        "current"
      );

      batch.set(subscriptionRef, {
        planId,
        planName: planData.planName,

        // Pricing info
        pricing: planData.pricing || {
          monthlyPrice: price,
          duration,
          currency: "INR",
        },

        // All features and limits for quick access
        features: planData.features || {},
        limits: planData.limits || {},

        // Subscription status
        status: "active",
        assignedAt: Timestamp.fromDate(new Date()),
        expiresAt: Timestamp.fromDate(expiresAt),

        // Legacy support
        price,
        duration,

        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Update hotel document with subscription info
      const hotelRef = doc(firestore, "hotels", hotelId);
      batch.update(hotelRef, {
        currentSubscription: {
          planId,
          planName: planData.planName,
          status: "active",
          features: planData.features || {},
          limits: planData.limits || {},
        },
        subscriptionUpdatedAt: Timestamp.fromDate(new Date()),
      });

      // Create subscription history entry
      const historyRef = doc(
        collection(firestore, "hotels", hotelId, "subscription", "history")
      );

      batch.set(historyRef, {
        planId,
        planName: planData.planName,
        price,
        duration,
        assignedAt: Timestamp.fromDate(new Date()),
        assignedBy: "super-admin",
        action: "assigned",
        features: planData.features || {},
        limits: planData.limits || {},
      });

      await batch.commit();

      toast.success("Plan assigned to hotel successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error assigning plan to hotel:", error);
      toast.error("Error assigning plan to hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Enhanced hotel subscription getter
  getHotelSubscription: async (hotelId) => {
    try {
      const subscriptionRef = doc(
        firestore,
        "hotels",
        hotelId,
        "subscription",
        "current"
      );
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        const now = new Date();
        const expiresAt = data.expiresAt?.toDate
          ? data.expiresAt.toDate()
          : new Date(data.expiresAt);

        return {
          ...data,
          isActive: data.status === "active" && expiresAt > now,
          isExpired: expiresAt <= now,
          daysRemaining: Math.max(
            0,
            Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
          ),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting hotel subscription:", error);
      return null;
    }
  },

  // Enhanced hotel subscriptions overview
  subscribeToHotelSubscriptions: (callback) => {
    const hotelsRef = collection(firestore, "hotels");

    const unsubscribe = onSnapshot(hotelsRef, async (querySnapshot) => {
      const subscriptions = [];
      const now = new Date();

      for (const hotelDoc of querySnapshot.docs) {
        const hotelData = hotelDoc.data();
        const subscriptionRef = doc(
          firestore,
          "hotels",
          hotelDoc.id,
          "subscription",
          "current"
        );

        try {
          const subscriptionDoc = await getDoc(subscriptionRef);
          let subscriptionData = null;

          if (subscriptionDoc.exists()) {
            const data = subscriptionDoc.data();
            const expiresAt = data.expiresAt?.toDate
              ? data.expiresAt.toDate()
              : new Date(data.expiresAt);

            subscriptionData = {
              ...data,
              isActive: data.status === "active" && expiresAt > now,
              isExpired: expiresAt <= now,
              daysRemaining: Math.max(
                0,
                Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
              ),
            };
          }

          subscriptions.push({
            hotelId: hotelDoc.id,
            hotelName: hotelData.businessName,
            subscription: subscriptionData,
          });
        } catch (error) {
          console.error(
            `Error getting subscription for hotel ${hotelDoc.id}:`,
            error
          );
        }
      }

      callback(subscriptions);
    });

    return unsubscribe;
  },

  // Get active plans for selection
  getActivePlans: async () => {
    try {
      const plansRef = collection(firestore, "subscription-plans");
      const q = query(plansRef, where("status", "==", "active"));
      const snapshot = await getDocs(q);

      const plans = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        plans.push({
          planId: doc.id,
          ...data,
          // Flatten for easier access
          ...(data.features || {}),
          ...(data.limits || {}),
        });
      });

      // Sort by price
      return plans.sort((a, b) => {
        const priceA = a.pricing?.monthlyPrice || a.price || 0;
        const priceB = b.pricing?.monthlyPrice || b.price || 0;
        return priceA - priceB;
      });
    } catch (error) {
      console.error("Error getting active plans:", error);
      return [];
    }
  },

  // Enhanced filter plans
  filterPlans: (plans, searchTerm) => {
    if (!searchTerm.trim()) {
      return plans.map((plan, index) => ({ ...plan, srNo: index + 1 }));
    }

    const term = searchTerm.toLowerCase();
    return plans
      .filter((plan) => {
        const price = plan.pricing?.monthlyPrice || plan.price || 0;
        return (
          plan.planName?.toLowerCase().includes(term) ||
          plan.description?.toLowerCase().includes(term) ||
          price.toString().includes(term) ||
          plan.duration?.toString().includes(term)
        );
      })
      .map((plan, index) => ({ ...plan, srNo: index + 1 }));
  },

  // Enhanced prepare for edit
  prepareForEdit: async (plan) => {
    try {
      const price = plan.pricing?.monthlyPrice || plan.price || 0;
      const duration = plan.pricing?.duration || plan.duration || 1;

      return {
        ...plan,
        // Flatten for form
        price,
        duration,

        // Features (already flattened in subscription)
        ...(plan.originalFeatures || plan.features || {}),
        ...(plan.originalLimits || plan.limits || {}),
      };
    } catch (error) {
      console.error("Error preparing plan for edit:", error);
      toast.error("Error loading plan data for editing.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },

  // Get plan by ID
  getPlanById: async (planId) => {
    try {
      const planRef = doc(firestore, "subscription-plans", planId);
      const planSnapshot = await getDoc(planRef);

      if (planSnapshot.exists()) {
        const data = planSnapshot.data();
        return {
          ...data,
          planId: planSnapshot.id,
          // Flatten features and limits
          ...(data.features || {}),
          ...(data.limits || {}),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting plan by ID:", error);
      return null;
    }
  },
};
