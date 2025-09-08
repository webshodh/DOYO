// Enhanced image conversion utility functions
export const convertImageToWebP = (
  file,
  quality = 0.8,
  maxWidth = 400,
  maxHeight = 400
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    console.log(`🔄 Converting ${file.name} (${file.type})`);
    console.log(`📁 Original size: ${(file.size / 1024).toFixed(2)} KB`);

    img.onload = () => {
      console.log(`🖼️ Original dimensions: ${img.width}x${img.height}px`);

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      // Scale down if image is larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;

        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      console.log(
        `📐 New dimensions: ${Math.round(width)}x${Math.round(height)}px`
      );
      console.log(`⚙️ Quality: ${quality * 100}%`);

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new File object with WebP extension
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              { type: "image/webp" }
            );

            const originalKB = (file.size / 1024).toFixed(2);
            const newKB = (webpFile.size / 1024).toFixed(2);
            const reduction = ((1 - webpFile.size / file.size) * 100).toFixed(
              1
            );

            console.log(`✅ Original: ${originalKB} KB → WebP: ${newKB} KB`);
            console.log(
              `📉 Reduction: ${reduction}% (Saved: ${(
                originalKB - newKB
              ).toFixed(2)} KB)`
            );

            resolve(webpFile);
          } else {
            reject(new Error("Failed to convert image to WebP"));
          }
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

// Enhanced GIF handler - Convert GIF to WebP for static images
export const handleGifConversion = async (
  file,
  quality = 0.7,
  maxWidth = 400,
  maxHeight = 400
) => {
  console.log(`🎭 Handling GIF: ${file.name}`);
  console.log(`📏 Original GIF size: ${(file.size / 1024).toFixed(2)} KB`);

  // Check if it's an animated GIF or static
  const isAnimated = await checkIfGifIsAnimated(file);

  if (isAnimated) {
    console.log(`🎬 Animated GIF detected - keeping as GIF but compressing`);
    // For animated GIFs, just resize but keep as GIF
    return await compressGif(file, maxWidth, maxHeight);
  } else {
    console.log(
      `🖼️ Static GIF detected - converting to WebP for better compression`
    );
    // For static GIFs, convert to WebP for much better compression
    return await convertImageToWebP(file, quality, maxWidth, maxHeight);
  }
};

// Check if GIF is animated
export const checkIfGifIsAnimated = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target.result);

      // Look for multiple image frames in GIF
      let imageCount = 0;
      for (let i = 0; i < arr.length - 2; i++) {
        if (arr[i] === 0x00 && arr[i + 1] === 0x21 && arr[i + 2] === 0xf9) {
          imageCount++;
          if (imageCount > 1) {
            resolve(true); // Animated
            return;
          }
        }
      }
      resolve(false); // Static
    };
    reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 64 * 1024))); // Read first 64KB
  });
};

// Compress GIF while keeping animation
export const compressGif = (file, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    console.log(`🎬 Compressing animated GIF...`);

    img.onload = () => {
      let { width, height } = img;

      // Scale down dimensions
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Convert back to GIF with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedGif = new File([blob], file.name, {
              type: "image/gif",
            });

            const originalKB = (file.size / 1024).toFixed(2);
            const newKB = (compressedGif.size / 1024).toFixed(2);
            const reduction = (
              (1 - compressedGif.size / file.size) *
              100
            ).toFixed(1);

            console.log(`✅ GIF compressed: ${originalKB} KB → ${newKB} KB`);
            console.log(`📉 Reduction: ${reduction}% (Animation preserved)`);

            resolve(compressedGif);
          } else {
            reject(new Error("Failed to compress GIF"));
          }
        },
        "image/gif",
        0.8 // GIF quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load GIF"));
    img.src = URL.createObjectURL(file);
  });
};

