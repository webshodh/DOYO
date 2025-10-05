import {
  Clock,
  ChefHat,
  Bell,
  CheckCircle,
  XCircle,
  Tag,
  Utensils,
  Leaf,
  Shield,
  Activity,
  Heart,
  Users,
  Star,
  Award,
  TrendingUp,
  AlertCircle,
  Thermometer,
  Info,
  Package,
  CheckCircle2,
} from "lucide-react";

export const NORMALIZED_VEG = ["veg", "vegetarian"];
export const NORMALIZED_NONVEG = [
  "nonveg",
  "non veg",
  "non-veg",
  "non vegetarian",
  "meat",
];

export const SIZE_CLASSES = {
  xs: {
    container: "w-3 h-3 border",
    dot: "w-1 h-1",
    logo: "w-2 h-2",
  },
  sm: {
    container: "w-4 h-4 border-2",
    dot: "w-1.5 h-1.5",
    logo: "w-3 h-3",
  },
  md: {
    container: "w-5 h-5 border-2",
    dot: "w-2 h-2",
    logo: "w-4 h-4",
  },
  lg: {
    container: "w-6 h-6 border-2",
    dot: "w-2.5 h-2.5",
    logo: "w-5 h-5",
  },
};

export const POSITION_CLASSES = {
  relative: "",
  absolute: "absolute top-2 right-4 z-10",
};

export const COLOR_CLASSES = {
  veg: {
    border: "border-green-500",
    bg: "bg-green-500",
    label: "Vegetarian",
  },
  nonveg: {
    border: "border-red-500",
    bg: "bg-red-500",
    label: "Non-vegetarian",
  },
};

// =============================================================================
// StatusBadge
// =============================================================================

export const STATUS_BADGE_CONFIG = {
  received: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    label: "Pending",
  },
  preparing: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: ChefHat,
    label: "Preparing",
  },
  ready: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Bell,
    label: "Ready",
  },
  completed: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: CheckCircle,
    label: "Completed",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    label: "Rejected",
  },
};

// =============================================================================
// Tags
// =============================================================================

// Tag variant styles
export const TAG_VARIANTS = {
  primary:
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500",
  secondary:
    "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-gray-400",
  success:
    "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500",
  warning:
    "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500",
  info: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-500",
  purple:
    "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500",
  pink: "bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-500",
  indigo:
    "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-500",
  emerald:
    "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500",
  orange:
    "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500",
  teal: "bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-500",
  default:
    "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
};
// Tag sizes
export const TAG_SIZES = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-2.5 text-lg",
};

