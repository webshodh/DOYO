// components/OptionsManager.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageTitle from "../../atoms/PageTitle";
import { useOptionsManager } from "../../customHooks/useOption";
import { Spinner } from "atoms";
import ErrorMessage from "atoms/Messages/ErrorMessage";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  CogIcon,
  Bars3Icon,
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
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-friendly Page Title */}
        <div className="mb-6 sm:mb-8">
          <PageTitle title="Options Manager" />
          <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
            Manage your menu categories and their available options
          </p>
        </div>

        {/* Enhanced Tab Navigation - Mobile Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeTab === "categories"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center justify-center">
                <TagIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Manage</span> Categories
              </div>
            </button>
            <button
              onClick={() => setActiveTab("options")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-all duration-300 ${
                activeTab === "options"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center justify-center">
                <CogIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Manage</span> Options
              </div>
            </button>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Add Category Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <TagIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Categories
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {categoriesArray.length} categories created
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium w-full sm:w-auto"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Category
                </button>
              </div>

              {/* Add Category Form - Mobile Optimized */}
              {showAddCategory && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-orange-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newCategoryTitle}
                      onChange={(e) => setNewCategoryTitle(e.target.value)}
                      placeholder="Enter category title (e.g., Spice Levels)"
                      className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white shadow-sm"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddCategory()
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddCategory}
                        disabled={!newCategoryTitle.trim()}
                        className="flex-1 sm:flex-none px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md text-sm font-medium"
                      >
                        <CheckIcon className="w-4 h-4 mx-auto sm:mx-0" />
                      </button>
                      <button
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategoryTitle("");
                        }}
                        className="flex-1 sm:flex-none px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 shadow-md text-sm font-medium"
                      >
                        <XMarkIcon className="w-4 h-4 mx-auto sm:mx-0" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Categories List - Enhanced Mobile Layout */}
              <div className="space-y-3 sm:space-y-4">
                {categoriesArray.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                      <TagIcon className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                      No Categories Yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                      Add your first category to get started with organizing
                      your menu options!
                    </p>
                  </div>
                ) : (
                  categoriesArray.map((category) => (
                    <div
                      key={category.key}
                      className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {editCategory?.key === category.key ? (
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={editCategory.title}
                              onChange={(e) =>
                                setEditCategory({
                                  ...editCategory,
                                  title: e.target.value,
                                })
                              }
                              className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white"
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleUpdateCategory()
                              }
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateCategory}
                                className="flex-1 sm:flex-none p-3 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-300 border border-green-300"
                              >
                                <CheckIcon className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => setEditCategory(null)}
                                className="flex-1 sm:flex-none p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 border border-gray-300"
                              >
                                <XMarkIcon className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 sm:p-6">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-gray-800 text-sm sm:text-base block truncate">
                                {category.title}
                              </span>
                              <div className="flex items-center mt-1">
                                <span className="text-xs sm:text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
                                  {category.options
                                    ? Object.keys(category.options).length
                                    : 0}{" "}
                                  options
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 ml-3">
                            <button
                              onClick={() => setEditCategory(category)}
                              className="p-2 sm:p-3 text-orange-600 hover:bg-orange-100 rounded-lg transition-all duration-300 border border-orange-200"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category.key)}
                              className="p-2 sm:p-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
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
          <div className="space-y-4 sm:space-y-6">
            {!hasCategories ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <TagIcon className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  No Categories Available
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
                  Please create some categories first before adding options to
                  them.
                </p>
                <button
                  onClick={() => setActiveTab("categories")}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg"
                >
                  Go to Categories
                </button>
              </div>
            ) : (
              <>
                {/* Category Selector - Mobile Optimized */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Category to Manage Options
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm shadow-sm"
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
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-4 sm:p-6">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <CogIcon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                          Options for "{categories[selectedCategory]?.title}"
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Manage available options for this category
                        </p>
                      </div>
                    </div>

                    {/* Add Option - Mobile Optimized */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-orange-200">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Enter new option..."
                          className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white shadow-sm"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddOption()
                          }
                        />
                        <button
                          onClick={handleAddOption}
                          disabled={!newOption.trim()}
                          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md text-sm font-medium flex items-center justify-center"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Add Option</span>
                          <span className="sm:hidden">Add</span>
                        </button>
                      </div>
                    </div>

                    {/* Options List - Enhanced Mobile Layout */}
                    <div className="space-y-3 sm:space-y-4">
                      {!categories[selectedCategory]?.options ||
                      Object.keys(categories[selectedCategory].options)
                        .length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                            <CogIcon className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                            No Options Yet
                          </h3>
                          <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                            Add your first option using the form above!
                          </p>
                        </div>
                      ) : (
                        Object.values(categories[selectedCategory].options).map(
                          (opt) => (
                            <div
                              key={opt.id}
                              className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              {editOption?.id === opt.id ? (
                                <div className="p-4 sm:p-6">
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                      type="text"
                                      value={editOption.value}
                                      onChange={(e) =>
                                        setEditOption({
                                          ...editOption,
                                          value: e.target.value,
                                        })
                                      }
                                      className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white"
                                      onKeyPress={(e) =>
                                        e.key === "Enter" &&
                                        handleUpdateOption()
                                      }
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleUpdateOption}
                                        className="flex-1 sm:flex-none p-3 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-300 border border-green-300"
                                      >
                                        <CheckIcon className="w-4 h-4 mx-auto" />
                                      </button>
                                      <button
                                        onClick={() => setEditOption(null)}
                                        className="flex-1 sm:flex-none p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 border border-gray-300"
                                      >
                                        <XMarkIcon className="w-4 h-4 mx-auto" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between p-4 sm:p-6">
                                  <div className="flex items-center flex-1 min-w-0">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                                    <span className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                                      {opt.value}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-2 ml-3">
                                    <button
                                      onClick={() => setEditOption(opt)}
                                      className="p-2 sm:p-3 text-orange-600 hover:bg-orange-100 rounded-lg transition-all duration-300 border border-orange-200"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        deleteOption(selectedCategory, opt.id)
                                      }
                                      className="p-2 sm:p-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-200"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Mobile-optimized Toast Container */}
        <ToastContainer
          position="top-right"
          className="!top-16 sm:!top-4"
          toastClassName="text-sm"
        />
      </div>
    </div>
  );
};

export default AddOption;
