// components/customers/CustomerTableSection.jsx
import React, { Suspense } from "react";
import SearchWithResults from "../molecules/SearchWithResults";
import EmptyState from "atoms/Messages/EmptyState";
import NoSearchResults from "molecules/NoSearchResults";
import LoadingSpinner from "../atoms/LoadingSpinner";
import { Users } from "lucide-react";

const DynamicTable = React.lazy(() => import("../organisms/DynamicTable"));

const CustomerTableSection = ({
  customers,
  filteredCustomers,
  searchTerm,
  onSearchChange,
  ViewCustomerColumns,
  onClearSearch,
}) => {
  return (
    <>
      <SearchWithResults
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        placeholder="Search customers by name, mobile, or email..."
        totalCount={customers.length}
        filteredCount={filteredCustomers.length}
        onClearSearch={onClearSearch}
        totalLabel="customers"
      />

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <Suspense fallback={<LoadingSpinner text="Loading table..." />}>
            <DynamicTable
              columns={ViewCustomerColumns}
              data={filteredCustomers}
              showPagination
              initialRowsPerPage={10}
              sortable
            />
          </Suspense>
        ) : searchTerm ? (
          <NoSearchResults
            searchTerm={searchTerm}
            onClearSearch={onClearSearch}
            message="No customers match your search"
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No Customers Found"
            description="No customer records available."
          />
        )}
      </div>
    </>
  );
};

export default CustomerTableSection;
