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
import Modal from "components/Modal";

function AddCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempCategoryId, setTempCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState(false);
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
        <div
          className="bg-white p-10 rounded-lg shadow-md"
          style={{ width: "100%" }}
        >
          <div className="d-flex items-center space-x-4 mb-4">
            <div style={{ width: "80%" }}>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-orange-500 rounded-full py-2 px-4 mt-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <button
                onClick={handleAdd}
                className="px-4 py-2 mr-2 text-white bg-orange-500 rounded-md"
              >
                Add Category
              </button>
            </div>
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
