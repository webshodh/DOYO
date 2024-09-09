import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { uid } from "uid";
import { set, ref, onValue, remove, update } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { PageTitle } from "../../Atoms";
import { ViewTableColumns } from "../../data/Columns";
import { DynamicTable } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import Modal from "components/Modal";
import SearchWithButton from "components/SearchWithAddButton";

function AddTable() {
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");
  const [tableSection, setTableSection] = useState("");
  const [tables, setTables] = useState([]);
  const [sections, setSections] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempTableId, setTempTableId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterSection, setSelectedFilterSection] = useState(""); // For filtering by section
  const [sortByCapacity, setSortByCapacity] = useState(""); // For sorting
  const { hotelName } = useHotelContext();
  const [show, setShow] = useState(false);
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;

  useEffect(() => {
    // Fetching sections for dropdown
    onValue(
      ref(db, `/admins/${currentAdminId}/hotels/${hotelName}/sections/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSections(Object.values(data));
        }
      }
    );

    // Fetching tables
    onValue(
      ref(db, `/admins/${currentAdminId}/hotels/${hotelName}/tables/`),
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setTables(Object.values(data));
        } else {
          setTables([]);
        }
      }
    );
  }, [hotelName, currentAdminId]);

  const handleAddTable = () => {
    if (!tableName || !tableCapacity || !tableSection) {
      toast.error("Please fill all fields!");
      return;
    }

    const tableId = uid(); // Ensure the tableId is generated correctly
    set(
      ref(
        db,
        `/admins/${currentAdminId}/hotels/${hotelName}/tables/${tableId}`
      ),
      {
        tableId,
        tableName,
        tableCapacity,
        tableSection,
        //sectionId: tableSection,
      }
    )
      .then(() => {
        setTableName("");
        setTableCapacity("");
        setTableSection("");
        toast.success("Table Added Successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      })
      .catch((error) => {
        toast.error("Failed to add the table. Please try again.", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const handleUpdateTable = (table) => {
    setIsEdit(true);
    setShow(true);
    setTempTableId(table.tableId); // Ensure tempTableId is set for editing
    setTableName(table.tableName);
    setTableCapacity(table.tableCapacity);
    setTableSection(table.sectionName);
  };

  const handleSubmitTableChange = () => {
    if (!tempTableId) {
      toast.error("Table ID is missing!");
      return;
    }

    if (window.confirm("Confirm update?")) {
      update(
        ref(
          db,
          `/admins/${currentAdminId}/hotels/${hotelName}/tables/${tempTableId}`
        ),
        {
          tableId: tempTableId,
          tableName,
          tableCapacity,
          tableSection,
        }
      )
        .then(() => {
          toast.success("Table Updated Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setIsEdit(false);
          setShow(false);
          setTableName("");
          setTableCapacity("");
          setTableSection("");
          setTempTableId(""); // Reset tempTableId after editing
        })
        .catch((error) => {
          toast.error("Failed to update the table. Please try again.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        });
    }
  };

  const handleDeleteTable = (table) => {
    if (window.confirm("Confirm delete?")) {
      const tableRef = ref(
        db,
        `/admins/${currentAdminId}/hotels/${hotelName}/tables/${table.tableId}`
      );

      remove(tableRef)
        .then(() => {
          toast.success("Table Deleted Successfully!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        })
        .catch((error) => {
          toast.error("Failed to delete the table. Please try again.", {
            position: toast.POSITION.TOP_RIGHT,
          });
        });
    }
  };

  // Filter by section and sort by table capacity
  const filteredAndSortedTables = tables
    .filter((table) =>
      selectedFilterSection ? table.sectionName === selectedFilterSection : true
    )
    .filter((table) =>
      table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByCapacity === "asc") {
        return a.tableCapacity - b.tableCapacity;
      } else if (sortByCapacity === "desc") {
        return b.tableCapacity - a.tableCapacity;
      }
      return 0;
    })
    .map((table, index) => ({
      srNo: index + 1,
      ...table,
    }));

  const handleAdd = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const columns = ViewTableColumns; // Define table columns separately
  console.log("filteredAndSortedTables", filteredAndSortedTables);
  return (
    <>
      <div className="d-flex justify-between">
        {/* Modal */}
        {show && (
          <Modal
            title="Add Role"
            handleClose={handleClose}
            children={
              <div
                className="bg-white p-10"
                style={{ width: "40%", marginRight: "10px" }}
              >
                <PageTitle pageTitle="Add Table" />
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Enter Table Name"
                  className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(e.target.value)}
                  placeholder="Enter Table Capacity"
                  className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={tableSection}
                  onChange={(e) => setTableSection(e.target.value)}
                  className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.sectionId} value={section.sectionName}>
                      {section.sectionName}
                    </option>
                  ))}
                </select>
                {isEdit ? (
                  <>
                    <button
                      onClick={handleSubmitTableChange}
                      className="px-4 py-2 mr-2 text-white bg-green-600 rounded-md"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setIsEdit(false);
                        setTableName("");
                        setTableCapacity("");
                        setTableSection("");
                        setTempTableId(""); // Reset tempTableId when canceling
                      }}
                      className="px-4 py-2 text-white bg-red-600 rounded-md"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddTable}
                    className="px-4 py-2 text-white bg-green-600 rounded-md"
                  >
                    Submit
                  </button>
                )}
                <ToastContainer />
              </div>
            }
          ></Modal>
        )}
        <div style={{ width: "100%" }}>
          <div className="bg-white p-10 rounded-lg shadow-md">
            <SearchWithButton
              searchTerm={searchTerm}
              onSearchChange={(e) => setSearchTerm(e.target.value)}
              buttonText="Add Table"
              onButtonClick={handleAdd}
            />
          </div>
          <div
            className="d-flex gap-5"
            style={{ width: "100%", marginTop: "50px" }}
          >
            <div style={{ width: "30%" }}>
              <PageTitle pageTitle="View Tables" />
            </div>
            {/* Filter by Section */}
            <select
              value={selectedFilterSection}
              onChange={(e) => setSelectedFilterSection(e.target.value)}
              className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Filter by Section</option>
              {sections.map((section) => (
                <option key={section.sectionId} value={section.sectionName}>
                  {section.sectionName}
                </option>
              ))}
            </select>

            {/* Sort by Capacity */}
            <select
              value={sortByCapacity}
              onChange={(e) => setSortByCapacity(e.target.value)}
              className="w-full p-3 mb-4 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort by Capacity</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* Display Table */}
          <DynamicTable
            columns={columns}
            data={filteredAndSortedTables}
            onEdit={handleUpdateTable}
            onDelete={handleDeleteTable}
          />
        </div>
      </div>
    </>
  );
}

export default AddTable;