// Smart converter - handles all formats optimally
export const smartImageConverter = async (file, targetMaxSize = 200) => {
  const targetMaxSizeBytes = targetMaxSize * 1024; // Convert KB to bytes
  const originalSizeKB = (file.size / 1024).toFixed(2);

  console.log(`🧠 Smart converter started for ${file.name}`);
  console.log(`🎯 Target max size: ${targetMaxSize} KB`);
  console.log(`📏 Current size: ${originalSizeKB} KB`);

  let processedFile = file;

  // Handle different file types
  if (file.type === "image/gif") {
    processedFile = await handleGifConversion(file, 0.7, 400, 400);
  } else if (file.type !== "image/webp") {
    // Convert other formats to WebP
    let quality = 0.8;

    // Adjust quality based on how much we need to compress
    if (file.size > 1024 * 1024) {
      // > 1MB
      quality = 0.6;
    } else if (file.size > 512 * 1024) {
      // > 512KB
      quality = 0.7;
    }

    processedFile = await convertImageToWebP(file, quality, 400, 400);
  }

  // If still too large, apply aggressive compression
  let attempts = 0;
  const maxAttempts = 3;

  while (processedFile.size > targetMaxSizeBytes && attempts < maxAttempts) {
    attempts++;
    console.log(
      `🔄 File still ${(processedFile.size / 1024).toFixed(
        2
      )} KB, attempt ${attempts} for more compression...`
    );

    const aggressiveQuality = Math.max(0.3, 0.8 - attempts * 0.2);
    const smallerDimension = Math.max(200, 400 - attempts * 100);

    if (processedFile.type === "image/gif") {
      processedFile = await compressGif(
        file,
        smallerDimension,
        smallerDimension
      );
    } else {
      processedFile = await convertImageToWebP(
        file,
        aggressiveQuality,
        smallerDimension,
        smallerDimension
      );
    }
  }

  const finalSizeKB = (processedFile.size / 1024).toFixed(2);
  const totalReduction = ((1 - processedFile.size / file.size) * 100).toFixed(
    1
  );

  console.log(`🎉 Smart conversion complete!`);
  console.log(
    `📊 ${originalSizeKB} KB → ${finalSizeKB} KB (${totalReduction}% reduction)`
  );

  return processedFile;
};

// import React, { useState, useEffect } from "react";
// import { FORM_CONFIG } from "Constants/addMenuFormConfig";
// import { Upload, ChefHat, AlertCircle, X, Save, Loader2 } from "lucide-react";
// import { FormSection, getDefaultFormData } from "utility/FormUtilityFunctions";

// // Enhanced Image Converter Utilities
// const convertImageToWebP = (file, quality = 0.8, maxWidth = 400, maxHeight = 400) => {
//   return new Promise((resolve, reject) => {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const img = new Image();

//     console.log(`🔄 Converting ${file.name} (${file.type})`);
//     console.log(`📁 Original size: ${(file.size / 1024).toFixed(2)} KB`);

//     img.onload = () => {
//       console.log(`🖼️ Original dimensions: ${img.width}x${img.height}px`);
      
//       let { width, height } = img;

//       if (width > maxWidth || height > maxHeight) {
//         const aspectRatio = width / height;
//         if (width > height) {
//           width = Math.min(width, maxWidth);
//           height = width / aspectRatio;
//         } else {
//           height = Math.min(height, maxHeight);
//           width = height * aspectRatio;
//         }
//       }

//       console.log(`📐 New dimensions: ${Math.round(width)}x${Math.round(height)}px`);
//       console.log(`⚙️ Quality: ${(quality * 100)}%`);

//       canvas.width = width;
//       canvas.height = height;
//       ctx.drawImage(img, 0, 0, width, height);

//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             const webpFile = new File(
//               [blob],
//               file.name.replace(/\.[^/.]+$/, ".webp"),
//               { type: "image/webp" }
//             );

//             const originalKB = (file.size / 1024).toFixed(2);
//             const newKB = (webpFile.size / 1024).toFixed(2);
//             const reduction = ((1 - webpFile.size / file.size) * 100).toFixed(1);

//             console.log(`✅ Original: ${originalKB} KB → WebP: ${newKB} KB`);
//             console.log(`📉 Reduction: ${reduction}% (Saved: ${(originalKB - newKB).toFixed(2)} KB)`);

//             resolve(webpFile);
//           } else {
//             reject(new Error("Failed to convert image to WebP"));
//           }
//         },
//         "image/webp",
//         quality
//       );
//     };

