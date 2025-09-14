// components/checkout/TableNumberInput.jsx
import { AlertCircle } from "lucide-react";

const TableNumberInput = ({
  tableNumber,
  onTableNumberChange,
  error,
  label = "Table Number *",
  placeholder = "Enter table number",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Table Information
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
            min="1"
            required
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableNumberInput;
