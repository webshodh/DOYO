import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { PageTitle } from "../../Atoms";
import { ViewRoleColumns, ViewSectionColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import styled from "styled-components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";


// Input field
const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

// Button styles
const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: ${(props) => (props.primary ? "#28a745" : "#dc3545")};
  margin-right: 10px;
`;

// Background Card
const BackgroundCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

function AddRole() {
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempRoleId, setTempRoleId] = useState("");

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const handleRoleNameChange = (e) => {
    setRoleName(e.target.value);
  };

  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/roles/`),
      (snapshot) => {
        setRoles([]);
        const data = snapshot.val();
        if (data !== null) {
          const sectionArray = Object.values(data);
          setRoles(sectionArray);
        }
      }
    );
  }, [hotelName]);

  const addRoleToDatabase = () => {
    const roleId = uid();
    set(ref(db, `/admins/${adminID}/hotels/${hotelName}/roles/${roleId}`), {
      roleName,
      roleId,
    });

    setRoleName("");
    toast.success("Role Added Successfully !", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleUpdateRole = (role) => {
    setIsEdit(true);
    setTempRoleId(role.roleId);
    setRoleName(role.roleName);
  };

  const handleSubmitRoleChange = () => {
    if (window.confirm("confirm update")) {
      update(ref(db, `/${hotelName}/roles/${tempRoleId}`), {
        roleName,
        roleId: tempRoleId,
      });
      toast.success("Role Updated Successfully !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    setRoleName("");
    setIsEdit(false);
  };

  const handleDeleteRole = (role) => {
    if (window.confirm("confirm delete")) {
      remove(ref(db, `/${hotelName}/roles/${role.roleId}`));
      toast.error("Role Deleted Successfully !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  // Convert customerInfo to an array and add serial numbers
  const rolesArray = Object.values(roles).map((role, index) => ({
    srNo: index + 1, // Serial number (1-based index)
    ...role,
  }));
  const columns = ViewRoleColumns; // Ensure this matches the expected format
  console.log("roles", rolesArray);
  return (
    <>
      <div className="background-card" style={{ padding: "40px" }}>
        <PageTitle pageTitle={"Add Roles"} />
        <Input
          type="text"
          value={roleName}
          onChange={handleRoleNameChange}
          placeholder="Enter Role Name"
        />
        {isEdit ? (
          <>
            <Button primary onClick={handleSubmitRoleChange}>
              Submit Change
            </Button>
            <Button
              onClick={() => {
                setIsEdit(false);
                setRoleName("");
              }}
            >
              Cancel
            </Button>
            <ToastContainer />
          </>
        ) : (
          <>
            <Button primary onClick={addRoleToDatabase}>
              Submit
            </Button>
            <ToastContainer />
          </>
        )}
      </div>
      <BackgroundCard style={{ padding: "40px" }}>
        <PageTitle pageTitle={"View Roles"} />
        <DynamicTable
          columns={columns}
          data={rolesArray}
          onEdit={handleUpdateRole}
          onDelete={handleDeleteRole}
        />
      </BackgroundCard>
    </>
  );
}

export default AddRole;
