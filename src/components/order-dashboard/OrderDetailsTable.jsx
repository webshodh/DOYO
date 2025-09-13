import React, { memo, useState } from "react";
import { Eye, Download, Search, Filter } from "lucide-react";

const OrderRow = memo(({ order, onViewDetails }) => {
  const status = order.kitchen?.status || order.status || "received";
  const statusColors = {
    received: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        #{order.orderNumber}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {new Date(order.timestamps?.orderPlaced).toLocaleString()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        Table {order.tableNumber || order.customerInfo?.tableNumber}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {order.items?.length || 0} items
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        ₹{order.pricing?.total || 0}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[status]}`}
        >
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        <button
          onClick={() => onViewDetails(order)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

const OrderDetailsTable = memo(({ orders, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toString().includes(searchTerm) ||
      order.tableNumber?.toString().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (order.kitchen?.status || order.status || "received") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
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
            <option value="received">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

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
              />
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
});

OrderDetailsTable.displayName = "OrderDetailsTable";
export default OrderDetailsTable;
