import React, { useState, useMemo } from "react";
import Pagination from "../Atoms/Pagination";
import AlertMessage from "../Atoms/AlertMessage";
import { FaEdit, FaTrash } from "react-icons/fa";
import CardTitle from "../Atoms/CardTitle";
import { colors } from "theme/theme";

const Table = ({ title, columns, data, onEdit, onDelete }) => {
  // State to manage selected filters
  const [filters, setFilters] = useState(
    columns.reduce((acc, column) => {
      acc[column.accessor] = "";
      return acc;
    }, {})
  );

  // State to manage unique values for dropdown filters
  const [uniqueValues, setUniqueValues] = useState({});

  // State to manage the search query
  const [searchQuery, setSearchQuery] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Extract unique values for each column
  useMemo(() => {
    const values = columns.reduce((acc, column) => {
      acc[column.accessor] = [
        ...new Set(data.map((row) => row[column.accessor])),
      ];
      return acc;
    }, {});
    setUniqueValues(values);
  }, [data, columns]);

  // Handle filter change from dropdown
  const handleFilterChange = (e, accessor) => {
    setFilters({ ...filters, [accessor]: e.target.value });
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  // Filter data based on selected filters and search query
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesFilters = columns.every((column) => {
        const filterValue = filters[column.accessor] || "";
        const cellValue = row[column.accessor] || "";
        return filterValue === "" || cellValue.toString().includes(filterValue);
      });

      const matchesSearch = columns.some((column) => {
        const cellValue = row[column.accessor] || "";
        return cellValue
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });

      return matchesFilters && matchesSearch;
    });
  }, [data, filters, columns, searchQuery]);

  // Calculate total pages based on filtered data and rows per page
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  return (
    <div className="container mx-auto p-4">
      {title && (
        <CardTitle title={title} />
      )}
      {/* Search Input and Filters */}
      <div className="flex  mb-4 gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-input w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-wrap gap-4">
          {columns.map((column, index) =>
            !["srNo", "menuName", "menuPrice", "menuCategoryCount", "totalMenuPrice", "price", "menuCount", "name", "totalOrders"].includes(column.accessor) ? (
              <div key={index} className="flex items-center gap-2">
                <label htmlFor={`filter-${column.accessor}`} className="text-sm font-medium">
                  {column.header}:
                </label>
                <select
                  id={`filter-${column.accessor}`}
                  value={filters[column.accessor] || ""}
                  onChange={(e) => handleFilterChange(e, column.accessor)}
                  className="form-select w-full md:w-48 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All</option>
                  {uniqueValues[column.accessor]?.map((value, idx) => (
                    <option key={idx} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        {currentData.length > 0 ? (
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead className="bg-orange-500 text-white">
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="px-6 py-3 text-left text-sm font-medium">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-gray-50 hover:bg-gray-100">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                      {column.accessor === "actions" ? (
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => onEdit(row)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => onDelete(row.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                        row[column.accessor] || "N/A"
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4">
            <AlertMessage message="No data available" type="warning" />
          </div>
        )}
      </div>

      {/* Pagination and Rows Per Page Selector */}
      <div className="flex flex-wrap mt-4 items-center gap-4">
        <div className="flex-1">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="rowsPerPage" className="text-sm font-medium">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            className="form-select px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Table;
