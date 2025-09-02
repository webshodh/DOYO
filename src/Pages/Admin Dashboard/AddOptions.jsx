// // components/OptionsManager.js
// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import PageTitle from "../../Atoms/PageTitle";
// import { useOptionsManager } from "../../customHooks/useOption";
// import { Spinner } from "Atoms";
// import ErrorMessage from "Atoms/ErrorMessage";

// const AddOption = () => {
//   const [selectedCategory, setSelectedCategory] = useState("spiceLevels");
//   const [newOption, setNewOption] = useState("");
//   const [editOption, setEditOption] = useState(null);

//   const { hotelName } = useParams();
//   const { options, loading, error, addOption, updateOption, deleteOption } =
//     useOptionsManager(hotelName);

//   if (loading) return <Spinner />;
//   if (error) return <ErrorMessage message={error} />;

//   const handleAdd = async () => {
//     if (!newOption.trim()) return;
//     await addOption(selectedCategory, newOption);
//     setNewOption("");
//   };

//   const handleUpdate = async () => {
//     if (!editOption?.id || !editOption?.value.trim()) return;
//     await updateOption(selectedCategory, editOption.id, editOption.value);
//     setEditOption(null);
//   };

//   return (
//     <div style={{ margin: "20px" }}>
//       <PageTitle pageTitle="Manage Options" />

//       {/* Category selector */}
//       <select
//         value={selectedCategory}
//         onChange={(e) => setSelectedCategory(e.target.value)}
//       >
//         {Object.keys(options).map((key) => (
//           <option key={key} value={key}>
//             {key}
//           </option>
//         ))}
//       </select>

//       {/* List options */}
//       <ul>
//         {options[selectedCategory] &&
//           Object.values(options[selectedCategory]).map((opt) => (
//             <li key={opt.id}>
//               {editOption?.id === opt.id ? (
//                 <>
//                   <input
//                     type="text"
//                     value={editOption.value}
//                     onChange={(e) =>
//                       setEditOption({ ...editOption, value: e.target.value })
//                     }
//                   />
//                   <button onClick={handleUpdate}>Save</button>
//                 </>
//               ) : (
//                 <>
//                   {opt.value}
//                   <button onClick={() => setEditOption(opt)}>Edit</button>
//                   <button
//                     onClick={() => deleteOption(selectedCategory, opt.id)}
//                   >
//                     Delete
//                   </button>
//                 </>
//               )}
//             </li>
//           ))}
//       </ul>

//       {/* Add option */}
//       <input
//         type="text"
//         placeholder="New option"
//         value={newOption}
//         onChange={(e) => setNewOption(e.target.value)}
//       />
//       <button onClick={handleAdd}>Add</button>

//       <ToastContainer />
//     </div>
//   );
// };

// export default AddOption;





// // components/OptionsManager.js
// import React, { useState } from "react";
// import { useParams } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import PageTitle from "../../Atoms/PageTitle";
// import { useOptionsManager } from "../../customHooks/useOption";
// import { Spinner } from "Atoms";
// import ErrorMessage from "Atoms/ErrorMessage";
// import { 
//   PlusIcon, 
//   PencilIcon, 
//   TrashIcon, 
//   CheckIcon, 
//   XMarkIcon,
//   TagIcon,
//   CogIcon 
// } from '@heroicons/react/24/outline';

// const AddOption = () => {
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [newOption, setNewOption] = useState("");
//   const [editOption, setEditOption] = useState(null);
//   const [newCategoryTitle, setNewCategoryTitle] = useState("");
//   const [editCategory, setEditCategory] = useState(null);
//   const [showAddCategory, setShowAddCategory] = useState(false);
//   const [activeTab, setActiveTab] = useState('categories');

//   const { hotelName } = useParams();
//   const { 
//     categories, 
//     options, 
//     loading, 
//     error, 
//     addCategory,
//     updateCategory,
//     deleteCategory,
//     addOption, 
//     updateOption, 
//     deleteOption 
//   } = useOptionsManager(hotelName);

//   if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
//   if (error) return <ErrorMessage message={error} />;

