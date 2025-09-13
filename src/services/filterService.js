// services/filterService.js
import { specialCategories } from "../Constants/addMenuFormConfig";

class FilterService {
  filterAndSortMenus(menus = [], filters = {}) {
    if (!Array.isArray(menus) || menus.length === 0) {
      return [];
    }

    let filtered = [...menus];

    // Apply search filter
    if (filters.searchTerm?.trim()) {
      filtered = this.applySearchFilter(filtered, filters.searchTerm);
    }

    // Apply category filters
    if (filters.selectedCategory) {
      filtered = this.applyCategoryFilter(filtered, filters.selectedCategory);
    }

    if (filters.selectedMainCategory) {
      filtered = this.applyMainCategoryFilter(
        filtered,
        filters.selectedMainCategory
      );
    }

    // Apply special filters
    if (filters.selectedSpecialFilters?.length > 0) {
      filtered = this.applySpecialFilters(
        filtered,
        filters.selectedSpecialFilters
      );
    }

    // Apply sorting
    return this.applySorting(filtered, filters.sortOrder);
  }

  applySearchFilter(menus = [], searchTerm = "") {
    const search = searchTerm.toLowerCase();
    return menus.filter(
      (menu) =>
        menu?.menuName?.toLowerCase()?.includes(search) ||
        menu?.menuDescription?.toLowerCase()?.includes(search)
    );
  }

  applyCategoryFilter(menus = [], category = "") {
    return menus.filter((menu) => menu?.menuCategory === category);
  }

  applyMainCategoryFilter(menus = [], mainCategory = "") {
    return menus.filter((menu) => menu?.mainCategory === mainCategory);
  }

  applySpecialFilters(menus = [], specialFilters = []) {
    return menus.filter((menu) =>
      specialFilters.every((filter) => menu?.[filter] === true)
    );
  }

  applySorting(menus = [], sortOrder = "default") {
    if (sortOrder === "lowToHigh") {
      return menus.sort(
        (a, b) =>
          parseFloat(a?.finalPrice || a?.menuPrice || 0) -
          parseFloat(b?.finalPrice || b?.menuPrice || 0)
      );
    }
    if (sortOrder === "highToLow") {
      return menus.sort(
        (a, b) =>
          parseFloat(b?.finalPrice || b?.menuPrice || 0) -
          parseFloat(a?.finalPrice || a?.menuPrice || 0)
      );
    }
    return menus;
  }

  getAvailableSpecialCategories(specialCategories = [], menus = []) {
    const counts = this.calculateSpecialCounts(menus);
    return specialCategories.filter(
      (category) => category?.name && counts[category.name] > 0
    );
  }

  calculateSpecialCounts(menus = []) {
    const counts = {};
    specialCategories.forEach((category) => {
      if (category?.name) {
        counts[category.name] = menus.filter(
          (menu) => menu?.[category.name] === true
        ).length;
      }
    });
    return counts;
  }

  hasActiveFilters(filters = {}) {
    return !!(
      filters.searchTerm ||
      filters.selectedCategory ||
      filters.selectedMainCategory ||
      filters.selectedSpecialFilters?.length > 0
    );
  }

  handleCategoryFilter(category = "", type = "") {
    if (type === "all" || category === "") {
      return { selectedCategory: "", selectedMainCategory: "" };
    }
    if (type === "main") {
      return { selectedCategory: "", selectedMainCategory: category };
    }
    return { selectedCategory: category, selectedMainCategory: "" };
  }
}

export const filterService = new FilterService();
