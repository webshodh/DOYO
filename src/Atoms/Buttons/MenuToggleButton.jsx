import { memo } from "react";

// Menu toggle button component
const MenuToggleButton = memo(({ onToggle, isOpen }) => (
  <button
    onClick={onToggle}
    className="lg:hidden p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
    aria-label={isOpen ? "Close menu" : "Open menu"}
    aria-expanded={isOpen}
  >
    <div className="relative w-6 h-6">
      <span
        className={`absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ${
          isOpen ? "rotate-45 top-3" : "top-1"
        }`}
      />
      <span
        className={`absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ${
          isOpen ? "opacity-0" : "top-3"
        }`}
      />
      <span
        className={`absolute block w-6 h-0.5 bg-gray-600 transform transition-all duration-300 ${
          isOpen ? "-rotate-45 top-3" : "top-5"
        }`}
      />
    </div>
  </button>
));
MenuToggleButton.displayName = "MenuToggleButton";
export default MenuToggleButton;