//   const handleAddCategory = async () => {
//     if (!newCategoryTitle.trim()) return;
//     await addCategory(newCategoryTitle);
//     setNewCategoryTitle("");
//     setShowAddCategory(false);
//   };

//   const handleUpdateCategory = async () => {
//     if (!editCategory?.key || !editCategory?.title.trim()) return;
//     await updateCategory(editCategory.key, editCategory.title);
//     setEditCategory(null);
//   };

//   const handleAddOption = async () => {
//     if (!newOption.trim() || !selectedCategory) return;
//     await addOption(selectedCategory, newOption);
//     setNewOption("");
//   };

//   const handleUpdateOption = async () => {
//     if (!editOption?.id || !editOption?.value.trim()) return;
//     await updateOption(selectedCategory, editOption.id, editOption.value);
//     setEditOption(null);
//   };

//   const categoriesArray = Object.values(categories);
//   const hasCategories = categoriesArray.length > 0;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         <PageTitle title="Options Manager" />
        
//         {/* Tab Navigation */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
//           <div className="flex border-b border-gray-200">
//             <button
//               onClick={() => setActiveTab('categories')}
//               className={`flex-1 px-6 py-4 text-sm font-medium rounded-tl-xl transition-colors duration-200 ${
//                 activeTab === 'categories'
//                   ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <TagIcon className="w-5 h-5 inline-block mr-2" />
//               Manage Categories
//             </button>
//             <button
//               onClick={() => setActiveTab('options')}
//               className={`flex-1 px-6 py-4 text-sm font-medium rounded-tr-xl transition-colors duration-200 ${
//                 activeTab === 'options'
//                   ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
//                   : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <CogIcon className="w-5 h-5 inline-block mr-2" />
//               Manage Options
//             </button>
//           </div>
//         </div>

//         {/* Categories Tab */}
//         {activeTab === 'categories' && (
//           <div className="space-y-6">
//             {/* Add Category Section */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-gray-800 flex items-center">
//                   <TagIcon className="w-6 h-6 mr-2 text-blue-600" />
//                   Categories
//                 </h2>
//                 <button
//                   onClick={() => setShowAddCategory(!showAddCategory)}
//                   className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
//                 >
//                   <PlusIcon className="w-4 h-4 mr-2" />
//                   Add Category
//                 </button>
//               </div>

//               {/* Add Category Form */}
//               {showAddCategory && (
//                 <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
//                   <div className="flex gap-3">
//                     <input
//                       type="text"
//                       value={newCategoryTitle}
//                       onChange={(e) => setNewCategoryTitle(e.target.value)}
//                       placeholder="Enter category title (e.g., Spice Levels)"
//                       className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                       onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
//                     />
//                     <button
//                       onClick={handleAddCategory}
//                       disabled={!newCategoryTitle.trim()}
//                       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                     >
//                       <CheckIcon className="w-4 h-4" />
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowAddCategory(false);
//                         setNewCategoryTitle("");
//                       }}
//                       className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
//                     >
//                       <XMarkIcon className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Categories List */}
//               <div className="space-y-3">
//                 {categoriesArray.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500">
//                     <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
//                     <p>No categories yet. Add your first category to get started!</p>
//                   </div>
//                 ) : (
//                   categoriesArray.map((category) => (
//                     <div
//                       key={category.key}
//                       className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
//                     >
//                       {editCategory?.key === category.key ? (
//                         <div className="flex items-center gap-3 flex-1">
//                           <input
//                             type="text"
//                             value={editCategory.title}
//                             onChange={(e) => setEditCategory({ ...editCategory, title: e.target.value })}
//                             className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                             onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
//                           />
//                           <button
//                             onClick={handleUpdateCategory}
//                             className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
//                           >
//                             <CheckIcon className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => setEditCategory(null)}
//                             className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                           >
//                             <XMarkIcon className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-center">
//                             <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
//                             <span className="font-medium text-gray-800">{category.title}</span>
//                             <span className="ml-3 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
//                               {options[category.key] ? Object.keys(options[category.key]).length : 0} options
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => setEditCategory(category)}
//                               className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
//                             >
//                               <PencilIcon className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => deleteCategory(category.key)}
//                               className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
//                             >
//                               <TrashIcon className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Options Tab */}
//         {activeTab === 'options' && (
//           <div className="space-y-6">
//             {!hasCategories ? (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
//                 <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">No Categories Available</h3>
//                 <p className="text-gray-500 mb-6">Please create some categories first before adding options.</p>
//                 <button
//                   onClick={() => setActiveTab('categories')}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
//                 >
//                   Go to Categories
//                 </button>
//               </div>
//             ) : (
//               <>
//                 {/* Category Selector */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     Select Category to Manage Options
//                   </label>
//                   <select
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
//                   >
//                     <option value="">Choose a category...</option>
//                     {categoriesArray.map((category) => (
//                       <option key={category.key} value={category.key}>
//                         {category.title}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Options Management */}
//                 {selectedCategory && (
//                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                     <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
//                       <CogIcon className="w-6 h-6 mr-2 text-blue-600" />
//                       Manage Options for "{categories[selectedCategory]?.title}"
//                     </h2>

