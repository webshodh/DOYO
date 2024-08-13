import React, { useState, useEffect } from "react";
import { db } from "../data/firebase/firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CountCard, DynamicTable, FilterSortSearch } from "../components";
import PageTitle from "../Atoms/PageTitle";
import styled from "styled-components";
import { useHotelContext } from "../Context/HotelContext";
import { getAuth } from "firebase/auth";
import ColoredCheckbox from "../Atoms/ColoredCheckbox";

// Background Card
const BackgroundCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

function ViewTable() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const [tableCountsBySection, setTableCountsBySection] = useState({});
  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

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

  const columns = [
    { Header: "Sr.No", accessor: "Sr.No" },
    { Header: "Section Name", accessor: "Section Name" },
    { Header: "Table Name", accessor: "Table Name" },
    { Header: "Capacity", accessor: "Capacity" },
    { Header: "Actions", accessor: "Actions" },
  ];
  console.log("data", data);
  return (
    <>
      <PageTitle pageTitle="View Tables" />
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
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <ColoredCheckbox label="Available" color="white" />
        <ColoredCheckbox label="Order Pending" color="Yellow" />
        <ColoredCheckbox label="Order Accepted" color="orange" />
        <ColoredCheckbox label="Order Completed" color="green" />
        <ColoredCheckbox label="Payment Pending" color="blue" />
      </div>
      <div className="container mt-2">
        <FilterSortSearch searchTerm={searchTerm} handleSearch={handleSearch} />
        <div className="d-flex">
          {data.map((item, index) => (
            <CountCard
              key={index}
              icon="bi-exclamation-circle-fill"
              iconColor="red"
              count={item.TableName} // Count of tables in that section
              label={"Table"} // Display section name
              type="primary"
            />
          ))}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default ViewTable;
