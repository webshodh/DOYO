const { Plus } = require("lucide-react");
const { memo } = require("react");

// Quick Actions component
const QuickActions = memo(({ onCreateOrder }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onCreateOrder}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Order
      </button>
    </div>
  </div>
));

QuickActions.displayName = "QuickActions";
export default QuickActions;
