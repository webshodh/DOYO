import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "../styles/AddCategory.css";
import { PageTitle } from "../Atoms";
import { ViewCategoryColumns } from "../data/Columns";
import { DynamicTable } from "../components";
import styled from "styled-components";

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

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempCategoryId, setTempCategoryId] = useState("");

  let hotelName = "Atithi";

  const handleCategoryNameChange = (e) => {
    setCategoryName(e.target.value);
  };

  useEffect(() => {
    onValue(ref(db, `/${hotelName}/categories/`), (snapshot) => {
      setCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        const categoryArray = Object.values(data);
        setCategories(categoryArray);
      }
    });
  }, [hotelName]);

  const addCategoryToDatabase = () => {
    const categoryId = uid();
    set(ref(db, `/${hotelName}/categories/${categoryId}`), {
      categoryName,
      categoryId,
    });

    setCategoryName("");
    toast.success("Category Added Successfully !", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const handleUpdateCategory = (category) => {
    setIsEdit(true);
    setTempCategoryId(category.categoryId);
    setCategoryName(category.categoryName);
  };

  const handleSubmitCategoryChange = () => {
    if (window.confirm("confirm update")) {
      update(ref(db, `/${hotelName}/categories/${tempCategoryId}`), {
        categoryName,
        categoryId: tempCategoryId,
      });
      toast.success("Category Updated Successfully !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    setCategoryName("");
    setIsEdit(false);
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm("confirm delete")) {
      remove(ref(db, `/${hotelName}/categories/${category.categoryId}`));
      toast.error("Category Deleted Successfully !", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  // Convert customerInfo to an array and add serial numbers
  const categoriesArray = Object.values(categories).map((category, index) => ({
    srNo: index + 1, // Serial number (1-based index)
    ...category,
  }));
  const columns = ViewCategoryColumns; // Ensure this matches the expected format
  console.log("categories", categoriesArray);
  return (
    <>
      <div className="background-card" style={{ padding: "40px" }}>
        <PageTitle pageTitle={"Add Category"} />
        <Input
          type="text"
          value={categoryName}
          onChange={handleCategoryNameChange}
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
                setCategoryName("");
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
        <PageTitle pageTitle={"View Categories"} />
        <DynamicTable
          columns={columns}
          data={categoriesArray}
          onEdit={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </BackgroundCard>
    </>
  );
}

export default AddCategory;
