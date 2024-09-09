import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { PageTitle } from "../../Atoms";
import { ViewSectionColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import Modal from "components/Modal";
import SearchWithButton from "components/SearchWithAddButton";

function AddSection() {
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempSectionId, setTempSectionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState(false);
  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  const handleSectionNameChange = (e) => {
    setSectionName(e.target.value);
  };

  useEffect(() => {
    onValue(
      ref(db, `/admins/${currentAdminId}/hotels/${hotelName}/sections/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSections(Object.values(data));
        }
      }
    );
  }, [hotelName]);

  const addCategoryToDatabase = async () => {
    const sectionId = uid();
    const normalizedSectionName = sectionName.trim().toLowerCase(); // Normalize the section name

    try {
      // Check for duplicate section names
      const existingSectionsSnapshot = await get(
        ref(db, `/admins/${currentAdminId}/hotels/${hotelName}/sections`)
      );
      const existingSections = existingSectionsSnapshot.val();

      const isDuplicate = Object.values(existingSections || {}).some(
        (section) =>
          section.sectionName.trim().toLowerCase() === normalizedSectionName
      );

      if (isDuplicate) {
        toast.error("Section with this name already exists.", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }

      // Add new section to the database
      await set(
        ref(
          db,
          `/admins/${currentAdminId}/hotels/${hotelName}/sections/${sectionId}`
        ),
        {
          sectionName,
          sectionId,
        }
      );

      setSectionName("");
      toast.success("Section Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
      // Delay hiding the modal by 2 seconds
      setTimeout(() => {
        setShow(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Error adding section. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleUpdateCategory = (category) => {
    setIsEdit(true);
    setShow(true);
    setTempSectionId(category.sectionId);
    setSectionName(category.sectionName);
  };

  const handleSubmitCategoryChange = async () => {
    const normalizedSectionName = sectionName.trim().toLowerCase(); // Normalize the section name

    try {
      // Check for duplicate section names (excluding the current one being edited)
      const existingSectionsSnapshot = await get(
        ref(db, `/admins/${currentAdminId}/hotels/${hotelName}/sections`)
      );
      const existingSections = existingSectionsSnapshot.val();

      const isDuplicate = Object.values(existingSections || {}).some(
        (section) =>
          section.sectionId !== tempSectionId &&
          section.sectionName.trim().toLowerCase() === normalizedSectionName
      );

      if (isDuplicate) {
        toast.error("Section with this name already exists.", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }

      if (window.confirm("Confirm update?")) {
        // Update section in the database
        await update(
          ref(
            db,
            `/admins/${currentAdminId}/hotels/${hotelName}/sections/${tempSectionId}`
          ),
          {
            sectionName,
            sectionId: tempSectionId,
          }
        );

        toast.success("Section Updated Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }

      setSectionName("");
      setIsEdit(false);
      setTimeout(() => {
        setShow(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Error updating section. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm("Confirm delete?")) {
      remove(
        ref(
          db,
          `/admins/${currentAdminId}/hotels/${hotelName}/sections/${category.sectionId}`
        )
      );
      toast.error("Section Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // Convert sections to an array with serial numbers and apply search filtering
  const sectionsArray = sections
    .map((category, index) => ({
      srNo: index + 1,
      ...category,
    }))
    .filter((section) =>
      section.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAdd = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const columns = ViewSectionColumns;

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
                style={{ width: "40%", marginRight: "10px" }}
              >
                <PageTitle pageTitle="Add Sections" />
                <input
                  type="text"
                  value={sectionName}
                  onChange={handleSectionNameChange}
                  placeholder="Enter Section Name"
                  className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isEdit ? (
                  <>
                    <button
                      onClick={handleSubmitCategoryChange}
                      className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setSectionName("");
                      }}
                      className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addCategoryToDatabase}
                    className="px-4 py-2 text-white bg-green-600 rounded-md"
                  >
                    Submit
                  </button>
                )}
                <ToastContainer />
              </div>
            }
          ></Modal>
        )}
        <div
          
          style={{ width: "100%" }}
        >
          <div className="p-10 bg-white shadow rounded-lg">
          <SearchWithButton
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            buttonText="Add Section"
            onButtonClick={handleAdd}
          />
          </div>
          <PageTitle pageTitle="View Sections" />
          <DynamicTable
            columns={columns}
            data={sectionsArray}
            onEdit={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </div>
    </>
  );
}

export default AddSection;
