import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import {
  Plus,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  Search,
  Filter,
  Download,
  Users,
  Building2,
  Star,
  Clock,
  Check,
  X,
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
const DynamicTable = React.lazy(() => import("../../organisms/DynamicTable"));

const ViewSubscriptionPlan = memo(() => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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
    onPlanAdded: (planData) => {
      console.log("Plan added successfully:", planData);
    },
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
          arr = arr.filter((plan) => plan.price === 0);
          break;
        case "budget":
          arr = arr.filter((plan) => plan.price > 0 && plan.price <= 1000);
          break;
        case "premium":
          arr = arr.filter((plan) => plan.price > 1000 && plan.price <= 5000);
          break;
        case "enterprise":
          arr = arr.filter((plan) => plan.price > 5000);
          break;
        default:
          break;
      }
    }

    // Sort by price ascending
    arr = [...arr].sort((a, b) => {
      return (a.price || 0) - (b.price || 0);
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
        ? plans.reduce((sum, plan) => sum + (plan.price || 0), 0) / total
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
        {/* Header */}

        <div className="flex flex-row lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle="Subscription Plans"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Manage subscription plans and hotel assignments"
          />
          <PrimaryButton
            onAdd={handleAddClick}
            btnText="Create New Plan"
            loading={submitting}
            icon={Plus}
            className="bg-purple-600 hover:bg-purple-700"
          />
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

        {/* Plans Grid/Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasPlans ? (
            filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filteredAndSorted.map((plan) => (
                  <div
                    key={plan.planId}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Plan Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {plan.planName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {plan.description}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
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
                          ₹{plan.price || 0}
                        </span>
                        <span className="text-gray-600 ml-1">
                          /{plan.duration} month{plan.duration !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {plan.price === 0 && (
                        <span className="text-sm text-green-600 font-medium">
                          Free Forever
                        </span>
                      )}
                    </div>

                    {/* Key Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Key Features
                      </h4>
                      <div className="space-y-1 text-sm">
                        {plan.features?.isCustomerOrderEnable && (
                          <div className="flex items-center text-green-600">
                            <Check size={14} className="mr-2" />
                            Customer Ordering
                          </div>
                        )}
                        {plan.features?.isCaptainDashboard && (
                          <div className="flex items-center text-green-600">
                            <Check size={14} className="mr-2" />
                            Captain Dashboard
                          </div>
                        )}
                        {plan.features?.isAnalyticsDashboard && (
                          <div className="flex items-center text-green-600">
                            <Check size={14} className="mr-2" />
                            Analytics & Reports
                          </div>
                        )}
                        {!plan.features?.isAnalyticsDashboard && (
                          <div className="flex items-center text-gray-400">
                            <X size={14} className="mr-2" />
                            Analytics & Reports
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="mb-4 text-sm text-gray-600 space-y-1">
                      <div>Max Admins: {plan.features?.maxAdmins || 1}</div>
                      <div>Menu Items: {plan.features?.maxMenuItems || 50}</div>
                      <div>Storage: {plan.features?.maxStorage || 500}MB</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAssignClick(plan)}
                        disabled={plan.status !== "active"}
                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Assign
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteClick(plan)}
                      className="w-full mt-2 px-3 py-2 text-sm border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
