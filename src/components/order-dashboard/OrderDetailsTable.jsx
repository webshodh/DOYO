import React, { memo, useState } from "react";
import { Eye, Printer, Search, Filter } from "lucide-react";

const OrderRow = memo(({ order, onViewDetails, onPrintBill }) => {
  const status =
    order.kitchen?.status ||
    order.status ||
    order.normalizedStatus ||
    "received";
  const statusColors = {
    received: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  // Check if order is completed to show print button
  const isOrderCompleted = status === "completed";

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    try {
      return new Date(dateTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `₹${numAmount.toLocaleString("en-IN")}`;
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        #{order.displayOrderNumber || order.orderNumber || order.id}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDateTime(order.timestamps?.orderPlaced || order.orderTimestamp)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {order.displayTable ||
          `Table ${
            order.tableNumber ||
            order.tableInfo ||
            order.customerInfo?.tableNumber ||
            "0"
          }`}
      </td>
      
      <td className="px-4 py-3 text-sm text-gray-600">
        {order.totalItems || order.items?.length || 0} items
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {formatCurrency(
          order.totalAmount || order.total || order.pricing?.total || 0
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
            statusColors[status] || statusColors.received
          }`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {/* View button - always visible */}
          <button
            onClick={() => onViewDetails(order)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Print Bill button - only visible when status is "completed" */}
          {isOrderCompleted && onPrintBill && (
            <button
              onClick={() => onPrintBill(order)}
              className="text-purple-600 hover:text-purple-800 p-1 rounded-lg hover:bg-purple-50 transition-colors"
              title="Print Bill"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

const OrderDetailsTable = memo(({ orders, onViewDetails, onPrintBill }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toString().includes(searchTerm) ||
      order.displayOrderNumber?.toString().includes(searchTerm) ||
      order.tableNumber?.toString().includes(searchTerm) ||
      order.tableInfo?.toString().includes(searchTerm) ||
      order.customerInfo?.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.tableNumber?.toString().includes(searchTerm) ||
      order.items?.some((item) =>
        item.menuName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const orderStatus =
      order.kitchen?.status ||
      order.status ||
      order.normalizedStatus ||
      "received";
    const matchesStatus =
      statusFilter === "all" || orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, table, customer, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
          {statusFilter !== "all" && ` (${statusFilter} only)`}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table
              </th>
              
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
                onPrintBill={onPrintBill}
              />
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">
              {orders.length === 0
                ? "No orders found"
                : "No orders match your search criteria"}
            </div>
            {orders.length > 0 && searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear search and filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

OrderDetailsTable.displayName = "OrderDetailsTable";
OrderRow.displayName = "OrderRow";

export default OrderDetailsTable;