//     img.onerror = () => reject(new Error("Failed to load image"));
//     img.src = URL.createObjectURL(file);
//   });
// };

// const checkIfGifIsAnimated = (file) => {
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const arr = new Uint8Array(e.target.result);
      
//       let imageCount = 0;
//       for (let i = 0; i < arr.length - 2; i++) {
//         if (arr[i] === 0x00 && arr[i + 1] === 0x21 && arr[i + 2] === 0xF9) {
//           imageCount++;
//           if (imageCount > 1) {
//             resolve(true);
//             return;
//           }
//         }
//       }
//       resolve(false);
//     };
//     reader.readAsArrayBuffer(file.slice(0, Math.min(file.size, 64 * 1024)));
//   });
// };

// const compressGif = (file, maxWidth = 400, maxHeight = 400) => {
//   return new Promise((resolve, reject) => {
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const img = new Image();

//     console.log(`🎬 Compressing animated GIF...`);

//     img.onload = () => {
//       let { width, height } = img;

//       if (width > maxWidth || height > maxHeight) {
//         const aspectRatio = width / height;
//         if (width > height) {
//           width = Math.min(width, maxWidth);
//           height = width / aspectRatio;
//         } else {
//           height = Math.min(height, maxHeight);
//           width = height * aspectRatio;
//         }
//       }

//       canvas.width = width;
//       canvas.height = height;
//       ctx.drawImage(img, 0, 0, width, height);

//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             const compressedGif = new File([blob], file.name, { type: "image/gif" });
            
//             const originalKB = (file.size / 1024).toFixed(2);
//             const newKB = (compressedGif.size / 1024).toFixed(2);
//             const reduction = ((1 - compressedGif.size / file.size) * 100).toFixed(1);
            
//             console.log(`✅ GIF compressed: ${originalKB} KB → ${newKB} KB`);
//             console.log(`📉 Reduction: ${reduction}% (Animation preserved)`);
            
//             resolve(compressedGif);
//           } else {
//             reject(new Error("Failed to compress GIF"));
//           }
//         },
//         "image/gif",
//         0.8
//       );
//     };

//     img.onerror = () => reject(new Error("Failed to load GIF"));
//     img.src = URL.createObjectURL(file);
//   });
// };

// const handleGifConversion = async (file, quality = 0.7, maxWidth = 400, maxHeight = 400) => {
//   console.log(`🎭 Handling GIF: ${file.name}`);
//   console.log(`📏 Original GIF size: ${(file.size / 1024).toFixed(2)} KB`);
  
//   const isAnimated = await checkIfGifIsAnimated(file);
  
//   if (isAnimated) {
//     console.log(`🎬 Animated GIF detected - keeping as GIF but compressing`);
//     return await compressGif(file, maxWidth, maxHeight);
//   } else {
//     console.log(`🖼️ Static GIF detected - converting to WebP for better compression`);
//     return await convertImageToWebP(file, quality, maxWidth, maxHeight);
//   }
// };

// const smartImageConverter = async (file, targetMaxSize = 200) => {
//   const targetMaxSizeBytes = targetMaxSize * 1024;
//   const originalSizeKB = (file.size / 1024).toFixed(2);
  
//   console.log(`🧠 Smart converter started for ${file.name}`);
//   console.log(`🎯 Target max size: ${targetMaxSize} KB`);
//   console.log(`📏 Current size: ${originalSizeKB} KB`);
  
//   let processedFile = file;
  
//   if (file.type === 'image/gif') {
//     processedFile = await handleGifConversion(file, 0.7, 400, 400);
//   } else if (file.type !== 'image/webp') {
//     let quality = 0.8;
    
//     if (file.size > 1024 * 1024) {
//       quality = 0.6;
//     } else if (file.size > 512 * 1024) {
//       quality = 0.7;
//     }
    
//     processedFile = await convertImageToWebP(file, quality, 400, 400);
//   }
  
//   let attempts = 0;
//   const maxAttempts = 3;
  
//   while (processedFile.size > targetMaxSizeBytes && attempts < maxAttempts) {
//     attempts++;
//     console.log(`🔄 File still ${(processedFile.size / 1024).toFixed(2)} KB, attempt ${attempts} for more compression...`);
    
