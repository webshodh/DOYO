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
import Modal from "components/Modal";

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
  const [show, setShow] = useState(false);

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const handleRoleNameChange = (e) => setRoleName(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/roles/`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoles(Object.values(data));
      }
    });
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
    setTimeout(() => {
      setShow(false);
    }, 2000);
  };

  const handleUpdateRole = (role) => {
    setIsEdit(true);
    setTempRoleId(role.roleId);
    setRoleName(role.roleName);
    setShow(true);
  };

  const handleSubmitRoleChange = () => {
    if (window.confirm("Confirm update")) {
      update(ref(db, `/hotels/${hotelName}/roles/${tempRoleId}`), {
        roleName,
        roleId: tempRoleId,
      });
      toast.success("Role Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setRoleName("");
      setIsEdit(false);
      setTimeout(() => {
        setShow(false);
      }, 2000);
    }
  };

  const handleDeleteRole = (role) => {
    if (window.confirm("Confirm delete")) {
      remove(ref(db, `/hotels/${hotelName}/roles/${role.roleId}`));
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
  const handleAdd = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };
  return (
    <>
      <div className="d-flex justify-between">
        {/* Modal */}
        {show && (
          <Modal
            title="Add Role"
            handleClose={handleClose}
            children={
              <div
                className="bg-white p-10"
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
                    <button
                      onClick={handleSubmitRoleChange}
                      className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setIsEdit(false) && setRoleName("")}
                      className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addRoleToDatabase}
                    className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
                  >
                    Submit
                  </button>
                )}
                <ToastContainer />
              </div>
            }
          ></Modal>
        )}
        <div className="bg-white rounded shadow p-10" style={{ width: "100%" }}>
          
          <div className="d-flex" style={{width:'100%'}}>
            <div style={{width:'85%', marginRight:'10px'}}>
            <input
          type="text"
          placeholder="What are you looking for?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-orange-500 rounded-full py-2 px-4 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
          </div>
          <div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 mr-2 text-white bg-orange-500 rounded-md mt-2"
            >
              Add Role
            </button>
          </div>
          </div>
          <PageTitle pageTitle="View Roles" />
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