//                     {/* Add Option Form */}
//                     <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
//                       <div className="flex gap-3">
//                         <input
//                           type="text"
//                           value={newOption}
//                           onChange={(e) => setNewOption(e.target.value)}
//                           placeholder="Enter new option..."
//                           className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                           onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
//                         />
//                         <button
//                           onClick={handleAddOption}
//                           disabled={!newOption.trim()}
//                           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                         >
//                           <PlusIcon className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Options List */}
//                     <div className="space-y-3">
//                       {!options[selectedCategory] || Object.keys(options[selectedCategory]).length === 0 ? (
//                         <div className="text-center py-8 text-gray-500">
//                           <CogIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
//                           <p>No options yet. Add your first option above!</p>
//                         </div>
//                       ) : (
//                         Object.values(options[selectedCategory]).map((opt) => (
//                           <div
//                             key={opt.id}
//                             className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
//                           >
//                             {editOption?.id === opt.id ? (
//                               <div className="flex items-center gap-3 flex-1">
//                                 <input
//                                   type="text"
//                                   value={editOption.value}
//                                   onChange={(e) => setEditOption({ ...editOption, value: e.target.value })}
//                                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                                   onKeyPress={(e) => e.key === 'Enter' && handleUpdateOption()}
//                                 />
//                                 <button
//                                   onClick={handleUpdateOption}
//                                   className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
//                                 >
//                                   <CheckIcon className="w-4 h-4" />
//                                 </button>
//                                 <button
//                                   onClick={() => setEditOption(null)}
//                                   className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
//                                 >
//                                   <XMarkIcon className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             ) : (
//                               <>
//                                 <div className="flex items-center">
//                                   <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
//                                   <span className="font-medium text-gray-800">{opt.value}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     onClick={() => setEditOption(opt)}
//                                     className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
//                                   >
//                                     <PencilIcon className="w-4 h-4" />
//                                   </button>
//                                   <button
//                                     onClick={() => deleteOption(selectedCategory, opt.id)}
//                                     className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
//                                   >
//                                     <TrashIcon className="w-4 h-4" />
//                                   </button>
//                                 </div>
//                               </>
//                             )}
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         )}

//         <ToastContainer />
//       </div>
//     </div>
//   );
// };

// export default AddOption;