//     const aggressiveQuality = Math.max(0.3, 0.8 - (attempts * 0.2));
//     const smallerDimension = Math.max(200, 400 - (attempts * 100));
    
//     if (processedFile.type === 'image/gif') {
//       processedFile = await compressGif(file, smallerDimension, smallerDimension);
//     } else {
//       processedFile = await convertImageToWebP(
//         file, 
//         aggressiveQuality, 
//         smallerDimension, 
//         smallerDimension
//       );
//     }
//   }
  
//   const finalSizeKB = (processedFile.size / 1024).toFixed(2);
//   const totalReduction = ((1 - processedFile.size / file.size) * 100).toFixed(1);
  
//   console.log(`🎉 Smart conversion complete!`);
//   console.log(`📊 ${originalSizeKB} KB → ${finalSizeKB} KB (${totalReduction}% reduction)`);
  
//   return processedFile;
// };

// // Loading Spinner Component
// const LoadingSpinner = ({ text = "Processing..." }) => (
//   <div className="flex flex-col items-center justify-center p-8 text-center">
//     <div className="relative">
//       <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
//       <div className="absolute inset-0 w-12 h-12 border-4 border-orange-100 rounded-full"></div>
//     </div>
//     <p className="text-gray-700 font-medium mt-4">{text}</p>
//     <p className="text-gray-500 text-sm mt-1">Please wait...</p>
//   </div>
// );

// const MenuFormModal = ({
//   show,
//   onClose,
//   onSubmit,
//   categories,
//   mainCategories,
//   editMode = false,
//   initialData = null,
//   hotelName,
// }) => {
//   const [formData, setFormData] = useState(getDefaultFormData());
//   const [previewImage, setPreviewImage] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isConverting, setIsConverting] = useState(false);
//   const [conversionStats, setConversionStats] = useState(null);

//   // Initialize form data
//   useEffect(() => {
//     if (initialData && editMode) {
//       const sanitizedData = {
//         ...getDefaultFormData(),
//         ...initialData,
//         nutritionalInfo: {
//           protein: "",
//           carbs: "",
//           fat: "",
//           fiber: "",
//           ...(initialData.nutritionalInfo || {}),
//         },
//         allergens: Array.isArray(initialData.allergens)
//           ? initialData.allergens
//           : [],
//       };

//       setFormData(sanitizedData);
//       setPreviewImage(initialData.imageUrl || initialData.existingImageUrl);
//     } else {
//       setFormData(getDefaultFormData());
//       setPreviewImage(null);
//     }
//   }, [initialData, editMode, show]);

//   // Calculate final price
//   useEffect(() => {
//     if (formData.menuPrice) {
//       const price = parseFloat(formData.menuPrice);
//       const discountPercent = parseFloat(formData.discount) || 0;
//       const finalPrice = price - (price * discountPercent) / 100;

//       setFormData((prev) => ({
//         ...prev,
//         finalPrice: finalPrice.toFixed(2),
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         finalPrice: "",
//       }));
//     }
//   }, [formData.menuPrice, formData.discount]);

//   // Enhanced handleFileChange function
//   const handleFileChange = async (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     console.log("🚀 File upload started");
//     console.log("📂 Selected file:", selectedFile.name);
//     console.log("📏 File size:", (selectedFile.size / 1024).toFixed(2), "KB");
//     console.log("🎭 File type:", selectedFile.type);

//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/webp",
//       "image/gif",
//       "image/avif",
//     ];

//     if (!allowedTypes.includes(selectedFile.type)) {
//       console.error("❌ Invalid file type:", selectedFile.type);
//       alert("Please select a valid image file (JPG, PNG, GIF, WEBP, AVIF)");
//       return;
//     }

//     const maxSize = selectedFile.type === "image/gif" ? 5 * 1024 * 1024 : 3 * 1024 * 1024;
//     if (selectedFile.size > maxSize) {
//       console.error(
//         "❌ File too large:",
//         (selectedFile.size / 1024 / 1024).toFixed(2),
//         "MB"
//       );
//       alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
//       return;
//     }

//     try {
//       setPreviewImage(null);
//       setConversionStats(null);
//       setIsConverting(true);

