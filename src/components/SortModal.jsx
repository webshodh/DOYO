import { Check, SortAsc, SortDesc, X } from "lucide-react";
import { memo, useCallback, useMemo, useRef } from "react";
import useOutsideClick from "../hooks/useOutsideClick";
// Sort Modal Component
const SortModal = memo(({ isOpen, onClose, currentSort, onSort }) => {
  const modalRef = useRef(null);

  useOutsideClick(modalRef, onClose);

  const sortOptions = useMemo(
    () => [
      { key: "default", label: "Default", icon: null },
      { key: "lowToHigh", label: "Price: Low to High", icon: SortAsc },
      { key: "highToLow", label: "Price: High to Low", icon: SortDesc },
    ],
    [],
  );

  const handleSortSelect = useCallback(
    (sortKey) => {
      if (onSort) {
        onSort(sortKey);
      }
      onClose();
    },
    [onSort, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>

        <div
          ref={modalRef}
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full mt-5"
        >
          <div className="bg-white px-4 pt-8 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sort By Price
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSortSelect(option.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors ${
                    currentSort === option.key
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && <option.icon className="w-4 h-4" />}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {currentSort === option.key && (
                    <Check className="w-4 h-4 text-orange-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

SortModal.displayName = "SortModal";
export default SortModal;
