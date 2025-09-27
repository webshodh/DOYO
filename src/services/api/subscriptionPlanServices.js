//  Subscription Services - services/api/subscriptionServices.js

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
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firestore = getFirestore();

export const subscriptionServices = {
  // Subscribe to all subscription plans
  subscribeToPlans: (callback) => {
    const plansRef = collection(firestore, "subscription-plans");
    const unsubscribe = onSnapshot(
      plansRef,
      (querySnapshot) => {
        const plansArray = [];
        querySnapshot.forEach((docSnap, index) => {
          plansArray.push({
            ...docSnap.data(),
            srNo: index + 1,
            planId: docSnap.id,
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

  // Add a new subscription plan
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

      // Prepare plan data with all features as boolean flags
      const data = {
        ...planData,
        planId,
        price: parseFloat(planData.price) || 0,
        duration: parseInt(planData.duration) || 1,
        features: {
          // Core features
          isCustomerOrderEnable: planData.isCustomerOrderEnable || false,
          isCaptainDashboard: planData.isCaptainDashboard || false,
          isKitchenDashboard: planData.isKitchenDashboard || false,
          isAnalyticsDashboard: planData.isAnalyticsDashboard || false,
          isInventoryManagement: planData.isInventoryManagement || false,
          isTableManagement: planData.isTableManagement || false,
          isStaffManagement: planData.isStaffManagement || false,
          isReportsExport: planData.isReportsExport || false,
          isMultiLanguage: planData.isMultiLanguage || false,
          isWhatsAppIntegration: planData.isWhatsAppIntegration || false,
          isSmsNotifications: planData.isSmsNotifications || false,
          isEmailReports: planData.isEmailReports || false,
          isCustomBranding: planData.isCustomBranding || false,
          is24x7Support: planData.is24x7Support || false,
          isAPIAccess: planData.isAPIAccess || false,

          // Limits
          maxAdmins: parseInt(planData.maxAdmins) || 1,
          maxCategories: parseInt(planData.maxCategories) || 5,
          maxMenuItems: parseInt(planData.maxMenuItems) || 50,
          maxCaptains: parseInt(planData.maxCaptains) || 2,
          maxTables: parseInt(planData.maxTables) || 10,
          maxStorage: parseInt(planData.maxStorage) || 1024, // MB

          // Custom features from form
          ...planData.features,
        },
        status: planData.status || "active",
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
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

  // Update subscription plan
  updatePlan: async (planId, planData) => {
    try {
      const data = {
        ...planData,
        price: parseFloat(planData.price) || 0,
        duration: parseInt(planData.duration) || 1,
        features: {
          // Core features
          isCustomerOrderEnable: planData.isCustomerOrderEnable || false,
          isCaptainDashboard: planData.isCaptainDashboard || false,
          isKitchenDashboard: planData.isKitchenDashboard || false,
          isAnalyticsDashboard: planData.isAnalyticsDashboard || false,
          isInventoryManagement: planData.isInventoryManagement || false,
          isTableManagement: planData.isTableManagement || false,
          isStaffManagement: planData.isStaffManagement || false,
          isReportsExport: planData.isReportsExport || false,
          isMultiLanguage: planData.isMultiLanguage || false,
          isWhatsAppIntegration: planData.isWhatsAppIntegration || false,
          isSmsNotifications: planData.isSmsNotifications || false,
          isEmailReports: planData.isEmailReports || false,
          isCustomBranding: planData.isCustomBranding || false,
          is24x7Support: planData.is24x7Support || false,
          isAPIAccess: planData.isAPIAccess || false,

          // Limits
          maxAdmins: parseInt(planData.maxAdmins) || 1,
          maxCategories: parseInt(planData.maxCategories) || 5,
          maxMenuItems: parseInt(planData.maxMenuItems) || 50,
          maxCaptains: parseInt(planData.maxCaptains) || 2,
          maxTables: parseInt(planData.maxTables) || 10,
          maxStorage: parseInt(planData.maxStorage) || 1024,

          // Custom features from form
          ...planData.features,
        },
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

  // Delete subscription plan
  deletePlan: async (plan) => {
    try {
      // Check if plan is assigned to any hotels before deleting
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

  // Assign plan to hotel
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

      // Update hotel's current subscription
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
        price: planData.price,
        duration: planData.duration,
        features: planData.features,
        status: "active",
        assignedAt: Timestamp.fromDate(new Date()),
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + planData.duration * 30 * 24 * 60 * 60 * 1000)
        ), // duration in months
        updatedAt: Timestamp.fromDate(new Date()),
      });

      // Create subscription history entry
      const historyRef = doc(
        collection(firestore, "hotels", hotelId, "subscription", "history")
      );

      batch.set(historyRef, {
        planId,
        planName: planData.planName,
        price: planData.price,
        duration: planData.duration,
        assignedAt: Timestamp.fromDate(new Date()),
        assignedBy: "super-admin", // You can pass this as parameter
        action: "assigned",
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

  // Get hotel's current subscription
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
        return subscriptionDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting hotel subscription:", error);
      return null;
    }
  },

  // Subscribe to hotel subscriptions (for dashboard overview)
  subscribeToHotelSubscriptions: (callback) => {
    const unsubscribes = [];

    const hotelsRef = collection(firestore, "hotels");
    const hotelsUnsubscribe = onSnapshot(hotelsRef, async (querySnapshot) => {
      const subscriptions = [];

      for (const hotelDoc of querySnapshot.docs) {
        const hotelData = hotelDoc.data();
        const subscriptionRef = doc(
          firestore,
          "hotels",
          hotelDoc.id,
          "subscription",
          "current"
        );

        const subscriptionDoc = await getDoc(subscriptionRef);

        subscriptions.push({
          hotelId: hotelDoc.id,
          hotelName: hotelData.businessName,
          subscription: subscriptionDoc.exists()
            ? subscriptionDoc.data()
            : null,
        });
      }

      callback(subscriptions);
    });

    unsubscribes.push(hotelsUnsubscribe);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  },

  // Filter plans
  filterPlans: (plans, searchTerm) => {
    if (!searchTerm.trim()) {
      return plans.map((plan, index) => ({ ...plan, srNo: index + 1 }));
    }

    const term = searchTerm.toLowerCase();
    return plans
      .filter((plan) => {
        return (
          plan.planName?.toLowerCase().includes(term) ||
          plan.description?.toLowerCase().includes(term) ||
          plan.price?.toString().includes(term) ||
          plan.duration?.toString().includes(term)
        );
      })
      .map((plan, index) => ({ ...plan, srNo: index + 1 }));
  },

  // Get plan by ID
  getPlanById: async (planId) => {
    try {
      const planRef = doc(firestore, "subscription-plans", planId);
      const planSnapshot = await getDoc(planRef);

      if (planSnapshot.exists()) {
        return {
          ...planSnapshot.data(),
          planId: planSnapshot.id,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting plan by ID:", error);
      return null;
    }
  },

  // Prepare plan for edit
  prepareForEdit: async (plan) => {
    try {
      return {
        ...plan,
        // Flatten features for form
        isCustomerOrderEnable: plan.features?.isCustomerOrderEnable || false,
        isCaptainDashboard: plan.features?.isCaptainDashboard || false,
        isKitchenDashboard: plan.features?.isKitchenDashboard || false,
        isAnalyticsDashboard: plan.features?.isAnalyticsDashboard || false,
        isInventoryManagement: plan.features?.isInventoryManagement || false,
        isTableManagement: plan.features?.isTableManagement || false,
        isStaffManagement: plan.features?.isStaffManagement || false,
        isReportsExport: plan.features?.isReportsExport || false,
        isMultiLanguage: plan.features?.isMultiLanguage || false,
        isWhatsAppIntegration: plan.features?.isWhatsAppIntegration || false,
        isSmsNotifications: plan.features?.isSmsNotifications || false,
        isEmailReports: plan.features?.isEmailReports || false,
        isCustomBranding: plan.features?.isCustomBranding || false,
        is24x7Support: plan.features?.is24x7Support || false,
        isAPIAccess: plan.features?.isAPIAccess || false,
        maxAdmins: plan.features?.maxAdmins || 1,
        maxCategories: plan.features?.maxCategories || 5,
        maxMenuItems: plan.features?.maxMenuItems || 50,
        maxCaptains: plan.features?.maxCaptains || 2,
        maxTables: plan.features?.maxTables || 10,
        maxStorage: plan.features?.maxStorage || 1024,
      };
    } catch (error) {
      console.error("Error preparing plan for edit:", error);
      toast.error("Error loading plan data for editing.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },
};
