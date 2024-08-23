import React, { useState, useEffect } from "react";
import { db, storage } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, update, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function AddMenu() {
  const [menuName, setMenuName] = useState("");
  const [menuCookingTime, setMenuCookingTime] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuContent, setMenuContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [availability, setAvailability] = useState("Available");
  const [mainCategory, setMainCategory] = useState("");
  const [file, setFile] = useState(null); // State for file upload
  const [editMode, setEditMode] = useState(false);
  const [editedMenuId, setEditedMenuId] = useState(null);

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const { hotelName } = useHotelContext();

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

  useEffect(() => {
    onValue(ref(db, `/hotels/${hotelName}/maincategory/`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMainCategories(Object.values(data));
      } else {
        setMainCategories([]);
      }
    });
  }, [hotelName]);

  console.log('maincategory', mainCategory)
  console.log('maincategory2', mainCategories)

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const writeToDatabase = async () => {
    try {
      const uuidSnapshot = await get(ref(db, `admins/${adminID}/hotels/${hotelName}/uuid`));
      const adminHotelUuid = uuidSnapshot.val();

      const generalUuidSnapshot = await get(ref(db, `hotels/${hotelName}/uuid`));
      const generalHotelUuid = generalUuidSnapshot.val();

      if (adminHotelUuid === generalHotelUuid) {
        let imageUrl = "";
        if (file) {
          // Upload image to Firebase Storage
          const imageRef = storageRef(storage, `images/${hotelName}/${file.name}`);
          await uploadBytes(imageRef, file);

          // Get the download URL of the uploaded image
          imageUrl = await getDownloadURL(imageRef);
        }

        const menuData = {
          menuName,
          menuCookingTime,
          menuPrice,
          menuCategory,
          menuContent,
          availability,
          mainCategory,
          uuid: editMode ? editedMenuId : uid(),
          imageUrl: imageUrl || "",
        };

        if (editMode) {
          // Update existing menu with the image URL
          await update(ref(db, `/hotels/${hotelName}/menu/${editedMenuId}`), menuData);
          setEditMode(false);
          setEditedMenuId(null);
          toast.success("Menu Updated Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else {
          // Add new menu with the image URL
          await set(ref(db, `/hotels/${hotelName}/menu/${menuData.uuid}`), menuData);
          toast.success("Menu Added Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }

        // Clear form fields
        setMenuName("");
        setMenuCookingTime("");
        setMenuPrice("");
        setMenuCategory("");
        setMenuContent("");
        setAvailability("Available");
        setMainCategory("");
        setFile(null);

      } else {
        toast.error("You do not have permission to manage menus for this hotel.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error("Error managing menu:", error);
      toast.error("Error managing menu. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label htmlFor="menuName" className="block text-sm font-medium text-gray-700">Menu Name</label>
              <input
                type="text"
                id="menuName"
                value={menuName}
                onChange={handleChange(setMenuName)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  menuName ? "border-green-500" : "border-red-500"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                placeholder="Enter Menu Name"
              />
              {menuName ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                  <FaCheckCircle />
                </div>
              ) : (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
              {!menuName && (
                <p className="text-red-500 text-xs mt-1">Menu Name is required.</p>
              )}
            </div>

            <div>
              <label htmlFor="menuCategory" className="block text-sm font-medium text-gray-700">Menu Category</label>
              <select
                id="menuCategory"
                value={menuCategory}
                onChange={handleChange(setMenuCategory)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="" disabled>Select Menu Category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label htmlFor="menuCookingTime" className="block text-sm font-medium text-gray-700">Cooking Time</label>
              <select
                id="menuCookingTime"
                value={menuCookingTime}
                onChange={handleChange(setMenuCookingTime)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="" disabled>Select Cooking Time</option>
                {[5, 10, 15, 20, 25, 30].map((time) => (
                  <option key={time} value={time}>{time} min</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="menuPrice" className="block text-sm font-medium text-gray-700">Menu Price</label>
              <input
                type="number"
                id="menuPrice"
                value={menuPrice}
                onChange={handleChange(setMenuPrice)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  menuPrice ? "border-green-500" : "border-red-500"
                } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500`}
                placeholder="Enter Menu Price"
              />
              {menuPrice ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                  <FaCheckCircle />
                </div>
              ) : (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-red-500">
                  <FaExclamationCircle />
                </div>
              )}
              {!menuPrice && (
                <p className="text-red-500 text-xs mt-1">Menu Price is required.</p>
              )}
            </div>

            <div>
              <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700">Main Category</label>
              <select
                id="mainCategory"
                value={mainCategory}
                onChange={handleChange(setMainCategory)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="" disabled>Select Main Category</option>
                {mainCategories.map((category) => (
                  <option key={category.categoryId} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Upload Image</label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
              <select
                id="availability"
                value={availability}
                onChange={handleChange(setAvailability)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="menuContent" className="block text-sm font-medium text-gray-700">Menu Content</label>
              <textarea
                id="menuContent"
                value={menuContent}
                onChange={handleChange(setMenuContent)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                rows="4"
                placeholder="Enter Menu Content"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={writeToDatabase}
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {editMode ? "Update Menu" : "Add Menu"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}

export default AddMenu;
