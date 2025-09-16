import React, { useState, useCallback, useMemo, memo, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Plus,
  Settings,
  Tag,
  LoaderCircle,
  AlertCircle,
  TrendingUp,
  Grid,
  List,
} from "lucide-react";
import PageTitle from "../../atoms/PageTitle";
import { useOptionsManager } from "../../customHooks/useOption";
import LoadingSpinner from "../../atoms/LoadingSpinner";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import StatCard from "components/Cards/StatCard";
import PrimaryButton from "atoms/Buttons/PrimaryButton";
import SearchWithResults from "molecules/SearchWithResults";
import ErrorMessage from "atoms/Messages/ErrorMessage";

// Main AddOption component
const AddOption = memo(() => {
  const navigate = useNavigate();
  const { hotelName } = useParams();

  // State management
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newOption, setNewOption] = useState("");
  const [editOption, setEditOption] = useState(null);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [searchTerm, setSearchTerm] = useState("");

  // Use custom hook for options management
  const {
    categories,
    loading,
    submitting,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addOption,
    updateOption,
    deleteOption,
    refreshOptions,
  } = useOptionsManager(hotelName);

  // Memoized calculations
  const stats = useMemo(() => {
    const categoriesArray = Object.values(categories || {});
    const totalOptions = categoriesArray.reduce(
      (total, category) =>
        total + (category.options ? Object.keys(category.options).length : 0),
      0
    );

    return {
      totalCategories: categoriesArray.length,
      totalOptions,
      categoriesWithOptions: categoriesArray.filter(
        (cat) => cat.options && Object.keys(cat.options).length > 0
      ).length,
      avgOptionsPerCategory:
        categoriesArray.length > 0
          ? Math.round((totalOptions / categoriesArray.length) * 10) / 10
          : 0,
    };
  }, [categories]);

  // Memoized filtered data
  const { categoriesArray, hasCategories, selectedCategoryData } =
    useMemo(() => {
      const categoriesArray = Object.values(categories || {});
      const hasCategories = categoriesArray.length > 0;
      const selectedCategoryData = selectedCategory
        ? categories[selectedCategory]
        : null;

      return { categoriesArray, hasCategories, selectedCategoryData };
    }, [categories, selectedCategory]);

  // Event handlers for categories
  const handleAddCategoryClick = useCallback(() => {
    setShowAddCategory(!showAddCategory);
  }, [showAddCategory]);

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryTitle.trim()) return;

    const success = await addCategory(newCategoryTitle);
    if (success) {
      setNewCategoryTitle("");
      setShowAddCategory(false);
    }
  }, [addCategory, newCategoryTitle]);

  const handleUpdateCategory = useCallback(async () => {
    if (!editCategory?.key || !editCategory?.title.trim()) return;

    const success = await updateCategory(editCategory.key, editCategory.title);
    if (success) {
      setEditCategory(null);
    }
  }, [updateCategory, editCategory]);

  const handleDeleteCategory = useCallback(
    async (categoryKey) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this category? This will also delete all its options."
      );
      if (confirmed) {
        await deleteCategory(categoryKey);
      }
    },
    [deleteCategory]
  );

  const handleEditCategoryClick = useCallback((category) => {
    setEditCategory(category);
  }, []);

  const handleCancelEditCategory = useCallback(() => {
    setEditCategory(null);
  }, []);

  // Event handlers for options
  const handleAddOption = useCallback(async () => {
    if (!newOption.trim() || !selectedCategory) return;

    const success = await addOption(selectedCategory, newOption);
    if (success) {
      setNewOption("");
    }
  }, [addOption, newOption, selectedCategory]);

  const handleUpdateOption = useCallback(async () => {
    if (!editOption?.id || !editOption?.value.trim()) return;

    const success = await updateOption(
      selectedCategory,
      editOption.id,
      editOption.value
    );
    if (success) {
      setEditOption(null);
    }
  }, [updateOption, selectedCategory, editOption]);

  const handleDeleteOption = useCallback(
    async (optionId) => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this option?"
      );
      if (confirmed) {
        await deleteOption(selectedCategory, optionId);
      }
    },
    [deleteOption, selectedCategory]
  );

  const handleEditOptionClick = useCallback((option) => {
    setEditOption(option);
  }, []);

  const handleCancelEditOption = useCallback(() => {
    setEditOption(null);
  }, []);

  // Tab and navigation handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleCategorySelect = useCallback((categoryKey) => {
    setSelectedCategory(categoryKey);
  }, []);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleRefresh = useCallback(() => {
    refreshOptions();
  }, [refreshOptions]);

  // Keyboard event handlers
  const handleCategoryKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleAddCategory();
      }
    },
    [handleAddCategory]
  );

  const handleOptionKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleAddOption();
      }
    },
    [handleAddOption]
  );

  const handleEditCategoryKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleUpdateCategory();
      }
    },
    [handleUpdateCategory]
  );

  const handleEditOptionKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleUpdateOption();
      }
    },
    [handleUpdateOption]
  );

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRefresh}
        title="Error Loading Options"
      />
    );
  }

  // Loading state
  if (loading) {
    return <LoadingSpinner size="lg" text="Loading options..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-1">
          <PageTitle
            pageTitle="Options Manager"
            className="text-2xl sm:text-3xl font-bold text-gray-900"
            description="Manage your menu categories and their available options"
          />

          {activeTab === "categories" && (
            <PrimaryButton
              onAdd={handleAddCategoryClick}
              btnText="Add Category"
              loading={submitting}
            />
          )}
        </div>

        {/* Stats Cards */}
        {hasCategories && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Tag}
              title="Total Categories"
              value={stats.totalCategories}
              color="blue"
            />
            <StatCard
              icon={Settings}
              title="Total Options"
              value={stats.totalOptions}
              color="green"
            />
            <StatCard
              icon={Grid}
              title="Categories with Options"
              value={stats.categoriesWithOptions}
              color="orange"
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Options/Category"
              value={stats.avgOptionsPerCategory}
              color="purple"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => handleTabChange("categories")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === "categories"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center justify-center">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Manage Categories
              </div>
            </button>
            <button
              onClick={() => handleTabChange("options")}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === "options"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              <div className="flex items-center justify-center">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Manage Options
              </div>
            </button>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {showAddCategory && (
              <div className="p-6 border-b border-gray-200 bg-orange-50">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    placeholder="Enter category title (e.g., Spice Levels)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    onKeyPress={handleCategoryKeyPress}
                    disabled={submitting}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryTitle.trim() || submitting}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryTitle("");
                      }}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6">
              {categoriesArray.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title="No Categories Yet"
                  description="Add your first category to get started with organizing your menu options!"
                  actionLabel="Add Your First Category"
                  onAction={handleAddCategoryClick}
                  loading={submitting}
                />
              ) : (
                <div className="space-y-4">
                  {categoriesArray.map((category) => (
                    <div
                      key={category.key}
                      className="bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                    >
                      {editCategory?.key === category.key ? (
                        <div className="p-6">
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
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                              onKeyPress={handleEditCategoryKeyPress}
                              disabled={submitting}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateCategory}
                                disabled={submitting}
                                className="px-4 py-3 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-300 disabled:opacity-50"
                              >
                                {submitting ? (
                                  <LoaderCircle className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                onClick={handleCancelEditCategory}
                                className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                                disabled={submitting}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-6">
                          <div className="flex items-center flex-1 min-w-0">
                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-gray-800 text-base block truncate">
                                {category.title}
                              </span>
                              <span className="text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded-full inline-block mt-1">
                                {category.options
                                  ? Object.keys(category.options).length
                                  : 0}{" "}
                                options
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => handleEditCategoryClick(category)}
                              className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                              disabled={submitting}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.key)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                              disabled={submitting}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options Tab */}
        {activeTab === "options" && (
          <div className="space-y-6">
            {!hasCategories ? (
              <EmptyState
                icon={Tag}
                title="No Categories Available"
                description="Please create some categories first before adding options to them."
                actionLabel="Go to Categories"
                onAction={() => handleTabChange("categories")}
              />
            ) : (
              <>
                {/* Category Selector */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Category to Manage Options
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    disabled={submitting}
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
                {selectedCategory && selectedCategoryData && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <Settings className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            Options for "{selectedCategoryData.title}"
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Manage available options for this category
                          </p>
                        </div>
                      </div>

                      {/* Add Option */}
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            placeholder="Enter new option..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                            onKeyPress={handleOptionKeyPress}
                            disabled={submitting}
                          />
                          <button
                            onClick={handleAddOption}
                            disabled={!newOption.trim() || submitting}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            {submitting ? (
                              <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Plus className="w-4 h-4 mr-2" />
                            )}
                            Add Option
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="p-6">
                      {!selectedCategoryData.options ||
                      Object.keys(selectedCategoryData.options).length === 0 ? (
                        <EmptyState
                          icon={List}
                          title="No Options Yet"
                          description="Add your first option using the form above!"
                        />
                      ) : (
                        <div className="space-y-3">
                          {Object.values(selectedCategoryData.options).map(
                            (opt) => (
                              <div
                                key={opt.id}
                                className="bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                              >
                                {editOption?.id === opt.id ? (
                                  <div className="p-4">
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
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                                        onKeyPress={handleEditOptionKeyPress}
                                        disabled={submitting}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={handleUpdateOption}
                                          disabled={submitting}
                                          className="px-4 py-3 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-300 disabled:opacity-50"
                                        >
                                          {submitting ? (
                                            <LoaderCircle className="w-4 h-4 animate-spin" />
                                          ) : (
                                            "Save"
                                          )}
                                        </button>
                                        <button
                                          onClick={handleCancelEditOption}
                                          className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                                          disabled={submitting}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center flex-1 min-w-0">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                                      <span className="font-medium text-gray-800 truncate">
                                        {opt.value}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                      <button
                                        onClick={() =>
                                          handleEditOptionClick(opt)
                                        }
                                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                                        disabled={submitting}
                                      >
                                        <Settings className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteOption(opt.id)
                                        }
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                        disabled={submitting}
                                      >
                                        <AlertCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
});

AddOption.displayName = "AddOption";

export default AddOption;
