import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { db } from "../../data/firebase/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DynamicTable, FilterSortSearch } from "../../components";
import PageTitle from "../../Atoms/PageTitle";
import { ViewStaffColumns } from "../../data/Columns";
import styled from "styled-components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";

// Background Card
const BackgroundCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

function ViewStaff() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleCounts, setRoleCounts] = useState({});

  const {hotelName} = useHotelContext(); // Replace with dynamic value if needed
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const navigate = useNavigate(); // Initialize navigate function for redirection

  // Fetch staff data from database
  useEffect(() => {
    const staffRef = ref(db, `/hotels/${hotelName}/staff/`);
    const unsubscribe = onValue(staffRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const staffArray = Object.values(data);
        setStaff(staffArray);
      } else {
        setStaff([]); // Clear staff if none exist
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  // Fetch roles from database
  useEffect(() => {
    const rolesRef = ref(db, `/hotels/${hotelName}/roles/`);
    const unsubscribe = onValue(rolesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rolesArray = Object.values(data);
        setRoles(rolesArray);
      } else {
        setRoles([]); // Clear roles if none exist
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [hotelName, currentAdminId]);

  useEffect(() => {
    const countsByRole = {};
    staff.forEach((staffMember) => {
      const role = staffMember.role;
      countsByRole[role] = (countsByRole[role] || 0) + 1;
    });

    setRoleCounts(countsByRole);
  }, [staff]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (staff) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this staff member?");
    if (confirmDelete) {
      // Delete the staff member
      remove(ref(db, `/hotels/${hotelName}/staff/${staff.staffId}`));

      toast.success("Staff Member Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleEdit = (staffMember) => {
    // Exclude the 'Actions' field by creating a new object without it
    const { Actions, ...serializableStaff } = staffMember;
  
    // Now navigate with the cleaned object
    navigate(`${hotelName}/admin/staff/staff-dashboard/add-staff`, {
      state: { staff: serializableStaff },
    });
  };
  

  const filterAndSortItems = () => {
    let filteredItems = staff.filter((member) => {
      const memberName = member.name || ""; // Use empty string if name is undefined
      return memberName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (selectedRole !== "") {
      filteredItems = filteredItems.filter((member) => {
        const memberRole = member.role || ""; // Use empty string if role is undefined
        return memberRole.toLowerCase() === selectedRole.toLowerCase();
      });
    }

    return filteredItems;
  };

  const filteredAndSortedItems = filterAndSortItems();

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
  };

  // Prepare data for the table
  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    "FirstName": item.firstName,
    "LastName": item.lastName,
    "upiId": item.upiId,
    "Role": item.role,
    "Actions": (
      <>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEdit(item)}
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm ml-2"
          onClick={() => handleDelete(item.id)}
        >
          <img src="/delete.png" width="20px" height="20px" alt="Delete" />
        </button>
      </>
    ),
  }));

  const columns = ViewStaffColumns;

  return (
    <>
      <PageTitle />
      <div className="mt-2">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-start">
              <div
                className="d-flex flex-nowrap overflow-auto"
                style={{ whiteSpace: "nowrap" }}
              >
                <div
                  className="p-2 mb-2 bg-light border cursor-pointer d-inline-block roleTab"
                  onClick={() => handleRoleFilter("")}
                  style={{ marginRight: "5px" }}
                >
                  <div>
                    All{" "}
                    <span
                      className="badge bg-danger badge-number"
                      style={{ borderRadius: "50%", padding: "5px" }}
                    >
                      {Object.values(roleCounts).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
                {roles
                  .filter((role) => roleCounts[role.roleName] > 0) // Only include roles with non-zero counts
                  .map((role) => (
                    <div
                      className="role p-2 mb-2 bg-light border cursor-pointer d-inline-block roleTab"
                      key={role.id}
                      onClick={() => handleRoleFilter(role.roleName)}
                    >
                      <div className="role-name">
                        {role.roleName}{" "}
                        <span
                          className="badge bg-danger badge-number"
                          style={{ borderRadius: "50%" }}
                        >
                          {roleCounts[role.roleName]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <FilterSortSearch searchTerm={searchTerm} handleSearch={handleSearch} />
        <BackgroundCard>
          <PageTitle pageTitle={"View Staff"} />
          <DynamicTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </BackgroundCard>
      </div>
      <ToastContainer />
    </>
  );
}

export default ViewStaff;
