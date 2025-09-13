import OrderStatusBadge from "atoms/Badges/OrderStatusBadge";
import StatusBadge from "atoms/Badges/StatusBadge";
import {
  CheckCircle,
  CheckCircle2,
  ChefHat,
  Package,
  Utensils,
} from "lucide-react";

export const ViewCategoryColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Category Name", accessor: "categoryName" },
];

export const ViewMenuColumns = [
  { header: "Sr.No", accessor: "Sr.No" },
  // { header: "Img", accessor: "Img" },
  { header: "Menu Category", accessor: "Menu Category" },
  { header: "Menu Name", accessor: "Menu Name" },
  { header: "Price", accessor: "Price" },
  { header: "Discount (%)", accessor: "Discount" },
  { header: "Final Price", accessor: "Final Price" },
  { header: "Availability", accessor: "Availability" },
];

export const adminsListColumn = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Name", accessor: "name" },
  { header: "Display Name", accessor: "displayName" },
  { header: "Mobile Number", accessor: "contact" },
  { header: "Email", accessor: "email" },
  { header: "Hotels", accessor: "hotelNames" }, // Now uses the processed hotelNames field
  { header: "Role", accessor: "role" },
  {
    header: "Created At",
    accessor: "createdAt",
    // Optional: You can add a formatter if you want to format the date
    formatter: (value) => new Date(value).toLocaleDateString(),
  },
];

export const hotelsListColumn = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Hotel Name", accessor: "hotelName" },
  { header: "Owner Name", accessor: "ownerName" },
  { header: "Contact", accessor: "contactInfo" },
  { header: "Owner Contact", accessor: "ownerContact" },
  { header: "Email", accessor: "email" },
  { header: "Country", accessor: "country" },
  { header: "District", accessor: "district" },
  { header: "State", accessor: "state" },
  { header: "Address", accessor: "fullAddress" },
  { header: "Cuisine Type", accessor: "cuisineType" },
  { header: "Status", accessor: "status" },
  { header: "Created Date", accessor: "createdDate" },
];

export const hotelsSubscriptionListColumn = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Hotel Name", accessor: "hotelName" },
  { header: "Country", accessor: "country" },
  { header: "State", accessor: "state" },
  { header: "District", accessor: "district" },
  { header: "City", accessor: "city" },
  { header: "Status", accessor: "status" },
  { header: "Created At", accessor: "createdDate" },
];
// Constants/Columns.js - Add this to your existing Columns file

