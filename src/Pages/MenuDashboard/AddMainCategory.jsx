// import React, { useState, useEffect } from "react";
// import { db } from "../../data/firebase/firebaseConfig";
// import { uid } from "uid";
// import { set, ref, onValue, remove, update, get } from "firebase/database";
// import { ToastContainer, toast } from "react-toastify";
// import { PageTitle } from "../../Atoms";
// import { ViewCategoryColumns } from "../../data/Columns";
// import { DynamicTable } from "../../components";
// import { useParams } from "react-router-dom";
// import { getAuth } from "firebase/auth";
// import Modal from "components/Modal";
// import SearchWithButton from "components/SearchWithAddButton";

// function AddMainCategory() {
//   const [categoryName, setCategoryName] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [isEdit, setIsEdit] = useState(false);
//   const [tempCategoryId, setTempCategoryId] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [show, setShow] = useState(false);
//   const { hotelName } = useParams();
//   const auth = getAuth();
//   const currentAdminId = auth.currentUser?.uid;
//   const adminID = currentAdminId;

//   const handleCategoryNameChange = (e) => {
//     setCategoryName(e.target.value);
//   };

//   useEffect(() => {
//     onValue(ref(db, `/hotels/${hotelName}/Maincategories/`), (snapshot) => {
//       setCategories([]);
//       const data = snapshot.val();
//       if (data !== null) {
//         const categoryArray = Object.values(data);
//         setCategories(categoryArray);
//       }
//     });
//   }, [hotelName]);

//   const addCategoryToDatabase = async () => {
//     const categoryId = uid();
//     const normalizedCategoryName = categoryName.trim().toLowerCase(); // Normalize the category name

//     try {
//       const uuidSnapshot = await get(
//         ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)
//       );
//       const adminHotelUuid = uuidSnapshot.val();
//       const generalUuidSnapshot = await get(
//         ref(db, `hotels/${hotelName}/uuid`)
//       );
//       const generalHotelUuid = generalUuidSnapshot.val();

//       if (adminHotelUuid === generalHotelUuid) {
//         // Check for duplicate category names
//         const existingCategoriesSnapshot = await get(
//           ref(db, `/hotels/${hotelName}/Maincategories`)
//         );
//         const existingCategories = existingCategoriesSnapshot.val();

//         const isDuplicate = Object.values(existingCategories || {}).some(
//           (category) =>
//             category.categoryName.trim().toLowerCase() ===
//             normalizedCategoryName
//         );

//         if (isDuplicate) {
//           toast.error("Category with this name already exists.", {
//             position: toast.POSITION.TOP_RIGHT,
//           });
//           return;
//         }

//         await set(
//           ref(db, `/hotels/${hotelName}/Maincategories/${categoryId}`),
//           {
//             categoryName,
//             categoryId,
//           }
//         );
//         setCategoryName("");
//         toast.success("Category Added Successfully!", {
//           position: toast.POSITION.TOP_RIGHT,
//         });
//         setTimeout(() => {
//           setShow(false);
//         }, 2000);
//       } else {
//         toast.error(
//           "You do not have permission to add categories for this hotel.",
//           {
//             position: toast.POSITION.TOP_RIGHT,
//           }
//         );
//       }
//     } catch (error) {
//       console.error("Error adding category:", error);
//       toast.error("Error adding category. Please try again.", {
//         position: toast.POSITION.TOP_RIGHT,
//       });
//     }
//   };

//   const handleUpdateCategory = async (category) => {
//     try {
//       const uuidSnapshot = await get(
//         ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)
//       );
//       const adminHotelUuid = uuidSnapshot.val();
//       const generalUuidSnapshot = await get(
//         ref(db, `hotels/${hotelName}/uuid`)
//       );
//       const generalHotelUuid = generalUuidSnapshot.val();

//       if (adminHotelUuid === generalHotelUuid) {
//         setIsEdit(true);
//         setTempCategoryId(category.categoryId);
//         setCategoryName(category.categoryName);
//       } else {
//         toast.error(
//           "You do not have permission to update categories for this hotel.",
//           {
//             position: toast.POSITION.TOP_RIGHT,
//           }
//         );
//       }
//     } catch (error) {
//       console.error("Error preparing category update:", error);
//     }
//   };

//   const handleSubmitCategoryChange = async () => {
//     const normalizedCategoryName = categoryName.trim().toLowerCase(); // Normalize the category name

//     try {
//       const uuidSnapshot = await get(
//         ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)
//       );
//       const adminHotelUuid = uuidSnapshot.val();
//       const generalUuidSnapshot = await get(
//         ref(db, `hotels/${hotelName}/uuid`)
//       );
//       const generalHotelUuid = generalUuidSnapshot.val();

//       if (adminHotelUuid === generalHotelUuid) {
//         // Check for duplicate category names (excluding the current one being edited)
//         const existingCategoriesSnapshot = await get(
//           ref(db, `/hotels/${hotelName}/Maincategories`)
//         );
//         const existingCategories = existingCategoriesSnapshot.val();

//         const isDuplicate = Object.values(existingCategories || {}).some(
//           (category) =>
//             category.categoryId !== tempCategoryId &&
//             category.categoryName.trim().toLowerCase() ===
//               normalizedCategoryName
//         );

//         if (isDuplicate) {
//           toast.error("Category with this name already exists.", {
//             position: toast.POSITION.TOP_RIGHT,
//           });
//           return;
//         }