// components/OptionsManager.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageTitle from "../../Atoms/PageTitle";
import { useOptionsManager } from "../../customHooks/useOption";
import { Spinner } from "Atoms";
import ErrorMessage from "Atoms/ErrorMessage";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const AddOption = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newOption, setNewOption] = useState("");
  const [editOption, setEditOption] = useState(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");

  const { hotelName } = useParams();
  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addOption,
    updateOption,
    deleteOption,
  } = useOptionsManager(hotelName);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  if (error) return <ErrorMessage message={error} />;

  // --- Category Handlers ---
  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) return;
    await addCategory(newCategoryTitle);
    setNewCategoryTitle("");
    setShowAddCategory(false);
  };

  const handleUpdateCategory = async () => {
    if (!editCategory?.key || !editCategory?.title.trim()) return;
    await updateCategory(editCategory.key, editCategory.title);
    setEditCategory(null);
  };

  // --- Option Handlers ---
  const handleAddOption = async () => {
    if (!newOption.trim() || !selectedCategory) return;
    await addOption(selectedCategory, newOption);
    setNewOption("");
  };

  const handleUpdateOption = async () => {
    if (!editOption?.id || !editOption?.value.trim()) return;
    await updateOption(selectedCategory, editOption.id, editOption.value);
    setEditOption(null);
  };

  const categoriesArray = Object.values(categories);
  const hasCategories = categoriesArray.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <PageTitle title="Options Manager" />

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex-1 px-6 py-4 text-sm font-medium rounded-tl-xl transition-colors duration-200 ${
                activeTab === "categories"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <TagIcon className="w-5 h-5 inline-block mr-2" />
              Manage Categories
            </button>
            <button
              onClick={() => setActiveTab("options")}
              className={`flex-1 px-6 py-4 text-sm font-medium rounded-tr-xl transition-colors duration-200 ${
                activeTab === "options"
                  ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CogIcon className="w-5 h-5 inline-block mr-2" />
              Manage Options
            </button>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Add Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <TagIcon className="w-6 h-6 mr-2 text-blue-600" />
                  Categories
                </h2>
                <button
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>

              {/* Add Category Form */}
              {showAddCategory && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newCategoryTitle}
                      onChange={(e) => setNewCategoryTitle(e.target.value)}
                      placeholder="Enter category title (e.g., Spice Levels)"
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryTitle.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryTitle("");
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Categories List */}
              <div className="space-y-3">
                {categoriesArray.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No categories yet. Add your first category to get started!</p>
                  </div>
                ) : (
                  categoriesArray.map((category) => (
                    <div
                      key={category.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
                    >
                      {editCategory?.key === category.key ? (
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="text"
                            value={editCategory.title}
                            onChange={(e) =>
                              setEditCategory({
                                ...editCategory,
                                title: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleUpdateCategory()
                            }
                          />
                          <button
                            onClick={handleUpdateCategory}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditCategory(null)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                            <span className="font-medium text-gray-800">
                              {category.title}
                            </span>
                            <span className="ml-3 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                              {category.options
                                ? Object.keys(category.options).length
                                : 0}{" "}
                              options
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditCategory(category)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category.key)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Options Tab */}
        {activeTab === "options" && (
          <div className="space-y-6">
            {!hasCategories ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <TagIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Categories Available
                </h3>
                <p className="text-gray-500 mb-6">
                  Please create some categories first before adding options.
                </p>
                <button
                  onClick={() => setActiveTab("categories")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Categories
                </button>
              </div>
            ) : (
              <>
                {/* Category Selector */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Category to Manage Options
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Choose a category...</option>
                    {categoriesArray.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Options Management */}
                {selectedCategory && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <CogIcon className="w-6 h-6 mr-2 text-blue-600" />
                      Manage Options for "
                      {categories[selectedCategory]?.title}"
                    </h2>

                    {/* Add Option */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Enter new option..."
                          className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddOption()
                          }
                        />
                        <button
                          onClick={handleAddOption}
                          disabled={!newOption.trim()}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="space-y-3">
                      {!categories[selectedCategory]?.options ||
                      Object.keys(categories[selectedCategory].options).length ===
                        0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <CogIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No options yet. Add your first option above!</p>
                        </div>
                      ) : (
                        Object.values(
                          categories[selectedCategory].options
                        ).map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300"
                          >
                            {editOption?.id === opt.id ? (
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type="text"
                                  value={editOption.value}
                                  onChange={(e) =>
                                    setEditOption({
                                      ...editOption,
                                      value: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  onKeyPress={(e) =>
                                    e.key === "Enter" && handleUpdateOption()
                                  }
                                />
                                <button
                                  onClick={handleUpdateOption}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditOption(null)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                  <span className="font-medium text-gray-800">
                                    {opt.value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditOption(opt)}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteOption(selectedCategory, opt.id)
                                    }
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default AddOption;
