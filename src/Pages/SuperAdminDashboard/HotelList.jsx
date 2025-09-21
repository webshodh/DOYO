import React, { useState, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useData from "../../data/useData";
import { PageTitle } from "../../atoms";
import { DynamicTable } from "../../components";
import { hotelsListColumn } from "../../Constants/Columns";
import { db } from "../../services/firebase/firebaseConfig";
import { ref, update, get, remove } from "firebase/database";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import HotelEditForm from "./AddHotel"; // Import the separate component
import ErrorMessage from "atoms/Messages/ErrorMessage";
import { Spinner } from "react-bootstrap";
import SearchWithButton from "molecules/SearchWithAddButton";
import CategoryTabs from "molecules/CategoryTab";
import {
  Activity,
  AlertTriangle,
  Building2,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import StatCard from "components/Cards/StatCard";

const ViewHotel = () => {
  const { data, loading, error, refetch } = useData("/hotels/");
  console.log("hotelData_______", data);
  const { hotelName } = useParams();
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Convert data to an array and add serial numbers + process hotel data
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
    }));
  }, [data]);

  // Get unique business types for filter
  const businessTypes = useMemo(() => {
    const types = [
      ...new Set(
        hotelsDataArray.map((hotel) => hotel.cuisineType).filter(Boolean)
      ),
    ];
    return types.filter((type) => type !== "Not specified");
  }, [hotelsDataArray]);

  // Calculate hotel statistics
  const hotelStats = useMemo(() => {
    const total = hotelsDataArray.length;
    const active = hotelsDataArray.filter(
      (hotel) => hotel.status === "Active"
    ).length;
    const inactive = total - active;
    // Mock revenue calculation - replace with actual logic
    const revenue = total * 50000; // Assuming average revenue per hotel

    return {
      total,
      active,
      inactive,
      revenue,
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
        ].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && hotel.status === "Active") ||
        (statusFilter === "inactive" && hotel.status === "Inactive");

      // Business type filter
      const matchesBusinessType =
        businessTypeFilter === "all" ||
        hotel.cuisineType === businessTypeFilter;

      return matchesSearch && matchesStatus && matchesBusinessType;
    });
  }, [hotelsDataArray, searchTerm, statusFilter, businessTypeFilter]);

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
    setBusinessTypeFilter("all");
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
    { label: "Toggle Status", variant: "primary", handler: onToggleStatus },
    { label: "View Details", variant: "info", handler: onViewDetails },
  ];

  const columns = hotelsListColumn;

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
              pageTitle="Hotel Management"
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              description="Manage hotels and their configurations"
            />

            {/* Result count */}
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
        </div>

        {/* Statistics Cards */}
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
                disabled={submitting}
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
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Hotels Table */}
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
                  searchable={false} // We handle search externally
                  exportable={false} // We handle export externally
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
                Get started by adding your first hotel to the system
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

export default ViewHotel;
