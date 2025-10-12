// useOrder_optimized.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { ref, onValue, update, remove, get } from "firebase/database";
import { rtdb } from "../services/firebase/firebaseConfig";
import { toast } from "react-toastify";

export const useOrder = (hotelName, options = {}) => {
  const {
    includeMenuData = false,
    defaultTimePeriod = "daily",
    defaultStatusFilter = "all",
    sortBy = "timestamp",
    sortOrder = "desc",
  } = options;

  // STATES
  const [orders, setOrders] = useState([]);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Filter state
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTimePeriod, setSelectedTimePeriod] =
    useState(defaultTimePeriod);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Enhanced filter states for delivery platforms and order types
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Debounced search for performance
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Enhanced normalization function with platform and order type data
  const normalizeOrderData = useCallback((rawData) => {
    if (!rawData) return [];
    return Object.entries(rawData).map(([key, value]) => {
      const orderTimestamp =
        value.timestamps?.orderPlaced ||
        value.orderTime ||
        value.createdAt ||
        value.timestamp ||
        value.orderTimestamp ||
        Date.now();
      const normalizedTimestamp = new Date(orderTimestamp).toISOString();

      let normalizedStatus =
        value.kitchen?.status ||
        value.status ||
        value.orderStatus ||
        "received";

      const statusMapping = {
        new: "received",
        pending: "received",
        placed: "received",
        received: "received",
        accepted: "received",
        preparing: "received",
        cooking: "received",
        in_progress: "received",
        ready: "received",
        finished: "received",
        done: "received",
        delivered: "completed",
        completed: "completed",
        complete: "completed",
        served: "completed",
        cancelled: "rejected",
        canceled: "rejected",
        rejected: "rejected",
      };
      normalizedStatus =
        statusMapping[normalizedStatus?.toLowerCase()] ||
        normalizedStatus?.toLowerCase();

      const tableInfo =
        value.tableNumber ||
        value.tableNo ||
        value.customerInfo?.tableNumber ||
        value.table ||
        value.customerInfo?.table ||
        "0";

      // Enhanced order type and platform extraction
      const orderType =
        value.orderDetails?.orderType ||
        value.orderType ||
        value.customerInfo?.orderType ||
        (tableInfo && tableInfo !== "0" ? "dine-in" : "takeaway");

      const deliveryPlatform =
        value.platformTracking?.orderSource ||
        value.deliveryInfo?.platform ||
        value.platform ||
        value.orderSource ||
        "direct";

      const platformName =
        value.platformTracking?.platformName ||
        getPlatformDisplayName(deliveryPlatform);

      const orderPriority =
        value.orderDetails?.priority ||
        value.kitchen?.priority ||
        value.priority ||
        "normal";

      const occasionType =
        value.orderDetails?.occasionType || value.occasionType || null;

      const paymentMethod =
        value.billing?.paymentMethod || value.paymentMethod || "pending";

      const items = (value.items || value.menuItems || []).map((item, idx) => {
        const itemPrice =
          parseFloat(item.itemTotal) ||
          parseFloat(item.finalPrice) ||
          parseFloat(item.price) ||
          parseFloat(item.originalPrice) ||
          0;
        const quantity = parseInt(item.quantity) || 1;
        const totalPrice = itemPrice * quantity;
        return {
          id: item.id || item.menuId || `item-${idx}`,
          menuId: item.menuId || item.id,
          menuName: item.menuName || item.name || "Unknown Item",
          menuCategory: item.menuCategory || item.category || "Uncategorized",
          quantity,
          price:
            parseFloat(item.price) ||
            parseFloat(item.originalPrice) ||
            itemPrice,
          originalPrice:
            parseFloat(item.originalPrice) ||
            parseFloat(item.price) ||
            itemPrice,
          finalPrice: itemPrice,
          itemTotal: totalPrice,
          imageUrl: item.imageUrl || null,
          notes: item.notes || item.specialInstructions || "",
          isVeg: item.isVeg || item.categoryType === "Veg",
          isSpicy: Boolean(item.isSpicy),
          ...item,
        };
      });

      const calculatedTotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
      const totalAmount =
        parseFloat(value.pricing?.total) ||
        parseFloat(value.total) ||
        parseFloat(value.orderDetails?.total) ||
        parseFloat(value.totalPrice) ||
        calculatedTotal ||
        0;

      const orderNumber = value.orderNumber || value.orderNo || value.id || key;
      const orderDate = new Date(normalizedTimestamp)
        .toISOString()
        .split("T")[0];

      const timestamps = {
        orderPlaced: normalizedTimestamp,
        orderDate,
        lastUpdated: value.timestamps?.lastUpdated || normalizedTimestamp,
        lastStatusUpdate: value.timestamps?.lastStatusUpdate || null,
        completedTime: value.timestamps?.completedTime || null,
        rejectedTime: value.timestamps?.rejectedTime || null,
        ...value.timestamps,
      };

      // Enhanced delivery information
      const deliveryInfo = value.deliveryInfo || {};
      const platformTracking = value.platformTracking || {};
      const analytics = value.analytics || {};

      return {
        id: key,
        orderNumber,
        status: normalizedStatus,
        normalizedStatus,
        orderTimestamp: normalizedTimestamp,
        orderDate,
        timestamps,
        tableInfo: tableInfo.toString(),
        tableNumber: tableInfo.toString(),

        // Enhanced order classification
        orderType,
        deliveryPlatform,
        platformName,
        orderPriority,
        occasionType,
        paymentMethod,

        // Customer information
        customerInfo: {
          tableNumber: tableInfo.toString(),
          customerName:
            value.customerInfo?.customerName ||
            value.customerInfo?.name ||
            value.customerName ||
            "",
          phoneNumber:
            value.customerInfo?.phoneNumber ||
            value.customerInfo?.mobile ||
            value.phoneNumber ||
            "",
          email: value.customerInfo?.email || "",
          alternatePhone: value.customerInfo?.alternatePhone || "",
          guestCount: value.customerInfo?.guestCount || null,
          ...value.customerInfo,
        },

        // Enhanced delivery data
        deliveryInfo: {
          address: deliveryInfo.address || "",
          landmark: deliveryInfo.landmark || "",
          deliveryInstructions: deliveryInfo.deliveryInstructions || "",
          platform: deliveryPlatform,
          platformName,
          deliveryFee: parseFloat(deliveryInfo.deliveryFee || 0),
          estimatedDeliveryTime: deliveryInfo.estimatedDeliveryTime || null,
          deliveryStatus: deliveryInfo.deliveryStatus || "pending",
          ...deliveryInfo,
        },

        // Platform tracking data
        platformTracking: {
          orderSource: deliveryPlatform,
          platformName,
          isAggregatorOrder: deliveryPlatform !== "direct",
          platformCommission: parseFloat(
            platformTracking.platformCommission || 0
          ),
          netRevenue: parseFloat(platformTracking.netRevenue || totalAmount),
          ...platformTracking,
        },

        // Analytics data
        analytics: {
          orderValue: totalAmount,
          itemCount: items.length,
          averageItemPrice: items.length > 0 ? totalAmount / items.length : 0,
          orderChannel: deliveryPlatform,
          customerSegment: analytics.customerSegment || "walk-in",
          peakHourOrder: analytics.peakHourOrder || false,
          weekendOrder:
            analytics.weekendOrder || isWeekendOrder(normalizedTimestamp),
          festivalOrder: occasionType === "festival",
          repeatCustomer: analytics.repeatCustomer || false,
          ...analytics,
        },

        items,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        total: parseFloat(totalAmount.toFixed(2)),
        totalItems: items.length,

        orderDetails: {
          total: parseFloat(totalAmount.toFixed(2)),
          totalItems: items.length,
          subtotal: parseFloat(value.orderDetails?.subtotal || totalAmount),
          tax: parseFloat(value.orderDetails?.tax || 0),
          discount: parseFloat(value.orderDetails?.discount || 0),
          orderType,
          priority: orderPriority,
          occasionType,
          guestCount: value.orderDetails?.guestCount || null,
          specialInstructions: value.orderDetails?.specialInstructions || "",
          ...value.orderDetails,
        },

        kitchen: {
          status: normalizedStatus,
          priority: orderPriority,
          lastUpdated: timestamps.lastUpdated,
          estimatedTime: value.kitchen?.estimatedTime || null,
          notes: value.kitchen?.notes || "",
          preparationTime: value.kitchen?.preparationTime || 25,
          assignedChef: value.kitchen?.assignedChef || "",
          ...value.kitchen,
        },

        billing: {
          paymentStatus: value.billing?.paymentStatus || "pending",
          paymentMethod,
          billGenerated: value.billing?.billGenerated || false,
          paidAmount: parseFloat(value.billing?.paidAmount || 0),
          changeAmount: parseFloat(value.billing?.changeAmount || 0),
          discount: parseFloat(value.billing?.discount || 0),
          couponCode: value.billing?.couponCode || null,
          ...value.billing,
        },

        ...value,
        displayOrderNumber: `#${orderNumber}`,
        displayTable:
          orderType === "dine-in"
            ? `Table ${tableInfo}`
            : orderType.charAt(0).toUpperCase() + orderType.slice(1),
        displayStatus:
          normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1),
        displayTime: new Date(normalizedTimestamp).toLocaleString(),
        displayDate: new Date(normalizedTimestamp).toLocaleDateString(),
        displayAmount: `₹${parseFloat(
          totalAmount.toFixed(2)
        ).toLocaleString()}`,
        displayPlatform: platformName,
        displayOrderType:
          orderType.charAt(0).toUpperCase() +
          orderType.slice(1).replace("-", " "),
        displayPriority:
          orderPriority.charAt(0).toUpperCase() + orderPriority.slice(1),
      };
    });
  }, []);

  // Helper function to get platform display name
  const getPlatformDisplayName = (platform) => {
    const platformNames = {
      direct: "Direct Order",
      swiggy: "Swiggy",
      zomato: "Zomato",
      "uber-eats": "Uber Eats",
      dunzo: "Dunzo",
      shadowfax: "Shadowfax",
      bigbasket: "BigBasket",
      "amazon-food": "Amazon Food",
      foodpanda: "Foodpanda",
      magicpin: "MagicPin",
      thrive: "Thrive",
      eatsure: "EatSure",
      ondc: "ONDC Network",
      phonepe: "PhonePe",
      paytm: "Paytm",
      other: "Other Platform",
    };
    return (
      platformNames[platform] ||
      platform.charAt(0).toUpperCase() + platform.slice(1)
    );
  };

  // Helper function to check if order is on weekend
  const isWeekendOrder = (timestamp) => {
    const day = new Date(timestamp).getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  // Memoize all range/date helpers to avoid function recreation
  const dateRangeHelpers = useMemo(
    () => ({
      getCurrentWeekRange: () => {
        const now = new Date();
        const first = now.getDate() - now.getDay();
        const firstday = new Date(now.setDate(first));
        const lastday = new Date(firstday);
        lastday.setDate(firstday.getDate() + 6);
        firstday.setHours(0, 0, 0, 0);
        lastday.setHours(23, 59, 59, 999);
        return { start: firstday, end: lastday };
      },
      getCurrentMonthRange: () => {
        const now = new Date();
        const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        firstday.setHours(0, 0, 0, 0);
        lastday.setHours(23, 59, 59, 999);
        return { start: firstday, end: lastday };
      },
      isDateInRange: (orderDate, startDate, endDate) => {
        const date = new Date(orderDate);
        date.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      },
      getPeriodDisplayText: (period, date) => {
        switch (period) {
          case "daily":
            return `Orders for ${new Date(date).toLocaleDateString()}`;
          case "weekly":
            const weekRange = dateRangeHelpers.getCurrentWeekRange();
            return `Orders for this week (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
          case "monthly":
            const monthRange = dateRangeHelpers.getCurrentMonthRange();
            return `Orders for ${monthRange.start.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}`;
          case "total":
            return "All orders";
          default:
            return "Orders";
        }
      },
    }),
    []
  );

  // Real-time order subscription with error handling and retry
  useEffect(() => {
    if (!hotelName) {
      setOrders([]);
      setLoading(false);
      setConnectionStatus("disconnected");
      return;
    }

    let unsubscribe = () => {};
    let retryCount = 0;
    const maxRetries = 3;

    const connectToFirebase = () => {
      setLoading(true);
      setError(null);
      setConnectionStatus("connecting");

      const ordersRef = ref(rtdb, `/hotels/${hotelName}/orders`);
      unsubscribe = onValue(
        ordersRef,
        (snapshot) => {
          try {
            const data = snapshot.val();
            const normalizedOrders = normalizeOrderData(data);
            normalizedOrders.sort((a, b) => {
              if (sortBy === "timestamp") {
                const aTime = new Date(a.orderTimestamp);
                const bTime = new Date(b.orderTimestamp);
                return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
              } else if (sortBy === "status") {
                return sortOrder === "desc"
                  ? b.normalizedStatus.localeCompare(a.normalizedStatus)
                  : a.normalizedStatus.localeCompare(b.normalizedStatus);
              } else if (sortBy === "table") {
                const aTable = parseInt(a.tableInfo) || 0;
                const bTable = parseInt(b.tableInfo) || 0;
                return sortOrder === "desc" ? bTable - aTable : aTable - bTable;
              } else if (sortBy === "orderNumber") {
                const aNum = parseInt(a.orderNumber) || 0;
                const bNum = parseInt(b.orderNumber) || 0;
                return sortOrder === "desc" ? bNum - aNum : aNum - bNum;
              }
              return 0;
            });
            setOrders(normalizedOrders);
            setLastUpdated(new Date().toISOString());
            setConnectionStatus("connected");
            setError(null);
            retryCount = 0;
          } catch (err) {
            setError(new Error(`Error processing orders: ${err.message}`));
            setConnectionStatus("error");
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError(new Error(`Database connection error: ${err.message}`));
          setConnectionStatus("error");
          setLoading(false);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => connectToFirebase(), 2000 * retryCount);
          }
        }
      );
    };

    connectToFirebase();
    return () => {
      unsubscribe();
      setConnectionStatus("disconnected");
    };
  }, [hotelName, sortBy, sortOrder, normalizeOrderData]);

  // RTDB menu live subscription (optional)
  useEffect(() => {
    if (!hotelName || !includeMenuData) return;
    const menuRef = ref(rtdb, `/hotels/${hotelName}/menu`);
    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        const data = snapshot.val();
        setMenuData(
          data
            ? Object.entries(data).map(([key, val]) => ({
                id: key,
                menuId: key,
                ...val,
              }))
            : []
        );
      },
      (err) => {}
    );
    return () => unsubscribe();
  }, [hotelName, includeMenuData]);

  // Memoize filter/sort logic for large lists
  const timeFilteredOrders = useMemo(() => {
    if (!orders.length) return [];
    let filtered = [...orders];
    if (selectedTimePeriod === "daily") {
      filtered = filtered.filter((order) => order.orderDate === selectedDate);
    } else if (selectedTimePeriod === "weekly") {
      const { start, end } = dateRangeHelpers.getCurrentWeekRange();
      filtered = filtered.filter((order) =>
        dateRangeHelpers.isDateInRange(order.orderDate, start, end)
      );
    } else if (selectedTimePeriod === "monthly") {
      const { start, end } = dateRangeHelpers.getCurrentMonthRange();
      filtered = filtered.filter((order) =>
        dateRangeHelpers.isDateInRange(order.orderDate, start, end)
      );
    }
    return filtered;
  }, [orders, selectedTimePeriod, selectedDate, dateRangeHelpers]);

  const filteredOrders = useMemo(() => {
    let filtered = [...timeFilteredOrders];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.normalizedStatus === statusFilter
      );
    }

    // Order type filter
    if (orderTypeFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.orderType === orderTypeFilter
      );
    }

    // Platform filter
    if (platformFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.deliveryPlatform === platformFilter
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.orderPriority === priorityFilter
      );
    }

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toString().toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.tableInfo?.toString().toLowerCase().includes(searchLower) ||
          order.customerInfo?.customerName
            ?.toLowerCase()
            .includes(searchLower) ||
          order.customerInfo?.phoneNumber
            ?.toLowerCase()
            .includes(searchLower) ||
          order.items?.some((item) =>
            item.menuName?.toLowerCase().includes(searchLower)
          ) ||
          order.normalizedStatus.toLowerCase().includes(searchLower) ||
          order.platformName?.toLowerCase().includes(searchLower) ||
          order.orderType?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [
    timeFilteredOrders,
    statusFilter,
    orderTypeFilter,
    platformFilter,
    priorityFilter,
    debouncedSearchTerm,
  ]);

  // Enhanced analytics and stats with platform and order type breakdown
  const orderStats = useMemo(() => {
    const stats = {
      total: timeFilteredOrders.length,
      received: 0,
      completed: 0,
      rejected: 0,

      // Order Type Stats
      totalDineInOrders: 0,
      totalTakeawayOrders: 0,
      totalDeliveryOrders: 0,

      // Platform Stats
      totalDirectOrders: 0,
      totalSwiggyOrders: 0,
      totalZomatoOrders: 0,
      totalUberEatsOrders: 0,
      totalDunzoOrders: 0,
      totalAmazonFoodOrders: 0,
      totalFoodpandaOrders: 0,
      totalMagicPinOrders: 0,
      totalPhonePeOrders: 0,
      totalPaytmOrders: 0,
      totalONDCOrders: 0,
      totalOtherPlatformOrders: 0,

      // Priority Stats
      normalPriorityOrders: 0,
      highPriorityOrders: 0,
      expressPriorityOrders: 0,
      vipPriorityOrders: 0,

      // Payment Method Stats
      cashPayments: 0,
      cardPayments: 0,
      upiPayments: 0,
      walletPayments: 0,
      pendingPayments: 0,

      // Revenue Stats by Platform
      directRevenue: 0,
      swiggyRevenue: 0,
      zomatoRevenue: 0,
      uberEatsRevenue: 0,
      totalPlatformRevenue: 0,
      totalPlatformCommission: 0,
      netRevenue: 0,

      // Time-based Stats
      peakHourOrders: 0,
      weekendOrders: 0,
      festivalOrders: 0,
      repeatCustomerOrders: 0,

      // Item Stats
      totalVegOrders: 0,
      totalNonVegOrders: 0,
      totalSpicyOrders: 0,
    };

    timeFilteredOrders.forEach((order) => {
      // Status counts
      if (order.normalizedStatus === "received") stats.received++;
      else if (order.normalizedStatus === "completed") stats.completed++;
      else if (order.normalizedStatus === "rejected") stats.rejected++;

      // Only count completed orders for revenue calculations
      const isCompletedOrder = order.normalizedStatus === "completed";
      const orderAmount = order.totalAmount || 0;

      // Order Type Stats
      switch (order.orderType) {
        case "dine-in":
          stats.totalDineInOrders++;
          break;
        case "takeaway":
          stats.totalTakeawayOrders++;
          break;
        case "delivery":
          stats.totalDeliveryOrders++;
          break;
      }

      // Platform Stats with Revenue
      switch (order.deliveryPlatform) {
        case "direct":
          stats.totalDirectOrders++;
          if (isCompletedOrder) stats.directRevenue += orderAmount;
          break;
        case "swiggy":
          stats.totalSwiggyOrders++;
          if (isCompletedOrder) stats.swiggyRevenue += orderAmount;
          break;
        case "zomato":
          stats.totalZomatoOrders++;
          if (isCompletedOrder) stats.zomatoRevenue += orderAmount;
          break;
        case "uber-eats":
          stats.totalUberEatsOrders++;
          if (isCompletedOrder) stats.uberEatsRevenue += orderAmount;
          break;
        case "dunzo":
          stats.totalDunzoOrders++;
          break;
        case "amazon-food":
          stats.totalAmazonFoodOrders++;
          break;
        case "foodpanda":
          stats.totalFoodpandaOrders++;
          break;
        case "magicpin":
          stats.totalMagicPinOrders++;
          break;
        case "phonepe":
          stats.totalPhonePeOrders++;
          break;
        case "paytm":
          stats.totalPaytmOrders++;
          break;
        case "ondc":
          stats.totalONDCOrders++;
          break;
        default:
          stats.totalOtherPlatformOrders++;
          break;
      }

      // Priority Stats
      switch (order.orderPriority) {
        case "normal":
          stats.normalPriorityOrders++;
          break;
        case "high":
          stats.highPriorityOrders++;
          break;
        case "express":
          stats.expressPriorityOrders++;
          break;
        case "vip":
          stats.vipPriorityOrders++;
          break;
      }

      // Payment Method Stats
      switch (order.paymentMethod) {
        case "cash":
          stats.cashPayments++;
          break;
        case "card":
          stats.cardPayments++;
          break;
        case "upi":
          stats.upiPayments++;
          break;
        case "wallet":
          stats.walletPayments++;
          break;
        case "pending":
          stats.pendingPayments++;
          break;
      }

      // Platform commission and net revenue
      if (isCompletedOrder) {
        const commission = order.platformTracking?.platformCommission || 0;
        stats.totalPlatformCommission += commission;
        stats.netRevenue += order.platformTracking?.netRevenue || orderAmount;
      }

      // Time-based stats
      if (order.analytics?.peakHourOrder) stats.peakHourOrders++;
      if (order.analytics?.weekendOrder) stats.weekendOrders++;
      if (order.analytics?.festivalOrder) stats.festivalOrders++;
      if (order.analytics?.repeatCustomer) stats.repeatCustomerOrders++;

      // Item-based stats
      const vegItems = order.items?.filter((item) => item.isVeg).length || 0;
      const nonVegItems =
        order.items?.filter((item) => !item.isVeg).length || 0;
      const spicyItems =
        order.items?.filter((item) => item.isSpicy).length || 0;

      if (vegItems > 0) stats.totalVegOrders++;
      if (nonVegItems > 0) stats.totalNonVegOrders++;
      if (spicyItems > 0) stats.totalSpicyOrders++;
    });

    // Calculate total revenue
    const revenueOrders = timeFilteredOrders.filter((o) =>
      ["completed"].includes(o.normalizedStatus)
    );
    stats.totalRevenue = revenueOrders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );
    stats.totalPlatformRevenue =
      stats.swiggyRevenue + stats.zomatoRevenue + stats.uberEatsRevenue;

    // Calculate averages
    stats.avgOrderValue =
      revenueOrders.length > 0
        ? Math.round(stats.totalRevenue / revenueOrders.length)
        : 0;

    // Calculate platform percentages
    stats.platformBreakdown = {
      direct: {
        orders: stats.totalDirectOrders,
        percentage:
          stats.total > 0 ? (stats.totalDirectOrders / stats.total) * 100 : 0,
        revenue: stats.directRevenue,
        revenuePercentage:
          stats.totalRevenue > 0
            ? (stats.directRevenue / stats.totalRevenue) * 100
            : 0,
      },
      swiggy: {
        orders: stats.totalSwiggyOrders,
        percentage:
          stats.total > 0 ? (stats.totalSwiggyOrders / stats.total) * 100 : 0,
        revenue: stats.swiggyRevenue,
        revenuePercentage:
          stats.totalRevenue > 0
            ? (stats.swiggyRevenue / stats.totalRevenue) * 100
            : 0,
      },
      zomato: {
        orders: stats.totalZomatoOrders,
        percentage:
          stats.total > 0 ? (stats.totalZomatoOrders / stats.total) * 100 : 0,
        revenue: stats.zomatoRevenue,
        revenuePercentage:
          stats.totalRevenue > 0
            ? (stats.zomatoRevenue / stats.totalRevenue) * 100
            : 0,
      },
      uberEats: {
        orders: stats.totalUberEatsOrders,
        percentage:
          stats.total > 0 ? (stats.totalUberEatsOrders / stats.total) * 100 : 0,
        revenue: stats.uberEatsRevenue,
        revenuePercentage:
          stats.totalRevenue > 0
            ? (stats.uberEatsRevenue / stats.totalRevenue) * 100
            : 0,
      },
    };

    // Calculate order type percentages
    stats.orderTypeBreakdown = {
      dineIn: {
        orders: stats.totalDineInOrders,
        percentage:
          stats.total > 0 ? (stats.totalDineInOrders / stats.total) * 100 : 0,
      },
      takeaway: {
        orders: stats.totalTakeawayOrders,
        percentage:
          stats.total > 0 ? (stats.totalTakeawayOrders / stats.total) * 100 : 0,
      },
      delivery: {
        orders: stats.totalDeliveryOrders,
        percentage:
          stats.total > 0 ? (stats.totalDeliveryOrders / stats.total) * 100 : 0,
      },
    };

    // Unique customers calculation
    const uniqueTables = new Set(
      timeFilteredOrders
        .map((o) => o.tableInfo)
        .filter((table) => table && table !== "Unknown" && table !== "0")
    );
    stats.uniqueCustomers = uniqueTables.size;

    // Peak hour calculation
    const hourCounts = {};
    timeFilteredOrders.forEach((order) => {
      if (order.orderTimestamp) {
        const hour = new Date(order.orderTimestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const peakHour = Object.keys(hourCounts).reduce(
      (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
      "0"
    );
    stats.peakHour = peakHour !== "0" ? `${peakHour}:00` : "N/A";

    return stats;
  }, [timeFilteredOrders]);

  // Enhanced Platform Analytics
  const platformAnalytics = useMemo(() => {
    const platforms = {};
    let totalPlatformOrders = 0;
    let totalPlatformRevenue = 0;

    timeFilteredOrders.forEach((order) => {
      const platform = order.deliveryPlatform;
      const platformName = order.platformName;

      if (!platforms[platform]) {
        platforms[platform] = {
          platform,
          platformName,
          orderCount: 0,
          revenue: 0,
          commission: 0,
          netRevenue: 0,
          avgOrderValue: 0,
          completedOrders: 0,
          rejectedOrders: 0,
          receivedOrders: 0,
        };
      }

      platforms[platform].orderCount++;
      totalPlatformOrders++;

      if (order.normalizedStatus === "completed") {
        platforms[platform].completedOrders++;
        platforms[platform].revenue += order.totalAmount;
        platforms[platform].commission +=
          order.platformTracking?.platformCommission || 0;
        platforms[platform].netRevenue +=
          order.platformTracking?.netRevenue || order.totalAmount;
        totalPlatformRevenue += order.totalAmount;
      } else if (order.normalizedStatus === "rejected") {
        platforms[platform].rejectedOrders++;
      } else {
        platforms[platform].receivedOrders++;
      }
    });

    // Calculate averages and percentages
    Object.values(platforms).forEach((platform) => {
      platform.avgOrderValue =
        platform.completedOrders > 0
          ? Math.round(platform.revenue / platform.completedOrders)
          : 0;
      platform.orderPercentage =
        totalPlatformOrders > 0
          ? (platform.orderCount / totalPlatformOrders) * 100
          : 0;
      platform.revenuePercentage =
        totalPlatformRevenue > 0
          ? (platform.revenue / totalPlatformRevenue) * 100
          : 0;
      platform.completionRate =
        platform.orderCount > 0
          ? (platform.completedOrders / platform.orderCount) * 100
          : 0;
    });

    const platformStats = Object.values(platforms).sort(
      (a, b) => b.orderCount - a.orderCount
    );

    return {
      platformStats,
      totalPlatformOrders,
      totalPlatformRevenue,
      topPlatform: platformStats[0] || null,
      platformCount: platformStats.length,
    };
  }, [timeFilteredOrders]);

  // Enhanced Menu Analytics (keeping existing)
  const menuAnalytics = useMemo(() => {
    const menuStatsData = {};
    let totalMenuOrders = 0;
    timeFilteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const menuName = item.menuName || "Unknown Menu";
        const menuId = item.menuId || item.id;
        const key = `${menuId}-${menuName}`;
        if (!menuStatsData[key]) {
          menuStatsData[key] = {
            menuName,
            menuId,
            orderCount: 0,
            revenue: 0,
            imageUrl:
              item.imageUrl ||
              menuData.find((m) => m.id === menuId || m.menuName === menuName)
                ?.imageUrl,
            category: item.menuCategory || "Uncategorized",
          };
        }
        const quantity = item.quantity || 1;
        const itemRevenue = item.itemTotal || 0;
        menuStatsData[key].orderCount += quantity;
        menuStatsData[key].revenue += itemRevenue;
        totalMenuOrders += quantity;
      });
    });
    const menuStats = Object.values(menuStatsData)
      .map((data) => ({
        ...data,
        revenue: parseFloat(data.revenue.toFixed(2)),
        percentage:
          totalMenuOrders > 0 ? (data.orderCount / totalMenuOrders) * 100 : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
    return {
      menuStats: menuStats.slice(0, 20),
      topMenus: menuStats.slice(0, 3),
      totalMenuOrders,
    };
  }, [timeFilteredOrders, menuData]);

  // Enhanced Category Analytics (keeping existing)
  const categoryAnalytics = useMemo(() => {
    const categoryData = {};
    let totalCategoryOrders = 0;
    timeFilteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const category = item.menuCategory || "Uncategorized";
        if (!categoryData[category]) {
          categoryData[category] = { orderCount: 0, revenue: 0 };
        }
        const quantity = item.quantity || 1;
        const itemRevenue = item.itemTotal || 0;
        categoryData[category].orderCount += quantity;
        categoryData[category].revenue += itemRevenue;
        totalCategoryOrders += quantity;
      });
    });
    const categoryStats = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        orderCount: data.orderCount,
        revenue: parseFloat(data.revenue.toFixed(2)),
        percentage:
          totalCategoryOrders > 0
            ? (data.orderCount / totalCategoryOrders) * 100
            : 0,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);
    return { categoryStats, totalCategoryOrders };
  }, [timeFilteredOrders]);

  // Enhanced order status update, delete, update functions - all RTDB compatible (keeping existing)
  const updateOrderStatus = useCallback(
    async (orderId, newStatus, additionalData = {}) => {
      if (submitting) {
        toast.warning("Please wait, another operation is in progress");
        return { success: false, error: "Update in progress" };
      }
      if (!orderId || !newStatus) {
        toast.error("Invalid order ID or status");
        return { success: false, error: "Invalid parameters" };
      }
      setSubmitting(true);
      try {
        const orderRef = ref(rtdb, `/hotels/${hotelName}/orders/${orderId}`);
        const now = new Date().toISOString();
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) throw new Error("Order not found");
        const statusMapping = {
          received: "received",
          completed: "completed",
          rejected: "rejected",
        };
        const normalizedNewStatus =
          statusMapping[newStatus.toLowerCase()] || newStatus.toLowerCase();
        const updates = {
          "kitchen/status": normalizedNewStatus,
          "kitchen/lastUpdated": now,
          status: normalizedNewStatus,
          "timestamps/lastStatusUpdate": now,
          "timestamps/lastUpdated": now,
        };
        Object.keys(additionalData).forEach((key) => {
          if (key !== "kitchen" && key !== "timestamps")
            updates[key] = additionalData[key];
        });
        if (additionalData.kitchen) {
          Object.keys(additionalData.kitchen).forEach((kitchenKey) => {
            updates[`kitchen/${kitchenKey}`] =
              additionalData.kitchen[kitchenKey];
          });
        }
        if (additionalData.timestamps) {
          Object.keys(additionalData.timestamps).forEach((timestampKey) => {
            updates[`timestamps/${timestampKey}`] =
              additionalData.timestamps[timestampKey];
          });
        }
        if (normalizedNewStatus === "completed") {
          updates[`timestamps/completedTime`] = now;
        } else if (normalizedNewStatus === "rejected") {
          updates[`timestamps/rejectedTime`] = now;
        }
        await update(orderRef, updates);
        toast.success(`Order status updated to ${normalizedNewStatus}`);
        return { success: true, newStatus: normalizedNewStatus };
      } catch (err) {
        toast.error(`Failed to update order status: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const deleteOrder = useCallback(
    async (orderId) => {
      if (submitting) {
        toast.warning("Please wait, another operation is in progress");
        return { success: false, error: "Operation in progress" };
      }
      if (!orderId) {
        toast.error("Invalid order ID");
        return { success: false, error: "Invalid order ID" };
      }
      setSubmitting(true);
      try {
        const orderRef = ref(rtdb, `/hotels/${hotelName}/orders/${orderId}`);
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) throw new Error("Order not found");
        await remove(orderRef);
        toast.success("Order deleted successfully");
        return { success: true };
      } catch (err) {
        toast.error(`Failed to delete order: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  const updateOrder = useCallback(
    async (orderId, orderData) => {
      if (submitting) {
        toast.warning("Please wait, another operation is in progress");
        return { success: false, error: "Update in progress" };
      }
      if (!orderId || !orderData) {
        toast.error("Invalid order data");
        return { success: false, error: "Invalid parameters" };
      }
      setSubmitting(true);
      try {
        const orderRef = ref(rtdb, `/hotels/${hotelName}/orders/${orderId}`);
        const orderSnapshot = await get(orderRef);
        if (!orderSnapshot.exists()) throw new Error("Order not found");
        const currentOrder = orderSnapshot.val();
        const now = new Date().toISOString();
        const updatedItems = orderData.items || currentOrder.items || [];
        const calculatedTotal = updatedItems.reduce(
          (sum, item) =>
            sum +
            (parseFloat(item.itemTotal) ||
              parseFloat(item.finalPrice) ||
              parseFloat(item.price) ||
              0) *
              (parseInt(item.quantity) || 1),
          0
        );
        const updates = {};
        Object.keys(orderData).forEach((key) => {
          if (
            key !== "kitchen" &&
            key !== "timestamps" &&
            key !== "orderDetails"
          ) {
            updates[key] = orderData[key];
          }
        });
        if (orderData.kitchen) {
          Object.keys(orderData.kitchen).forEach((kitchenKey) => {
            updates[`kitchen/${kitchenKey}`] = orderData.kitchen[kitchenKey];
          });
        }
        const newStatus =
          orderData.status ||
          orderData.normalizedStatus ||
          currentOrder.kitchen?.status ||
          currentOrder.status ||
          "received";
        updates["kitchen/status"] = newStatus;
        updates["kitchen/lastUpdated"] = now;
        if (orderData.timestamps) {
          Object.keys(orderData.timestamps).forEach((timestampKey) => {
            updates[`timestamps/${timestampKey}`] =
              orderData.timestamps[timestampKey];
          });
        }
        updates["timestamps/lastModified"] = now;
        updates["timestamps/lastUpdated"] = now;
        if (orderData.orderDetails) {
          Object.keys(orderData.orderDetails).forEach((detailKey) => {
            updates[`orderDetails/${detailKey}`] =
              orderData.orderDetails[detailKey];
          });
        }
        if (orderData.items) {
          updates["orderDetails/totalItems"] = updatedItems.length;
          updates.totalAmount = parseFloat(calculatedTotal.toFixed(2));
          updates.total = parseFloat(calculatedTotal.toFixed(2));
        }
        updates.status = newStatus;
        updates.id = orderId;
        await update(orderRef, updates);
        toast.success("Order updated successfully");
        return { success: true };
      } catch (err) {
        toast.error(`Failed to update order: ${err.message}`);
        return { success: false, error: err.message };
      } finally {
        setSubmitting(false);
      }
    },
    [hotelName, submitting]
  );

  // Enhanced filter and search handlers
  const handleStatusFilterChange = useCallback((filter) => {
    if (typeof filter === "string") setStatusFilter(filter);
  }, []);

  const handleOrderTypeFilterChange = useCallback((filter) => {
    if (typeof filter === "string") setOrderTypeFilter(filter);
  }, []);

  const handlePlatformFilterChange = useCallback((filter) => {
    if (typeof filter === "string") setPlatformFilter(filter);
  }, []);

  const handlePriorityFilterChange = useCallback((filter) => {
    if (typeof filter === "string") setPriorityFilter(filter);
  }, []);

  const handleSearchChange = useCallback((term) => {
    if (typeof term === "string") setSearchTerm(term);
  }, []);

  const handleDateChange = useCallback(
    (date) => {
      if (date && typeof date === "string") {
        setSelectedDate(date);
        if (selectedTimePeriod !== "daily") setSelectedTimePeriod("daily");
      }
    },
    [selectedTimePeriod]
  );

  const handleTimePeriodChange = useCallback((period) => {
    if (period && typeof period === "string") {
      setSelectedTimePeriod(period);
      if (period === "daily")
        setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setOrderTypeFilter("all");
    setPlatformFilter("all");
    setPriorityFilter("all");
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  const refreshOrders = useCallback(() => {
    setError(null);
    if (connectionStatus === "error") setConnectionStatus("connecting");
  }, [connectionStatus]);

  // Helper functions, memoized (keeping existing)
  const getOrderById = useCallback(
    (orderId) => {
      return orders.find((order) => order.id === orderId) || null;
    },
    [orders]
  );

  const getOrdersByStatus = useCallback(
    (status) => {
      return orders.filter((order) => order.normalizedStatus === status);
    },
    [orders]
  );

  const getOrdersByTable = useCallback((tableNumber) => {
    return orders.filter((order) => order.tableInfo === tableNumber.toString());
  });

  // New helper functions for enhanced analytics
  const getOrdersByPlatform = useCallback(
    (platform) => {
      return orders.filter((order) => order.deliveryPlatform === platform);
    },
    [orders]
  );

  const getOrdersByType = useCallback(
    (orderType) => {
      return orders.filter((order) => order.orderType === orderType);
    },
    [orders]
  );

  const getOrdersByPriority = useCallback(
    (priority) => {
      return orders.filter((order) => order.orderPriority === priority);
    },
    [orders]
  );

  // Today's enhanced stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter((order) => order.orderDate === today);

    const stats = {
      total: todayOrders.length,
      revenue: 0,
      received: 0,
      completed: 0,
      rejected: 0,

      // Order type breakdown for today
      dineInOrders: 0,
      takeawayOrders: 0,
      deliveryOrders: 0,

      // Platform breakdown for today
      directOrders: 0,
      swiggyOrders: 0,
      zomatoOrders: 0,
      uberEatsOrders: 0,
      otherPlatformOrders: 0,

      // Revenue by platform
      directRevenue: 0,
      swiggyRevenue: 0,
      zomatoRevenue: 0,
      uberEatsRevenue:0,
      totalPlatformCommission: 0,
    };

    todayOrders.forEach((order) => {
      if (order.normalizedStatus === "received") stats.received++;
      else if (order.normalizedStatus === "completed") {
        stats.completed++;
        stats.revenue += order.totalAmount || 0;

        // Platform revenue calculation for completed orders
        switch (order.deliveryPlatform) {
          case "direct":
            stats.directRevenue += order.totalAmount || 0;
            break;
          case "swiggy":
            stats.swiggyRevenue += order.totalAmount || 0;
            stats.totalPlatformCommission += (order.totalAmount || 0) * 0.2;
            break;
          case "zomato":
            stats.zomatoRevenue += order.totalAmount || 0;
            stats.totalPlatformCommission += (order.totalAmount || 0) * 0.2;
            break;
        }
      } else if (order.normalizedStatus === "rejected") stats.rejected++;

      // Order type counts
      switch (order.orderType) {
        case "dine-in":
          stats.dineInOrders++;
          break;
        case "takeaway":
          stats.takeawayOrders++;
          break;
        case "delivery":
          stats.deliveryOrders++;
          break;
      }

      // Platform counts
      switch (order.deliveryPlatform) {
        case "direct":
          stats.directOrders++;
          break;
        case "swiggy":
          stats.swiggyOrders++;
          break;
        case "zomato":
          stats.zomatoOrders++;
          break;
        case "uber-eats":
          stats.uberEatsOrders++;
          break;
        default:
          stats.otherPlatformOrders++;
          break;
      }
    });

    return stats;
  }, [orders]);

  // Enhanced export CSV helper
  const exportOrdersCSV = useCallback(() => {
    if (!filteredOrders.length) {
      toast.warning("No orders to export");
      return;
    }
    const csvData = filteredOrders.map((order) => ({
      OrderNumber: order.orderNumber,
      Date: order.displayDate,
      Time: order.displayTime,
      OrderType: order.displayOrderType,
      Table: order.orderType === "dine-in" ? order.tableInfo : "N/A",
      Platform: order.displayPlatform,
      Priority: order.displayPriority,
      CustomerName: order.customerInfo?.customerName || "",
      Phone: order.customerInfo?.phoneNumber || "",
      Status: order.displayStatus,
      Items:
        order.items
          ?.map((item) => `${item.menuName} (${item.quantity})`)
          .join("; ") || "",
      TotalAmount: order.totalAmount,
      PaymentMethod: order.paymentMethod || "N/A",
      DeliveryAddress: order.deliveryInfo?.address || "N/A",
      SpecialInstructions: order.orderDetails?.specialInstructions || "",
      PlatformCommission: order.platformTracking?.platformCommission || 0,
      NetRevenue: order.platformTracking?.netRevenue || order.totalAmount,
    }));
    const csvContent = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_enhanced_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Enhanced orders data exported successfully");
  }, [filteredOrders]);

  return {
    // Data
    orders,
    filteredOrders,
    timeFilteredOrders,
    menuData,

    // Enhanced Analytics
    orderStats,
    menuAnalytics,
    categoryAnalytics,
    platformAnalytics, // New platform-specific analytics
    todayStats,

    // Status and state
    loading,
    submitting,
    error,
    lastUpdated,
    connectionStatus,

    // Enhanced Filter state
    statusFilter,
    orderTypeFilter, // New
    platformFilter, // New
    priorityFilter, // New
    selectedDate,
    selectedTimePeriod,
    searchTerm,
    debouncedSearchTerm,

    // Enhanced Handlers
    handleStatusFilterChange,
    handleOrderTypeFilterChange, // New
    handlePlatformFilterChange, // New
    handlePriorityFilterChange, // New
    handleSearchChange,
    handleDateChange,
    handleTimePeriodChange,
    clearFilters,

    // Actions
    updateOrderStatus,
    deleteOrder,
    updateOrder,
    refreshOrders,
    exportOrdersCSV,

    // Enhanced Helper functions
    getOrderById,
    getOrdersByStatus,
    getOrdersByTable,
    getOrdersByPlatform, // New
    getOrdersByType, // New
    getOrdersByPriority, // New
    dateRangeHelpers,

    // Enhanced Options
    statusOptions: [
      { value: "all", label: "All Orders" },
      { value: "received", label: "Received" },
      { value: "completed", label: "Completed" },
      { value: "rejected", label: "Rejected" },
    ],
    orderTypeOptions: [
      // New
      { value: "all", label: "All Order Types" },
      { value: "dine-in", label: "Dine In" },
      { value: "takeaway", label: "Takeaway" },
      { value: "delivery", label: "Delivery" },
    ],
    platformOptions: [
      // New
      { value: "all", label: "All Platforms" },
      { value: "direct", label: "DOYO Orders" },
      { value: "swiggy", label: "Swiggy" },
      { value: "zomato", label: "Zomato" },
      { value: "uber-eats", label: "Uber Eats" },
      { value: "dunzo", label: "Dunzo" },
      { value: "amazon-food", label: "Amazon Food" },
      { value: "foodpanda", label: "Foodpanda" },
      { value: "magicpin", label: "MagicPin" },
      { value: "phonepe", label: "PhonePe" },
      { value: "paytm", label: "Paytm" },
      { value: "ondc", label: "ONDC Network" },
      { value: "other", label: "Other Platforms" },
    ],
    priorityOptions: [
      // New
      { value: "all", label: "All Priorities" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High Priority" },
      { value: "express", label: "Express" },
      { value: "vip", label: "VIP" },
    ],
    timePeriodOptions: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "total", label: "All Time" },
    ],
    periodDisplayText: dateRangeHelpers.getPeriodDisplayText(
      selectedTimePeriod,
      selectedDate
    ),
    hasOrders: orders.length > 0,
    hasFilteredOrders: filteredOrders.length > 0,
    isConnected: connectionStatus === "connected",
    isLoading: loading,
    isError: !!error,
    errorMessage: error?.message || null,
  };
};
