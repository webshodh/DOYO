import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  forwardRef,
} from "react";
import {
  Edit,
  Trash2,
  Check,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Image as ImageIcon,
  AlertCircle,
  Loader,
  Eye,
  Printer, // Added Printer icon
} from "lucide-react";
import usePagination from "hooks/usePagination";

// Image cell component with error handling
const ImageCell = memo(
  ({ src, alt = "Item image", className = "w-12 h-12" }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
    }, []);

    if (!src) {
      return (
        <div
          className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}
        >
          <ImageIcon className="w-4 h-4 text-gray-400" />
        </div>
      );
    }

    return (
      <div
        className={`relative ${className} rounded-lg overflow-hidden bg-gray-100`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-gray-400" />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        )}
      </div>
    );
  },
);

ImageCell.displayName = "ImageCell";

// Action button component
const ActionButton = memo(
  ({
    onClick,
    icon: Icon,
    variant = "primary",
    size = "sm",
    disabled = false,
    loading = false,
    children,
    ariaLabel,
    className = "",
  }) => {
    const variants = {
      primary: "bg-blue-500 hover:bg-blue-600 text-white",
      success: "bg-green-500 hover:bg-green-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
      warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
      secondary: "bg-gray-500 hover:bg-gray-600 text-white",
      print: "bg-purple-500 hover:bg-purple-600 text-white", // Added print variant
    };

    const sizes = {
      xs: "p-1",
      sm: "p-2",
      md: "px-3 py-2",
      lg: "px-4 py-2",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`inline-flex items-center gap-1 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        aria-label={ariaLabel}
      >
        {loading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
      </button>
    );
  },
);

ActionButton.displayName = "ActionButton";

// Actions cell component - Updated to include print functionality
const ActionsCell = memo(
  ({
    item,
    onEdit,
    onDelete,
    onAccept,
    onReject,
    onMarkAsCompleted,
    onView,
    onPrint, // Added onPrint prop
    customActions = [],
    showLabels = false,
  }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const allActions = [
      onView && {
        label: "View",
        icon: Eye,
        onClick: () => onView(item),
        variant: "secondary",
      },
      onEdit && {
        label: "Edit",
        icon: Edit,
        onClick: () => onEdit(item),
        variant: "primary",
      },
      onPrint && {
        // Added print action
        label: "Print",
        icon: Printer,
        onClick: () => onPrint(item),
        variant: "print",
      },
      onAccept && {
        label: "Accept",
        icon: Check,
        onClick: () => onAccept(item),
        variant: "success",
      },
      onReject && {
        label: "Reject",
        icon: X,
        onClick: () => onReject(item),
        variant: "danger",
      },
      onMarkAsCompleted && {
        label: "Complete",
        icon: CheckCircle,
        onClick: () => onMarkAsCompleted(item),
        variant: "success",
      },
      onDelete && {
        label: "Delete",
        icon: Trash2,
        onClick: () => onDelete(item),
        variant: "danger",
      },
      ...customActions,
    ].filter(Boolean);

    if (allActions.length === 0) return null;

    // Show first 3 actions directly, rest in dropdown
    const visibleActions = allActions.slice(0, 3);
    const hiddenActions = allActions.slice(3);

    return (
      <div className="flex items-center gap-1 relative">
        {visibleActions.map((action, index) => (
          <ActionButton
            key={index}
            onClick={action.onClick}
            icon={action.icon}
            variant={action.variant}
            ariaLabel={action.label}
            className="flex-shrink-0"
          >
            {showLabels && (
              <span className="hidden sm:inline text-xs">{action.label}</span>
            )}
          </ActionButton>
        ))}

        {hiddenActions.length > 0 && (
          <div className="relative">
            <ActionButton
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              icon={MoreHorizontal}
              variant="secondary"
              ariaLabel="More actions"
            />

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-32">
                {hiddenActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

ActionsCell.displayName = "ActionsCell";

// Pagination component
const Pagination = memo(
  ({ currentPage, totalPages, onPageChange, className = "" }) => {
    const getVisiblePages = useMemo(() => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

    return (
      <nav
        className={`flex items-center gap-1 ${className}`}
        aria-label="Pagination"
      >
        <ActionButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          icon={ChevronsLeft}
          variant="secondary"
          ariaLabel="Go to first page"
        />

        <ActionButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={ChevronLeft}
          variant="secondary"
          ariaLabel="Go to previous page"
        />

        {getVisiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? "bg-orange-500 text-white"
                : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            {page}
          </button>
        ))}

        <ActionButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={ChevronRight}
          variant="secondary"
          ariaLabel="Go to next page"
        />

        <ActionButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          icon={ChevronsRight}
          variant="secondary"
          ariaLabel="Go to last page"
        />
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";

// Table header component
const TableHeader = memo(
  ({ columns, hasActions, onSort, sortConfig, className = "" }) => (
    <thead
      className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white ${className}`}
    >
      <tr>
        {/* Table header */}
        {Array.isArray(columns) &&
          columns.map((column, index) => (
            <th
              key={index}
              className={`text-left px-6 py-4 text-sm font-semibold tracking-wider ${
                column.sortable ? "cursor-pointer hover:bg-orange-600" : ""
              }`}
              onClick={
                column.sortable ? () => onSort?.(column.accessor) : undefined
              }
            >
              {column.sortable && sortConfig?.field === column.accessor && (
                <span className="text-orange-200">
                  {sortConfig?.direction === "asc" ? "↑" : "↓"}
                </span>
              )}
            </th>
          ))}
        {hasActions && (
          <th className="text-left px-6 py-4 text-sm font-semibold tracking-wider">
            Actions
          </th>
        )}
      </tr>
    </thead>
  ),
);