//         if (window.confirm("Confirm update")) {
//           await update(
//             ref(db, `/hotels/${hotelName}/Maincategories/${tempCategoryId}`),
//             {
//               categoryName,
//               categoryId: tempCategoryId,
//             }
//           );
//           toast.success("Category Updated Successfully!", {
//             position: toast.POSITION.TOP_RIGHT,
//           });
//         }
//         setCategoryName("");
//         setIsEdit(false);
//         setTimeout(() => {
//           setShow(false);
//         }, 2000);
//       } else {
//         toast.error(
//           "You do not have permission to update categories for this hotel.",
//           {
//             position: toast.POSITION.TOP_RIGHT,
//           }
//         );
//       }
//     } catch (error) {
//       console.error("Error updating category:", error);
//       toast.error("Error updating category. Please try again.", {
//         position: toast.POSITION.TOP_RIGHT,
//       });
//     }
//   };

//   const handleDeleteCategory = async (category) => {
//     try {
//       const uuidSnapshot = await get(
//         ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`)
//       );
//       const adminHotelUuid = uuidSnapshot.val();
//       const generalUuidSnapshot = await get(
//         ref(db, `hotels/${hotelName}/uuid`)
//       );
//       const generalHotelUuid = generalUuidSnapshot.val();

//       if (adminHotelUuid === generalHotelUuid) {
//         if (window.confirm("Confirm delete")) {
//           await remove(
//             ref(
//               db,
//               `/hotels/${hotelName}/Maincategories/${category.categoryId}`
//             )
//           );
//           toast.error("Category Deleted Successfully!", {
//             position: toast.POSITION.TOP_RIGHT,
//           });
//         }
//       } else {
//         toast.error(
//           "You do not have permission to delete categories for this hotel.",
//           {
//             position: toast.POSITION.TOP_RIGHT,
//           }
//         );
//       }
//     } catch (error) {
//       console.error("Error deleting category:", error);
//       toast.error("Error deleting category. Please try again.", {
//         position: toast.POSITION.TOP_RIGHT,
//       });
//     }
//   };

//   const categoriesArray = Object.values(categories)
//     .map((category, index) => ({
//       srNo: index + 1, // Serial number (1-based index)
//       ...category,
//     }))
//     .filter((category) =>
//       category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//   const columns = ViewCategoryColumns; // Ensure this matches the expected format
//   const handleAdd = () => {
//     setShow(true);
//   };

//   const handleClose = () => {
//     setShow(false);
//   };
//   return (
//     <>
//       <div className="d-flex justify-between">
//         {/* Modal */}
//         {show && (
//           <Modal
//             title="Add Category"
//             handleClose={handleClose}
//             children={
//               <div
//                 className="p-10 bg-white rounded-lg shadow-md"
//                 style={{ width: "40%", marginRight: "10px" }}
//               >
//                 <PageTitle pageTitle={"Add Special Category"} />
//                 <input
//                   type="text"
//                   value={categoryName}
//                   onChange={handleCategoryNameChange}
//                   placeholder="Enter Category Name"
//                   className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//                 />
//                 {isEdit ? (
//                   <>
//                     <button
//                       onClick={handleSubmitCategoryChange}
//                       className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       onClick={() => {
//                         setIsEdit(false);
//                         setCategoryName("");
//                       }}
//                       className="px-4 py-2 mr-2 text-white bg-red-600 rounded-md"
//                     >
//                       Cancel
//                     </button>
//                     <ToastContainer />
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       onClick={addCategoryToDatabase}
//                       className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
//                     >
//                       Submit
//                     </button>
//                     <ToastContainer />
//                   </>
//                 )}
//               </div>
//             }
//           ></Modal>
//         )}
//         <div style={{ width: "100%" }}>
//           <div>
//             {/* Search Bar */}
//             <SearchWithButton
//               searchTerm={searchTerm}
//               onSearchChange={(e) => setSearchTerm(e.target.value)}
//               buttonText="Add Special Category"
//               onButtonClick={handleAdd}
//             />
//           </div>
//           <PageTitle pageTitle={"View Special Categories"} />
//           <DynamicTable
//             columns={columns}
//             data={categoriesArray}
//             onEdit={handleUpdateCategory}
//             onDelete={handleDeleteCategory}
//           />
//         </div>
//       </div>
//     </>
//   );
// }

// export default AddMainCategory;



// components/CategoryManager.js
import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageTitle  from "../../Atoms/PageTitle";
import { ViewCategoryColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import SearchWithButton from "../../components/SearchWithAddButton";
import CategoryFormModal from "../../components/CategoryFormModal";
import { useCategoryManager } from "../../customHooks/mainCategory";

const CategoryManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  
  const { hotelName } = useParams();
  
  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryManager(hotelName);

  // Filter and format categories for table
  const categoriesData = useMemo(() => {
    return categories
      .filter(category =>
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((category, index) => ({
        srNo: index + 1,
        ...category,
      }));
  }, [categories, searchTerm]);

  const handleAdd = () => {
    setEditCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    await deleteCategory(category.categoryId);
  };

  const handleSubmit = async (categoryName, categoryId = null) => {
    if (categoryId) {
      // Update existing category
      return await updateCategory(categoryId, categoryName);
    } else {
      // Add new category
      return await addCategory(categoryName);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditCategory(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-between">
        <CategoryFormModal
          show={showModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editCategory={editCategory}
          title={editCategory ? "Edit Category" : "Add Category"}
        />

        <div style={{ width: "100%" }}>
          <SearchWithButton
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            buttonText="Add Special Category"
            onButtonClick={handleAdd}
          />
          
          <PageTitle pageTitle="View Special Categories" />
          
          <DynamicTable
            columns={ViewCategoryColumns}
            data={categoriesData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
      
      <ToastContainer />
    </>
  );
};

export default CategoryManager;