// Icon sizes
export const TAG_ICON_SIZES = {
  xs: "w-2.5 h-2.5",
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

// Tag categories
export const TAG_CATEGORIES = {
  PRIMARY: ["menuCategory", "categoryType", "mealType", "cuisineType"],
  FEATURES: [
    "isSeasonal",
    "isLimitedEdition",
    "isMostOrdered",
    "isBeverageAlcoholic",
    "chefSpecial",
    "isPopular",
    "isRecommended",
  ],
  DIETARY: [
    "isVegan",
    "isGlutenFree",
    "isSugarFree",
    "isLactoseFree",
    "isOrganic",
    "isHighProtein",
    "isJainFriendly",
    "isKidsFriendly",
  ],
};

// Tag configuration
export const TAG_CONFIG = {
  // Category & Type Tags
  menuCategory: { icon: Tag, variant: "primary", size: "sm" },
  categoryType: {
    icon: null,
    variant: "purple",
    size: "sm",
    customIcon: (value) => (value === "veg" ? "🌱" : "🍖"),
  },
  mealType: { icon: Utensils, variant: "orange", size: "sm" },
  cuisineType: { icon: ChefHat, variant: "success", size: "sm" },

  // Special Features
  isVegan: { icon: Leaf, variant: "success", size: "xs", label: "Vegan" },
  isGlutenFree: {
    icon: Shield,
    variant: "info",
    size: "xs",
    label: "Gluten Free",
  },
  isSugarFree: {
    icon: Shield,
    variant: "purple",
    size: "xs",
    label: "Sugar Free",
  },
  isLactoseFree: {
    icon: Shield,
    variant: "teal",
    size: "xs",
    label: "Lactose Free",
  },
  isOrganic: { icon: Leaf, variant: "emerald", size: "xs", label: "Organic" },
  isHighProtein: {
    icon: Activity,
    variant: "danger",
    size: "xs",
    label: "High Protein",
  },
  isJainFriendly: {
    icon: Heart,
    variant: "warning",
    size: "xs",
    label: "Jain Friendly",
  },
  isKidsFriendly: {
    icon: Users,
    variant: "pink",
    size: "xs",
    label: "Kids Friendly",
  },
  isSeasonal: { icon: Star, variant: "orange", size: "xs", label: "Seasonal" },
  isLimitedEdition: {
    icon: Award,
    variant: "indigo",
    size: "xs",
    label: "Limited Edition",
  },
  isMostOrdered: {
    icon: TrendingUp,
    variant: "danger",
    size: "xs",
    label: "Most Ordered",
  },
  isBeverageAlcoholic: {
    icon: AlertCircle,
    variant: "danger",
    size: "xs",
    label: "Alcoholic",
  },
  chefSpecial: {
    icon: Star,
    variant: "warning",
    size: "xs",
    label: "Chef Special",
  },
  isPopular: {
    icon: TrendingUp,
    variant: "pink",
    size: "xs",
    label: "Popular",
  },
  isRecommended: {
    icon: Award,
    variant: "emerald",
    size: "xs",
    label: "Recommended",
  },

  // Additional tags
  spiceLevel: { icon: Thermometer, variant: "danger", size: "xs" },
  preparationMethod: { icon: ChefHat, variant: "secondary", size: "xs" },
  cookingTime: { icon: Clock, variant: "info", size: "xs" },
};

// =============================================================================
// InfredientTags
// =============================================================================
export const INGREDIENT_COLORS = [
  { bg: "bg-red-500", text: "text-white", hover: "hover:bg-red-600" },
  { bg: "bg-blue-500", text: "text-white", hover: "hover:bg-blue-600" },
  { bg: "bg-green-500", text: "text-white", hover: "hover:bg-green-600" },
  { bg: "bg-purple-500", text: "text-white", hover: "hover:bg-purple-600" },
  { bg: "bg-pink-500", text: "text-white", hover: "hover:bg-pink-600" },
  { bg: "bg-indigo-500", text: "text-white", hover: "hover:bg-indigo-600" },
  { bg: "bg-yellow-500", text: "text-black", hover: "hover:bg-yellow-600" },
  { bg: "bg-teal-500", text: "text-white", hover: "hover:bg-teal-600" },
  { bg: "bg-orange-500", text: "text-white", hover: "hover:bg-orange-600" },
  { bg: "bg-cyan-500", text: "text-white", hover: "hover:bg-cyan-600" },
  { bg: "bg-lime-500", text: "text-black", hover: "hover:bg-lime-600" },
  { bg: "bg-rose-500", text: "text-white", hover: "hover:bg-rose-600" },
  { bg: "bg-emerald-500", text: "text-white", hover: "hover:bg-emerald-600" },
  { bg: "bg-sky-500", text: "text-white", hover: "hover:bg-sky-600" },
  { bg: "bg-violet-500", text: "text-white", hover: "hover:bg-violet-600" },
];

export const INGREDIENT_GRADIENT_STYLES = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)",
  "linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)",
  "linear-gradient(135deg, #b794f6 0%, #f093fb 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  "linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)",
];

// =============================================================================
// Menu Modal
// =============================================================================

// Pre-configured section configurations with enhanced items
export const getDietaryItems = () => [
  {
    label: "Vegan",
    key: "isVegan",
    type: "boolean",
    labelColor: "text-green-600",
    icon: Leaf,
  },
  {
    label: "Gluten Free",
    key: "isGlutenFree",
    type: "boolean",
    labelColor: "text-blue-600",
    icon: Shield,
  },
  {
    label: "Sugar Free",
    key: "isSugarFree",
    type: "boolean",
    labelColor: "text-purple-600",
    icon: Heart,
  },
  {
    label: "Lactose Free",
    key: "isLactoseFree",
    type: "boolean",
    labelColor: "text-orange-600",
    icon: Shield,
  },
  {
    label: "Jain Friendly",
    key: "isJainFriendly",
    type: "boolean",
    labelColor: "text-yellow-600",
    icon: Star,
  },
  {
    label: "Organic",
    key: "isOrganic",
    type: "boolean",
    labelColor: "text-green-600",
    icon: Leaf,
  },
  {
    label: "Kids Friendly",
    key: "isKidsFriendly",
    type: "boolean",
    labelColor: "text-blue-600",
    icon: Heart,
  },
];

