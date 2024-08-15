import React, { useState, useEffect } from "react";
import { db } from "../../data/firebase/firebaseConfig";
import { ref, onValue, update, set, remove } from "firebase/database";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import { uid } from "uid";
import { DynamicTable } from "../../components";
import { ViewTableColumns } from "../../data/Columns";
// Styled components for the form
export const FormContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 20px;
`;

export const InputWrapper = styled.div`
  flex: 1 1 calc(50% - 300px);
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  margin-bottom: 8px;
  font-weight: bold;
`;

export const Input = styled.input`
  padding: 10px;
  border: 1px solid
    ${(props) => (props.error ? "#dc3545" : props.success ? "#28a745" : "#ccc")};
  border-radius: 4px;
  outline: none;
  box-shadow: ${(props) =>
    props.error ? "0 0 0 1px rgba(220, 53, 69, 0.5)" : "none"};

  &:focus {
    border-color: ${(props) => (props.error ? "#dc3545" : "#80bdff")};
    box-shadow: ${(props) =>
      props.error
        ? "0 0 0 1px rgba(220, 53, 69, 0.5)"
        : "0 0 0 0.2rem rgba(38, 143, 255, 0.25)"};
  }
`;

export const Icon = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
`;

export const ErrorMessage = styled.p`
  color: #dc3545;
  font-size: 0.875rem;
  margin: 5px 0 0;
`;

