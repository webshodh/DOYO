import React, { useState, useMemo } from "react";
import "../styles/Table.css"; // Import the CSS for styling
import Pagination from "../Atoms/Pagination";
import AlertMessage from "../Atoms/AlertMessage";
import { FaEdit, FaTrash } from "react-icons/fa";
import CardTitle from "../Atoms/CardTitle";

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
    <div className="table-container form-container">
      {title && (
        <CardTitle title={title}/>
      )}
      {/* Search Input and Filters */}
      <div className="">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="col-md-5" style={{ marginRight: "20px" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control search-input"
          />
        </div>
        <div className="col-md-7">
          <div className="filter-container d-flex align-items-center">
            {columns.map((column, index) =>
              column.accessor !== "srNo" &&
              column.accessor !== "menuName" &&
              column.accessor !== "menuPrice" &&
              column.accessor !== "menuCategoryCount" &&
              column.accessor !== "totalMenuPrice" &&
              column.accessor !== "price" &&
              column.accessor !== "menuCount" &&
              column.accessor !== "name" &&
              column.accessor !== "totalOrders" 
              
     
               ? (
                <div key={index} className="filter-item">
                  <label htmlFor={`filter-${column.accessor}`} className="mr-2">
                    {column.header}:
                  </label>
                  <select
                    id={`filter-${column.accessor}`}
                    value={filters[column.accessor] || ""}
                    onChange={(e) => handleFilterChange(e, column.accessor)}
                    className="form-select form-select-sm"
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
      </div>

      {/* Table Section */}
      <div className="table-responsive ">
        {currentData.length > 0 ? (
          <table className="table table-bordered table-striped table-hover">
            <thead className="thead-dark">
              <tr className="table-primary">
                {columns.map((column, index) => (
                  <th key={index}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {column.accessor === "actions" ? (
                        <div>
                          <button
                            style={{
                              color: "blue",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                            }}
                            onClick={() => onEdit(row)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            style={{
                              color: "red",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                            }}
                            onClick={() => onDelete(row.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ) : (
                        row[column.accessor] || "N/A" // Default to "N/A" if data is missing
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert-container">
            <AlertMessage message="No data available" type="warning" />
          </div>
        )}
      </div>

      {/* Pagination and Rows Per Page Selector */}
      <div className="row mt-4 align-items-center">
        <div className="col-md-3 d-flex justify-content-start">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="col-md-9 d-flex align-items-center">
          <label htmlFor="rowsPerPage" className="mr-2 mb-0 pagination-label">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            className="form-control form-control-sm pagination-label-input"
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
    </div>
  );
};

export default Table;