export const getAdditionalDetails = () => [
  {
    label: "Menu Category",
    key: "menuCategory",
    type: "badge",
    icon: Utensils,
  },
  {
    label: "Meal Type",
    key: "mealType",
    type: "badge",
    icon: ChefHat,
  },
  {
    label: "Cuisine Type",
    key: "cuisineType",
    type: "conditional",
    icon: Star,
  },
  {
    label: "Spice Level",
    key: "spiceLevel",
    type: "conditional",
    icon: AlertCircle,
  },
];

export const getPreparationItems = () => [
  {
    label: "Preparation Method",
    key: "preparationMethod",
    type: "conditional",
    icon: ChefHat,
  },
  {
    label: "Cooking Style",
    key: "cookingStyle",
    type: "conditional",
    icon: Utensils,
  },
  {
    label: "Taste Profile",
    key: "tasteProfile",
    type: "conditional",
    icon: Star,
  },
  {
    label: "Texture",
    key: "texture",
    type: "conditional",
    icon: Info,
  },
];

export const getNutritionItems = () => [
  {
    label: "Calories",
    key: "calories",
    type: "number",
    labelColor: "text-orange-600",
    customRenderer: (value) => `${value || 0} kcal`,
  },
  {
    label: "Protein",
    key: "protein",
    type: "number",
    labelColor: "text-blue-600",
    customRenderer: (value) => `${value || 0}g`,
  },
  {
    label: "Carbs",
    key: "carbs",
    type: "number",
    labelColor: "text-green-600",
    customRenderer: (value) => `${value || 0}g`,
  },
  {
    label: "Fat",
    key: "fat",
    type: "number",
    labelColor: "text-red-600",
    customRenderer: (value) => `${value || 0}g`,
  },
];

// =============================================================================
// Order Analytics
// =============================================================================

// Order status constants
export const ORDER_STATUSES = [
  {
    value: "received",
    label: "Received",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: Package,
  },
  {
    value: "preparing",
    label: "Preparing",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: ChefHat,
  },
  {
    value: "ready",
    label: "Ready",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: CheckCircle2,
  },
  {
    value: "served",
    label: "Served",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    icon: Utensils,
  },
  {
    value: "completed",
    label: "Completed",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    icon: XCircle,
  },
];

// Time period options
export const TIME_PERIODS = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "total", label: "All Time" },
];