TableHeader.displayName = "TableHeader";

// Main DynamicTable component - Updated to include print functionality
const DynamicTable = memo(
  forwardRef(
    (
      {
        // Data props
        columns = [],
        data = [],

        // Action handlers
        onEdit,
        onDelete,
        onAccept,
        onReject,
        onMarkAsCompleted,
        onView,
        onPrint, // Added onPrint prop
        customActions = [],

        // Table configuration
        initialRowsPerPage = 10,
        rowsPerPageOptions = [5, 10, 15, 20, 25, 50],
        showPagination = true,
        showRowsPerPage = true,

        // Styling
        className = "",
        headerClassName = "",
        bodyClassName = "",
        rowClassName = "",

        // Features
        sortable = false,
        loading = false,
        emptyMessage = "No data available",
        showLabelsOnActions = false,

        // Events
        onRowClick,
        onSort,

        // Row highlighting function
        highlightRows,

        // Additional props
        testId,
        ...rest
      },
      ref,
    ) => {
      const {
        currentPage,
        totalPages,
        rowsPerPage,
        paginatedData,
        goToPage,
        changeRowsPerPage,
      } = usePagination(data, initialRowsPerPage);

      const [sortConfig, setSortConfig] = useState(null);

      // Handle sorting
      const handleSort = useCallback(
        (field) => {
          if (!sortable || !onSort) return;

          let direction = "asc";
          if (sortConfig?.field === field && sortConfig.direction === "asc") {
            direction = "desc";
          }

          const newSortConfig = { field, direction };
          setSortConfig(newSortConfig);
          onSort(newSortConfig);
        },
        [sortConfig, sortable, onSort],
      );

      // Check if table has actions - Updated to include onPrint
      const hasActions = useMemo(
        () =>
          !!(
            onEdit ||
            onDelete ||
            onAccept ||
            onReject ||
            onMarkAsCompleted ||
            onView ||
            onPrint || // Added onPrint check
            customActions.length > 0
          ),
        [
          onEdit,
          onDelete,
          onAccept,
          onReject,
          onMarkAsCompleted,
          onView,
          onPrint, // Added onPrint dependency
          customActions,
        ],
      );

      // Handle row click
      const handleRowClick = useCallback(
        (item, event) => {
          if (onRowClick && !event.target.closest("button")) {
            onRowClick(item);
          }
        },
        [onRowClick],
      );

      if (loading) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-gray-600">Loading data...</span>
            </div>
          </div>
        );
      }

      return (
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
          ref={ref}
          data-testid={testId}
          {...rest}
        >
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <TableHeader
                columns={columns}
                hasActions={hasActions}
                onSort={handleSort}
                sortConfig={sortConfig}
                className={headerClassName}
              />

              <tbody
                className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}
              >
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr
                      key={item.uuid || item.id || item._id || index}
                      onClick={(e) => handleRowClick(item, e)}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        onRowClick ? "cursor-pointer" : ""
                      } ${
                        highlightRows ? highlightRows(item) : ""
                      } ${rowClassName}`}
                    >
                      {/* Table rows */}
                      {Array.isArray(columns) &&
                        columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {column.render ? (
                              column.render(item[column.accessor], item, index)
                            ) : ["image", "img", "Img"].includes(
                                column.accessor,
                              ) ? (
                              <ImageCell
                                src={item[column.accessor]}
                                alt={`${item.name || "Item"} image`}
                              />
                            ) : (
                              (item[column.accessor] ?? "-")
                            )}
                          </td>
                        ))}

                      {hasActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <ActionsCell
                            item={item}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAccept={onAccept}
                            onReject={onReject}
                            onMarkAsCompleted={onMarkAsCompleted}
                            onView={onView}
                            onPrint={onPrint} // Added onPrint prop
                            customActions={customActions}
                            showLabels={showLabelsOnActions}
                          />
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + (hasActions ? 1 : 0)}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <span>{emptyMessage}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with pagination */}
          {showPagination && data.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span>
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, data.length)} of{" "}
                  {data.length} entries
                </span>

                {showRowsPerPage && (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="rowsPerPage"
                      className="text-sm text-gray-600"
                    >
                      Rows per page:
                    </label>
                    <select
                      id="rowsPerPage"
                      value={rowsPerPage}
                      onChange={(e) =>
                        changeRowsPerPage(Number(e.target.value))
                      }
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {rowsPerPageOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      );
    },
  ),
);

DynamicTable.displayName = "DynamicTable";

// Default props - Updated to include onPrint
DynamicTable.defaultProps = {
  columns: [],
  data: [],
  initialRowsPerPage: 10,
  rowsPerPageOptions: [5, 10, 15, 20, 25, 50],
  showPagination: true,
  showRowsPerPage: true,
  loading: false,
  emptyMessage: "No data available",
  showLabelsOnActions: false,
  sortable: false,
  customActions: [],
};

export default DynamicTable;