//       const startTime = Date.now();

//       console.log("🧠 Starting smart conversion...");
//       const processedFile = await smartImageConverter(selectedFile, 150);

//       const conversionTime = Date.now() - startTime;
//       console.log(`⏱️ Total conversion time: ${conversionTime}ms`);

//       const stats = {
//         originalSize: selectedFile.size,
//         originalType: selectedFile.type,
//         finalSize: processedFile.size,
//         finalType: processedFile.type,
//         reduction: selectedFile.size > 0
//           ? ((1 - processedFile.size / selectedFile.size) * 100)
//           : 0,
//         savedBytes: selectedFile.size - processedFile.size,
//         conversionTime: conversionTime,
//       };

//       setConversionStats(stats);

//       console.log("🎉 File processing completed!");
//       console.log("📊 FINAL RESULTS:");
//       console.log(`   Original: ${(stats.originalSize / 1024).toFixed(2)} KB (${stats.originalType})`);
//       console.log(`   Final: ${(stats.finalSize / 1024).toFixed(2)} KB (${stats.finalType})`);
//       console.log(`   Reduction: ${stats.reduction.toFixed(1)}%`);
//       console.log(`   Saved: ${(stats.savedBytes / 1024).toFixed(2)} KB`);
//       console.log(`   Time taken: ${conversionTime}ms`);

//       setFormData((prev) => ({
//         ...prev,
//         file: processedFile,
//         existingImageUrl: "",
//       }));

//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setPreviewImage(e.target.result);
//         console.log("🖼️ Preview image created");
//       };
//       reader.readAsDataURL(processedFile);
//     } catch (error) {
//       console.error("❌ Error processing image:", error);
//       alert("Error processing image. Please try a different file.");
//     } finally {
//       setIsConverting(false);
//       console.log("🏁 File processing pipeline finished");
//     }
//   };

//   const validateForm = () => {
//     const requiredFields = [
//       { field: "menuName", label: "Menu Name" },
//       { field: "menuContent", label: "Description" },
//       { field: "menuCookingTime", label: "Cooking Time" },
//       { field: "menuPrice", label: "Base Price" },
//       { field: "menuCategory", label: "Menu Category" },
//       { field: "categoryType", label: "Category Type" },
//     ];

//     const missingFields = requiredFields.filter(({ field }) => {
//       const value = formData[field];
//       return !value || (typeof value === "string" && value.trim() === "");
//     });

//     if (missingFields.length > 0) {
//       const fieldNames = missingFields.map(({ label }) => label).join(", ");
//       alert(`Please fill in the following required fields: ${fieldNames}`);
//       return false;
//     }

//     return true;
//   };

//   const prepareFormDataForSubmission = () => {
//     console.log("Raw form data before preparation:", formData);

//     const submissionData = {
//       menuName: String(formData.menuName || "").trim(),
//       menuContent: String(formData.menuContent || "").trim(),
//       ingredients: String(formData.ingredients || "").trim(),
//       menuCookingTime: parseInt(formData.menuCookingTime) || 0,
//       servingSize: parseInt(formData.servingSize) || 1,

//       menuPrice: parseFloat(formData.menuPrice) || 0,
//       discount: parseFloat(formData.discount) || 0,
//       finalPrice: parseFloat(formData.finalPrice) || parseFloat(formData.menuPrice) || 0,
//       calories: parseInt(formData.calories) || 0,

//       mainCategory: String(formData.mainCategory || ""),
//       menuCategory: String(formData.menuCategory || ""),
//       categoryType: String(formData.categoryType || ""),
//       mealType: String(formData.mealType || ""),
//       spiceLevel: String(formData.spiceLevel || ""),
//       portionSize: String(formData.portionSize || ""),

//       preparationMethod: String(formData.preparationMethod || ""),
//       difficulty: String(formData.difficulty || ""),
//       availability: String(formData.availability || "Available"),
//       cuisineType: String(formData.cuisineType || ""),
//       tasteProfile: String(formData.tasteProfile || ""),
//       texture: String(formData.texture || ""),
//       cookingStyle: String(formData.cookingStyle || ""),

