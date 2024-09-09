import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, set, onValue, remove, update } from "firebase/database";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { uid } from "uid";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useHotelContext } from "Context/HotelContext";
import { ViewStaffColumns } from "../../data/Columns";
import { DynamicTable, FilterSortSearch } from "components";
import Modal from "components/Modal";
import { PageTitle } from "Atoms";
import CategoryTabs from "components/CategoryTab";

function AddStaff() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState(null); // State to hold the selected image file
  const [roles, setRoles] = useState([]); // Example roles
  const [selectedRole, setSelectedRole] = useState("");
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleCounts, setRoleCounts] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [show, setShow] = useState(false);

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const { hotelName } = useHotelContext(); // Replace with your hotel name or use context
  const storage = getStorage();

  // Handle image file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !upiId || !role) {
      toast.error("All fields are required!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const newStaffId = uid(); // Generate a unique ID for the new staff member

    try {
      let imageUrl = null;

      if (file) {
        // Upload image to Firebase Storage
        const imageRef = storageRef(
          storage,
          `staff_images/${hotelName}/${file.name}`
        );
        await uploadBytes(imageRef, file);

        // Get the download URL of the uploaded image
        imageUrl = await getDownloadURL(imageRef);
      }

      // Add new staff member under the admin's collection
      const staffData = {
        firstName,
        lastName,
        upiId,
        role,
        imageUrl, // Store the image URL in the database
        uuid: newStaffId,
      };

      await set(ref(db, `/hotels/${hotelName}/staff/${newStaffId}`), staffData);

      toast.success("Staff Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });

      // Clear form fields
      setFirstName("");
      setLastName("");
      setUpiId("");
      setRole("");
      setFile(null);
    } catch (error) {
      toast.error("Error adding staff: " + error.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

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

  const handleDelete = (staffMember) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff member?"
    );
    if (confirmDelete) {
      // Delete the staff member
      remove(ref(db, `/hotels/${hotelName}/staff/${staffMember.uuid}`));

      toast.success("Staff Member Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleEdit = (role) => {
    setShow(true);
    setIsEdit(true);
    setFirstName(role.FirstName);
    setLastName(role.LastName);
    setUpiId(role.upiId);
    setRole(role.Role);
    setFile(null);
  };

  const handleSubmitChange = (staffMember) => {
    if (window.confirm("Confirm update")) {
      update(ref(db, `/hotels/${hotelName}/staff/${staffMember.uuid}`), {
        firstName,
        lastName,
        upiId,
        role,
        uuid: staffMember.uuid,
      });
      toast.success("Role Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      setFirstName(role.FirstName);
      setLastName(role.LastName);
      setUpiId(role.upiId);
      setRole(role.Role);
      setFile(null);
      setIsEdit(false);
    }
  };
  const filterAndSortItems = () => {
    let filteredItems = staff.filter((member) => {
      const memberName = member.firstName || ""; // Use empty string if name is undefined
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
    FirstName: item.firstName,
    LastName: item.lastName,
    upiId: item.upiId,
    Role: item.role,
  }));
  const handleAdd = () => {
    setShow(true);
    // Clear form fields
    setFirstName("");
    setLastName("");
    setUpiId("");
    setRole("");
    setFile(null);
  };
  const handleClose = () => {
    setShow(false);
  };
  const columns = ViewStaffColumns;
  return (
    <>
      <div className="d-flex justify-between" style={{ width: "100%" }}>
        {/* Modal */}
        {show && (
          <Modal
            title="Add Menu"
            handleClose={handleClose}
            children={
              <div className="bg-white p-6" style={{ width: "100%" }}>
                <form className=" gap-6">
                  <div className="relative">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      id="firstName"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        firstName ? "border-green-500" : "border-red-500"
                      } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                      placeholder="Enter First Name"
                    />
                    {firstName && (
                      <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {!firstName && (
                      <FaExclamationCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                    {!firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        First Name is required.
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      id="lastName"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        lastName ? "border-green-500" : "border-red-500"
                      } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                      placeholder="Enter Last Name"
                    />
                    {lastName && (
                      <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {!lastName && (
                      <FaExclamationCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                    {!lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        Last Name is required.
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <label
                      htmlFor="upiId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      id="upiId"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        upiId ? "border-green-500" : "border-red-500"
                      } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                      placeholder="Enter UPI ID"
                    />
                    {upiId && (
                      <FaCheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500" />
                    )}
                    {!upiId && (
                      <FaExclamationCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500" />
                    )}
                    {!upiId && (
                      <p className="text-red-500 text-xs mt-1">
                        UPI ID is required.
                      </p>
                    )}
                  </div>

                  <div className="relative ">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 bg-white"
                    >
                      Select Role
                    </label>
                    <select
                      id="role"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="" disabled>
                        Select Role
                      </option>
                      {roles.map((role) => (
                        <option key={role} value={role.roleName}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                    {!role && (
                      <p className="text-red-500 text-xs mt-1">
                        Role is required.
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="file"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Profile Image
                    </label>
                    <input
                      type="file"
                      id="file"
                      className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm file:border-0 file:bg-gray-200 file:text-gray-700"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="col-span-2">
                    {isEdit ? (
                      <>
                        <button
                          primary
                          onClick={handleSubmitChange}
                          className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
                        >
                          Submit
                        </button>
                        {/* <button
                          onClick={() => setIsEdit(false) && setShow(false)}
                          className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md"
                        >
                          Cancel
                        </button> */}
                      </>
                    ) : (
                      <button
                        primary
                        onClick={handleSubmit}
                        className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </form>
              </div>
            }
          />
        )}
        <div className="bg-white rounded shadow p-10" style={{ width: "100%" }}>
          <div className="mt-4">
            {/* Wrapper to enable horizontal scrolling */}
            <div className="overflow-x-auto no-scrollbar">
              {/* Flex container for horizontal layout */}
              <div className="flex flex-nowrap space-x-2">
                {/* Category Tabs */}
                <div className="sticky">
                  <CategoryTabs
                    categories={roles}
                    menuCountsByCategory={roleCounts}
                    handleCategoryFilter={handleRoleFilter}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="d-flex" style={{ width: "100%" }}>
              <div style={{ width: "80%" , marginRight:'10px'}}>
                <FilterSortSearch
                  searchTerm={searchTerm}
                  handleSearch={handleSearch}
                />
              </div>
              <div style={{ width: "20%" }}>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 mr-2 text-white bg-orange-500 rounded-md mt-2"
                >
                  Add Staff
                </button>
              </div>
            </div>
            {/* <BackgroundCard>
          <PageTitle pageTitle={"View Staff"} /> */}
            <PageTitle pageTitle="View Roles" />
            <DynamicTable
              columns={columns}
              data={data}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            {/* </BackgroundCard> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddStaff;
