import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { PageTitle } from "../../Atoms";
import { ViewCategoryColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import Modal from "components/Modal";

function AddMainCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempCategoryId, setTempCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState(false);
  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const handleCategoryNameChange = (e) => {
    setCategoryName(e.target.value);
  };

  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/Maincategories/`), (snapshot) => {
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
        await set(ref(db, `/hotels/${hotelName}/Maincategories/${categoryId}`), {
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
          await update(ref(db, `/hotels/${hotelName}/Maincategories/${tempCategoryId}`), {
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
          await remove(ref(db, `/hotels/${hotelName}/Maincategories/${category.categoryId}`));
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

  const categoriesArray = Object.values(categories)
    .map((category, index) => ({
      srNo: index + 1, // Serial number (1-based index)
      ...category,
    }))
    .filter((category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const columns = ViewCategoryColumns; // Ensure this matches the expected format
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
            title="Add Category"
            handleClose={handleClose}
            children={
      <div className="p-10 bg-white rounded-lg shadow-md" style={{width:'40%', marginRight:'10px'}}>
        <PageTitle pageTitle={"Add Special Category"} />
        <input
          type="text"
          value={categoryName}
          onChange={handleCategoryNameChange}
          placeholder="Enter Category Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                setCategoryName("");
              }}
              className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md"
            >
              Cancel
            </button>
            <ToastContainer />
          </>
        ) : (
          <>
            <button
              onClick={addCategoryToDatabase}
              className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
            >
              Submit
            </button>
            <ToastContainer />
          </>
        )}
      </div>
 }
 ></Modal>
)}
      <div className="p-10 bg-white rounded-lg shadow-md" style={{width:'100%'}}>
        <PageTitle pageTitle={"View Categories"} />
        {/* Search Bar */}
        <div className="mb-6" style={{ width: "100%" }}>
        <div style={{ width: "70%" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="SearchByName"
            className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Category Name"
          />
          </div>
           <div style={{ width: "20%" }}>
              <button
                onClick={handleAdd}
                className="px-4 py-2 mr-2 text-white bg-orange-500 rounded-md"
              >
                Add Role
              </button>
            </div>
        </div>
        <DynamicTable
          columns={columns}
          data={categoriesArray}
          onEdit={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </div>
      </div>
    </>
  );
}

export default AddMainCategory;