//       nutritionalInfo: {
//         protein: parseFloat(formData.nutritionalInfo?.protein) || 0,
//         carbs: parseFloat(formData.nutritionalInfo?.carbs) || 0,
//         fat: parseFloat(formData.nutritionalInfo?.fat) || 0,
//         fiber: parseFloat(formData.nutritionalInfo?.fiber) || 0,
//       },

//       chefSpecial: Boolean(formData.chefSpecial),
//       isPopular: Boolean(formData.isPopular),
//       isVegan: Boolean(formData.isVegan),
//       isGlutenFree: Boolean(formData.isGlutenFree),
//       isRecommended: Boolean(formData.isRecommended),
//       isSugarFree: Boolean(formData.isSugarFree),
//       isMostOrdered: Boolean(formData.isMostOrdered),
//       isSeasonal: Boolean(formData.isSeasonal),
//       isLimitedEdition: Boolean(formData.isLimitedEdition),
//       isOrganic: Boolean(formData.isOrganic),
//       isHighProtein: Boolean(formData.isHighProtein),
//       isLactoseFree: Boolean(formData.isLactoseFree),
//       isJainFriendly: Boolean(formData.isJainFriendly),
//       isKidsFriendly: Boolean(formData.isKidsFriendly),
//       isBeverageAlcoholic: Boolean(formData.isBeverageAlcoholic),

//       allergens: Array.isArray(formData.allergens) ? [...formData.allergens] : [],

//       file: formData.file || null,
//       existingImageUrl: String(formData.existingImageUrl || formData.imageUrl || ""),
//       imageUrl: String(formData.imageUrl || formData.existingImageUrl || ""),

//       createdAt: editMode
//         ? formData.createdAt || new Date().toISOString()
//         : new Date().toISOString(),
//       updatedAt: new Date().toISOString(),

//       ...(editMode && formData.uuid && { uuid: formData.uuid }),
//     };

//     return submissionData;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     console.log("Current form data on submit:", formData);

//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const submissionData = prepareFormDataForSubmission();
//       console.log("Final submission data:", submissionData);
//       console.log("Number of fields being submitted:", Object.keys(submissionData).length);

//       const success = await onSubmit(submissionData);

//       if (success) {
//         handleClose();
//       }
//     } catch (error) {
//       console.error("Form submission error:", error);
//       alert("There was an error submitting the form. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     setFormData(getDefaultFormData());
//     setPreviewImage(null);
//     setIsSubmitting(false);
//     setIsConverting(false);
//     setConversionStats(null);
//     onClose();
//   };

//   if (!show) return null;

//   const externalOptions = {
//     categories: categories || [],
//     mainCategories: mainCategories || [],
//   };

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ marginTop: "100px" }}
//     >
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={!isSubmitting ? handleClose : undefined}
//       ></div>

//       <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[95vh] overflow-y-auto">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="bg-white/20 rounded-full p-2">
//                 <ChefHat className="w-6 h-6" />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">
//                   {editMode ? "Edit Menu Item" : "Add New Menu Item"}
//                 </h2>
//                 <p className="text-orange-100">
//                   {editMode
//                     ? "Update menu details"
//                     : "Create a delicious new menu item"}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={handleClose}
//               disabled={isSubmitting}
//               className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         <div className="p-6">
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Enhanced Image Upload Component */}
//               <div className="lg:col-span-1">
//                 <div className="sticky top-6">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <Upload className="w-5 h-5 text-orange-500" />
//                     Menu Image/GIF
//                     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
//                       Auto WebP
//                     </span>
//                   </h3>

//                   <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors duration-200">
//                     {isConverting ? (
//                       <LoadingSpinner text="Converting to WebP..." />
//                     ) : previewImage ? (
//                       <div className="relative">
//                         <img
//                           src={previewImage}
//                           alt="Preview"
//                           className="w-full h-48 object-cover rounded-xl"
//                         />
                        
