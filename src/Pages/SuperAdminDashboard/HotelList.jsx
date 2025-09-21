// src/Pages/SuperAdmin/ViewHotel.jsx
import React, { useState, useCallback, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Building2,
  Hotel,
  MapPin,
  Phone,
  Mail,
  Users,
  RefreshCw,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Clock,
  Star,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

// ✅ NEW: Import Firestore-based hooks and contexts
import { useAuth } from "../../context/AuthContext";
import { useSuperAdmin } from "../../hooks/useSuperAdmin";
import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";

import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import { hotelsListColumn } from "../../Constants/Columns";
import HotelEditForm from "./AddHotel";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import StatCard from "components/Cards/StatCard";
import SearchWithButton from "molecules/SearchWithAddButton";

const ViewHotel = () => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // ✅ NEW: Use context hooks for better integration
  const { currentUser, isSuperAdmin } = useAuth();
  const { hasPermissions } = useSuperAdmin();

  // ✅ ENHANCED: Use Firestore collection hook
  const {
    documents: hotels,
    loading,
    error,
    connectionStatus,
    lastFetch,
    retryCount,
    refresh: refetchHotels,
    isRetrying,
    canRetry,
  } = useFirestoreCollection("hotels", {
    orderBy: [["createdAt", "desc"]],
    realtime: true,
    enableRetry: true,
  });

  // State management
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("hotelData_______", hotels);

  // ✅ NEW: Permission check
  const hasPermission = useMemo(() => {
    return isSuperAdmin() && hasPermissions;
  }, [isSuperAdmin, hasPermissions]);

  // ✅ ENHANCED: Process and filter hotel data
  const processedHotels = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];

    let filtered = hotels.map((hotel, index) => ({
      srNo: index + 1,
      id: hotel.id,
      ...hotel,
      // Handle hotel name from multiple possible fields
      hotelName:
        hotel.businessName ||
        hotel.name ||
        hotel.hotelName ||
        hotel.info?.businessName ||
        "No Name provided",

      // Handle owner/admin information
      ownerName:
        hotel.adminDetails?.name ||
        hotel.admin?.name ||
        hotel.info?.admin?.name ||
        hotel.ownerName ||
        "N/A",

      // Handle location information
      district:
        hotel.address?.district ||
        hotel.district ||
        hotel.info?.district ||
        "N/A",

      state: hotel.address?.state || hotel.state || hotel.info?.state || "N/A",

      // Format full address
      fullAddress: hotel.address
        ? `${hotel.address.street || ""} ${hotel.address.city || ""} ${
            hotel.address.state || ""
          } ${hotel.address.pincode || ""}`.trim()
        : hotel.info?.address || hotel.location || "No address provided",

      // Handle contact information
      contactInfo:
        hotel.phone ||
        hotel.contact ||
        hotel.info?.primaryContact ||
        hotel.primaryContact ||
        "No contact provided",

      // Handle email
      email:
        hotel.email || hotel.admin?.email || hotel.info?.admin?.email || "N/A",

      // Format status
      status:
        hotel.isActive !== false && hotel.status !== "inactive"
          ? "Active"
          : "Inactive",

      // Format creation date
      createdDate: hotel.createdAt?.toDate
        ? hotel.createdAt.toDate().toLocaleDateString()
        : hotel.createdAt
        ? new Date(hotel.createdAt).toLocaleDateString()
        : "N/A",

      // Handle owner contact
      ownerContact:
        hotel.adminDetails?.phone ||
        hotel.admin?.contact ||
        hotel.info?.admin?.contact ||
        hotel.ownerContact ||
        "N/A",

      // Format business type/cuisine
      cuisineType:
        hotel.businessType ||
        hotel.cuisineType ||
        hotel.info?.businessType ||
        "Not specified",

      // Additional fields for enhanced display
      avgCostForTwo: hotel.avgCostForTwo || 0,
      rating: hotel.stats?.rating || 0,
      totalOrders: hotel.stats?.totalOrders || 0,
      totalRevenue: hotel.stats?.totalRevenue || 0,

      // GST and legal info
      gstNumber: hotel.gstNumber || hotel.info?.gstNumber || "N/A",
      fssaiNumber: hotel.fssaiNumber || hotel.info?.fssaiNumber || "N/A",
    }));

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (hotel) =>
          hotel.hotelName?.toLowerCase().includes(search) ||
          hotel.ownerName?.toLowerCase().includes(search) ||
          hotel.district?.toLowerCase().includes(search) ||
          hotel.state?.toLowerCase().includes(search) ||
          hotel.cuisineType?.toLowerCase().includes(search) ||
          hotel.email?.toLowerCase().includes(search) ||
          hotel.contactInfo?.includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(
        (hotel) => (hotel.status === "Active") === isActive
      );
    }

    // Apply business type filter
    if (businessTypeFilter !== "all") {
      filtered = filtered.filter(
        (hotel) =>
          hotel.cuisineType?.toLowerCase() === businessTypeFilter.toLowerCase()
      );
    }

    return filtered;
  }, [hotels, searchTerm, statusFilter, businessTypeFilter]);

  // ✅ NEW: Hotel statistics
  const hotelStats = useMemo(() => {
    if (!hotels || hotels.length === 0) {
      return { total: 0, active: 0, inactive: 0, revenue: 0 };
    }

    const total = hotels.length;
    const active = hotels.filter(
      (hotel) => hotel.isActive !== false && hotel.status !== "inactive"
    ).length;
    const inactive = total - active;
    const totalRevenue = hotels.reduce(
      (sum, hotel) => sum + (hotel.stats?.totalRevenue || 0),
      0
    );

    return { total, active, inactive, revenue: totalRevenue };
  }, [hotels]);

  // ✅ NEW: Business types for filter
  const businessTypes = useMemo(() => {
    if (!hotels || hotels.length === 0) return [];

    const types = new Set();
    hotels.forEach((hotel) => {
      const type =
        hotel.businessType || hotel.cuisineType || hotel.info?.businessType;
      if (type) types.add(type);
    });

    return Array.from(types);
  }, [hotels]);

  // Handle search change
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Handle add button click
  const handleAddClick = useCallback(() => {
    if (!hasPermission) {
      toast.error("You don't have permission to add hotels.");
      return;
    }
    navigate("/super-admin/add-hotel");
  }, [hasPermission, navigate]);

  // ✅ ENHANCED: Toggle hotel status with Firestore
  const onToggleStatus = useCallback(
    async (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to modify hotel status.");
        return;
      }

      const { id, hotelName, status } = item;
      const newStatus = status !== "Active";
      setSubmitting(true);

      try {
        const hotelDocRef = doc(db, "hotels", id);

        await updateDoc(hotelDocRef, {
          isActive: newStatus,
          status: newStatus ? "active" : "inactive",
          updatedAt: serverTimestamp(),
          updatedBy: currentUser?.uid,
        });

        const statusText = newStatus ? "activated" : "deactivated";
        toast.success(`${hotelName || "Hotel"} ${statusText} successfully.`);
      } catch (error) {
        console.error("Error updating hotel status:", error);

        let errorMessage = "Error updating hotel status: ";
        if (error.code === "permission-denied") {
          errorMessage += "You don't have permission to update this hotel.";
        } else {
          errorMessage += error.message;
        }

        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
    [hasPermission, currentUser]
  );

  // Function to handle edit action
  const onEdit = useCallback(
    (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to edit hotels.");
        return;
      }
      console.log("Opening edit form for hotel:", item);
      setEditingHotel(item);
    },
    [hasPermission]
  );

  // Function to handle successful edit
  const onEditSuccess = useCallback(() => {
    console.log("Edit successful, refreshing data...");
    setEditingHotel(null);
    toast.success("Hotel updated successfully!");
  }, []);

  // ✅ ENHANCED: Delete function with Firestore
  const onDelete = useCallback(
    async (item) => {
      if (!hasPermission) {
        toast.error("You don't have permission to delete hotels.");
        return;
      }

      const { id, hotelName, name } = item;
      const displayName = hotelName || name || "this hotel";

      // Confirm deletion
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${displayName}? This action cannot be undone and will remove all associated data including orders, menu items, and staff.`
      );

      if (confirmDelete) {
        setSubmitting(true);

        try {
          const hotelDocRef = doc(db, "hotels", id);
          await deleteDoc(hotelDocRef);

          toast.success(`${displayName} deleted successfully!`);
        } catch (error) {
          console.error("Error deleting hotel:", error);

          let errorMessage = "Error deleting hotel: ";
          if (error.code === "permission-denied") {
            errorMessage += "You don't have permission to delete this hotel.";
          } else {
            errorMessage += error.message;
          }

          toast.error(errorMessage);
        } finally {
          setSubmitting(false);
        }
      }
    },
    [hasPermission]
  );

  // Function to view hotel details
  const onViewDetails = useCallback(
    (item) => {
      console.log("Viewing details for hotel:", item);
      toast.info(`Viewing details for ${item.hotelName || item.name}`);
      // Navigate to hotel details page
      navigate(`/super-admin/hotel/${item.id}/details`);
    },
    [navigate]
  );

  // ✅ NEW: Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchHotels();
    } catch (error) {
      console.error("Error refreshing hotel list:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [refetchHotels]);

  // ✅ NEW: Export functionality
  const handleExport = useCallback(() => {
    try {
      const csvData = processedHotels.map((hotel) => ({
        "Sr. No": hotel.srNo,
        "Hotel Name": hotel.hotelName,
        Owner: hotel.ownerName,
        Email: hotel.email,
        Phone: hotel.contactInfo,
        District: hotel.district,
        State: hotel.state,
        "Business Type": hotel.cuisineType,
        Status: hotel.status,
        "Created Date": hotel.createdDate,
        "GST Number": hotel.gstNumber,
        "Average Cost": hotel.avgCostForTwo,
        Rating: hotel.rating,
        "Total Orders": hotel.totalOrders,
        Revenue: hotel.totalRevenue,
      }));

      const csv = csvData.map((row) => Object.values(row).join(",")).join("\n");
      const headers = Object.keys(csvData[0] || {}).join(",");
      const csvContent = headers + "\n" + csv;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `hotels_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting hotel list:", error);
      toast.error("Error exporting data");
    }
  }, [processedHotels]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setEditingHotel(null);
  }, []);

  // ✅ ENHANCED: Actions with better organization
  const actions = [
    {
      label: "Toggle Status",
      variant: "primary",
      handler: onToggleStatus,
      icon: (item) =>
        item.status === "Active" ? (
          <ToggleRight size={14} />
        ) : (
          <ToggleLeft size={14} />
        ),
      condition: () => hasPermission,
    },
    {
      label: "View Details",
      variant: "info",
      handler: onViewDetails,
      icon: <Eye size={14} />,
    },
  ];

  // ✅ ENHANCED: Updated columns with better formatting
  const enhancedColumns = [
    ...hotelsListColumn,
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value) => (
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-500" />
          <span className="text-sm">{value || "0.0"}</span>
        </div>
      ),
    },
  ];

  // Computed values
  const hotelCount = processedHotels.length;
  const hasHotels = hotelStats.total > 0;
  const hasSearchResults = processedHotels.length > 0;

  // ✅ NEW: Permission check UI
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            You don't have super admin permissions to view hotels.
          </p>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Loading state
  // if (loading && (!hotels || hotels.length === 0)) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <LoadingSpinner size="lg" text="Loading hotel list..." />
  //     </div>
  //   );
  // }

  // ✅ ENHANCED: Error state
  if (error && connectionStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            error={error}
            onRetry={handleRefresh}
            title="Hotel List Error"
            showRetryButton={canRetry}
          />
          <div className="mt-4 text-center">
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Attempted {retryCount} time{retryCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
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

        {/* ✅ ENHANCED: Header with actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <PageTitle
              pageTitle="Hotel Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description="Manage hotels and their configurations"
            />

            {/* ✅ NEW: Live status indicator */}
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live updates</span>
              </div>
            )}

            {/* ✅ NEW: Result count */}
            {hasHotels && (
              <div className="text-sm text-gray-600 mt-1">
                {searchTerm ||
                statusFilter !== "all" ||
                businessTypeFilter !== "all"
                  ? `Showing ${hotelCount} of ${hotelStats.total} hotels`
                  : `Total: ${hotelStats.total} hotels`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={!hasHotels}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isRefreshing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ✅ ENHANCED: Statistics Cards */}
        {hasHotels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Building2}
              title="Total Hotels"
              value={hotelStats.total}
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={Activity}
              title="Active Hotels"
              value={hotelStats.active}
              color="green"
              subtitle={`${Math.round(
                (hotelStats.active / hotelStats.total) * 100
              )}% active`}
              loading={loading}
            />
            <StatCard
              icon={AlertTriangle}
              title="Inactive Hotels"
              value={hotelStats.inactive}
              color="red"
              loading={loading}
            />
            <StatCard
              icon={TrendingUp}
              title="Total Revenue"
              value={`₹${(hotelStats.revenue / 1000).toFixed(1)}K`}
              color="purple"
              subtitle="Across all hotels"
              loading={loading}
            />
          </div>
        )}

        {/* ✅ ENHANCED: Filters */}
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
                  placeholder="Search hotels by name, owner, location, or type..."
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

              {businessTypes.length > 0 && (
                <select
                  value={businessTypeFilter}
                  onChange={(e) => setBusinessTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleAddClick}
                disabled={submitting || !hasPermission}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Add Hotel
              </button>
            </div>
          </div>

          {/* Filter summary */}
          {(searchTerm ||
            statusFilter !== "all" ||
            businessTypeFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {hotelCount} result{hotelCount !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setBusinessTypeFilter("all");
                }}
                className="text-red-600 hover:text-red-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* ✅ ENHANCED: Hotels Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {hasHotels ? (
            <>
              {hasSearchResults ? (
                <DynamicTable
                  columns={enhancedColumns}
                  data={processedHotels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  actions={actions}
                  loading={submitting}
                  emptyMessage="No hotels match your search criteria"
                  showPagination={true}
                  initialRowsPerPage={10}
                  sortable={true}
                  // ✅ NEW: Enhanced table props
                  searchable={false} // We handle search externally
                  exportable={false} // We handle export externally
                  refreshable={true}
                  onRefresh={handleRefresh}
                  connectionStatus={connectionStatus}
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
                Get started by adding your first hotel to the system
              </p>
              <button
                onClick={handleAddClick}
                disabled={submitting || !hasPermission}
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

export default ViewHotel;
