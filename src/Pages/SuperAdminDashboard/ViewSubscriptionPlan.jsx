// components/Pages/ViewSubscriptionPlan.js

import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import {
  Plus,
  CreditCard,
  TrendingUp,
  DollarSign,
  Package,
  Search,
  Check,
  X,
  Users,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Settings,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import PageTitle from "../../atoms/PageTitle";
import {
  useSubscription,
  useHotelSubscriptions,
} from "../../hooks/useSubscriptionPlan";
import { useHotelsList } from "../../hooks/useHotel";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import StatCard from "components/Cards/StatCard";
import { useTranslation } from "react-i18next";
import { useTheme } from "context/ThemeContext";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { useNavigate } from "react-router-dom";

const SubscriptionFormModal = React.lazy(() =>
  import("../../components/FormModals/SubscriptionPlanFormModal")
);

// Feature configuration for dynamic rendering
const FEATURE_CONFIG = {
  // Core Features
  coreFeatures: {
    title: "Core Features",
    icon: Settings,
    features: [
      {
        key: "isOrderDashboard",
        label: "Order Management",
        description: "Manage all orders and track status"
      },
      {
        key: "isCustomerOrderEnable",
        label: "Online Ordering",
        description: "Customer self-ordering via QR codes"
      },
      {
        key: "isCaptainDashboard",
        label: "Captain Dashboard",
        description: "Waiter/Captain order management"
      },
      {
        key: "isKitchenDashboard",
        label: "Kitchen Display",
        description: "Kitchen order preparation system"
      },
      {
        key: "isInventoryManagement",
        label: "Inventory Management",
        description: "Track stock and ingredients"
      },
      {
        key: "isTableManagement",
        label: "Table Management",
        description: "Manage tables and reservations"
      },
      {
        key: "isStaffManagement",
        label: "Staff Management",
        description: "Employee scheduling and management"
      },
    ],
  },
  
  // Analytics Features
  analyticsFeatures: {
    title: "Analytics & Reports",
    icon: BarChart3,
    features: [
      {
        key: "isAnalyticsDashboard",
        label: "Analytics Dashboard",
        description: "Business insights and metrics"
      },
      {
        key: "isReportsExport",
        label: "Export Reports",
        description: "Download reports as PDF/Excel"
      },
      {
        key: "isSalesReports",
        label: "Sales Reports",
        description: "Detailed sales analysis"
      },
      {
        key: "isCustomerInsights",
        label: "Customer Insights",
        description: "Customer behavior analytics"
      },
    ],
  },
  
  // Integration Features
  integrationFeatures: {
    title: "Integrations",
    icon: MessageSquare,
    features: [
      {
        key: "isWhatsAppIntegration",
        label: "WhatsApp Integration",
        description: "Send orders via WhatsApp"
      },
      {
        key: "isSmsNotifications",
        label: "SMS Notifications",
        description: "SMS alerts and updates"
      },
      {
        key: "isEmailReports",
        label: "Email Reports",
        description: "Automated email reports"
      },
      {
        key: "isMultiLanguage",
        label: "Multi-Language",
        description: "Support multiple languages"
      },
      {
        key: "is24x7Support",
        label: "24x7 Support",
        description: "Round-the-clock support"
      },
    ],
  },
};

// Usage limits configuration
const LIMIT_CONFIG = [
  { key: "maxAdmins", label: "Admins", icon: Users },
  { key: "maxCategories", label: "Categories", icon: Package },
  { key: "maxMenuItems", label: "Menu Items", icon: ShoppingCart },
  { key: "maxCaptains", label: "Captains", icon: Users },
  { key: "maxTables", label: "Tables", icon: Settings },
  { key: "maxOrders", label: "Orders/Month", icon: ShoppingCart },
  { key: "maxStorage", label: "Storage (MB)", icon: Package },
];

// Enhanced Plan Card Component
const PlanCard = memo(({ plan, onEdit, onDelete, onAssign }) => {
  const getPrice = () => plan.pricing?.monthlyPrice || plan.price || 0;
  const getDuration = () => plan.pricing?.duration || plan.duration || 1;
  
  // Count enabled features dynamically
  const getEnabledFeatures = () => {
    const features = plan.originalFeatures || plan.features || {};
    return Object.values(FEATURE_CONFIG).flatMap(category => 
      category.features.filter(feature => features[feature.key])
    );
  };

  const enabledFeatures = getEnabledFeatures();
  const totalPossibleFeatures = Object.values(FEATURE_CONFIG)
    .flatMap(category => category.features).length;

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
      {/* Plan Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {plan.planName}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {plan.description}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${
            plan.status === "active"
              ? "bg-green-100 text-green-600"
              : plan.status === "inactive"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {plan.status}
        </span>
      </div>

      {/* Plan Price */}
      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            ₹{getPrice()}
          </span>
          <span className="text-gray-600 ml-1">
            /{getDuration()} month{getDuration() !== 1 ? "s" : ""}
          </span>
        </div>
        {getPrice() === 0 && (
          <span className="text-sm text-green-600 font-medium">
            Free Forever
          </span>
        )}
      </div>

      {/* Feature Summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Features</h4>
          <span className="text-xs text-gray-500">
            {enabledFeatures.length}/{totalPossibleFeatures} enabled
          </span>
        </div>
        
        {/* Feature Categories */}
        {Object.entries(FEATURE_CONFIG).map(([categoryKey, category]) => {
          const categoryFeatures = category.features.filter(feature => 
            (plan.originalFeatures || plan.features || {})[feature.key]
          );
          
          if (categoryFeatures.length === 0) return null;
          
          const Icon = category.icon;
          
          return (
            <div key={categoryKey} className="mb-2">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                <Icon size={12} />
                <span>{category.title} ({categoryFeatures.length})</span>
              </div>
              <div className="pl-4 space-y-1">
                {categoryFeatures.slice(0, 3).map((feature) => (
                  <div key={feature.key} className="flex items-center text-xs text-green-600">
                    <Check size={10} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{feature.label}</span>
                  </div>
                ))}
                {categoryFeatures.length > 3 && (
                  <div className="text-xs text-gray-500 pl-3">
                    +{categoryFeatures.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {enabledFeatures.length === 0 && (
          <div className="flex items-center text-xs text-gray-400">
            <X size={10} className="mr-1" />
            <span>No features enabled</span>
          </div>
        )}
      </div>

      {/* Usage Limits */}
      <div className="mb-4 text-sm text-gray-600">
        <h4 className="font-medium text-gray-700 mb-2">Usage Limits</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {LIMIT_CONFIG.slice(0, 6).map((limit) => {
            const value = (plan.originalLimits || plan.limits || {})[limit.key] || 
                         plan[limit.key] || 0;
            return (
              <div key={limit.key} className="flex items-center">
                <limit.icon size={10} className="mr-1 text-gray-400" />
                <span>{limit.label}: {value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onAssign(plan)}
            disabled={plan.status !== "active"}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign
          </button>
        </div>
        
        <button
          onClick={() => onDelete(plan)}
          className="w-full px-3 py-2 text-sm border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

PlanCard.displayName = "PlanCard";

const ViewSubscriptionPlan = memo(() => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlanForAssign, setSelectedPlanForAssign] = useState(null);

  // Get subscription plans
  const {
    plans,
    filteredPlans,
    searchTerm,
    loading,
    submitting,
    error,
    handleFormSubmit,
    handleSearchChange,
    deletePlan,
    assignPlanToHotel,
    prepareForEdit,
    planCount,
    hasPlans,
    hasSearchResults,
    setSearchTerm,
    clearError,
  } = useSubscription({
    onPlanAdded: (planData) => {},
  });

  // Get hotel subscriptions overview
  const {
    hotelSubscriptions,
    subscriptionStats,
    loading: subscriptionsLoading,
  } = useHotelSubscriptions();

  // Get hotels list for assignment
  const { hotels: availableHotels } = useHotelsList();

  // Filter plans based on status and price range
  const filteredAndSorted = useMemo(() => {
    let arr = filteredPlans;

    if (statusFilter !== "all") {
      arr = arr.filter((plan) => plan.status === statusFilter);
    }

    if (priceRangeFilter !== "all") {
      switch (priceRangeFilter) {
        case "free":
          arr = arr.filter((plan) => {
            const price = plan.pricing?.monthlyPrice || plan.price || 0;
            return price === 0;
          });
          break;
        case "budget":
          arr = arr.filter((plan) => {
            const price = plan.pricing?.monthlyPrice || plan.price || 0;
            return price > 0 && price <= 1000;
          });
          break;
        case "premium":
          arr = arr.filter((plan) => {
            const price = plan.pricing?.monthlyPrice || plan.price || 0;
            return price > 1000 && price <= 5000;
          });
          break;
        case "enterprise":
          arr = arr.filter((plan) => {
            const price = plan.pricing?.monthlyPrice || plan.price || 0;
            return price > 5000;
          });
          break;
        default:
          break;
      }
    }

    // Sort by price ascending
    arr = [...arr].sort((a, b) => {
      const priceA = a.pricing?.monthlyPrice || a.price || 0;
      const priceB = b.pricing?.monthlyPrice || b.price || 0;
      return priceA - priceB;
    });

    return arr;
  }, [filteredPlans, statusFilter, priceRangeFilter]);

  // Enhanced Stats Calculation
  const planStats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((plan) => plan.status === "active").length;
    const inactive = total - active;

    const totalRevenue = subscriptionStats?.revenue || 0;
    const averagePrice =
      total > 0
        ? plans.reduce((sum, plan) => {
            const price = plan.pricing?.monthlyPrice || plan.price || 0;
            return sum + price;
          }, 0) / total
        : 0;

    return {
      total,
      active,
      inactive,
      totalRevenue,
      averagePrice: Math.round(averagePrice),
      subscribedHotels: subscriptionStats?.activeSubscriptions || 0,
    };
  }, [plans, subscriptionStats]);

  const handleAddClick = useCallback(() => {
    setEditingPlan(null);
    setShowModal(true);
    if (error) clearError();
  }, [error, clearError]);

  const handleEditClick = useCallback(
    async (plan) => {
      try {
        const planToEdit = await prepareForEdit(plan);
        if (planToEdit) {
          setEditingPlan(planToEdit);
          setShowModal(true);
        }
      } catch (err) {
        console.error("Error preparing plan for edit:", err);
      }
    },
    [prepareForEdit]
  );

  const handleDeleteClick = useCallback(
    async (plan) => {
      const planName = plan.planName || "this plan";

      const confirmed = window.confirm(
        `Are you sure you want to delete "${planName}"?\n\nNote: Plans currently assigned to hotels cannot be deleted. This action cannot be undone.`
      );

      if (confirmed) {
        try {
          await deletePlan(plan);
        } catch (err) {
          console.error("Error deleting plan:", err);
        }
      }
    },
    [deletePlan]
  );

  const handleAssignClick = useCallback((plan) => {
    setSelectedPlanForAssign(plan);
    setShowAssignModal(true);
  }, []);

  const handleAssignPlan = useCallback(
    async (hotelId) => {
      if (!selectedPlanForAssign) return;

      try {
        await assignPlanToHotel(hotelId, selectedPlanForAssign.planId);
        setShowAssignModal(false);
        setSelectedPlanForAssign(null);
      } catch (err) {
        console.error("Error assigning plan:", err);
      }
    },
    [selectedPlanForAssign, assignPlanToHotel]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingPlan(null);
    if (error) clearError();
  }, [error, clearError]);

  const handleModalSubmit = useCallback(
    async (planData, planId = null) => {
      try {
        const success = await handleFormSubmit(planData, planId);
        return success;
      } catch (error) {
        console.error("Error submitting plan form:", error);
        return false;
      }
    },
    [handleFormSubmit]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange("");
  }, [handleSearchChange]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriceRangeFilter("all");
  }, [setSearchTerm]);

  // Error Handling
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage
          error={error}
          title="Error Loading Subscription Plans"
          onRetry={clearError}
        />
      </div>
    );
  }

  if (loading && !plans.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading subscription plans..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal for Add/Edit Plan */}
      <Suspense fallback={<LoadingSpinner />}>
        <SubscriptionFormModal
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          editPlan={editingPlan}
          title={editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
          submitting={submitting}
        />
      </Suspense>

      {/* Plan Assignment Modal */}
      {showAssignModal && selectedPlanForAssign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign "{selectedPlanForAssign.planName}" to Hotel
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableHotels
                .filter((hotel) => hotel.status === "active")
                .map((hotel) => (
                  <button
                    key={hotel.hotelId}
                    onClick={() => handleAssignPlan(hotel.hotelId)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {hotel.businessName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {hotel.city}, {hotel.state}
                    </div>
                  </button>
                ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
          <PageTitle
            pageTitle={t("dashboard.title")}
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
          />
          <p className="text-blue-100 text-sm sm:text-base">
            {t("dashboard.welcome")}
            {t("dashboard.today")}
          </p>
        </div>

        {hasPlans && (
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span>Total Plans: {planStats.total}</span>
            <span className="text-green-600">Active: {planStats.active}</span>
            <span className="text-blue-600">
              Subscribed Hotels: {planStats.subscribedHotels}
            </span>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        {hasPlans && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Package}
              title="Total Plans"
              value={planStats.total}
              color="blue"
              loading={loading}
              subtitle={`${planStats.active} active`}
            />
            <StatCard
              icon={TrendingUp}
              title="Active Subscriptions"
              value={planStats.subscribedHotels}
              color="green"
              subtitle="Hotels subscribed"
              loading={subscriptionsLoading}
            />
            <StatCard
              icon={DollarSign}
              title="Monthly Revenue"
              value={`₹${(planStats.totalRevenue / 1000).toFixed(1)}K`}
              color="purple"
              subtitle="From subscriptions"
              loading={subscriptionsLoading}
            />
            <StatCard
              icon={CreditCard}
              title="Avg. Plan Price"
              value={`₹${planStats.averagePrice}`}
              color="orange"
              subtitle="Per month"
              loading={loading}
            />
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by plan name, description, or price..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter dropdowns */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Prices</option>
                <option value="free">Free (₹0)</option>
                <option value="budget">Budget (₹1-1K)</option>
                <option value="premium">Premium (₹1K-5K)</option>
                <option value="enterprise">Enterprise (₹5K+)</option>
              </select>

              <button
                onClick={handleAddClick}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Create Plan
              </button>
            </div>
          </div>

          {/* Filter summary */}
          {(searchTerm ||
            statusFilter !== "all" ||
            priceRangeFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSorted.length} result
                {filteredAndSorted.length !== 1 ? "s" : ""}
                {searchTerm && ` for "${searchTerm}"`}
              </span>
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasPlans ? (
            filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filteredAndSorted.map((plan) => (
                  <PlanCard
                    key={plan.planId}
                    plan={plan}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAssign={handleAssignClick}
                  />
                ))}
              </div>
            ) : (
              <NoSearchResults
                btnText="Create New Plan"
                searchTerm={searchTerm}
                onClearSearch={handleClearSearch}
                onAddNew={handleAddClick}
              />
            )
          ) : (
            <EmptyState
              icon={Package}
              title="No Subscription Plans Yet"
              description="Create your first subscription plan to start offering services to hotels. You can set features, pricing, and limits for each plan."
              actionLabel="Create Your First Plan"
              onAction={handleAddClick}
              loading={submitting}
            />
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
});

ViewSubscriptionPlan.displayName = "ViewSubscriptionPlan";
export default ViewSubscriptionPlan;
