import React, { useState } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, update } from "firebase/database";
import { toast } from "react-toastify";

const AdminEditForm = ({ admin, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: admin.name || "",
    displayName: admin.displayName || "",
    email: admin.email || "",
    contact: admin.contact || admin.phone || "",
    role: admin.role || "admin",
  });
  const [loading, setLoading] = useState(false);

  console.log("Editing admin:", admin);
  console.log("Admin ID:", admin.id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the exact admin ID from the data
      const adminRef = ref(db, `admins/${admin.id}`);

      // Prepare update data - only include fields that should be updated
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        role: formData.role,
        updatedAt: new Date().toISOString(),
      };

      // Only add displayName if it has a value
      if (formData.displayName.trim()) {
        updateData.displayName = formData.displayName.trim();
      }

      // Preserve existing fields that shouldn't be changed
      if (admin.createdAt) {
        updateData.createdAt = admin.createdAt;
      }
      if (admin.hotels) {
        updateData.hotels = admin.hotels;
      }
      if (admin.phone && !formData.contact) {
        updateData.phone = admin.phone;
      }

      console.log("Updating admin with ID:", admin.id);
      console.log("Firebase path:", `admins/${admin.id}`);
      console.log("Update data:", updateData);

      await update(adminRef, updateData);

      toast.success("Admin updated successfully!");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Error updating admin: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          width: "500px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#333" }}>Edit Admin Details</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Mobile Number *
            </label>
            <input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              required
              pattern="[0-9]{10}"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          {/* Hotel Information (Read-only) */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Assigned Hotels:
            </label>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#666",
                border: "1px solid #e9ecef",
              }}
            >
              {admin.hotels && Object.keys(admin.hotels).length > 0
                ? Object.values(admin.hotels)
                    .map((hotel) => hotel.hotelName)
                    .join(", ")
                : "No hotels assigned"}
            </div>
            <small style={{ color: "#6c757d", fontSize: "12px" }}>
              Hotel assignments are managed separately
            </small>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              borderTop: "1px solid #eee",
              paddingTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "12px 24px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: "#f8f9fa",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                color: "#495057",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: loading ? "#ccc" : "#28a745",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditForm;
