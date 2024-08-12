// AddMenu.js
import React, { useState, useEffect } from "react";
import { db, storage } from "../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form } from "react-bootstrap";
import "./AddMenu";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import styled from 'styled-components';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useHotelContext } from "../Context/HotelContext";
import { getAuth } from "firebase/auth";
// Container for the form
export const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px;
`;

// Wrapper for each input
export const InputWrapper = styled.div`
  flex: 1 1 calc(50% - 300px); // Two-column layout
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

// Label styling
export const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

// Input field with conditional styling
export const Input = styled.input`
  padding: 10px;
  border: 1px solid ${props => props.error ? '#dc3545' : props.success ? '#28a745' : '#ccc'};
  border-radius: 4px;
  outline: none;
  box-shadow: ${props => props.error ? '0 0 0 1px rgba(220, 53, 69, 0.5)' : 'none'};
  
  &:focus {
    border-color: ${props => props.error ? '#dc3545' : '#80bdff'};
    box-shadow: ${props => props.error ? '0 0 0 1px rgba(220, 53, 69, 0.5)' : '0 0 0 0.2rem rgba(38, 143, 255, 0.25)'};
  }
`;

// Icon for error or success
export const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.error ? '#dc3545' : '#28a745'};
`;

// Error message styling
export const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

// Success message styling
export const SuccessMessage = styled.p`
  color: #28a745;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

// File upload section
export const FileUpload = styled.div`
  flex: 1 1 100%;
`;

// Button styling
export const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: ${props => props.primary ? '#28a745' : '#dc3545'};
  margin-top: 10px;
  
  &:hover {
    background-color: ${props => props.primary ? '#218838' : '#c82333'};
  }