export const ViewOffersColumns = [
  {
    Header: "Sr. No.",
    accessor: "srNo",
    width: 80,
    Cell: ({ value }) => (
      <span className="text-gray-600 font-medium">{value}</span>
    ),
  },
  {
    Header: "Offer Name",
    accessor: "offerName",
    width: 200,
    Cell: ({ value, row }) => (
      <div>
        <div className="font-semibold text-gray-800">{value}</div>
        {row.original.offerDescription && (
          <div className="text-sm text-gray-500 mt-1">
            {row.original.offerDescription.length > 50
              ? `${row.original.offerDescription.substring(0, 50)}...`
              : row.original.offerDescription}
          </div>
        )}
      </div>
    ),
  },
  {
    Header: "Type",
    accessor: "offerType",
    width: 120,
    Cell: ({ value }) => {
      const typeLabels = {
        percentage: "Percentage",
        fixed: "Fixed Amount",
        buy_one_get_one: "BOGO",
        combo: "Combo",
        free_delivery: "Free Delivery",
      };

      const typeColors = {
        percentage: "bg-blue-100 text-blue-800",
        fixed: "bg-green-100 text-green-800",
        buy_one_get_one: "bg-purple-100 text-purple-800",
        combo: "bg-orange-100 text-orange-800",
        free_delivery: "bg-pink-100 text-pink-800",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            typeColors[value] || "bg-gray-100 text-gray-800"
          }`}
        >
          {typeLabels[value] || value}
        </span>
      );
    },
  },
  {
    Header: "Discount",
    accessor: "discountValue",
    width: 100,
    Cell: ({ value, row }) => {
      const { offerType } = row.original;

      if (offerType === "free_delivery") {
        return (
          <span className="text-green-600 font-medium">Free Delivery</span>
        );
      }

      if (offerType === "buy_one_get_one") {
        return <span className="text-purple-600 font-medium">BOGO</span>;
      }

      if (!value) return <span className="text-gray-400">-</span>;

      if (offerType === "percentage") {
        return <span className="text-blue-600 font-medium">{value}%</span>;
      }

      return <span className="text-green-600 font-medium">₹{value}</span>;
    },
  },
  {
    Header: "Min. Order",
    accessor: "minimumOrderAmount",
    width: 100,
    Cell: ({ value }) => (
      <span className="text-gray-600">
        {value ? `₹${value}` : "No minimum"}
      </span>
    ),
  },
  {
    Header: "Valid Period",
    accessor: "validFrom",
    width: 180,
    Cell: ({ row }) => {
      const { validFrom, validUntil } = row.original;
      const fromDate = new Date(validFrom).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
      const untilDate = new Date(validUntil).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return (
        <div className="text-sm">
          <div className="text-gray-600">{fromDate} to</div>
          <div className="text-gray-800 font-medium">{untilDate}</div>
        </div>
      );
    },
  },
  {
    Header: "Usage",
    accessor: "currentUsageCount",
    width: 100,
    Cell: ({ value, row }) => {
      const { maxUsageCount } = row.original;
      const current = value || 0;

      return (
        <div className="text-sm">
          <div className="font-medium text-gray-800">{current}</div>
          {maxUsageCount && (
            <div className="text-gray-500">of {maxUsageCount}</div>
          )}
        </div>
      );
    },
  },
  {
    Header: "Status",
    accessor: "statusDisplay",
    width: 100,
    Cell: ({ value, row }) => {
      const { isActive, isExpired } = row.original;

      let statusClass = "";
      let statusText = value;

      if (isExpired) {
        statusClass = "bg-red-100 text-red-800";
        statusText = "Expired";
      } else if (isActive) {
        statusClass = "bg-green-100 text-green-800";
        statusText = "Active";
      } else {
        statusClass = "bg-gray-100 text-gray-800";
        statusText = "Inactive";
      }

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
        >
          {statusText}
        </span>
      );
    },
  },
  {
    Header: "Actions",
    accessor: "actions",
    width: 150,
    Cell: ({ row, onEdit, onDelete, onToggleStatus }) => {
      const offer = row.original;

      return (
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(offer)}
            className="px-2 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Edit Offer"
          >
            <i className="fas fa-edit"></i>
          </button>

          <button
            onClick={() => onToggleStatus(offer)}
            className={`px-2 py-1 text-sm font-medium ${
              offer.isActive
                ? "text-orange-600 hover:text-orange-800"
                : "text-green-600 hover:text-green-800"
            }`}
            title={offer.isActive ? "Deactivate" : "Activate"}
          >
            <i className={`fas ${offer.isActive ? "fa-pause" : "fa-play"}`}></i>
          </button>

          <button
            onClick={() => onDelete(offer)}
            className="px-2 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
            title="Delete Offer"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      );
    },
  },
];

// Captain table columns configuration
export const ViewCaptainColumns = [
  {
    header: "Sr.",
    accessor: "srNo",
    sortable: true,
    width: "60px",
    cell: (row) => (
      <span className="font-medium text-gray-900">{row.srNo}</span>
    ),
  },

  {
    header: "Name",
    accessor: "firstName",
    sortable: true,
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {row.firstName} {row.lastName}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          {row.experience || 0} years exp.
        </span>
      </div>
    ),
  },
  {
    header: "Contact",
    accessor: "mobileNo",
    sortable: true,
    cell: (row) => (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <a href={`tel:${row.mobileNo}`} className="hover:text-blue-600">
            {row.mobileNo}
          </a>
        </div>
      </div>
    ),
  },
  {
    header: "Email",
    accessor: "email",
    sortable: true,
    cell: (row) => (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`mailto:${row.email}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.email}
          </a>
        </div>
      </div>
    ),
  },
  {
    header: "Adhar No",
    accessor: "adharNo",
    sortable: false,
    cell: (row) => (
      <div className="flex flex-col space-y-1 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <span>Aadhar: {row.adharNo}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <span>PAN: {row.panNo}</span>
        </div>
      </div>
    ),
  },
  {
    header: "Address",
    accessor: "address",
    sortable: false,
    width: "200px",
    cell: (row) => (
      <div className="flex items-start gap-2">
        <span
          className="text-sm text-gray-600 line-clamp-2"
          title={row.address}
        >
          {row.address}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    width: "100px",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: "Created",
    accessor: "createdAt",
    sortable: true,
    width: "120px",
    cell: (row) => (
      <div className="text-sm text-gray-600">
        {new Date(row.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    ),
  },
  {
    header: "Actions",
    accessor: "actions",
    sortable: false,
    width: "120px",
  },
];
export const orderStatuses = [
  { value: "received", label: "Received", color: "blue", icon: Package },
  {
    value: "preparing",
    label: "Preparing",
    color: "yellow",
    icon: ChefHat,
  },
  { value: "ready", label: "Ready", color: "green", icon: CheckCircle2 },
  { value: "served", label: "Served", color: "purple", icon: Utensils },
  {
    value: "completed",
    label: "Completed",
    color: "gray",
    icon: CheckCircle,
  },
];
// Order columns configuration for DynamicTable
export const orderColumns = [
  {
    header: "Order #",
    accessor: "orderNumber",
    sortable: true,
    render: (value, item) => `#${value || item.id}`,
  },
  {
    header: "Table",
    accessor: "tableNumber",
    sortable: true,
    render: (value, item) => `Table ${value || item.tableNo || "N/A"}`,
  },
  {
    header: "Items",
    accessor: "totalItems",
    sortable: true,
    render: (value, item) =>
      `${item.orderDetails?.totalItems || item.items?.length || 0} items`,
  },
  {
    header: "Total",
    accessor: "total",
    sortable: true,
    render: (value, item) => `₹${item.pricing?.total || value || 0}`,
  },
  {
    header: "Status",
    accessor: "status",
    sortable: true,
    render: (status, item) => (
      <OrderStatusBadge status={status} orderStatuses={orderStatuses} />
    ),
  },
  {
    header: "Time",
    accessor: "orderTime",
    sortable: true,
    render: (value, item) =>
      item.timestamps?.orderPlacedLocal ||
      (value ? new Date(value).toLocaleTimeString() : "N/A"),
  },
];
