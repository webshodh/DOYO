import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  X,
} from "lucide-react";

const BulkMenuUpload = () => {
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [uploadResult, setUploadResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);

      // Read and preview the file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          setPreviewData(jsonData);
          setShowPreview(true);
        } catch (error) {
          alert("Invalid JSON file format");
          setSelectedFile(null);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid JSON file");
    }
  };

  const validateMenuData = (data) => {
    const errors = [];

    if (!data.hotels) {
      errors.push('Missing "hotels" root object');
      return errors;
    }

    Object.keys(data.hotels).forEach((hotelName) => {
      const hotel = data.hotels[hotelName];

      if (!hotel.categories) {
        errors.push(`Hotel "${hotelName}": Missing categories`);
      }

      if (!hotel.menu) {
        errors.push(`Hotel "${hotelName}": Missing menu`);
      }

      if (!hotel.info) {
        errors.push(`Hotel "${hotelName}": Missing info`);
      }

      // Validate menu items
      if (hotel.menu) {
        Object.keys(hotel.menu).forEach((menuId) => {
          const menuItem = hotel.menu[menuId];
          if (!menuItem.menuName) {
            errors.push(`Menu item "${menuId}": Missing menuName`);
          }
          if (!menuItem.menuPrice && menuItem.menuPrice !== 0) {
            errors.push(`Menu item "${menuId}": Missing menuPrice`);
          }
          if (!menuItem.menuCategory) {
            errors.push(`Menu item "${menuId}": Missing menuCategory`);
          }
        });
      }
    });

    return errors;
  };

  const simulateFirebaseUpload = async (data) => {
    // Simulate Firebase upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In real implementation, this would be:
    // import { getDatabase, ref, update } from 'firebase/database';
    // const db = getDatabase();
    // await update(ref(db), data);

    return {
      success: true,
      itemsProcessed: Object.values(data.hotels).reduce(
        (total, hotel) =>
          total + (hotel.menu ? Object.keys(hotel.menu).length : 0),
        0,
      ),
      categoriesProcessed: Object.values(data.hotels).reduce(
        (total, hotel) =>
          total + (hotel.categories ? Object.keys(hotel.categories).length : 0),
        0,
      ),
      hotelsProcessed: Object.keys(data.hotels).length,
    };
  };

  const handleUpload = async () => {
    if (!previewData) return;

    setUploadStatus("uploading");

    try {
      const validationErrors = validateMenuData(previewData);

      if (validationErrors.length > 0) {
        setUploadResult({
          success: false,
          errors: validationErrors,
        });
        setUploadStatus("error");
        return;
      }

      const result = await simulateFirebaseUpload(previewData);

      setUploadResult(result);
      setUploadStatus("success");
    } catch (error) {
      setUploadResult({
        success: false,
        error: error.message,
      });
      setUploadStatus("error");
    }
  };

  const resetUpload = () => {
    setUploadStatus("idle");
    setUploadResult(null);
    setSelectedFile(null);
    setPreviewData(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSample = () => {
    const sampleData = {
      hotels: {
        "Sample Restaurant": {
          categories: {
            cat001: {
              categoryId: "cat001",
              categoryName: "Appetizers",
              createdAt: new Date().toISOString(),
              createdBy: "admin",
            },
            cat002: {
              categoryId: "cat002",
              categoryName: "Main Course",
              createdAt: new Date().toISOString(),
              createdBy: "admin",
            },
          },
          info: {
            admin: {
              adminId: "admin123",
              assignedAt: new Date().toISOString(),
              contact: "1234567890",
              email: "admin@restaurant.com",
              name: "admin",
              role: "admin",
            },
            createdAt: new Date().toISOString(),
            hotelName: "Sample Restaurant",
            status: "active",
            uuid: "sample-uuid-123",
          },
          menu: {
            menu001: {
              availability: "Available",
              calories: 250,
              categoryType: "veg",
              chefSpecial: false,
              createdAt: new Date().toISOString(),
              cuisineType: "Indian",
              discount: 0,
              finalPrice: 150,
              ingredients: "Sample ingredients",
              menuCategory: "Appetizers",
              menuContent: "Sample menu description",
              menuCookingTime: 15,
              menuName: "Sample Dish",
              menuPrice: 150,
              nutritionalInfo: {
                carbs: 30,
                fat: 10,
                fiber: 5,
                protein: 15,
              },
              preparationMethod: "Grilled",
              servingSize: 1,
              spiceLevel: "Medium",
              texture: "Crispy",
              uuid: "menu001",
            },
          },
        },
      },
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-menu-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Bulk Menu Import
        </h2>
        <p className="text-gray-600">
          Upload a JSON file to bulk import menu items, categories, and
          restaurant data
        </p>
      </div>

      {/* Download Sample Button */}
      <div className="mb-6">
        <button
          onClick={downloadSample}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <Download size={18} />
          Download Sample JSON Format
        </button>
      </div>

      {/* File Upload Area */}
      {uploadStatus === "idle" && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-gray-500">JSON files only</p>
          </label>
        </div>
      )}

      {/* File Preview */}
      {showPreview && uploadStatus === "idle" && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-600" size={20} />
              <span className="font-medium">{selectedFile?.name}</span>
            </div>
            <button
              onClick={resetUpload}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {previewData && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">
                Preview Summary:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded">
                  <span className="font-medium">Hotels:</span>{" "}
                  {Object.keys(previewData.hotels || {}).length}
                </div>
                <div className="bg-white p-3 rounded">
                  <span className="font-medium">Menu Items:</span>{" "}
                  {Object.values(previewData.hotels || {}).reduce(
                    (total, hotel) =>
                      total + Object.keys(hotel.menu || {}).length,
                    0,
                  )}
                </div>
                <div className="bg-white p-3 rounded">
                  <span className="font-medium">Categories:</span>{" "}
                  {Object.values(previewData.hotels || {}).reduce(
                    (total, hotel) =>
                      total + Object.keys(hotel.categories || {}).length,
                    0,
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Import Data
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadStatus === "uploading" && (
        <div className="mt-6 p-6 bg-blue-50 rounded-lg text-center">
          <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-4" />
          <p className="text-blue-800 font-medium">
            Uploading data to Firebase...
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Please wait while we process your data
          </p>
        </div>
      )}

      {/* Success Result */}
      {uploadStatus === "success" && uploadResult && (
        <div className="mt-6 p-6 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-600" size={24} />
            <h3 className="text-lg font-medium text-green-800">
              Upload Successful!
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded">
              <span className="font-medium">Hotels Processed:</span>{" "}
              {uploadResult.hotelsProcessed}
            </div>
            <div className="bg-white p-3 rounded">
              <span className="font-medium">Categories Processed:</span>{" "}
              {uploadResult.categoriesProcessed}
            </div>
            <div className="bg-white p-3 rounded">
              <span className="font-medium">Menu Items Processed:</span>{" "}
              {uploadResult.itemsProcessed}
            </div>
          </div>

          <button
            onClick={resetUpload}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Upload Another File
          </button>
        </div>
      )}

      {/* Error Result */}
      {uploadStatus === "error" && uploadResult && (
        <div className="mt-6 p-6 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-medium text-red-800">Upload Failed</h3>
          </div>

          {uploadResult.errors && (
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2">
                Validation Errors:
              </h4>
              <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {uploadResult.error && (
            <p className="text-red-600 mb-4">{uploadResult.error}</p>
          )}

          <button
            onClick={resetUpload}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>
            • Download the sample JSON file to understand the required format
          </li>
          <li>
            • Ensure your JSON includes hotels, categories, menu items, and info
            objects
          </li>
          <li>
            • All menu items must have required fields: menuName, menuPrice,
            menuCategory
          </li>
          <li>
            • The component validates data before uploading to prevent errors
          </li>
          <li>• Large files may take a few moments to process</li>
        </ul>
      </div>
    </div>
  );
};

export default BulkMenuUpload;
