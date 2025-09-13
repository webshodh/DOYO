import React, { memo } from "react";
import EmptyState from "atoms/Messages/EmptyState";
import { LoaderCircle, Plus, Search } from "lucide-react";

// No search results component
const NoSearchResults = memo(
  ({ searchTerm, onClearSearch, onAddNew, btnText }) => (
    <EmptyState
      icon={Search}
      title="No Captains Found"
      description={`No captains match your search for "${searchTerm}". Try adjusting your search terms or add a new captain.`}
      className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
    >
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LoaderCircle className="w-4 h-4" />
          Clear Search
        </button>

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {btnText}
        </button>
      </div>
    </EmptyState>
  )
);

NoSearchResults.displayName = "NoSearchResults";
export default NoSearchResults;