// Order analytics calculations
export const calculateOrderAnalytics = (orders, menuData = []) => {
  if (!orders.length) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0,
      rejectedOrders: 0,
      successRate: 0,
      rejectionRate: 0,
      uniqueCustomers: 0,
      peakHour: "N/A",
      categoryWiseOrders: {},
      menuWiseOrders: {},
      topSellingDishes: [],
      revenueByCategory: {},
    };
  }

  // Basic metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => (o.kitchen?.status || o.status) === "completed"
  );
  const pendingOrders = orders.filter((o) => {
    const status = o.kitchen?.status || o.status || "received";
    return ["received", "preparing", "ready"].includes(status);
  });
  const rejectedOrders = orders.filter(
    (o) => (o.kitchen?.status || o.status) === "rejected"
  );

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + (order.pricing?.total || 0),
    0
  );

  const avgOrderValue =
    completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const successRate =
    totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

  const rejectionRate =
    totalOrders > 0 ? (rejectedOrders.length / totalOrders) * 100 : 0;

  // Peak hour calculation
  const hourCounts = {};
  orders.forEach((order) => {
    if (order.timestamps?.orderPlaced) {
      const hour = new Date(order.timestamps.orderPlaced).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const peakHour =
    Object.keys(hourCounts).length > 0
      ? Object.keys(hourCounts).reduce(
          (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
          "0"
        )
      : "0";

  // Unique customers
  const uniqueTables = new Set(
    orders
      .map((o) => o.tableNumber || o.customerInfo?.tableNumber)
      .filter(Boolean)
  );

  // Category and menu analysis
  const categoryWiseOrders = {};
  const menuWiseOrders = {};
  const revenueByCategory = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const category = item.menuCategory || "Other";
      const menuName = item.menuName;
      const quantity = item.quantity || 1;
      const itemRevenue =
        (item.finalPrice || item.originalPrice || 0) * quantity;

      // Category wise orders
      categoryWiseOrders[category] =
        (categoryWiseOrders[category] || 0) + quantity;
      revenueByCategory[category] =
        (revenueByCategory[category] || 0) + itemRevenue;

      // Menu wise orders
      if (menuName) {
        menuWiseOrders[menuName] = (menuWiseOrders[menuName] || 0) + quantity;
      }
    });
  });

  // Top selling dishes
  const topSellingDishes = Object.entries(menuWiseOrders)
    .map(([dish, count]) => {
      const menuItem = menuData.find((m) => m.menuName === dish);
      return {
        dish,
        count,
        category: menuItem?.menuCategory || "Other",
        revenue: count * (menuItem?.finalPrice || menuItem?.originalPrice || 0),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalOrders,
    totalRevenue,
    avgOrderValue,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    rejectedOrders: rejectedOrders.length,
    successRate,
    rejectionRate,
    uniqueCustomers: uniqueTables.size,
    peakHour: peakHour !== "0" ? `${peakHour}:00` : "N/A",
    categoryWiseOrders,
    menuWiseOrders,
    topSellingDishes,
    revenueByCategory,
  };
};

// Date utility functions
export const dateUtils = {
  getCurrentWeekRange: () => {
    const now = new Date();
    const first = now.getDate() - now.getDay();
    const firstday = new Date(now.setDate(first));
    const lastday = new Date(firstday);
    lastday.setDate(firstday.getDate() + 6);
    return { start: firstday, end: lastday };
  },

  getCurrentMonthRange: () => {
    const now = new Date();
    const firstday = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastday = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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

  formatOrderDate: (order) => {
    return (
      order.timestamps?.orderDate ||
      new Date(order.timestamps?.orderPlaced).toISOString().split("T")[0]
    );
  },

  getTodayString: () => {
    return new Date().toISOString().split("T")[0];
  },
};

// Filter orders by time period
export const filterOrdersByTimePeriod = (
  orders,
  selectedTimePeriod,
  selectedDate
) => {
  if (selectedTimePeriod === "total") {
    return orders;
  }

  if (selectedTimePeriod === "daily") {
    return orders.filter((order) => {
      const orderDateStr = dateUtils.formatOrderDate(order);
      return orderDateStr === selectedDate;
    });
  }

  if (selectedTimePeriod === "weekly") {
    const { start, end } = dateUtils.getCurrentWeekRange();
    return orders.filter((order) => {
      const orderDate = dateUtils.formatOrderDate(order);
      return dateUtils.isDateInRange(orderDate, start, end);
    });
  }

  if (selectedTimePeriod === "monthly") {
    const { start, end } = dateUtils.getCurrentMonthRange();
    return orders.filter((order) => {
      const orderDate = dateUtils.formatOrderDate(order);
      return dateUtils.isDateInRange(orderDate, start, end);
    });
  }

  return orders;
};

// Get period display text
export const getPeriodDisplayText = (selectedTimePeriod, selectedDate) => {
  switch (selectedTimePeriod) {
    case "daily":
      return `Orders for ${new Date(selectedDate).toLocaleDateString()}`;
    case "weekly":
      const weekRange = dateUtils.getCurrentWeekRange();
      return `Orders for this week (${weekRange.start.toLocaleDateString()} - ${weekRange.end.toLocaleDateString()})`;
    case "monthly":
      const monthRange = dateUtils.getCurrentMonthRange();
      return `Orders for ${monthRange.start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })}`;
    case "total":
      return "All orders";
    default:
      return "Orders";
  }
};

// Format currency
export const formatCurrency = (amount) => {
  return `₹${Math.round(amount || 0).toLocaleString()}`;
};

// Get status configuration
export const getStatusConfig = (status) => {
  return ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
};