export const Button = styled.button`
  width:200px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  background-color: ${(props) => (props.primary ? "#28a745" : "#dc3545")};
  margin-top: 10px;

  &:hover {
    background-color: ${(props) => (props.primary ? "#218838" : "#c82333")};
  }
`;

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
      ref(db, `/admins/${adminID}/hotels/${hotelName}/table/`),
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
      ref(db, `/admins/${adminID}/hotels/${hotelName}/sections/`),
      (snapshot) => {
        setSections([]);
        const data = snapshot.val();
        if (data !== null) {
          setSections(Object.values(data));
        }
      }
    );
  }, [hotelName, adminID]);

  const handleTableNameChange = (e) => {
    setTableName(e.target.value);
  };

  const handleTableCapacityChange = (e) => {
    setTableCapacity(e.target.value);
  };

  const handleTableSectionChange = (e) => {
    setTableSection(e.target.value);
  };

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

  // Fetch Table data from database
  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/tables`),
      (snapshot) => {
        setTables([]);
        const data = snapshot.val();
        if (data !== null) {
          Object.values(data).forEach((table) => {
            setTables((oldTables) => [...oldTables, table]);
          });
        }
      }
    );
  }, [hotelName, adminID]);

  // Fetch Section data from database
  useEffect(() => {
    onValue(
      ref(db, `/admins/${adminID}/hotels/${hotelName}/sections/`),
      (snapshot) => {
        setSections([]);
        const data = snapshot.val();
        if (data !== null) {
          Object.values(data).forEach((section) => {
            setSections((oldSections) => [...oldSections, section]);
          });
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

  const handleShow = (tableId) => {
    const selectedTable = tables.find((table) => table.uuid === tableId);
    console.log("Selected Table:", selectedTable);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (tableId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this table?"
    );
    if (confirmDelete) {
      // Delete the table
      remove(
        ref(db, `/admins/${adminID}/hotels/${hotelName}/tables/${tableId}`)
      );

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
        (table) =>
          table.tableSection.toLowerCase() === selectedSection.toLowerCase()
      );
    }

    // Sort by table capacity if needed
    if (sortOrder === "lowToHigh") {
      filteredItems.sort(
        (a, b) => parseFloat(a.capacity) - parseFloat(b.capacity)
      );
    } else if (sortOrder === "highToLow") {
      filteredItems.sort(
        (a, b) => parseFloat(b.capacity) - parseFloat(a.capacity)
      );
    }

    return filteredItems;
  };

  const filteredAndSortedItems = filterAndSortItems();

  const handleCategoryFilter = (section) => {
    setSelectedSection(section);
  };

  // Prepare data for the table
  const data = filteredAndSortedItems.map((item, index) => ({
    "Sr.No": index + 1,
    SectionName: item.tableSection || "Other",
    TableName: item.tableName,
    Capacity: item.capacity,
    Actions: (
      <>
        <button
          className="btn btn-primary btn-sm mr-2"
          onClick={() => handleShow(item.uuid)}
        >
          <img src="/update.png" width="20px" height="20px" alt="Update" />
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(item.uuid)}
        >
          <img src="/delete.png" width="20px" height="20px" alt="Delete" />
        </button>
      </>
    ),
  }));

  const columns =ViewTableColumns
console.log('data', data)
  return (
    <>
    <div className="background-card">
      <FormContainer>
        <InputWrapper>
          <Label htmlFor="TableName">Table Name</Label>
          <div style={{ position: "relative" }}>
            <Input
              type="text"
              value={tableName}
              onChange={handleTableNameChange}
              id="TableName"
              error={!tableName}
              success={tableName}
              placeholder="Enter Table Name"
            />
            {tableName && (
              <Icon success>
                <FaCheckCircle />
              </Icon>
            )}
            {!tableName && (
              <Icon error>
                <FaExclamationCircle />
              </Icon>
            )}
          </div>
          {!tableName && <ErrorMessage>Table Name is required.</ErrorMessage>}
        </InputWrapper>

        <InputWrapper>
          <Label htmlFor="TableCapacity">Table Capacity</Label>
          <div style={{ position: "relative" }}>
            <Input
              type="number"
              value={tableCapacity}
              onChange={handleTableCapacityChange}
              id="TableCapacity"
              error={!tableCapacity}
              success={tableCapacity}
              placeholder="Enter Table Capacity"
            />
            {tableCapacity && (
              <Icon success>
                <FaCheckCircle />
              </Icon>
            )}
            {!tableCapacity && (
              <Icon error>
                <FaExclamationCircle />
              </Icon>
            )}
          </div>
          {!tableCapacity && (
            <ErrorMessage>Table Capacity is required.</ErrorMessage>
          )}
        </InputWrapper>

       
      </FormContainer>
      <FormContainer>
      <InputWrapper>
          <Label htmlFor="tableSection">Table Section</Label>
          <select
            id="tableSection"
            className="form-select"
            onChange={handleTableSectionChange}
            value={tableSection}
          >
            <option value="" disabled>
              Select Table Section
            </option>
            {sections.map((section) => (
              <option key={section.sectionId} value={section.sectionName}>
                {section.sectionName}
              </option>
            ))}
          </select>
        </InputWrapper>

        <Button primary onClick={writeToDatabase}>
          {editMode ? "Update" : "Submit"}
        </Button>
        </FormContainer>
      
    </div>
    <div className="container mt-2">
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-wrap justify-content-start">
              <div
                className="d-flex flex-nowrap overflow-auto"
                style={{ whiteSpace: "nowrap" }}
              >
                <div
                  className="p-2 mb-2 bg-light border cursor-pointer d-inline-block categoryTab"
                  onClick={() => handleCategoryFilter("")}
                  style={{ marginRight: "5px" }}
                >
                  <div>
                    All{" "}
                    <span
                      className="badge bg-danger badge-number"
                      style={{ borderRadius: "50%", padding: "5px" }}
                    >
                      {" "}
                      {Object.values(tableCountsBySection).reduce(
                        (a, b) => a + b,
                        0
                      )}
                    </span>
                  </div>
                </div>
                {sections
                  .filter((item) => tableCountsBySection[item.sectionName] > 0) // Only include sections with non-zero counts
                  .map((item) => (
                    <div
                      className="section p-2 mb-2 bg-light border cursor-pointer d-inline-block categoryTab"
                      key={item.id}
                      onClick={() => handleCategoryFilter(item.sectionName)}
                    >
                      <div className="section-name">
                        {item.sectionName}{" "}
                        <span
                          className="badge bg-danger badge-number"
                          style={{ borderRadius: "50%" }}
                        >
                          {tableCountsBySection[item.sectionName]}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <DynamicTable
        columns={columns}
        data={data}
        onEdit={handleShow}
        onDelete={handleDelete}/>
      </div>

    </>
  );
}

export default AddTable;
