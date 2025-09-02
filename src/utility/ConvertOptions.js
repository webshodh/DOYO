// optionsConverter.js - Complete solution for converting database response to OPTIONS format

import useOptionsData from "data/useOptionsData";

/**
 * Convert database response to OPTIONS format
 * @param {Object} optionsData - Raw data from useOptionsData hook
 * @returns {Object} - Formatted OPTIONS object
 */
export function convertToOptions(optionsData) {
  if (!optionsData || typeof optionsData !== 'object') {
    return {};
  }

  const options = {};
  
  // Iterate through each category in the database response
  Object.keys(optionsData).forEach(category => {
    // Skip if the value is not an array
    if (!Array.isArray(optionsData[category])) {
      return;
    }
    
    // Convert category name to camelCase
    const categoryName = toCamelCase(category);
    
    // Extract values from the array and sort by createdAt (oldest first)
    const sortedItems = optionsData[category]
      .filter(item => item && item.value) // Filter out invalid items
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .map(item => item.value);
    
    // Only add non-empty arrays
    if (sortedItems.length > 0) {
      options[categoryName] = sortedItems;
    }
  });
  
  return options;
}

/**
 * Helper function to convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} - CamelCase string
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Generate export statement string
 * @param {Object} optionsData - Raw data from database
 * @returns {string} - Ready-to-use export statement
 */
export function generateOptionsExport(optionsData) {
  const options = convertToOptions(optionsData);
  
  if (Object.keys(options).length === 0) {
    return 'export const OPTIONS = {};';
  }
  
  let exportString = 'export const OPTIONS = {\n';
  
  const categories = Object.keys(options);
  
  categories.forEach((category, index) => {
    // Add comment for category
    const categoryComment = category
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    exportString += `  // ${categoryComment}\n`;
    
    // Add the array
    exportString += `  ${category}: [\n`;
    options[category].forEach((value, valueIndex) => {
      const comma = valueIndex < options[category].length - 1 ? ',' : '';
      exportString += `    "${value}"${comma}\n`;
    });
    exportString += '  ]';
    
    // Add comma if not the last category
    if (index < categories.length - 1) {
      exportString += ',';
    }
    exportString += '\n\n';
  });
  
  exportString += '};';
  return exportString;
}

/**
 * Get options for a specific category
 * @param {Object} optionsData - Raw data from database
 * @param {string} categoryName - Category name (snake_case or camelCase)
 * @returns {Array} - Array of option values
 */
export function getCategoryOptions(optionsData, categoryName) {
  if (!optionsData || !categoryName) {
    return [];
  }
  
  // Try both original name and snake_case conversion
  const originalCategory = optionsData[categoryName];
  const snakeCaseCategory = optionsData[toSnakeCase(categoryName)];
  
  const categoryData = originalCategory || snakeCaseCategory;
  
  if (!Array.isArray(categoryData)) {
    return [];
  }
  
  return categoryData
    .filter(item => item && item.value)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    .map(item => item.value);
}

/**
 * Helper function to convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} - snake_case string
 */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * React Hook for using converted options data
 * @param {string} hotelName - Hotel name parameter
 * @returns {Object} - Converted options and metadata
 */
export function useConvertedOptions(hotelName) {
  const {
    optionsData,
    totalOptionsCount,
    categories,
    optionTypes,
    error
  } = useOptionsData(hotelName);
  
  // Convert raw data to OPTIONS format
  const OPTIONS = convertToOptions(optionsData);
  
  // Generate export string if needed
  const exportString = generateOptionsExport(optionsData);
  
  return {
    OPTIONS,
    exportString,
    optionsData,
    totalOptionsCount,
    categories,
    optionTypes,
    error,
    // Additional helper methods
    getCategoryOptions: (categoryName) => getCategoryOptions(optionsData, categoryName),
    hasCategory: (categoryName) => {
      const camelCase = toCamelCase(categoryName);
      const snakeCase = toSnakeCase(categoryName);
      return OPTIONS[camelCase] || OPTIONS[snakeCase] || false;
    }
  };
}