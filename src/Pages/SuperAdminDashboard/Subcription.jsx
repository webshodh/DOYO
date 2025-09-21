import React, { useState, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useData from "../../data/useData";
import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import {
  hotelsListColumn,
  hotelsSubscriptionListColumn,
} from "../../Constants/Columns";
import { db } from "../../services/firebase/firebaseConfig";
import { ref, update, get, remove } from "firebase/database";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import HotelEditForm from "./AddHotel";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { Spinner } from "react-bootstrap";
import SearchWithButton from "molecules/SearchWithAddButton";
import {
  Building2,
  Search,
  Plus,
  Activity,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Calendar,
  DollarSign,
} from "lucide-react";
import StatCard from "components/Cards/StatCard";

const ViewHotelSubscription = () => {
  const { data, loading, error, refetch } = useData("/hotels/");
  const { hotelName } = useParams();
  const navigate = useNavigate();

  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  // Convert data to an array and add serial numbers + process hotel data with subscription info
  const hotelsDataArray = useMemo(() => {
    return Object.entries(data || {}).map(([id, hotel], index) => ({
      srNo: index + 1,
      id,
      ...hotel,
      hotelName:
        hotel.info?.businessName || hotel.hotelName || "No Name provided",
      ownerName: hotel.info?.admin?.name || hotel.ownerName || "N/A",
      district: hotel.info?.district || hotel.district || "N/A",
      state: hotel.info?.state || hotel.state || "N/A",

      // Format address if it exists
      fullAddress: hotel.info?.address
        ? `${hotel.info.address || ""} ${hotel.address?.city || ""} ${
            hotel.address?.state || ""
          } ${hotel.address?.pincode || ""}`.trim()
        : hotel.location || "No address provided",

      // Format contact info
      contactInfo:
        hotel.info?.primaryContact ||
        hotel.contact ||
        hotel.phone ||
        hotel.mobile ||
        "No contact provided",

      // Format status
      status: hotel.info?.status !== false ? "Active" : "Inactive",

      // Format creation date
      createdDate: hotel.createdAt
        ? new Date(hotel.createdAt).toLocaleDateString()
        : "N/A",

      // Handle multiple contact numbers if they exist
      ownerContact: hotel.info?.admin?.contact || hotel.ownerContact || "N/A",
      email: hotel.info?.admin?.email || hotel.email || "N/A",

      // Format cuisine type
      cuisineType:
        hotel.info?.businessType || hotel.cuisineType || "Not specified",

      // Subscription specific fields
      subscriptionPlan: hotel.subscription?.plan || "Free",
      subscriptionStatus: hotel.subscription?.status || "inactive",
      subscriptionExpiry: hotel.subscription?.expiryDate
        ? new Date(hotel.subscription.expiryDate).toLocaleDateString()
        : "N/A",
      monthlyRevenue: hotel.subscription?.monthlyAmount || 0,
      totalPaid: hotel.subscription?.totalPaid || 0,
      lastPaymentDate: hotel.subscription?.lastPayment
        ? new Date(hotel.subscription.lastPayment).toLocaleDateString()
        : "N/A",
      paymentMethod: hotel.subscription?.paymentMethod || "N/A",
    }));
  }, [data]);

  // Get unique subscription plans for filter
  const subscriptionPlans = useMemo(() => {
    const plans = [
      ...new Set(
        hotelsDataArray.map((hotel) => hotel.subscriptionPlan).filter(Boolean)
      ),
    ];
    return plans.filter((plan) => plan !== "Free");
  }, [hotelsDataArray]);

  // Calculate subscription statistics
  const subscriptionStats = useMemo(() => {
    const total = hotelsDataArray.length;
    const activeSubscriptions = hotelsDataArray.filter(
      (hotel) =>
        hotel.subscriptionStatus === "active" &&
        hotel.subscriptionPlan !== "Free"
    ).length;
    const inactiveSubscriptions = hotelsDataArray.filter(
      (hotel) =>
        hotel.subscriptionStatus === "inactive" ||
        hotel.subscriptionPlan === "Free"
    ).length;
    const totalRevenue = hotelsDataArray.reduce(
      (sum, hotel) => sum + (hotel.totalPaid || 0),
      0
    );
    const monthlyRevenue = hotelsDataArray.reduce(
      (sum, hotel) => sum + (hotel.monthlyRevenue || 0),
      0
    );

    return {
      total,
      activeSubscriptions,
      inactiveSubscriptions,
      totalRevenue,
      monthlyRevenue,
    };
  }, [hotelsDataArray]);

  // Filter hotels based on search term and filters
  const filteredHotels = useMemo(() => {
    return hotelsDataArray.filter((hotel) => {
      // Text search filter
      const matchesSearch =
        !searchTerm ||
        [
          hotel.hotelName,
          hotel.ownerName,
          hotel.district,
          hotel.state,
          hotel.cuisineType,
          hotel.subscriptionPlan,
        ].some(
          (field) =>
            field && field.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && hotel.status === "Active") ||
        (statusFilter === "inactive" && hotel.status === "Inactive");

      // Subscription filter
      const matchesSubscription =
        subscriptionFilter === "all" ||
        (subscriptionFilter === "active" &&
          hotel.subscriptionStatus === "active") ||
        (subscriptionFilter === "inactive" &&
          (hotel.subscriptionStatus === "inactive" ||
            hotel.subscriptionPlan === "Free")) ||
        subscriptionFilter === hotel.subscriptionPlan;

      return matchesSearch && matchesStatus && matchesSubscription;
    });
  }, [hotelsDataArray, searchTerm, statusFilter, subscriptionFilter]);

  const hotelCount = filteredHotels.length;
  const hasHotels = hotelsDataArray.length > 0;
  const hasSearchResults = filteredHotels.length > 0;

  console.log("Hotel data array:", hotelsDataArray);

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle add button click
  const handleAddClick = () => {
    navigate("/super-admin/add-hotel");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSubscriptionFilter("all");
  };

  // Function to toggle hotel status (Active/Inactive)
  const onToggleStatus = async (item) => {
    const { id, hotelName } = item;
    const itemRef = ref(db, `hotels/${id}`);
    setSubmitting(true);

    try {
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        const currentData = snapshot.val();
        const currentStatus = currentData.info?.status !== false;
        const newStatus = !currentStatus;

        // Update only the status field, preserve everything else
        await update(itemRef, {
          "info.status": newStatus,
          updatedAt: new Date().toISOString(),
        });

        const statusText = newStatus ? "activated" : "deactivated";
        toast.success(`${hotelName || "Hotel"} ${statusText} successfully.`);

        // Refresh data after update
        if (refetch) {
          refetch();
        }
      } else {
        toast.error("No data available for this hotel.");
      }
    } catch (error) {
      console.error("Error updating hotel status:", error);
      toast.error("Error updating hotel status: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Function to manage subscription
  const onManageSubscription = async (item) => {
    const { id, hotelName } = item;
    console.log("Managing subscription for hotel:", item);
    toast.info(`Managing subscription for ${hotelName || "Hotel"}`);
    // You can navigate to subscription management page or open a modal
    // navigate(`/super-admin/hotel-subscription/${id}`);
  };

  // Function to handle edit action
  const onEdit = (item) => {
    console.log("Opening edit form for hotel:", item);
    setEditingHotel(item);
  };

  // Function to handle successful edit
  const onEditSuccess = () => {
    console.log("Edit successful, refreshing data...");
    setEditingHotel(null);

    // Refresh data after successful update
    if (refetch) {
      refetch();
    }
  };

  // Function to handle delete action
  const onDelete = async (item) => {
    const { id, hotelName, name } = item;
    const displayName = hotelName || name || "this hotel";

    // Confirm deletion
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${displayName}? This action cannot be undone.`
    );

    if (confirmDelete) {
      const itemRef = ref(db, `hotels/${id}`);
      setSubmitting(true);

      try {
        await remove(itemRef);
        toast.success(`${displayName} deleted successfully!`);

        // Refresh data after deletion
        if (refetch) {
          refetch();
        }
      } catch (error) {
        console.error("Error deleting hotel:", error);
        toast.error("Error deleting hotel: " + error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Function to view hotel details
  const onViewDetails = (item) => {
    console.log("Viewing details for hotel:", item);
    toast.info(`Viewing details for ${item.hotelName || item.name}`);
  };

  // Handle modal close
  const handleModalClose = () => {
    setEditingHotel(null);
  };

  const actions = [
    {
      label: "Manage Subscription",
      variant: "primary",
      handler: onManageSubscription,
    },
    { label: "Toggle Status", variant: "success", handler: onToggleStatus },
    { label: "View Details", variant: "info", handler: onViewDetails },
  ];

  const columns = hotelsSubscriptionListColumn;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Hotel Edit Form Modal */}
        {editingHotel && (
          <HotelEditForm
            hotel={editingHotel}
            onClose={handleModalClose}
            onSuccess={onEditSuccess}
            submitting={submitting}
          />
        )}

        {/* Header with actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <PageTitle
              pageTitle="Hotel Subscription Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description="Manage hotel subscriptions and billing"
            />

            {/* Result count */}
            {hasHotels && (
              <div className="text-sm text-gray-600 mt-1">
                {searchTerm ||
                statusFilter !== "all" ||
                subscriptionFilter !== "all"
                  ? `Showing ${hotelCount} of ${subscriptionStats.total} hotels`
                  : `Total: ${subscriptionStats.total} hotels`}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {hasHotels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Building2}
              title="Total Hotels"
              value={subscriptionStats.total}
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={CreditCard}
              title="Active Subscriptions"
              value={subscriptionStats.activeSubscriptions}
              color="green"
              subtitle={`${Math.round(
                (subscriptionStats.activeSubscriptions /
                  subscriptionStats.total) *
                  100
              )}% subscribed`}
              loading={loading}
            />
            <StatCard
              icon={DollarSign}
              title="Monthly Revenue"
              value={`₹${(subscriptionStats.monthlyRevenue / 1000).toFixed(
                1
              )}K`}
              color="purple"
              subtitle="Per month"
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              title="Total Revenue"
              value={`₹${(subscriptionStats.totalRevenue / 100000).toFixed(
                1
              )}L`}
              color="orange"
              subtitle="All time"
              loading={loading}
            />
          </div>
        )}

        {/* Filters */}
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
                  placeholder="Search hotels by name, owner, location, or subscription..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={subscriptionFilter}
                onChange={(e) => setSubscriptionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Subscriptions</option>
                <option value="active">Active Subscriptions</option>
                <option value="inactive">Inactive Subscriptions</option>
                {subscriptionPlans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan} Plan
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter summary */}
          {(searchTerm ||
            statusFilter !== "all" ||
            subscriptionFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {hotelCount} result{hotelCount !== 1 ? "s" : ""}
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

        {/* Hotels Subscription Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasHotels ? (
            <>
              {hasSearchResults ? (
                <DynamicTable
                  columns={columns}
                  data={filteredHotels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  actions={actions}
                  loading={submitting}
                  emptyMessage="No hotels match your search criteria"
                  showPagination={true}
                  initialRowsPerPage={10}
                  sortable={true}
                  searchable={false}
                  exportable={true}
                  refreshable={true}
                />
              ) : (
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    No hotels found
                  </h5>
                  <p className="text-gray-600 mb-4">
                    No hotels match your search "{searchTerm}"
                  </p>
                  <button
                    onClick={() => handleSearchChange("")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h5 className="text-lg font-medium text-gray-900 mb-2">
                No Hotels Found
              </h5>
              <p className="text-gray-600 mb-6">
                Get started by adding your first hotel to manage subscriptions
              </p>
              <button
                onClick={handleAddClick}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <Plus size={20} />
                Add Your First Hotel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
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
};

export default ViewHotelSubscription;
