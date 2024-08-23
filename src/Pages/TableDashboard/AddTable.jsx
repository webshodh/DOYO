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

// Tailwind CSS classes are used directly in JSX
function AddTable() {
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableSection, setTableSection] = useState("");
  const [sections, setSections] = useState([]);
  const [tables, setTables] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedMenuId, setEditedMenuId] = useState(null);

  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  const { hotelName } = useHotelContext();

  const [selectedSection, setSelectedSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [tableCountsBySection, setTableCountsBySection] = useState({});

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

  useEffect(() => {
    const countsBySection = {};
    tables.forEach((table) => {
      const section = table.tableSection;
      countsBySection[section] = (countsBySection[section] || 0) + 1;
    });

    setTableCountsBySection(countsBySection);
  }, [tables]);

  const handleTableNameChange = (e) => setTableName(e.target.value);
  const handleTableCapacityChange = (e) => setTableCapacity(e.target.value);
  const handleTableSectionChange = (e) => setTableSection(e.target.value);

  const writeToDatabase = () => {
    if (editMode) {
      // Update existing table
      update(
        ref(db, `/admins/${adminID}/hotels/${hotelName}/tables/${editedMenuId}`),
        {
          tableName,
          tableCapacity,
          tableSection,
          uuid: editedMenuId,
        }
      );
      setEditMode(false);
      setEditedMenuId(null);
      toast.success("Table Updated Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      // Add a new table
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

    // Clear form fields
    setTableName("");
    setTableCapacity("");
    setTableSection("");
  };

  const handleShow = (tableId) => {
    const selectedTable = tables.find((table) => table.uuid === tableId);
    console.log("Selected Table:", selectedTable);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleDelete = (tableId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this table?"
    );
    if (confirmDelete) {
      // Delete the table
      remove(ref(db, `/admins/${adminID}/hotels/${hotelName}/tables/${tableId}`));
      toast.success("Table Deleted Successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const filterAndSortItems = () => {
    let filteredItems = tables.filter((table) =>
      table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedSection !== "") {
      filteredItems = filteredItems.filter(
        (table) => table.tableSection.toLowerCase() === selectedSection.toLowerCase()
      );
    }

    // Sort by table capacity if needed
    if (sortOrder === "lowToHigh") {
      filteredItems.sort((a, b) => parseFloat(a.tableCapacity) - parseFloat(b.tableCapacity));
    } else if (sortOrder === "highToLow") {
      filteredItems.sort((a, b) => parseFloat(b.tableCapacity) - parseFloat(a.tableCapacity));
    }

    return filteredItems;
  };

  const filteredAndSortedItems = filterAndSortItems();

  const handleCategoryFilter = (section) => setSelectedSection(section);

  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    SectionName: item.tableSection || "Other",
    TableName: item.tableName,
    Capacity: item.tableCapacity,
    Actions: (
      <>
        <button
          className="btn btn-primary btn-sm mr-2"
          onClick={() => handleShow(item.uuid)}
        >
          <img src="/update.png" width="20" height="20" alt="Update" />
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(item.uuid)}
        >
          <img src="/delete.png" width="20" height="20" alt="Delete" />
        </button>
      </>
    ),
  }));

  const columns = ViewTableColumns;

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="TableName" className="block font-semibold mb-2">Table Name</label>
            <input
              type="text"
              value={tableName}
              onChange={handleTableNameChange}
              id="TableName"
              className={`w-full p-3 border rounded-md ${
                !tableName ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 ${
                !tableName ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="Enter Table Name"
            />
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
            {!tableName && (
              <p className="text-red-500 text-sm mt-1">Table Name is required.</p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="TableCapacity" className="block font-semibold mb-2">Table Capacity</label>
            <input
              type="number"
              value={tableCapacity}
              onChange={handleTableCapacityChange}
              id="TableCapacity"
              className={`w-full p-3 border rounded-md ${
                !tableCapacity ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 ${
                !tableCapacity ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              placeholder="Enter Table Capacity"
            />
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
            {!tableCapacity && (
              <p className="text-red-500 text-sm mt-1">Table Capacity is required.</p>
            )}
          </div>

          <div>
            <label htmlFor="TableSection" className="block font-semibold mb-2">Table Section</label>
            <select
              id="TableSection"
              value={tableSection}
              onChange={handleTableSectionChange}
              className="w-full p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Section</option>
              {sections.map((section, index) => (
                <option key={index} value={section.sectionName}>
                  {section.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2 flex justify-end mt-4">
            <button
              onClick={writeToDatabase}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-blue-600"
            >
              {editMode ? "Update Table" : "Add Table"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Search Tables"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={() => handleCategoryFilter("")}
            className={`px-4 py-2 rounded-md ${
              selectedSection === "" ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            All Sections
          </button>
          {Object.keys(tableCountsBySection).map((section) => (
            <button
              key={section}
              onClick={() => handleCategoryFilter(section)}
              className={`px-4 py-2 rounded-md ${
                selectedSection === section ? "bg-orange-500 text-white" : "bg-gray-200"
              }`}
            >
              {section} ({tableCountsBySection[section]})
            </button>
          ))}
        </div>

        <div className="flex mb-4">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Sort By Capacity</option>
            <option value="lowToHigh">Low to High</option>
            <option value="highToLow">High to Low</option>
          </select>
        </div>

        <DynamicTable columns={columns} data={data} />
      </div>
    </>
  );
}

export default AddTable;
