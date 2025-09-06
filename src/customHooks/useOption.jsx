// // hooks/useOptionsManager.js
// import { useState, useEffect, useCallback } from "react";
// import { getAuth } from "firebase/auth";
// import { toast } from "react-toastify";
// import { createOptionsService } from "../services/optionService";

// export const useOptionsManager = (hotelName) => {
//   const [options, setOptions] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const auth = getAuth();
//   const adminId = auth.currentUser?.uid;
//   const optionsService = createOptionsService(hotelName);

//   // Subscribe to options
//   useEffect(() => {
//     if (!hotelName) return;

//     setLoading(true);
//     const unsubscribe = optionsService.subscribeToOptions((optionsData) => {
//       setOptions(optionsData);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, [hotelName]);

//   // Add option
//   const addOption = useCallback(
//     async (category, value) => {
//       try {
//         setError(null);
//         await optionsService.addOption(category, value, adminId);
//         toast.success("Option Added Successfully!");
//         return true;
//       } catch (error) {
//         console.error("Error adding option:", error);
//         toast.error(error.message || "Error adding option.");
//         setError(error.message);
//         return false;
//       }
//     },
//     [adminId, optionsService]
//   );

//   // Update option
//   const updateOption = useCallback(
//     async (category, optionId, value) => {
//       try {
//         setError(null);
//         await optionsService.updateOption(category, optionId, value, adminId);
//         toast.success("Option Updated Successfully!");
//         return true;
//       } catch (error) {
//         console.error("Error updating option:", error);
//         toast.error(error.message || "Error updating option.");
//         setError(error.message);
//         return false;
//       }
//     },
//     [adminId, optionsService]
//   );

//   // Delete option
//   const deleteOption = useCallback(
//     async (category, optionId) => {
//       try {
//         setError(null);
//         const confirmed = window.confirm("Are you sure you want to delete this option?");
//         if (!confirmed) return false;

//         await optionsService.deleteOption(category, optionId, adminId);
//         toast.error("Option Deleted Successfully!");
//         return true;
//       } catch (error) {
//         console.error("Error deleting option:", error);
//         toast.error(error.message || "Error deleting option.");
//         setError(error.message);
//         return false;
//       }
//     },
//     [adminId, optionsService]
//   );

//   return {
//     options,
//     loading,
//     error,
//     addOption,
//     updateOption,
//     deleteOption,
//   };
// };


// customHooks/useOption.js
import { useState, useEffect } from "react";
import { createOptionsService } from "../services/optionService"; // ✅ fixed import
import { toast } from "react-toastify";

export const useOptionsManager = (hotelName) => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optionsService] = useState(() => createOptionsService(hotelName));

  useEffect(() => {
    if (!hotelName) return;

    setLoading(true);

    const unsubscribeCategories = optionsService.subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });

    return () => {
      unsubscribeCategories();
    };
  }, [hotelName, optionsService]);

  // -------- CATEGORY METHODS ----------
  const addCategory = async (categoryTitle) => {
    try {
      await optionsService.addCategory(categoryTitle, "admin-id"); // replace with actual adminId
      toast.success("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.message);
    }
  };

  const updateCategory = async (categoryKey, newTitle) => {
    try {
      await optionsService.updateCategory(categoryKey, newTitle, "admin-id");
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.message);
    }
  };

  const deleteCategory = async (categoryKey) => {
    if (window.confirm("Are you sure? This will delete the category and all its options.")) {
      try {
        await optionsService.deleteCategory(categoryKey, "admin-id");
        toast.success("Category deleted successfully!");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error(error.message);
      }
    }
  };

  // -------- OPTION METHODS ----------
  const addOption = async (categoryKey, value) => {
    try {
      await optionsService.addOption(categoryKey, value, "admin-id");
      toast.success("Option added successfully!");
    } catch (error) {
      console.error("Error adding option:", error);
      toast.error(error.message);
    }
  };

  const updateOption = async (categoryKey, optionId, newValue) => {
    try {
      await optionsService.updateOption(categoryKey, optionId, newValue, "admin-id");
      toast.success("Option updated successfully!");
    } catch (error) {
      console.error("Error updating option:", error);
      toast.error(error.message);
    }
  };

  const deleteOption = async (categoryKey, optionId) => {
    if (window.confirm("Are you sure you want to delete this option?")) {
      try {
        await optionsService.deleteOption(categoryKey, optionId, "admin-id");
        toast.success("Option deleted successfully!");
      } catch (error) {
        console.error("Error deleting option:", error);
        toast.error(error.message);
      }
    }
  };

  return {
    categories, // categories already include their options
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addOption,
    updateOption,
    deleteOption,
  };
};
