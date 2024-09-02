import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { PageTitle } from "../../Atoms";
import { ViewSectionColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";

function AddSection() {
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempSectionId, setTempSectionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const addCategoryToDatabase = () => {
    const sectionId = uid();
    set(
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
  };

  const handleUpdateCategory = (category) => {
    setIsEdit(true);
    setTempSectionId(category.sectionId);
    setSectionName(category.sectionName);
  };

  const handleSubmitCategoryChange = () => {
    if (window.confirm("Confirm update?")) {
      update(
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

  const columns = ViewSectionColumns;

  return (
    <>
      <div className="d-flex justify-between">
        <div
          className="bg-white rounded shadow p-10"
          style={{ width: "30%", marginRight: "10px" }}
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
                Submit Change
              </button>
              <button
                onClick={() => {
                  setIsEdit(false);
                  setSectionName("");
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-md"
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

        <div
          className="p-10 bg-white shadow rounded-lg"
          style={{ width: "70%" }}
        >
          <PageTitle pageTitle="View Sections" />
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="SearchByName"
              className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by Section Name"
            />
          </div>
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
