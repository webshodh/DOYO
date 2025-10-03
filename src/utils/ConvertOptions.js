/**
 * Convert database response into simplified options object
 * Format: { categoryName: ["option1", "option2", ...] }
 *
 * @param {Object} optionsData - Raw data from DB
 * @returns {Object} - Object with categories and option names only
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}
export function simplifyOptions(optionsData) {
  if (!optionsData || typeof optionsData !== "object") {
    return {};
  }

  const simplified = {};

  Object.keys(optionsData).forEach((category) => {
    if (!Array.isArray(optionsData[category])) return;

    // Convert snake_case → camelCase for key
    const categoryName = toCamelCase(category);

    // Extract only the option names (value field)
    const optionNames = optionsData[category]
      .filter((item) => item && item.value) // remove invalid
      .map((item) => item.value); // take only name

    if (optionNames.length > 0) {
      simplified[categoryName] = optionNames;
    }
  });

  return simplified;
}
