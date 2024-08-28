import React, { useState } from "react";
import { PageTitle } from "../../Atoms";
import { DynamicTable, FilterSortSearch } from "../../components";
import { customersColumns } from "../../data/Columns";
import useCompletedOrders from "../../data/useCompletedOrders";
import useCustomerData from "../../data/useCustomerData";
import { useHotelContext } from "../../Context/HotelContext";

const CustomersDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");
  const { hotelName } = useHotelContext();

  const { completedOrders, loading, error } = useCompletedOrders(hotelName);
  const { customerDataArray, customerCountData } = useCustomerData(completedOrders);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
console.log('customerDataArray', customerDataArray)
  // Filter data based on searchTerm
  const filteredData = customerDataArray.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered data
  if (sortOrder !== "default") {
    if (sortOrder === "lowToHigh") {
      filteredData.sort(
        (a, b) => parseFloat(a.totalMenuPrice) - parseFloat(b.totalMenuPrice)
      );
    } else if (sortOrder === "highToLow") {
      filteredData.sort(
        (a, b) => parseFloat(b.totalMenuPrice) - parseFloat(a.totalMenuPrice)
      );
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const columns = customersColumns;

  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <PageTitle pageTitle={`Customers (${filteredData.length})`} />
      </div>
      <div className="mt-2">
        <FilterSortSearch
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          handleSort={handleSort}
        />
        <div className="row mt-3">
          <div className="col-12">
            <DynamicTable
              columns={columns}
              data={filteredData}
              onEdit={null}
              onDelete={null}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomersDashboard;
