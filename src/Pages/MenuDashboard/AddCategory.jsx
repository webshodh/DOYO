import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "../../styles/AddCategory.css";
import { PageTitle } from "../../Atoms";
import { ViewCategoryColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempCategoryId, setTempCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const adminID = auth.currentUser?.uid;

  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/categories/`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(Object.values(data));
      } else {
        setCategories([]);
      }
    });
  }, [hotelName]);

  const handleCategoryNameChange = (e) => setCategoryName(e.target.value);

  const addCategoryToDatabase = async () => {
    const categoryId = uid();
    try {
      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
      ]);

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
      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
      ]);

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
      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
      ]);

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
      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) => snapshot.val()),
      ]);

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

  const filteredCategories = categories
    .filter((category) => category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((category, index) => ({
      srNo: index + 1, // Serial number (1-based index)
      ...category,
    }));

  const columns = ViewCategoryColumns;

  return (
    <>
    <div className="d-flex justify-between"> 
      <div className="bg-white p-10 rounded-lg shadow-md" style={{width:'30%', marginRight:'10px'}}>
        <PageTitle pageTitle={"Add Category"} />
        <input
          type="text"
          value={categoryName}
          onChange={handleCategoryNameChange}
          placeholder="Enter Category Name"
          className="w-full p-3 border mb-4 rounded-md"
        />
        {isEdit ? (
          <>
            <button onClick={handleSubmitCategoryChange} className="bg-green-500 text-white p-3 rounded-md mr-2">
              Submit Change
            </button>
            <button
              onClick={() => {
                setIsEdit(false);
                setCategoryName("");
              }}
              className="bg-red-500 text-white p-3 rounded-md"
            >
              Cancel
            </button>
          </>
        ) : (
          <button onClick={addCategoryToDatabase} className="bg-green-500 text-white p-3 rounded-md">
            Submit
          </button>
        )}
        <ToastContainer />
      </div>

      <div className="bg-white p-10 rounded-lg shadow-md" style={{width:'70%'}}>
        <PageTitle pageTitle={"View Categories"} />
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="SearchByName"
            className="w-full p-3 border rounded-md"
            placeholder="Search by Category Name"
          />
        </div>
        <DynamicTable
          columns={columns}
          data={filteredCategories}
          onEdit={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </div>
      </div>
    </>
  );
}

export default AddCategory;
