import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "../../styles/AddCategory.css";
import { PageTitle } from "../../Atoms";
import { ViewCategoryColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Modal from "components/Modal";
import SearchWithButton from "components/SearchWithAddButton";

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempCategoryId, setTempCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState(false);
  const { hotelName } = useParams();
  const auth = getAuth();
  const adminID = auth.currentUser?.uid;
console.log("hotelName", hotelName)
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
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const normalizedCategoryName = categoryName.trim().toLowerCase();
    const isDuplicate = categories.some(
      (category) =>
        category.categoryName.toLowerCase() === normalizedCategoryName
    );

    if (isDuplicate) {
      toast.error("Category already exists.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const categoryId = uid();
    try {
      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then(
          (snapshot) => snapshot.val()
        ),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) =>
          snapshot.val()
        ),
      ]);

      if (adminHotelUuid === generalHotelUuid) {
        await set(ref(db, `/hotels/${hotelName}/categories/${categoryId}`), {
          categoryName: categoryName.trim(),
          categoryId,
        });
        setCategoryName("");
        toast.success("Category Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setTimeout(() => {
          setShow(false);
        }, 2000);
      } else {
        toast.error(
          "You do not have permission to add categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
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
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then(
          (snapshot) => snapshot.val()
        ),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) =>
          snapshot.val()
        ),
      ]);

      if (adminHotelUuid === generalHotelUuid) {
        setIsEdit(true);
        setTempCategoryId(category.categoryId);
        setCategoryName(category.categoryName);
      } else {
        toast.error(
          "You do not have permission to update categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
    } catch (error) {
      console.error("Error preparing category update:", error);
    }
  };

  const handleSubmitCategoryChange = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const normalizedCategoryName = categoryName.trim().toLowerCase();
    const isDuplicate = categories.some(
      (category) =>
        category.categoryName.toLowerCase() === normalizedCategoryName &&
        category.categoryId !== tempCategoryId
    );

    if (isDuplicate) {
      toast.error("Category already exists.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    try {
      const [adminHotelUuid, generalHotelUuid] = await Promise.all([
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then(
          (snapshot) => snapshot.val()
        ),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) =>
          snapshot.val()
        ),
      ]);

      if (adminHotelUuid === generalHotelUuid) {
        if (window.confirm("Confirm update")) {
          await update(
            ref(db, `/hotels/${hotelName}/categories/${tempCategoryId}`),
            {
              categoryName: categoryName.trim(),
              categoryId: tempCategoryId,
            }
          );
          toast.success("Category Updated Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
        setCategoryName("");
        setIsEdit(false);
        setTimeout(() => {
          setShow(false);
        }, 2000);
      } else {
        toast.error(
          "You do not have permission to update categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
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
        get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)).then(
          (snapshot) => snapshot.val()
        ),
        get(ref(db, `hotels/${hotelName}/uuid`)).then((snapshot) =>
          snapshot.val()
        ),
      ]);

      if (adminHotelUuid === generalHotelUuid) {
        if (window.confirm("Confirm delete")) {
          await remove(
            ref(db, `/hotels/${hotelName}/categories/${category.categoryId}`)
          );
          toast.error("Category Deleted Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      } else {
        toast.error(
          "You do not have permission to delete categories for this hotel.",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const filteredCategories = categories
    .filter((category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((category, index) => ({
      srNo: index + 1, // Serial number (1-based index)
      ...category,
    }));

  const columns = ViewCategoryColumns;
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
              <div
                className="bg-white p-10"
                style={{ width: "40%", marginRight: "10px" }}
              >
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
                  </>
                ) : (
                  <button
                    onClick={addCategoryToDatabase}
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
        <div style={{ width: "100%" }}>
          <div>
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              buttonText="Add Category"
              onButtonClick={handleAdd}
            />
          </div>
          <PageTitle pageTitle={"View Categories"} />
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


// import React, { useState, useEffect } from "react";
// import { ToastContainer } from "react-toastify";
// import "../../styles/AddCategory.css";
// import { PageTitle } from "../../Atoms";
// import { ViewCategoryColumns } from "../../data/Columns";
// import { DynamicTable } from "../../components";
// import { useParams } from "react-router-dom";
// import { getAuth } from "firebase/auth";
// import Modal from "components/Modal";
// import SearchWithButton from "components/SearchWithAddButton";
// import {
//   subscribeToCategories,
//   addCategory,
//   updateCategory,
//   deleteCategory,
//   filterAndMapCategories,
// } from "../../services/categoryService";

// function AddCategory() {
//   const [categoryName, setCategoryName] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [isEdit, setIsEdit] = useState(false);
//   const [tempCategoryId, setTempCategoryId] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [show, setShow] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { hotelName } = useParams();
//   const auth = getAuth();
//   const adminID = auth.currentUser?.uid;

//   // Subscribe to categories data
//   useEffect(() => {
//     if (!hotelName) return;

//     const unsubscribe = subscribeToCategories(hotelName, setCategories);
//     return () => unsubscribe();
//   }, [hotelName]);

//   // Reset form state
//   const resetForm = () => {
//     setCategoryName("");
//     setIsEdit(false);
//     setTempCategoryId("");
//   };

//   // Handle category name input change
//   const handleCategoryNameChange = (e) => setCategoryName(e.target.value);

//   // Handle adding new category
//   const handleAddCategory = async () => {
//     if (!adminID || !hotelName) return;

//     setLoading(true);
//     try {
//       const result = await addCategory(adminID, hotelName, categoryName, categories);
//       if (result.success) {
//         resetForm();
//         setTimeout(() => setShow(false), 2000);
//       }
//     } catch (error) {
//       console.error("Error in handleAddCategory:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle updating existing category
//   const handleUpdateCategory = async (category) => {
//     if (!adminID || !hotelName) return;

//     setIsEdit(true);
//     setTempCategoryId(category.categoryId);
//     setCategoryName(category.categoryName);
//     setShow(true);
//   };

//   // Handle submitting category update
//   const handleSubmitCategoryUpdate = async () => {
//     if (!adminID || !hotelName || !tempCategoryId) return;

//     if (!window.confirm("Confirm update")) return;

//     setLoading(true);
//     try {
//       const result = await updateCategory(
//         adminID,
//         hotelName,
//         tempCategoryId,
//         categoryName,
//         categories
//       );
//       if (result.success) {
//         resetForm();
//         setTimeout(() => setShow(false), 2000);
//       }
//     } catch (error) {
//       console.error("Error in handleSubmitCategoryUpdate:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle deleting category
//   const handleDeleteCategory = async (category) => {
//     if (!adminID || !hotelName) return;

//     if (!window.confirm("Confirm delete")) return;

//     setLoading(true);
//     try {
//       await deleteCategory(adminID, hotelName, category);
//     } catch (error) {
//       console.error("Error in handleDeleteCategory:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle modal show
//   const handleAdd = () => {
//     resetForm();
//     setShow(true);
//   };

//   // Handle modal close
//   const handleClose = () => {
//     resetForm();
//     setShow(false);
//   };

//   // Handle cancel edit
//   const handleCancelEdit = () => {
//     resetForm();
//   };

//   // Filter and map categories with search term
//   const filteredCategories = filterAndMapCategories(categories, searchTerm);
//   const columns = ViewCategoryColumns;

//   return (
//     <>
//       <div className="d-flex justify-between">
//         {/* Modal */}
//         {show && (
//           <Modal
//             title={isEdit ? "Update Category" : "Add Category"}
//             handleClose={handleClose}
//             children={
//               <div
//                 className="bg-white p-10"
//                 style={{ width: "40%", marginRight: "10px" }}
//               >
//                 <PageTitle pageTitle={isEdit ? "Update Category" : "Add Category"} />
//                 <input
//                   type="text"
//                   value={categoryName}
//                   onChange={handleCategoryNameChange}
//                   placeholder="Enter Category Name"
//                   className="w-full p-3 border mb-4 rounded-md"
//                   disabled={loading}
//                 />
//                 {isEdit ? (
//                   <>
//                     <button
//                       onClick={handleSubmitCategoryUpdate}
//                       className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
//                       disabled={loading}
//                     >
//                       {loading ? "Updating..." : "Update"}
//                     </button>
//                     <button
//                       onClick={handleCancelEdit}
//                       className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md"
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                   </>
//                 ) : (
//                   <button
//                     onClick={handleAddCategory}
//                     className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
//                     disabled={loading}
//                   >
//                     {loading ? "Adding..." : "Add"}
//                   </button>
//                 )}
//                 <ToastContainer />
//               </div>
//             }
//           />
//         )}
        
//         <div style={{ width: "100%" }}>
//           <div>
//             <SearchWithButton
//               searchTerm={searchTerm}
//               onSearchChange={(e) => setSearchTerm(e.target.value)}
//               buttonText="Add Category"
//               onButtonClick={handleAdd}
//             />
//           </div>
//           <PageTitle pageTitle={"View Categories"} />
//           <DynamicTable
//             columns={columns}
//             data={filteredCategories}
//             onEdit={handleUpdateCategory}
//             onDelete={handleDeleteCategory}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

// export default AddCategory;