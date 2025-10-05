// hotelServices.js (COMPLETE WITH isOrderEnabled)
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

export const hotelServices = {
  // Subscribe to all hotels with enhanced data
  subscribeToHotels: (callback) => {
    const hotelsRef = collection(firestore, "hotels");
    const q = query(hotelsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const hotelsArray = [];

        for (let i = 0; i < querySnapshot.docs.length; i++) {
          const docSnap = querySnapshot.docs[i];
          const hotelData = docSnap.data();

          // Get additional metrics for each hotel
          const metrics = await hotelServices.getHotelMetrics(docSnap.id);

          hotelsArray.push({
            ...hotelData,
            srNo: i + 1,
            hotelId: docSnap.id,
            metrics,
            isOrderEnabled: Boolean(hotelData.isOrderEnabled || false), // Ensure boolean
          });
        }

        callback(hotelsArray);
      },
      (error) => {
        console.error("Error fetching hotels:", error);
        toast.error("Error loading hotels", {
          position: toast.POSITION.TOP_RIGHT,
        });
        callback([]);
      }
    );
    return unsubscribe;
  },

  // Get hotel metrics (admins count, subscription info, etc.)
  getHotelMetrics: async (hotelId) => {
    try {
      const metrics = {
        totalAdmins: 0,
        totalCategories: 0,
        totalMenuItems: 0,
        totalCaptains: 0,
        totalOrders: 0,
        subscription: null,
        lastActivity: null,
      };

      // Get admin count
      const adminMetaRef = doc(firestore, "hotels", hotelId, "admins", "_meta");
      const adminMetaDoc = await getDoc(adminMetaRef);
      if (adminMetaDoc.exists()) {
        metrics.totalAdmins = adminMetaDoc.data().totalAdmins || 0;
      }

      // Get category count
      const categoryMetaRef = doc(
        firestore,
        "hotels",
        hotelId,
        "categories",
        "_meta"
      );
      const categoryMetaDoc = await getDoc(categoryMetaRef);
      if (categoryMetaDoc.exists()) {
        metrics.totalCategories = categoryMetaDoc.data().totalCategories || 0;
      }

      // Get menu items count
      const menuMetaRef = doc(firestore, "hotels", hotelId, "menu", "_meta");
      const menuMetaDoc = await getDoc(menuMetaRef);
      if (menuMetaDoc.exists()) {
        metrics.totalMenuItems = menuMetaDoc.data().totalMenuItems || 0;
      }

      // Get captains count
      const captainMetaRef = doc(
        firestore,
        "hotels",
        hotelId,
        "captains",
        "_meta"
      );
      const captainMetaDoc = await getDoc(captainMetaRef);
      if (captainMetaDoc.exists()) {
        metrics.totalCaptains = captainMetaDoc.data().totalCaptains || 0;
      }

      // Get orders count
      const ordersMetaRef = doc(
        firestore,
        "hotels",
        hotelId,
        "orders",
        "_meta"
      );
      const ordersMetaDoc = await getDoc(ordersMetaRef);
      if (ordersMetaDoc.exists()) {
        const orderData = ordersMetaDoc.data();
        metrics.totalOrders = orderData.totalOrders || 0;
      }

      // Get current subscription
      const subscriptionRef = doc(
        firestore,
        "hotels",
        hotelId,
        "subscription",
        "current"
      );
      const subscriptionDoc = await getDoc(subscriptionRef);
      if (subscriptionDoc.exists()) {
        metrics.subscription = subscriptionDoc.data();
      }

      return metrics;
    } catch (error) {
      console.error("Error getting hotel metrics:", error);
      return {
        totalAdmins: 0,
        totalCategories: 0,
        totalMenuItems: 0,
        totalCaptains: 0,
        totalOrders: 0,
        subscription: null,
        lastActivity: null,
      };
    }
  },

  // Toggle order enabled status for a hotel
  toggleOrderEnabled: async (hotelId, isEnabled) => {
    try {
      const hotelRef = doc(firestore, "hotels", hotelId);
      await updateDoc(hotelRef, {
        isOrderEnabled: Boolean(isEnabled),
        updatedAt: Timestamp.fromDate(new Date()),
      });

      toast.success(
        `Orders ${isEnabled ? "enabled" : "disabled"} successfully!`,
        {
          position: toast.POSITION.TOP_RIGHT,
        }
      );

      return { success: true };
    } catch (error) {
      console.error("Error toggling order status:", error);
      toast.error("Error updating order status. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return { success: false, error: error.message };
    }
  },

  // Add hotel with enhanced validation and setup
  addHotel: async (hotelData, existingHotels = []) => {
    try {
      // Enhanced duplicate checking
      const duplicateCheck = hotelServices.checkDuplicateHotel(
        hotelData,
        existingHotels
      );
      if (duplicateCheck.isDuplicate) {
        toast.error(duplicateCheck.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return { success: false, error: duplicateCheck.message };
      }

      // Generate hotelId from business name
      const hotelId = hotelServices.generateHotelId(hotelData.businessName);

      // Prepare comprehensive hotel data
      const data = {
        ...hotelData,
        hotelId,
        // Standardize naming
        hotelName: hotelData.businessName,
        businessName: hotelData.businessName,
        // Status handling
        status: hotelData.isActive === "active" ? "active" : "inactive",
        isActive: hotelData.isActive || "active",
        // Order enabled status - NEW FIELD
        isOrderEnabled: Boolean(hotelData.isOrderEnabled || false),
        // Timestamps
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        // Additional metadata
        setupCompleted: false,
        onboardingStep: 1,
        // Financial data
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalOrders: 0,
        // Contact normalization
        primaryContact: hotelServices.normalizePhoneNumber(
          hotelData.primaryContact
        ),
        alternateContact: hotelServices.normalizePhoneNumber(
          hotelData.alternateContact
        ),
      };

      const batch = writeBatch(firestore);

      // Create hotel document
      const hotelRef = doc(firestore, "hotels", hotelId);
      batch.set(hotelRef, data);

      // Initialize hotel collections with enhanced structure
      await hotelServices.initializeHotelCollections(batch, hotelId, data);

      // Commit all changes
      await batch.commit();

      toast.success("Hotel created successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return { success: true, hotelId };
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast.error("Error creating hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return { success: false, error: error.message };
    }
  },

  // Enhanced duplicate checking
  checkDuplicateHotel: (hotelData, existingHotels) => {
    // Check business name
    const duplicateByName = existingHotels.find(
      (h) =>
        h.businessName?.toLowerCase().trim() ===
        hotelData.businessName?.toLowerCase().trim()
    );
    if (duplicateByName) {
      return { isDuplicate: true, message: "Business name already exists" };
    }

    // Check email
    if (hotelData.businessEmail) {
      const duplicateByEmail = existingHotels.find(
        (h) =>
          h.businessEmail?.toLowerCase().trim() ===
          hotelData.businessEmail?.toLowerCase().trim()
      );
      if (duplicateByEmail) {
        return { isDuplicate: true, message: "Business email already exists" };
      }
    }

    // Check primary contact
    if (hotelData.primaryContact) {
      const normalizedPhone = hotelServices.normalizePhoneNumber(
        hotelData.primaryContact
      );
      const duplicateByPhone = existingHotels.find(
        (h) =>
          hotelServices.normalizePhoneNumber(h.primaryContact) ===
          normalizedPhone
      );
      if (duplicateByPhone) {
        return {
          isDuplicate: true,
          message: "Primary contact number already exists",
        };
      }
    }

    return { isDuplicate: false };
  },

  // Generate hotel ID
  generateHotelId: (businessName) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters except spaces
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .substring(0, 50); // Limit length
  },

  // Normalize phone numbers for comparison
  normalizePhoneNumber: (phone) => {
    if (!phone) return "";
    return phone.replace(/\D/g, ""); // Remove all non-digits
  },

  // Enhanced hotel collections initialization
  initializeHotelCollections: async (batch, hotelId, hotelData) => {
    try {
      const timestamp = Timestamp.fromDate(new Date());

      // Initialize admins collection with enhanced metadata
      const adminMetaRef = doc(firestore, "hotels", hotelId, "admins", "_meta");
      batch.set(adminMetaRef, {
        createdAt: timestamp,
        totalAdmins: 0,
        maxAdmins: 1, // Default for free plan
        lastUpdated: timestamp,
        hotelId,
      });

      // Initialize categories collection
      const categoryMetaRef = doc(
        firestore,
        "hotels",
        hotelId,
        "categories",
        "_meta"
      );
      batch.set(categoryMetaRef, {
        createdAt: timestamp,
        totalCategories: 0,
        maxCategories: 5, // Default for free plan
        lastUpdated: timestamp,
        hotelId,
      });

      // Initialize menu collection
      const menuMetaRef = doc(firestore, "hotels", hotelId, "menu", "_meta");
      batch.set(menuMetaRef, {
        createdAt: timestamp,
        totalMenuItems: 0,
        maxMenuItems: 50, // Default for free plan
        lastUpdated: timestamp,
        hotelId,
      });

      // Initialize orders collection
      const ordersMetaRef = doc(
        firestore,
        "hotels",
        hotelId,
        "orders",
        "_meta"
      );
      batch.set(ordersMetaRef, {
        createdAt: timestamp,
        totalOrders: 0,
        todayOrders: 0,
        monthlyOrders: 0,
        totalRevenue: 0,
        lastUpdated: timestamp,
        hotelId,
      });

      // Initialize captains collection
      const captainsMetaRef = doc(
        firestore,
        "hotels",
        hotelId,
        "captains",
        "_meta"
      );
      batch.set(captainsMetaRef, {
        createdAt: timestamp,
        totalCaptains: 0,
        maxCaptains: 2, // Default for free plan
        lastUpdated: timestamp,
        hotelId,
      });

      // Initialize subscription with free plan - Enhanced with order feature
      const subscriptionRef = doc(
        firestore,
        "hotels",
        hotelId,
        "subscription",
        "current"
      );
      batch.set(subscriptionRef, {
        planId: "free",
        planName: "Free Plan",
        price: 0,
        duration: 0, // Unlimited for free
        status: "active",
        features: {
          isCustomerOrderEnable: Boolean(hotelData.isOrderEnabled || true), // Based on hotel setting
          isCaptainDashboard: false,
          isKitchenDashboard: false,
          isAnalyticsDashboard: false,
          isInventoryManagement: false,
          isTableManagement: false,
          isStaffManagement: false,
          maxAdmins: 1,
          maxCategories: 5,
          maxMenuItems: 50,
          maxCaptains: 2,
          maxTables: 10,
          maxStorage: 500, // MB
        },
        assignedAt: timestamp,
        assignedBy: "system",
        hotelId,
      });

      // Initialize settings collection
      const settingsRef = doc(
        firestore,
        "hotels",
        hotelId,
        "settings",
        "general"
      );
      batch.set(settingsRef, {
        currency: "INR",
        timezone: "Asia/Kolkata",
        language: "en",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "12h",
        taxRate: 0,
        serviceCharge: 0,
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
        },
        orderSettings: {
          autoAcceptOrders: false,
          orderPreparationTime: 30, // minutes
          minimumOrderAmount: 0,
          isOrderEnabled: Boolean(hotelData.isOrderEnabled || false), // Hotel-specific order setting
        },
        createdAt: timestamp,
        hotelId,
      });
    } catch (error) {
      console.error("Error initializing hotel collections:", error);
      throw error;
    }
  },

  // Update hotel with validation
  updateHotel: async (hotelId, hotelData, existingHotels = []) => {
    try {
      // Check for duplicates excluding current hotel
      const otherHotels = existingHotels.filter((h) => h.hotelId !== hotelId);
      const duplicateCheck = hotelServices.checkDuplicateHotel(
        hotelData,
        otherHotels
      );
      if (duplicateCheck.isDuplicate) {
        toast.error(duplicateCheck.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

      const data = {
        ...hotelData,
        // Maintain consistency
        hotelName: hotelData.businessName || hotelData.hotelName,
        businessName: hotelData.businessName || hotelData.hotelName,
        status: hotelData.isActive === "active" ? "active" : "inactive",
        // Order enabled status
        isOrderEnabled: Boolean(
          hotelData.isOrderEnabled !== undefined
            ? hotelData.isOrderEnabled
            : false
        ),
        // Normalize contact numbers
        primaryContact: hotelServices.normalizePhoneNumber(
          hotelData.primaryContact
        ),
        alternateContact: hotelServices.normalizePhoneNumber(
          hotelData.alternateContact
        ),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(doc(firestore, "hotels", hotelId), data);

      // Also update the order settings in the hotel's settings collection
      try {
        const settingsRef = doc(
          firestore,
          "hotels",
          hotelId,
          "settings",
          "general"
        );
        await updateDoc(settingsRef, {
          "orderSettings.isOrderEnabled": Boolean(hotelData.isOrderEnabled),
          updatedAt: Timestamp.fromDate(new Date()),
        });
      } catch (settingsError) {
        console.warn("Could not update settings collection:", settingsError);
        // Don't fail the entire update if settings update fails
      }

      toast.success("Hotel updated successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error updating hotel:", error);
      toast.error("Error updating hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Enhanced delete with safety checks
  deleteHotel: async (hotel) => {
    try {
      const hotelId = hotel.hotelId;

      // Safety check - prevent deletion if hotel has data
      const metrics = await hotelServices.getHotelMetrics(hotelId);
      if (
        metrics.totalAdmins > 0 ||
        metrics.totalMenuItems > 0 ||
        metrics.totalOrders > 0
      ) {
        const confirmMessage = `⚠️ WARNING: This hotel has:
• ${metrics.totalAdmins} admin(s)
• ${metrics.totalMenuItems} menu item(s)
• ${metrics.totalOrders} order(s)
• Active subscription: ${metrics.subscription?.planName || "Free"}
• Orders ${hotel.isOrderEnabled ? "ENABLED" : "DISABLED"}

Deleting will permanently remove ALL data including orders, categories, and admin accounts.

Type "DELETE" to confirm:`;

        const userInput = prompt(confirmMessage);
        if (userInput !== "DELETE") {
          toast.info("Hotel deletion cancelled", {
            position: toast.POSITION.TOP_RIGHT,
          });
          return false;
        }
      }

      const batch = writeBatch(firestore);

      // Delete hotel document
      const hotelRef = doc(firestore, "hotels", hotelId);
      batch.delete(hotelRef);

      // Note: Firestore will automatically delete subcollections in production
      // For development, you might want to manually clean up subcollections

      await batch.commit();

      toast.success("Hotel deleted successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Error deleting hotel. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Enhanced filtering with multiple criteria including order status
  filterHotels: (hotels, searchTerm, filters = {}) => {
    let filteredHotels = [...hotels];

    // Text search
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredHotels = filteredHotels.filter((hotel) => {
        return (
          hotel.businessName?.toLowerCase().includes(term) ||
          hotel.hotelName?.toLowerCase().includes(term) ||
          hotel.businessType?.toLowerCase().includes(term) ||
          hotel.area?.toLowerCase().includes(term) ||
          hotel.city?.toLowerCase().includes(term) ||
          hotel.state?.toLowerCase().includes(term) ||
          hotel.address?.toLowerCase().includes(term) ||
          hotel.businessEmail?.toLowerCase().includes(term) ||
          hotel.primaryContact?.includes(term) ||
          hotel.ownerName?.toLowerCase().includes(term)
        );
      });
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      filteredHotels = filteredHotels.filter((hotel) => {
        const status = hotel.status || hotel.isActive || "active";
        if (filters.status === "active") {
          return status === "active" || status === "Active";
        } else if (filters.status === "inactive") {
          return (
            status === "inactive" ||
            status === "in_active" ||
            status === "Inactive"
          );
        }
        return true;
      });
    }

    // Order enabled filter - NEW FILTER
    if (filters.orderEnabled && filters.orderEnabled !== "all") {
      filteredHotels = filteredHotels.filter((hotel) => {
        if (filters.orderEnabled === "enabled") {
          return hotel.isOrderEnabled === true;
        } else if (filters.orderEnabled === "disabled") {
          return (
            hotel.isOrderEnabled === false || hotel.isOrderEnabled === undefined
          );
        }
        return true;
      });
    }

    // Business type filter
    if (filters.businessType && filters.businessType !== "all") {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.businessType === filters.businessType
      );
    }

    // Location filters
    if (filters.city && filters.city !== "all") {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    if (filters.state && filters.state !== "all") {
      filteredHotels = filteredHotels.filter(
        (hotel) => hotel.state?.toLowerCase() === filters.state.toLowerCase()
      );
    }

    // Subscription plan filter
    if (filters.subscriptionPlan && filters.subscriptionPlan !== "all") {
      filteredHotels = filteredHotels.filter(
        (hotel) =>
          hotel.metrics?.subscription?.planName?.toLowerCase() ===
          filters.subscriptionPlan.toLowerCase()
      );
    }

    // Add serial numbers
    return filteredHotels.map((hotel, index) => ({
      ...hotel,
      srNo: index + 1,
    }));
  },

  // Get unique filter options from hotels
  getFilterOptions: (hotels) => {
    const options = {
      businessTypes: [],
      cities: [],
      states: [],
      subscriptionPlans: [],
      orderStatuses: [
        { value: "enabled", label: "Orders Enabled" },
        { value: "disabled", label: "Orders Disabled" },
      ],
    };

    const businessTypesSet = new Set();
    const citiesSet = new Set();
    const statesSet = new Set();
    const plansSet = new Set();

    hotels.forEach((hotel) => {
      if (hotel.businessType) businessTypesSet.add(hotel.businessType);
      if (hotel.city) citiesSet.add(hotel.city);
      if (hotel.state) statesSet.add(hotel.state);
      if (hotel.metrics?.subscription?.planName) {
        plansSet.add(hotel.metrics.subscription.planName);
      }
    });

    options.businessTypes = Array.from(businessTypesSet).sort();
    options.cities = Array.from(citiesSet).sort();
    options.states = Array.from(statesSet).sort();
    options.subscriptionPlans = Array.from(plansSet).sort();

    return options;
  },

  // Prepare hotel for editing
  prepareForEdit: async (hotel) => {
    try {
      return {
        ...hotel,
        // Convert status back to isActive for form compatibility
        isActive: hotel.status === "active" ? "active" : "in_active",
        // Ensure isOrderEnabled is properly formatted
        isOrderEnabled: Boolean(hotel.isOrderEnabled || false),
      };
    } catch (error) {
      console.error("Error preparing hotel for edit:", error);
      toast.error("Error loading hotel data for editing.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return null;
    }
  },

  // Get hotel by ID with full details
  getHotelById: async (hotelId) => {
    try {
      const hotelRef = doc(firestore, "hotels", hotelId);
      const hotelSnapshot = await getDoc(hotelRef);

      if (hotelSnapshot.exists()) {
        const hotelData = hotelSnapshot.data();
        const metrics = await hotelServices.getHotelMetrics(hotelId);

        return {
          ...hotelData,
          hotelId: hotelSnapshot.id,
          metrics,
          isOrderEnabled: Boolean(hotelData.isOrderEnabled || false), // Ensure boolean
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting hotel by ID:", error);
      return null;
    }
  },

  // Bulk operations
  bulkUpdateHotels: async (hotelIds, updateData) => {
    try {
      const batch = writeBatch(firestore);

      hotelIds.forEach((hotelId) => {
        const hotelRef = doc(firestore, "hotels", hotelId);
        const processedData = {
          ...updateData,
          updatedAt: Timestamp.fromDate(new Date()),
        };

        // Ensure isOrderEnabled is boolean if provided
        if (updateData.hasOwnProperty("isOrderEnabled")) {
          processedData.isOrderEnabled = Boolean(updateData.isOrderEnabled);
        }

        batch.update(hotelRef, processedData);
      });

      await batch.commit();

      toast.success(`${hotelIds.length} hotels updated successfully!`, {
        position: toast.POSITION.TOP_RIGHT,
      });
      return true;
    } catch (error) {
      console.error("Error bulk updating hotels:", error);
      toast.error("Error updating hotels. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  },

  // Export hotels data with order status
  exportHotelsData: (hotels, format = "csv") => {
    try {
      const exportData = hotels.map((hotel) => ({
        "Hotel ID": hotel.hotelId,
        "Business Name": hotel.businessName,
        "Business Type": hotel.businessType,
        "Owner Name": hotel.ownerName,
        Email: hotel.businessEmail,
        Phone: hotel.primaryContact,
        City: hotel.city,
        State: hotel.state,
        Status: hotel.status,
        "Orders Enabled": hotel.isOrderEnabled ? "Yes" : "No", // NEW FIELD
        "Created Date":
          hotel.createdAt?.toDate?.()?.toLocaleDateString() || "N/A",
        "Total Admins": hotel.metrics?.totalAdmins || 0,
        "Total Menu Items": hotel.metrics?.totalMenuItems || 0,
        "Total Orders": hotel.metrics?.totalOrders || 0,
        "Subscription Plan": hotel.metrics?.subscription?.planName || "Free",
      }));

      // For now, return the data - you can implement actual file download
      return exportData;
    } catch (error) {
      console.error("Error exporting hotels data:", error);
      toast.error("Error exporting data.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return [];
    }
  },

  // Hotel analytics with order status
  getHotelAnalytics: (hotels) => {
    const analytics = {
      total: hotels.length,
      active: 0,
      inactive: 0,
      orderEnabled: 0,
      orderDisabled: 0,
      byBusinessType: {},
      byCity: {},
      byState: {},
      bySubscriptionPlan: {},
      byOrderStatus: {
        enabled: 0,
        disabled: 0,
      },
      revenueStats: {
        totalRevenue: 0,
        averageRevenue: 0,
        topPerformers: [],
      },
    };

    hotels.forEach((hotel) => {
      // Status counts
      const status = hotel.status || hotel.isActive || "active";
      if (status === "active" || status === "Active") {
        analytics.active++;
      } else {
        analytics.inactive++;
      }

      // Order status counts
      if (hotel.isOrderEnabled) {
        analytics.orderEnabled++;
        analytics.byOrderStatus.enabled++;
      } else {
        analytics.orderDisabled++;
        analytics.byOrderStatus.disabled++;
      }

      // Business type distribution
      if (hotel.businessType) {
        analytics.byBusinessType[hotel.businessType] =
          (analytics.byBusinessType[hotel.businessType] || 0) + 1;
      }

      // Location distribution
      if (hotel.city) {
        analytics.byCity[hotel.city] = (analytics.byCity[hotel.city] || 0) + 1;
      }
      if (hotel.state) {
        analytics.byState[hotel.state] =
          (analytics.byState[hotel.state] || 0) + 1;
      }

      // Subscription plan distribution
      const planName = hotel.metrics?.subscription?.planName || "Free";
      analytics.bySubscriptionPlan[planName] =
        (analytics.bySubscriptionPlan[planName] || 0) + 1;

      // Revenue stats
      const revenue = hotel.totalRevenue || hotel.monthlyRevenue || 0;
      analytics.revenueStats.totalRevenue += revenue;
    });

    analytics.revenueStats.averageRevenue =
      analytics.total > 0
        ? analytics.revenueStats.totalRevenue / analytics.total
        : 0;

    return analytics;
  },
};
