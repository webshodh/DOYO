import React, { useState, useEffect } from "react";

const DynamicTable = ({ columns, data, onEdit, onDelete, actions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [paginatedData, setPaginatedData] = useState([]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    setPaginatedData(data.slice(startIndex, endIndex));
  }, [data, currentPage, rowsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-orange-500 text-white">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="text-left px-6 py-3 text-sm font-medium tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete || actions) && (
              <th className="text-left px-6 py-3 text-sm font-medium tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <tr
                key={index}
                className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-700"
                  >
                    {item[column.accessor]}
                  </td>
                ))}
                {(onEdit || onDelete || actions) && (
                  <td className="px-6 py-4 text-sm text-gray-700 flex space-x-2">
                    {onEdit && (
                      <button
                        className="btn btn-info text-white hover:text-blue-800 transition-colors"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-danger text-white hover:text-red-800 transition-colors"
                        onClick={() => onDelete(item)}
                      >
                        Delete
                      </button>
                    )}
                    {actions &&
                      actions.length > 0 &&
                      actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className={`text-${action.variant}-600 hover:text-${action.variant}-800 transition-colors`}
                          onClick={() => action.handler(item)}
                        >
                          {action.label}
                        </button>
                      ))}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-6 py-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center py-4">
        {/* Pagination Buttons */}
        <div className="flex space-x-2" style={{marginRight:'10px'}}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        {/* Rows Per Page Selector */}
        <div>
          <label htmlFor="rowsPerPage" className="text-sm text-gray-700">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing rows per page
            }}
            className="ml-2 border border-gray-300 rounded p-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
