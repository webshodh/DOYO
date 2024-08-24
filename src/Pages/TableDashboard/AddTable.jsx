import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, onValue, update, set, remove } from "firebase/database";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import { uid } from "uid";
import { DynamicTable } from "../../components";
import { ViewTableColumns } from "../../data/Columns";

// Main AddTable component
function AddTable() {
  // State variables to handle table data, form inputs, and UI state
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableSection, setTableSection] = useState("");
  const [sections, setSections] = useState([]);
  const [tables, setTables] = useState([]);
  const [editMode, setEditMode] = useState(false); // To toggle between add and edit mode
  const [editedMenuId, setEditedMenuId] = useState(null); // To store the ID of the table being edited

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const { hotelName } = useHotelContext();

  // Additional state variables for filtering, searching, and sorting tables
  const [selectedSection, setSelectedSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [tableCountsBySection, setTableCountsBySection] = useState({});

  // Fetch table data from Firebase when the component mounts or when hotelName/adminID changes
  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/tables`),
      (snapshot) => {
        setTables([]);
        const data = snapshot.val();
        if (data !== null) {
          setTables(Object.values(data));
        }
      }
    );
  }, [hotelName, adminID]);

  // Fetch sections data from Firebase when the component mounts or when hotelName/adminID changes
  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/sections`),
      (snapshot) => {
        setSections([]);
        const data = snapshot.val();
        if (data !== null) {
          setSections(Object.values(data));
        }
      }
    );
  }, [hotelName, adminID]);

  // Calculate the number of tables in each section
  useEffect(() => {
    const countsBySection = {};
    tables.forEach((table) => {
      const section = table.tableSection;
      countsBySection[section] = (countsBySection[section] || 0) + 1;
    });

    setTableCountsBySection(countsBySection);
  }, [tables]);

  // Handlers for input fields
  const handleTableNameChange = (e) => setTableName(e.target.value);
  const handleTableCapacityChange = (e) => setTableCapacity(e.target.value);
  const handleTableSectionChange = (e) => setTableSection(e.target.value);

  // Function to write (add/update) table data to Firebase
  const writeToDatabase = () => {
    if (editMode) {
      // If in edit mode, update the existing table
      update(
        ref(
          db,
          `/admins/${adminID}/hotels/${hotelName}/tables/${editedMenuId}`
        ),
        {
          tableName,
          tableCapacity,
          tableSection,
          uuid: editedMenuId,
        }
      );
      setEditMode(false); // Exit edit mode after updating
      setEditedMenuId(null);
      toast.success("Table Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      // If not in edit mode, add a new table
      const newTableId = uid(); // Generate a unique ID for the new table
      set(
        ref(db, `/admins/${adminID}/hotels/${hotelName}/tables/${newTableId}`),
        {
          tableName,
          tableCapacity,
          tableSection,
          uuid: newTableId,
        }
      );
      toast.success("Table Added Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    // Clear form fields after adding/updating the table
    setTableName("");
    setTableCapacity("");
    setTableSection("");
  };

  // Function to populate form fields when editing an existing table
  const handleEditTable = (tableId) => {
    const selectedTable = tables.find((table) => table.uuid === tableId);
    setTableName(selectedTable.tableName);
    setTableCapacity(selectedTable.tableCapacity);
    setTableSection(selectedTable.tableSection);
    setEditMode(true); // Enter edit mode
    setEditedMenuId(tableId); // Store the ID of the table being edited
  };

  // Function to delete a table from Firebase
  const handleDeleteTable = (tableId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this table?"
    );
    if (confirmDelete) {
      // Delete the table from Firebase
      remove(
        ref(db, `/admins/${adminID}/hotels/${hotelName}/tables/${tableId}`)
      );
      toast.success("Table Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  // Function to handle search input
  const handleSearch = (e) => setSearchTerm(e.target.value);

  // Function to filter and sort tables based on search term, selected section, and sort order
  const filterAndSortItems = () => {
    let filteredItems = tables.filter((table) =>
      table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedSection !== "") {
      filteredItems = filteredItems.filter(
        (table) =>
          table.tableSection.toLowerCase() === selectedSection.toLowerCase()
      );
    }

    // Sort by table capacity if sort order is specified
    if (sortOrder === "lowToHigh") {
      filteredItems.sort(
        (a, b) => parseFloat(a.tableCapacity) - parseFloat(b.tableCapacity)
      );
    } else if (sortOrder === "highToLow") {
      filteredItems.sort(
        (a, b) => parseFloat(b.tableCapacity) - parseFloat(a.tableCapacity)
      );
    }

    return filteredItems;
  };

  // Get the filtered and sorted table items
  const filteredAndSortedItems = filterAndSortItems();

  // Function to filter tables by section
  const handleCategoryFilter = (section) => setSelectedSection(section);

  // Prepare data for the DynamicTable component
  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    SectionName: item.tableSection || "Other",
    TableName: item.tableName,
    Capacity: item.tableCapacity,
    Actions: (
      <>
        <button
          className="btn btn-primary btn-sm mr-2"
          onClick={() => handleEditTable(item.uuid)} // Edit button functionality
        >
          <img src="/update.png" width="20" height="20" alt="Update" />
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDeleteTable(item.uuid)} // Delete button functionality
        >
          <img src="/delete.png" width="20" height="20" alt="Delete" />
        </button>
      </>
    ),
  }));

  // Table columns definition (imported from a separate file)
  const columns = ViewTableColumns;

  return (
    <>
      {/* Form to add or edit tables */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Table Name Input */}
          <div className="relative">
            <label htmlFor="TableName" className="block font-semibold mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={handleTableNameChange}
              id="TableName"
              className={`w-full p-3 border rounded-md ${
                !tableName ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 ${
                !tableName ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
              placeholder="Enter Table Name"
            />
            {/* Validation icons */}
            {tableName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                <FaCheckCircle />
              </div>
            )}
            {!tableName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                <FaExclamationCircle />
              </div>
            )}
            {/* Validation message */}
            {!tableName && (
              <p className="text-red-500 text-sm mt-1">
                Table Name is required.
              </p>
            )}
          </div>

          {/* Table Capacity Input */}
          <div className="relative">
            <label htmlFor="TableCapacity" className="block font-semibold mb-2">
              Table Capacity
            </label>
            <input
              type="number"
              value={tableCapacity}
              onChange={handleTableCapacityChange}
              id="TableCapacity"
              className={`w-full p-3 border rounded-md ${
                !tableCapacity ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 ${
                !tableCapacity ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
              placeholder="Enter Table Capacity"
            />
            {/* Validation icons */}
            {tableCapacity && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                <FaCheckCircle />
              </div>
            )}
            {!tableCapacity && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                <FaExclamationCircle />
              </div>
            )}
            {/* Validation message */}
            {!tableCapacity && (
              <p className="text-red-500 text-sm mt-1">
                Table Capacity is required.
              </p>
            )}
          </div>

          {/* Table Section Dropdown */}
          <div className="relative">
            <label htmlFor="TableSection" className="block font-semibold mb-2">
              Table Section
            </label>
            <select
              value={tableSection}
              onChange={handleTableSectionChange}
              id="TableSection"
              className={`w-full p-3 border rounded-md ${
                !tableSection ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 ${
                !tableSection ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            >
              <option value="">Select a Section</option>
              {sections.map((section, index) => (
                <option key={index} value={section.sectionName}>
                  {section.sectionName}
                </option>
              ))}
            </select>
            {/* Validation icons */}
            {tableSection && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                <FaCheckCircle />
              </div>
            )}
            {!tableSection && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                <FaExclamationCircle />
              </div>
            )}
            {/* Validation message */}
            {!tableSection && (
              <p className="text-red-500 text-sm mt-1">
                Table Section is required.
              </p>
            )}
          </div>
        </div>

        {/* Add/Update Table Button */}
        <div className="mt-6">
          <button
            onClick={writeToDatabase}
            className="w-full bg-orange-500 text-white p-3 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            {editMode ? "Update Table" : "Add Table"}
          </button>
        </div>
      </div>

      {/* Section Filter, Search Bar, and Sort Order Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="SearchByName" className="block font-semibold mb-2">
            Search by Name
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            id="SearchByName"
            className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by Table Name"
          />
        </div>
        {/* Section Filter */}
        <div className="relative">
          <label htmlFor="FilterBySection" className="block font-semibold mb-2">
            Filter by Section
          </label>
          <select
            value={selectedSection}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            id="FilterBySection"
            className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sections</option>
            {sections.map((section, index) => (
              <option key={index} value={section.sectionName}>
                {section.sectionName} (
                {tableCountsBySection[section.sectionName] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Dropdown */}
        <div className="relative">
          <label htmlFor="SortOrder" className="block font-semibold mb-2">
            Sort by Capacity
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            id="SortOrder"
            className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="lowToHigh">Low to High</option>
            <option value="highToLow">High to Low</option>
          </select>
        </div>
      </div>

      {/* Table Display */}
      <div className="mt-6">
        {filteredAndSortedItems.length > 0 ? (
          <DynamicTable columns={columns} data={data} 
          onEdit={handleEditTable}
          onDelete={handleDeleteTable}
           />
        ) : (
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
            No tables available. Please add some tables.
          </div>
        )}
      </div>
    </>
  );
}

export default AddTable;
