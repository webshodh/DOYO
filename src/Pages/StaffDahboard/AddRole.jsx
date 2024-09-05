import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { PageTitle } from "../../Atoms";
import { ViewRoleColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";

// Tailwind Input and Button components
const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-2 mb-4 border border-gray-300 rounded"
  />
);

function AddRole() {
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempRoleId, setTempRoleId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const handleRoleNameChange = (e) => setRoleName(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    onValue(
      ref(db, `/hotels/${hotelName}/roles/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setRoles(Object.values(data));
        }
      }
    );
  }, [hotelName, adminID]);

  const addRoleToDatabase = () => {
    const roleId = uid();
    set(ref(db, `/hotels/${hotelName}/roles/${roleId}`), {
      roleName,
      roleId,
    });
    setRoleName("");
    toast.success("Role Added Successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleUpdateRole = (role) => {
    setIsEdit(true);
    setTempRoleId(role.roleId);
    setRoleName(role.roleName);
  };

  const handleSubmitRoleChange = () => {
    if (window.confirm("Confirm update")) {
      update(
        ref(db, `/hotels/${hotelName}/roles/${tempRoleId}`),
        {
          roleName,
          roleId: tempRoleId,
        }
      );
      toast.success("Role Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setRoleName("");
      setIsEdit(false);
    }
  };

  const handleDeleteRole = (role) => {
    if (window.confirm("Confirm delete")) {
      remove(
        ref(db, `/hotels/${hotelName}/roles/${role.roleId}`)
      );
      toast.error("Role Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rolesArray = filteredRoles.map((role, index) => ({
    srNo: index + 1,
    ...role,
  }));

  return (
    <>
      <div className="d-flex justify-between">
        <div
          className="bg-white rounded shadow p-10"
          style={{ marginRight: "10px", width: "40%" }}
        >
          <PageTitle pageTitle="Add Roles" />
          <Input
            value={roleName}
            onChange={handleRoleNameChange}
            placeholder="Enter Role Name"
          />
          {isEdit ? (
            <>
              <button  onClick={handleSubmitRoleChange} className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md">
                Submit
              </button>
              <button onClick={() => setIsEdit(false) && setRoleName("")} className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={addRoleToDatabase} className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md">
              Submit
            </button>
          )}
          <ToastContainer />
        </div>

        <div className="bg-white rounded shadow p-10" style={{ width: "60%" }}>
          <PageTitle pageTitle="View Roles" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search Roles"
          />
          <DynamicTable
            columns={ViewRoleColumns}
            data={rolesArray}
            onEdit={handleUpdateRole}
            onDelete={handleDeleteRole}
          />
        </div>
      </div>
    </>
  );
}

export default AddRole;