`;
function AddMenu() {
  const [menuName, setMenuName] = useState("");
  const [menuCookingTime, setMenuCookingTime] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuCategory, setMenuCategory] = useState("");
  const [menuContent, setMenuContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [availability, setAvailability] = useState("Available"); // Added state for availability
  const [file, setFile] = useState(null); // State for file upload

  const [menues, setMenues] = useState([]);
  const [menuCountsByCategory, setMenuCountsByCategory] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [disabledCards, setDisabledCards] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedMenuId, setEditedMenuId] = useState(null);

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
 
  const { hotelName } = useHotelContext();
  useEffect(() => {
    onValue(ref(db, `/admins/${adminID}/hotels/${hotelName}/menu/`), (snapshot) => {
      setMenues([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).forEach((category) => {
          setMenues((oldCategories) => [...oldCategories, category]);
        });
      }
    });
  }, [hotelName]);

  useEffect(() => {
    onValue(ref(db, `/admins/${adminID}/hotels/${hotelName}/categories/`), (snapshot) => {
      setCategories([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).forEach((category) => {
          setCategories((oldCategories) => [...oldCategories, category]);
        });
      }
    });
  }, [hotelName]);

  useEffect(() => {
    const initialDisabledState = menues.reduce((acc, menu) => {
      acc[menu.uuid] = false;
      return acc;
    }, {});
    setDisabledCards(initialDisabledState);
  }, [menues]);

  useEffect(() => {
    const countsByCategory = {};
    menues.forEach((menu) => {
      const category = menu.menuCategory;
      countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    });

    setMenuCountsByCategory(countsByCategory);
  }, [menues]);

  const handleMenuNameChange = (e) => {
    setMenuName(e.target.value);
  };

  const handleCookingTimeChange = (e) => {
    setMenuCookingTime(e.target.value);
  };

  const handleMenuPriceChange = (e) => {
    setMenuPrice(e.target.value);
  };

  const handleMenuCategoryChange = (e) => {
    setMenuCategory(e.target.value);
  };

  const handleMenuContentChange = (e) => {
    setMenuContent(e.target.value);
  };

  const handleMenuAvailabilityChange = (e) => {
    setAvailability(e.target.value);
  };

  const handleFileChange = (e) => {
    // Handle file upload
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const writeToDatabase = async () => {
    if (file) {
      // Upload image to Firebase Storage
      const imageRef = storageRef(storage, `images/${hotelName}/${file.name}`);
      await uploadBytes(imageRef, file);

      // Get the download URL of the uploaded image
      const imageUrl = await getDownloadURL(imageRef);

      if (editMode) {
        // Update existing menu with the image URL
        update(ref(db, `/admins/${adminID}/hotels/${hotelName}/menu/${editedMenuId}`), {
          menuName,
          menuCookingTime,
          menuPrice,
          menuCategory,
          menuContent,
          availability,
          imageUrl, // Save image URL
          uuid: editedMenuId,
        });
        setEditMode(false);
        setEditedMenuId(null);
        toast.success("Menu Updated Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        // Add new menu with the image URL
        const uuid = uid();
        set(ref(db, `/admins/${adminID}/hotels/${hotelName}/menu/${uuid}`), {
          menuName,
          menuCookingTime,
          menuPrice,
          menuCategory,
          menuContent,
          availability,
          imageUrl, // Save image URL
          uuid,
        });
        toast.success("Menu Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } else {
      // If no file is selected, proceed without uploading image
      if (editMode) {
        // Update existing menu without the image URL
        update(ref(db, `/admins/${adminID}/hotels/${hotelName}/menu/${editedMenuId}`), {
          menuName,
          menuCookingTime,
          menuPrice,
          menuCategory,
          menuContent,
          availability,
          uuid: editedMenuId,
        });
        setEditMode(false);
        setEditedMenuId(null);
        toast.success("Menu Updated Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      } else {
        // Add new menu without the image URL
        const uuid = uid();
        set(ref(db, `/admins/${adminID}/hotels/${hotelName}/menu/${uuid}`), {
          menuName,
          menuCookingTime,
          menuPrice,
          menuCategory,
          menuContent,
          availability,
          uuid,
        });
        toast.success("Menu Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    }

    // Clear form fields
    setMenuName("");
    setMenuCookingTime("");
    setMenuPrice("");
    setMenuCategory("");
    setMenuContent("");
    setAvailability("");
    setFile(null);

    setShowForm(false);
  };
console.log('categories', categories)
  return (
    <>
     <div className="background-card">
       <FormContainer>
       <InputWrapper>
         <Label htmlFor="menuName">Menu Name</Label>
         <div style={{ position: 'relative' }}>
           <Input
             type="text"
             value={menuName}
             onChange={handleMenuNameChange}
             id="menuName"
             error={!menuName} // Replace with actual validation condition
             success={menuName} // Replace with actual validation condition
             placeholder="Enter Menu Name"
           />
           {menuName && <Icon success><FaCheckCircle /></Icon>}
           {!menuName && <Icon error><FaExclamationCircle /></Icon>}
         </div>
         {!menuName && <ErrorMessage>Menu Name is required.</ErrorMessage>}
       </InputWrapper>
       
       <InputWrapper>
         <Label htmlFor="cookingTime">Cooking Time</Label>
         <select
           id="cookingTime"
           className="form-select"
           onChange={handleCookingTimeChange}
          //  value={cookingTime}
         >
           <option value="" disabled>Select Cooking Time</option>
           {[5, 10, 15, 20, 25, 30].map(time => (
             <option key={time} value={time}>{time} min</option>
           ))}
         </select>
       </InputWrapper>
 
       <InputWrapper>
         <Label htmlFor="menuPrice">Menu Price</Label>
         <div style={{ position: 'relative' }}>
           <Input
             type="number"
             value={menuPrice}
             onChange={handleMenuPriceChange}
             id="menuPrice"
             error={!menuPrice} // Replace with actual validation condition
             success={menuPrice} // Replace with actual validation condition
             placeholder="Enter Menu Price"
           />
           {menuPrice && <Icon success><FaCheckCircle /></Icon>}
           {!menuPrice && <Icon error><FaExclamationCircle /></Icon>}
         </div>
         {!menuPrice && <ErrorMessage>Menu Price is required.</ErrorMessage>}
       </InputWrapper>
 
       <InputWrapper>
         <Label htmlFor="menuCategory">Menu Category</Label>
         <select
           id="menuCategory"
           className="form-select"
           onChange={handleMenuCategoryChange}
           value={menuCategory}
         >
           <option value="" disabled>Select Menu Category</option>
           {categories.map((category) => (
             <option key={category.categoryId} value={category.categoryName}>
               {category.categoryName}
             </option>
           ))}
         </select>
       </InputWrapper>
 
       <InputWrapper>
         <Label htmlFor="menuContent">Menu Content</Label>
         <textarea
           id="menuContent"
           className="form-control"
           rows="3"
           value={menuContent}
           onChange={handleMenuContentChange}
           placeholder="Enter Menu Content"
         ></textarea>
       </InputWrapper>
 
       <InputWrapper>
         <Label>Status</Label>
         <div>
           <input
             type="radio"
             id="availableRadio"
             name="status"
             value="Available"
             checked={availability === "Available"}
             onChange={() => setAvailability("Available")}
             className="form-check-input"
           />
           <label htmlFor="availableRadio" className="form-check-label" style={{width:'100px'}}>
             Available
           </label>
           <input
             type="radio"
             id="notAvailableRadio"
             name="status"
             value="Not Available"
             checked={availability === "Not Available"}
             onChange={() => setAvailability("Not Available")}
             className="form-check-input"
           />
           <label htmlFor="notAvailableRadio" className="form-check-label">
             Not Available
           </label>
         </div>
       </InputWrapper>
 
       {!editMode && (
         <FileUpload>
           <Label htmlFor="formFile">Upload Image</Label>
           <input type="file" id="formFile" onChange={handleFileChange} className="form-control" />
         </FileUpload>
       )}
 
       <Button primary onClick={writeToDatabase}>
         {editMode ? "Update" : "Submit"}
       </Button>
     </FormContainer>
     </div>
    </>
  );
}

export default AddMenu;


 {/* <div className="container">
        {!editMode ? <h2>Add Menu</h2> : <h2>Update Menu</h2>}

        <div className="mb-3">
          <label htmlFor="menuName" className="form-label">
            Menu Name
          </label>
          <input
            type="text"
            value={menuName}
            onChange={handleMenuNameChange}
            id="menuName"
            className="form-control"
            placeholder="Enter Menu Name"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="cookingTime" className="form-label">
            Cooking Time
          </label>
          <select
            id="cookingTime"
            className="form-select"
            onChange={handleCookingTimeChange}
          >
            <option selected disabled>
              Select Cooking Time
            </option>
            <option value="5">5 min</option>
            <option value="10">10 min</option>
            <option value="15">15 min</option>
            <option value="20">20 min</option>
            <option value="25">25 min</option>
            <option value="30">30 min</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="menuPrice" className="form-label">
            Menu Price
          </label>
          <input
            type="number"
            value={menuPrice}
            onChange={handleMenuPriceChange}
            id="menuPrice"
            className="form-control"
            placeholder="Enter Menu Price"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="menuCategory" className="form-label">
            Menu Category
          </label>
          <select
            id="menuCategory"
            className="form-select"
            onChange={handleMenuCategoryChange}
          >
            <option selected disabled>
              Select Menu Category
            </option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="menuContent" className="form-label">
            Menu Content
          </label>
          <textarea
            id="menuContent"
            className="form-control"
            rows="3"
            value={menuContent}
            onChange={handleMenuContentChange}
            placeholder="Enter Menu Content"
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <br />
          <div className="form-check form-check-inline">
            <input
              type="radio"
              id="availableRadio"
              name="status"
              value="Available"
              checked={availability === "Available"}
              onChange={() => setAvailability("Available")}
              className="form-check-input"
            />
            <label htmlFor="availableRadio" className="form-check-label">
              Available
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              id="notAvailableRadio"
              name="status"
              value="Not Available"
              checked={availability === "Not Available"}
              onChange={() => setAvailability("Not Available")}
              className="form-check-input"
            />
            <label htmlFor="notAvailableRadio" className="form-check-label">
              Not Available
            </label>
          </div>
        </div>
        {/* File upload field */}

      //   {!editMode ? (
      //     <Form.Group controlId="formFile" className="mb-3">
      //       <Form.Label>Upload Image</Form.Label>
      //       <Form.Control type="file" onChange={handleFileChange} />
      //     </Form.Group>
      //   ) : (
      //     ""
      //   )}
      //   <button onClick={writeToDatabase} className="btn btn-success">
      //     {editMode ? "Update" : "Submit"}
      //   </button>
      //   <ToastContainer />
      // </div> 