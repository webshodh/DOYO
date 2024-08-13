import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
// import "../styles/AddSection.css";
import { PageTitle } from "../Atoms";
import { ViewCategoryColumns, ViewSectionColumns } from "../data/Columns";
import { DynamicTable } from "../components";
import styled from "styled-components";
import { useHotelContext } from "../Context/HotelContext";
import { getAuth } from "firebase/auth";
// Container for Category Management
const CategoryManagementContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 15px;
  width: 100%;
`;

// Main Category Management section
const CategoryManagement = styled.div`
  max-width: 100%;
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

// Heading Style
const Heading = styled.h2`
  margin-top: 10px;
  text-align: left;
`;

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

function AddSection() {
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempSectionId, setTempSectionId] = useState("");

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const handleSectionNameChange = (e) => {
    setSectionName(e.target.value);
  };

  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/sections/`),
      (snapshot) => {
        setSections([]);
        const data = snapshot.val();
        if (data !== null) {
          const sectionArray = Object.values(data);
          setSections(sectionArray);
        }
      }
    );
  }, [hotelName]);

  const addCategoryToDatabase = () => {
    const sectionId = uid();
    set(ref(db, `/admins/${adminID}/hotels/${hotelName}/sections/${sectionId}`), {
      sectionName,
      sectionId,
    });

    setSectionName("");
    toast.success("Section Added Successfully !", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleUpdateCategory = (category) => {
    setIsEdit(true);
    setTempSectionId(category.sectionId);
    setSectionName(category.sectionName);
  };

  const handleSubmitCategoryChange = () => {
    if (window.confirm("confirm update")) {
      update(ref(db, `/${hotelName}/sections/${tempSectionId}`), {
        sectionName,
        sectionId: tempSectionId,
      });
      toast.success("Section Updated Successfully !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    setSectionName("");
    setIsEdit(false);
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm("confirm delete")) {
      remove(ref(db, `/${hotelName}/sections/${category.sectionId}`));
      toast.error("Section Deleted Successfully !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  // Convert customerInfo to an array and add serial numbers
  const sectionsArray = Object.values(sections).map((category, index) => ({
    srNo: index + 1, // Serial number (1-based index)
    ...category,
  }));
  const columns = ViewSectionColumns; // Ensure this matches the expected format
  console.log("sections", sectionsArray);
  return (
    <>
      <div className="background-card" style={{ padding: "40px" }}>
        <PageTitle pageTitle={"Add Sections"} />
        <Input
          type="text"
          value={sectionName}
          onChange={handleSectionNameChange}
          placeholder="Enter Category Name"
        />
        {isEdit ? (
          <>
            <Button primary onClick={handleSubmitCategoryChange}>
              Submit Change
            </Button>
            <Button
              onClick={() => {
                setIsEdit(false);
                setSectionName("");
              }}
            >
              Cancel
            </Button>
            <ToastContainer />
          </>
        ) : (
          <>
            <Button primary onClick={addCategoryToDatabase}>
              Submit
            </Button>
            <ToastContainer />
          </>
        )}
      </div>
      <BackgroundCard>
        <PageTitle pageTitle={"View Sections"} />
        <DynamicTable
          columns={columns}
          data={sectionsArray}
          onEdit={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </BackgroundCard>
    </>
  );
}

export default AddSection;
