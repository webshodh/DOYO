import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  startAfter,
  endBefore,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { toast } from "react-toastify";
import { app } from "../firebase/firebaseConfig";

const firestore = getFirestore(app);
const auth = getAuth(app);

// Utility functions
const handleFirebaseError = (error, customMessage = "An error occurred") => {
  console.error("Firebase Error:", error);
  const errorMessage = error.message || customMessage;
  toast.error(errorMessage);
  return { success: false, error: errorMessage };
};

const createSuccessResponse = (
  data = null,
  message = "Operation successful"
) => {
  return { success: true, data, message };
};

const validateOrderData = (orderData) => {
  const required = ["hotelName", "orderItems", "totalAmount"];
  const missing = required.filter((field) => !orderData[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (
    !Array.isArray(orderData.orderItems) ||
    orderData.orderItems.length === 0
  ) {
    throw new Error("Order must contain at least one item");
  }

  return true;
};

// Kitchen Services Object
export const kitchenServices = {
  // Authentication Functions
  async loginKitchenAdmin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Get kitchen admin data
      const adminDoc = await getDoc(doc(firestore, "kitchenAdmins", user.uid));

      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error("Kitchen admin account not found");
      }

      const adminData = {
        uid: user.uid,
        email: user.email,
        ...adminDoc.data(),
      };

      // Store in localStorage
      localStorage.setItem("kitchenAdmin", JSON.stringify(adminData));

      toast.success("Login successful!");
      return createSuccessResponse(adminData, "Login successful");
    } catch (error) {
      return handleFirebaseError(error, "Login failed");
    }
  },

  async logoutKitchenAdmin() {
    try {
      await signOut(auth);
      localStorage.removeItem("kitchenAdmin");
      toast.success("Logged out successfully");
      return createSuccessResponse(null, "Logged out successfully");
    } catch (error) {
      return handleFirebaseError(error, "Logout failed");
    }
  },

  async getCurrentKitchenAdmin() {
    try {
      const storedAdmin = localStorage.getItem("kitchenAdmin");
      if (storedAdmin) {
        return JSON.parse(storedAdmin);
      }

      const user = auth.currentUser;
      if (!user) return null;

      const adminDoc = await getDoc(doc(firestore, "kitchenAdmins", user.uid));
      if (adminDoc.exists()) {
        const adminData = {
          uid: user.uid,
          email: user.email,
          ...adminDoc.data(),
        };
        localStorage.setItem("kitchenAdmin", JSON.stringify(adminData));
        return adminData;
      }

      return null;
    } catch (error) {
      console.error("Error getting current kitchen admin:", error);
      return null;
    }
  },

  // Order Management Functions
  async getOrders(hotelName, options = {}) {
    try {
      const {
        status = null,
        limit: queryLimit = 100,
        orderBy: orderByField = "timestamp",
        sortOrder = "desc",
        startDate = null,
        endDate = null,
      } = options;

      let ordersQuery = collection(firestore, `hotels/${hotelName}/orders`);
      const constraints = [];

      // Add status filter
      if (status && status !== "all") {
        constraints.push(where("status", "==", status));
      }

      // Add date range filter
      if (startDate) {
        constraints.push(
          where("timestamp", ">=", Timestamp.fromDate(startDate))
        );
      }
      if (endDate) {
        constraints.push(where("timestamp", "<=", Timestamp.fromDate(endDate)));
      }

      // Add ordering
      constraints.push(orderBy(orderByField, sortOrder));

      // Add limit
      if (queryLimit) {
        constraints.push(limit(queryLimit));
      }

      ordersQuery = query(ordersQuery, ...constraints);
      const snapshot = await getDocs(ordersQuery);

      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      }));

      return createSuccessResponse(orders, `Retrieved ${orders.length} orders`);
    } catch (error) {
      return handleFirebaseError(error, "Failed to fetch orders");
    }
  },

  async getOrderById(hotelName, orderId) {
    try {
      const orderDoc = await getDoc(
        doc(firestore, `hotels/${hotelName}/orders`, orderId)
      );

      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }

      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data(),
        timestamp: orderDoc.data().timestamp?.toDate?.() || new Date(),
        createdAt: orderDoc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: orderDoc.data().updatedAt?.toDate?.() || new Date(),
      };

      return createSuccessResponse(orderData, "Order retrieved successfully");
    } catch (error) {
      return handleFirebaseError(error, "Failed to fetch order");
    }
  },

  // Order Status Management
  async updateOrderStatus(hotelName, orderId, newStatus, updateData = {}) {
    try {
      const orderRef = doc(firestore, `hotels/${hotelName}/orders`, orderId);

      // Get current order data
      const orderDoc = await getDoc(orderRef);
      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }

      const currentOrder = orderDoc.data();
      const validStatuses = [
        "received",
        "preparing",
        "ready",
        "completed",
        "rejected",
      ];

      if (!validStatuses.includes(newStatus.toLowerCase())) {
        throw new Error("Invalid order status");
      }

      // Prepare update data
      const updatePayload = {
        status: newStatus.toLowerCase(),
        updatedAt: serverTimestamp(),
        lastStatusUpdate: serverTimestamp(),
        statusHistory: [
          ...(currentOrder.statusHistory || []),
          {
            status: newStatus.toLowerCase(),
            timestamp: new Date().toISOString(),
            updatedBy: updateData.updatedBy || "kitchen",
            updatedByName: updateData.updatedByName || "Kitchen Admin",
            notes: updateData.notes || `Status updated to ${newStatus}`,
          },
        ],
        ...updateData,
      };

      // Add completion timestamp for completed orders
      if (newStatus.toLowerCase() === "completed") {
        updatePayload.completedAt = serverTimestamp();
        updatePayload.completionTime = new Date().toISOString();
      }

      // Add rejection data for rejected orders
      if (newStatus.toLowerCase() === "rejected") {
        updatePayload.rejectedAt = serverTimestamp();
        updatePayload.rejectionReason =
          updateData.rejectionReason || "Order rejected by kitchen";
      }

      await updateDoc(orderRef, updatePayload);

      toast.success(`Order status updated to ${newStatus}`);
      return createSuccessResponse(
        { orderId, newStatus },
        "Status updated successfully"
      );
    } catch (error) {
      return handleFirebaseError(error, "Failed to update order status");
    }
  },

  async completeOrder(hotelName, orderId, updateData = {}) {
    try {
      const result = await this.updateOrderStatus(
        hotelName,
        orderId,
        "completed",
        {
          ...updateData,
          notes: updateData.notes || "Order completed by kitchen",
          kitchen: {
            completedBy: updateData.updatedByName || "Kitchen Admin",
            completedAt: new Date().toISOString(),
            notes: updateData.notes || "Order completed successfully",
          },
        }
      );

      if (result.success) {
        toast.success("Order marked as completed!");
      }

      return result;
    } catch (error) {
      return handleFirebaseError(error, "Failed to complete order");
    }
  },

  async rejectOrder(hotelName, orderId, rejectionReason, updateData = {}) {
    try {
      const result = await this.updateOrderStatus(
        hotelName,
        orderId,
        "rejected",
        {
          ...updateData,
          rejectionReason: rejectionReason || "Order rejected by kitchen",
          notes: updateData.notes || `Order rejected: ${rejectionReason}`,
          kitchen: {
            rejectedBy: updateData.updatedByName || "Kitchen Admin",
            rejectedAt: new Date().toISOString(),
            rejectionReason: rejectionReason || "Order rejected by kitchen",
            notes: updateData.notes || `Order rejected: ${rejectionReason}`,
          },
        }
      );

      if (result.success) {
        toast.success("Order rejected");
      }

      return result;
    } catch (error) {
      return handleFirebaseError(error, "Failed to reject order");
    }
  },

  // Real-time Subscriptions
  subscribeToOrders(hotelName, callback, options = {}) {
    try {
      const {
        status = null,
        limit: queryLimit = 100,
        orderBy: orderByField = "timestamp",
        sortOrder = "desc",
      } = options;

      let ordersQuery = collection(firestore, `hotels/${hotelName}/orders`);
      const constraints = [];

      // Add status filter
      if (status && status !== "all") {
        constraints.push(where("status", "==", status));
      }

      // Add ordering and limit
      constraints.push(orderBy(orderByField, sortOrder));
      if (queryLimit) {
        constraints.push(limit(queryLimit));
      }

      ordersQuery = query(ordersQuery, ...constraints);

      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
          }));

          callback(orders);
        },
        (error) => {
          console.error("Error in orders subscription:", error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up orders subscription:", error);
      return () => {}; // Return empty function
    }
  },

  subscribeToOrder(hotelName, orderId, callback) {
    try {
      const orderRef = doc(firestore, `hotels/${hotelName}/orders`, orderId);

      const unsubscribe = onSnapshot(
        orderRef,
        (doc) => {
          if (doc.exists()) {
            const orderData = {
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate?.() || new Date(),
              createdAt: doc.data().createdAt?.toDate?.() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            };
            callback(orderData);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error("Error in order subscription:", error);
          callback(null);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up order subscription:", error);
      return () => {}; // Return empty function
    }
  },

  // Order Statistics
  async getOrderStatistics(hotelName, options = {}) {
    try {
      const {
        startDate = null,
        endDate = null,
        period = "daily", // daily, weekly, monthly, total
      } = options;

      let ordersQuery = collection(firestore, `hotels/${hotelName}/orders`);
      const constraints = [];

      // Add date range filter based on period
      const now = new Date();
      let periodStart = null;

      switch (period) {
        case "daily":
          periodStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "weekly":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          periodStart = weekStart;
          break;
        case "monthly":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          // For "total", don't add date filter
          break;
      }

      if (periodStart || startDate) {
        constraints.push(
          where("timestamp", ">=", Timestamp.fromDate(periodStart || startDate))
        );
      }
      if (endDate) {
        constraints.push(where("timestamp", "<=", Timestamp.fromDate(endDate)));
      }

      ordersQuery = query(ordersQuery, ...constraints);
      const snapshot = await getDocs(ordersQuery);

      const orders = snapshot.docs.map((doc) => doc.data());

      // Calculate statistics
      const stats = {
        totalOrders: orders.length,
        received: orders.filter((o) => o.status === "received").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        ready: orders.filter((o) => o.status === "ready").length,
        completed: orders.filter((o) => o.status === "completed").length,
        rejected: orders.filter((o) => o.status === "rejected").length,
        totalRevenue: orders
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0),
        averageOrderValue: 0,
        completionRate: 0,
        rejectionRate: 0,
      };

      // Calculate rates
      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalRevenue / stats.completed || 0;
        stats.completionRate = (stats.completed / stats.totalOrders) * 100;
        stats.rejectionRate = (stats.rejected / stats.totalOrders) * 100;
      }

      return createSuccessResponse(stats, "Statistics retrieved successfully");
    } catch (error) {
      return handleFirebaseError(error, "Failed to fetch statistics");
    }
  },

  // Kitchen Admin Management
  async updateKitchenAdminProfile(adminId, updateData) {
    try {
      const adminRef = doc(firestore, "kitchenAdmins", adminId);

      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(adminRef, updatePayload);

      // Update localStorage
      const currentAdmin = this.getCurrentKitchenAdmin();
      if (currentAdmin) {
        const updatedAdmin = { ...currentAdmin, ...updateData };
        localStorage.setItem("kitchenAdmin", JSON.stringify(updatedAdmin));
      }

      toast.success("Profile updated successfully");
      return createSuccessResponse(updateData, "Profile updated successfully");
    } catch (error) {
      return handleFirebaseError(error, "Failed to update profile");
    }
  },

  // Utility Functions
  async deleteOrder(hotelName, orderId) {
    try {
      const orderRef = doc(firestore, `hotels/${hotelName}/orders`, orderId);

      // Check if order exists
      const orderDoc = await getDoc(orderRef);
      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }

      const orderData = orderDoc.data();

      // Only allow deletion of certain statuses
      const deletableStatuses = ["received", "rejected"];
      if (!deletableStatuses.includes(orderData.status)) {
        throw new Error(
          "Cannot delete orders that are being prepared or completed"
        );
      }

      await deleteDoc(orderRef);

      toast.success("Order deleted successfully");
      return createSuccessResponse({ orderId }, "Order deleted successfully");
    } catch (error) {
      return handleFirebaseError(error, "Failed to delete order");
    }
  },

  // Search and Filter Functions
  async searchOrders(hotelName, searchTerm, options = {}) {
    try {
      const { status = null, limit: queryLimit = 50 } = options;

      // Get all orders first (we'll filter client-side for text search)
      let ordersQuery = collection(firestore, `hotels/${hotelName}/orders`);
      const constraints = [];

      if (status && status !== "all") {
        constraints.push(where("status", "==", status));
      }

      constraints.push(orderBy("timestamp", "desc"));

      if (queryLimit) {
        constraints.push(limit(queryLimit));
      }

      ordersQuery = query(ordersQuery, ...constraints);
      const snapshot = await getDocs(ordersQuery);

      const allOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      // Filter orders based on search term
      const filteredOrders = allOrders.filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.customerPhone?.toLowerCase().includes(searchLower) ||
          order.displayTable?.toLowerCase().includes(searchLower) ||
          order.orderItems?.some((item) =>
            item.menuName?.toLowerCase().includes(searchLower)
          )
        );
      });

      return createSuccessResponse(
        filteredOrders,
        `Found ${filteredOrders.length} matching orders`
      );
    } catch (error) {
      return handleFirebaseError(error, "Search failed");
    }
  },

  // Print/Bill Functions
  async generateOrderBill(hotelName, orderId) {
    try {
      const orderResult = await this.getOrderById(hotelName, orderId);

      if (!orderResult.success) {
        throw new Error("Order not found");
      }

      const order = orderResult.data;

      // Get restaurant info
      const hotelDoc = await getDoc(doc(firestore, "hotels", hotelName));
      const hotelInfo = hotelDoc.exists() ? hotelDoc.data() : {};

      const billData = {
        order: order,
        restaurant: {
          name: hotelInfo.name || hotelName,
          address: hotelInfo.address || "Restaurant Address",
          phone: hotelInfo.phone || "Phone Number",
          gst: hotelInfo.gstNumber || "GST Number",
          email: hotelInfo.email || "Email",
        },
        generatedAt: new Date().toISOString(),
        generatedBy: "kitchen",
      };

      return createSuccessResponse(billData, "Bill generated successfully");
    } catch (error) {
      return handleFirebaseError(error, "Failed to generate bill");
    }
  },

  // Batch Operations
  async batchUpdateOrderStatus(
    hotelName,
    orderIds,
    newStatus,
    updateData = {}
  ) {
    try {
      const batch = writeBatch(firestore);

      for (const orderId of orderIds) {
        const orderRef = doc(firestore, `hotels/${hotelName}/orders`, orderId);
        batch.update(orderRef, {
          status: newStatus.toLowerCase(),
          updatedAt: serverTimestamp(),
          lastStatusUpdate: serverTimestamp(),
          ...updateData,
        });
      }

      await batch.commit();

      toast.success(`${orderIds.length} orders updated successfully`);
      return createSuccessResponse(
        { orderIds, newStatus },
        `${orderIds.length} orders updated successfully`
      );
    } catch (error) {
      return handleFirebaseError(error, "Batch update failed");
    }
  },

  // Connection Status
  isOnline() {
    return navigator.onLine;
  },

  // Error Recovery
  async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        console.warn(
          `Operation failed, attempt ${attempt}/${maxRetries}:`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  },
};

// Export default
export default kitchenServices;
