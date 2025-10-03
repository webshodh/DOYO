// import React, { memo } from "react";
// import { Filter } from "lucide-react";
// import { FilterSortSearch } from "../../../components";

// const MenuHeader = memo(
//   ({
//     totalItems,
//     totalAmount,
//     isLoading,
//     filteredItemsCount,
//     searchTerm,
//     onSearch,
//     onSort,
//     showFilters,
//     onToggleFilters,
//     hasActiveFilters,
//     onClearFilters,
//     CartButtonComponent,
//   }) => (
//     <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
//       <div className="px-4 py-3">
//         {/* Top Header - Cart and Title */}
//         <div className="flex justify-between items-center mb-3">
//           <div>
//             <h1 className="text-lg sm:text-xl font-bold text-gray-800">
//               Captain Menu
//             </h1>
//             <p className="text-xs sm:text-sm text-gray-500">
//               {isLoading
//                 ? "Loading..."
//                 : `${filteredItemsCount} items available`}
//             </p>
//           </div>

//           {CartButtonComponent}
//         </div>

//         {/* Search Bar */}
//         <div className="mb-3">
//           <FilterSortSearch
//             searchTerm={searchTerm}
//             handleSearch={onSearch}
//             handleSort={onSort}
//           />
//         </div>

//         {/* Mobile Filter Toggle */}
//         <div className="flex items-center justify-between mb-3">
//           <button
//             onClick={onToggleFilters}
//             className="md:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
//           >
//             <Filter size={16} />
//             Filters
//             {hasActiveFilters && (
//               <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
//                 !
//               </span>
//             )}
//           </button>

//           {hasActiveFilters && (
//             <button
//               onClick={onClearFilters}
//               className="md:hidden text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
//             >
//               Clear All
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// );

// MenuHeader.displayName = "MenuHeader";
// export default MenuHeader;