//                         {formData.file && (
//                           <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs px-3 py-1.5 rounded-md">
//                             <div className="flex items-center gap-1">
//                               {formData.file.type.includes('webp') && (
//                                 <span className="w-2 h-2 bg-green-400 rounded-full"></span>
//                               )}
//                               <span className="font-medium">
//                                 {formData.file.type.includes('webp') ? 'WebP' : 
//                                  formData.file.type.includes('avif') ? 'AVIF' : 
//                                  formData.file.name.split('.').pop().toUpperCase()}
//                               </span>
//                               <span className="opacity-75">•</span>
//                               <span>{(formData.file.size / 1024).toFixed(1)}KB</span>
//                             </div>
//                           </div>
//                         )}

//                         <button
//                           type="button"
//                           onClick={() => {
//                             setPreviewImage(null);
//                             setFormData((prev) => ({
//                               ...prev,
//                               file: null,
//                               existingImageUrl: "",
//                             }));
//                             setConversionStats(null);
//                           }}
//                           disabled={isSubmitting}
//                           className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors disabled:opacity-50"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ) : (
//                       <label
//                         htmlFor="file"
//                         className={`block p-8 text-center transition-colors ${
//                           isSubmitting || isConverting ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-100"
//                         }`}
//                       >
//                         <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-600 font-medium mb-2">
//                           Click to upload image or GIF
//                         </p>
//                         <p className="text-gray-400 text-sm mb-2">
//                           PNG, JPG, GIF, WEBP up to 3MB
//                         </p>
//                         <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
//                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
//                           Auto-converts to WebP for 50-70% smaller files
//                         </div>
//                       </label>
//                     )}
                    
//                     <input
//                       type="file"
//                       id="file"
//                       accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
//                       onChange={handleFileChange}
//                       disabled={isSubmitting || isConverting}
//                       className="hidden"
//                     />
//                   </div>

//                   {/* Detailed Conversion Stats */}
//                   {conversionStats && previewImage && (
//                     <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
//                       <div className="flex items-center gap-2 mb-3">
//                         <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                         <span className="text-green-800 font-semibold">Optimization Complete!</span>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div className="space-y-1">
//                           <div className="text-gray-600">Original:</div>
//                           <div className="font-mono text-xs bg-white px-2 py-1 rounded">
//                             {(conversionStats.originalSize / 1024).toFixed(2)} KB
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {conversionStats.originalType.split('/')[1].toUpperCase()}
//                           </div>
//                         </div>
                        
//                         <div className="space-y-1">
//                           <div className="text-gray-600">Optimized:</div>
//                           <div className="font-mono text-xs bg-white px-2 py-1 rounded">
//                             {(conversionStats.finalSize / 1024).toFixed(2)} KB
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {conversionStats.finalType.split('/')[1].toUpperCase()}
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="mt-3 pt-3 border-t border-green-200">
//                         <div className="flex justify-between items-center text-sm">
//                           <span className="text-green-700 font-medium">
//                             Size Reduction: {conversionStats.reduction.toFixed(1)}%
//                           </span>
//                           <span className="text-green-600 text-xs">
//                             Saved {(conversionStats.savedBytes / 1024).toFixed(2)} KB
//                           </span>
//                         </div>
//                         <div className="text-xs text-green-600 mt-1">
//                           Processing time: {conversionStats.conversionTime}ms
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Form Sections */}
//               <div className="lg:col-span-2 space-y-6">
//                 {FORM_CONFIG.sections.map((section) => (
//                   <FormSection
//                     key={section.id}
//                     section={section}
//                     formData={formData}
//                     onChange={setFormData}
//                     externalOptions={externalOptions}
//                     disabled={isSubmitting}
//                     hotelName={hotelName}
//                   />
//                 ))}

//                 {/* Form Actions */}
//                 <div className="flex items-center justify-between pt-6 border-t border-gray-200">
//                   <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <AlertCircle className="w-4 h-4" />
//                     <span>* Required fields</span>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <button
//                       type="button"
//                       onClick={handleClose}
//                       disabled={isSubmitting || isConverting}
//                       className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <X className="w-4 h-4" />
//                       Cancel
//                     </button>

//                     <button
//                       type="submit"
//                       disabled={isSubmitting || isConverting}
//                       className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <Save className="w-4 h-4" />
//                       {isSubmitting
//                         ? "Saving..."
//                         : isConverting
//                         ? "Processing..."
//                         : editMode
//                         ? "Update Menu Item"
//                         : "Create Menu Item"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenuFormModal;