import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { ref, onValue, update, set } from "firebase/database";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useHotelContext } from "../Context/HotelContext";
import { getAuth } from "firebase/auth";
import { uid } from "uid";
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
  padding: 10px 20px;
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
  
console.log('sections', sections)
  return (
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
  );
}

export default AddTable;
