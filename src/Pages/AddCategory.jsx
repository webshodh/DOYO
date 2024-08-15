import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "../styles/AddCategory.css";
import { PageTitle } from "../Atoms";
import { ViewCategoryColumns } from "../data/Columns";
import { DynamicTable } from "../components";
import styled from "styled-components";
import { useHotelContext } from "../Context/HotelContext";
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

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempCategoryId, setTempCategoryId] = useState("");

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const handleCategoryNameChange = (e) => {
    setCategoryName(e.target.value);
  };

  // useEffect(() => {
  //   onValue(
  //     ref(db, `/admins/${adminID}/hotels/${hotelName}/categories/`),
  //     (snapshot) => {
  //       setCategories([]);
  //       const data = snapshot.val();
  //       if (data !== null) {
  //         const categoryArray = Object.values(data);
  //         setCategories(categoryArray);
  //       }
  //     }
  //   );
  // }, [hotelName]);

  // const addCategoryToDatabase = () => {
  //   const categoryId = uid();
  //   set(ref(db, `/admins/${adminID}/hotels/${hotelName}/categories/${categoryId}`), {
  //     categoryName,
  //     categoryId,
  //   });

  //   setCategoryName("");
  //   toast.success("Category Added Successfully !", {
  //     position: toast.POSITION.TOP_RIGHT,
  //   });
  // };

  // const handleUpdateCategory = (category) => {
  //   setIsEdit(true);
  //   setTempCategoryId(category.categoryId);
  //   setCategoryName(category.categoryName);
  // };

  // const handleSubmitCategoryChange = () => {
  //   if (window.confirm("confirm update")) {
  //     update(ref(db, `/${hotelName}/categories/${tempCategoryId}`), {
  //       categoryName,
  //       categoryId: tempCategoryId,
  //     });
  //     toast.success("Category Updated Successfully !", {
  //       position: toast.POSITION.TOP_RIGHT,
  //     });
  //   }
  //   setCategoryName("");
  //   setIsEdit(false);
  // };

  // const handleDeleteCategory = (category) => {
  //   if (window.confirm("confirm delete")) {
  //     remove(ref(db, `/${hotelName}/categories/${category.categoryId}`));
  //     toast.error("Category Deleted Successfully !", {
  //       position: toast.POSITION.TOP_RIGHT,
  //     });
  //   }
  // };


  // Convert customerInfo to an array and add serial numbers
  
  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/categories/`), (snapshot) => {
      setCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        const categoryArray = Object.values(data);
        setCategories(categoryArray);
      }
    });
  }, [hotelName]);
  
  const addCategoryToDatabase = async () => {
    const categoryId = uid();
    try {
      const uuidSnapshot = await get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`));
      const adminHotelUuid = uuidSnapshot.val();
  
      const generalUuidSnapshot = await get(ref(db, `hotels/${hotelName}/uuid`));
      const generalHotelUuid = generalUuidSnapshot.val();
  
      if (adminHotelUuid === generalHotelUuid) {
        await set(ref(db, `/hotels/${hotelName}/categories/${categoryId}`), {
          categoryName,
          categoryId,
        });
        setCategoryName("");
        toast.success("Category Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        toast.error("You do not have permission to add categories for this hotel.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error adding category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  
  const handleUpdateCategory = async (category) => {
    try {
      const uuidSnapshot = await get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`));
      const adminHotelUuid = uuidSnapshot.val();
  
      const generalUuidSnapshot = await get(ref(db, `hotels/${hotelName}/uuid`));
      const generalHotelUuid = generalUuidSnapshot.val();
  
      if (adminHotelUuid === generalHotelUuid) {
        setIsEdit(true);
        setTempCategoryId(category.categoryId);
        setCategoryName(category.categoryName);
      } else {
        toast.error("You do not have permission to update categories for this hotel.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error preparing category update:", error);
    }
  };
  
  const handleSubmitCategoryChange = async () => {
    try {
      const uuidSnapshot = await get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`));
      const adminHotelUuid = uuidSnapshot.val();
  
      const generalUuidSnapshot = await get(ref(db, `hotels/${hotelName}/uuid`));
      const generalHotelUuid = generalUuidSnapshot.val();
  
      if (adminHotelUuid === generalHotelUuid) {
        if (window.confirm("Confirm update")) {
          await update(ref(db, `/hotels/${hotelName}/categories/${tempCategoryId}`), {
            categoryName,
            categoryId: tempCategoryId,
          });
          toast.success("Category Updated Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
        setCategoryName("");
        setIsEdit(false);
      } else {
        toast.error("You do not have permission to update categories for this hotel.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  
  const handleDeleteCategory = async (category) => {
    try {
      const uuidSnapshot = await get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`));
      const adminHotelUuid = uuidSnapshot.val();
  
      const generalUuidSnapshot = await get(ref(db, `hotels/${hotelName}/uuid`));
      const generalHotelUuid = generalUuidSnapshot.val();
  
      if (adminHotelUuid === generalHotelUuid) {
        if (window.confirm("Confirm delete")) {
          await remove(ref(db, `/hotels/${hotelName}/categories/${category.categoryId}`));
          toast.error("Category Deleted Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } else {
        toast.error("You do not have permission to delete categories for this hotel.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };
  
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
