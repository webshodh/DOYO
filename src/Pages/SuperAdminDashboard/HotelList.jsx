import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useData from "../../data/useData";
import { PageTitle } from "../../Atoms";
import { DynamicTable } from "../../components";
import { hotelsListColumn } from "../../Constants/Columns";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, update, get, remove } from "firebase/database";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import HotelEditForm from "./AddHotel"; // Import the separate component
import ErrorMessage from "Atoms/ErrorMessage";
import { Spinner } from "react-bootstrap";
import SearchWithButton from "components/SearchWithAddButton";

const ViewHotel = () => {
  const { data, loading, error, refetch } = useData("/hotels/");
  console.log("hotelData_______", data);
  const { hotelName } = useParams();
  const [editingHotel, setEditingHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
const navigate = useNavigate();
  // Convert data to an array and add serial numbers + process hotel data
  const hotelsDataArray = Object.entries(data || {}).map(
    ([id, hotel], index) => ({
      srNo: index + 1,
      id,
      ...hotel,
      hotelName: hotel.info?.businessName || hotel.hotelName || "No Name provided",
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
      cuisineType: hotel.info?.businessType || hotel.cuisineType || "Not specified",
    })
  );

  // Filter hotels based on search term
  const filteredHotels = hotelsDataArray.filter((hotel) =>
    hotel.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hotelCount = hotelsDataArray.length;
  const hasHotels = hotelCount > 0;
  const hasSearchResults = filteredHotels.length > 0;

  console.log("Hotel data array:", hotelsDataArray);

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle add button click
  const handleAddClick = () => {
    // Navigate to add hotel page or open modal
   navigate('/super-admin/add-hotel')
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
          'info.status': newStatus,
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
    return <Spinner />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <>
      <div style={{ margin: "20px" }}>
        {/* Hotel Edit Form Modal */}
        {editingHotel && (
          <HotelEditForm
            hotel={editingHotel}
            onClose={handleModalClose}
            onSuccess={onEditSuccess}
            submitting={submitting}
          />
        )}

        <div style={{ width: "100%" }}>
          {/* Page Title with Stats */}
          <div className="d-flex justify-between align-items-center mb-3">
            <PageTitle pageTitle="Hotel Management" />
            {hasHotels && (
              <div className="text-sm text-gray-600">
                {searchTerm
                  ? `Showing ${filteredHotels.length} of ${hotelCount} hotels`
                  : `Total: ${hotelCount} hotels`}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {hasHotels && (
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title text-primary">Total Hotels</h5>
                    <h3 className="text-primary">{hotelCount}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title text-success">Active Hotels</h5>
                    <h3 className="text-success">
                      {filteredHotels.filter((hotel) => hotel.status === "Active").length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title text-danger">Inactive Hotels</h5>
                    <h3 className="text-danger">
                      {filteredHotels.filter((hotel) => hotel.status === "Inactive").length}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Add Button */}
          <div className="mb-4">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => handleSearchChange(e.target.value)}
              buttonText="Add Hotel"
              onButtonClick={handleAddClick}
              disabled={submitting}
              placeholder="Search hotels by name, owner, location, or type..."
            />
          </div>

          {/* Hotels Table */}
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
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">
                    <i className="fas fa-search fa-3x"></i>
                  </div>
                  <h5 className="text-gray-600">No hotels found</h5>
                  <p className="text-gray-500">
                    No hotels match your search "{searchTerm}"
                  </p>
                  <button
                    className="btn btn-outline-primary mt-2"
                    onClick={() => handleSearchChange("")}
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <i className="fas fa-hotel fa-4x"></i>
              </div>
              <h5 className="text-gray-600 mb-2">No Hotels Found</h5>
              <p className="text-gray-500 mb-4">
                Get started by adding your first hotel
              </p>
              <button
                className="btn btn-primary"
                onClick={handleAddClick}
                disabled={submitting}
              >
                <i className="fas fa-plus me-2"></i>
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
      />
    </>
  );
};

export default ViewHotel;