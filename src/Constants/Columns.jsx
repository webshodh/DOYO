import { useTranslation } from "react-i18next";
import OrderStatusBadge from "atoms/Badges/OrderStatusBadge";
import StatusBadge from "atoms/Badges/StatusBadge";
import {
  CheckCircle,
  CheckCircle2,
  ChefHat,
  Package,
  ShoppingBag,
  Utensils,
} from "lucide-react";

const useColumns = () => {
  const { t } = useTranslation();

  // View Category Columns
  const ViewCategoryColumns = [
    { header: t("tableHeaders.srNo"), accessor: "srNo" },
    { header: t("tableHeaders.categoryName"), accessor: "categoryName" },
  ];

  // View Menu Columns
  const ViewMenuColumns = [
    { header: t("tableHeaders.srNo"), accessor: "Sr.No" },
    { header: t("tableHeaders.menuCategory"), accessor: "Menu Category" },
    { header: t("tableHeaders.menuName"), accessor: "Menu Name" },
    { header: t("tableHeaders.price"), accessor: "Price" },
    { header: t("tableHeaders.discount"), accessor: "Discount" },
    { header: t("tableHeaders.finalPrice"), accessor: "Final Price" },
    { header: t("tableHeaders.availability"), accessor: "Availability" },
  ];

  // Admins List Columns
  const adminsListColumn = [
    { header: t("tableHeaders.srNo"), accessor: "srNo" },
    { header: t("tableHeaders.name"), accessor: "name" },
    { header: t("tableHeaders.displayName"), accessor: "displayName" },
    { header: t("tableHeaders.mobileNumber"), accessor: "contact" },
    { header: t("tableHeaders.email"), accessor: "email" },
    { header: t("tableHeaders.hotels"), accessor: "hotelNames" },
    { header: t("tableHeaders.role"), accessor: "role" },
    { header: t("tableHeaders.status"), accessor: "status" },
    {
      header: t("tableHeaders.createdAt"),
      accessor: "createdDate",
      formatter: (value) => value || "N/A",
    },
  ];

  // Hotels List Columns
  const hotelsListColumn = [
    { header: t("tableHeaders.srNo"), accessor: "srNo" },
    { header: t("tableHeaders.hotelName"), accessor: "hotelName" },
    { header: t("tableHeaders.ownerName"), accessor: "ownerName" },
    { header: t("tableHeaders.contact"), accessor: "contactInfo" },
    { header: t("tableHeaders.ownerContact"), accessor: "ownerContact" },
    { header: t("tableHeaders.email"), accessor: "email" },
    { header: t("tableHeaders.country"), accessor: "country" },
    { header: t("tableHeaders.district"), accessor: "district" },
    { header: t("tableHeaders.state"), accessor: "state" },
    { header: t("tableHeaders.address"), accessor: "fullAddress" },
    { header: t("tableHeaders.cuisineType"), accessor: "cuisineType" },
    { header: t("tableHeaders.status"), accessor: "status" },
    { header: t("tableHeaders.createdDate"), accessor: "createdDate" },
  ];

  // Hotels Subscription List Columns
  const hotelsSubscriptionListColumn = [
    { header: t("tableHeaders.srNo"), accessor: "srNo" },
    { header: t("tableHeaders.hotelName"), accessor: "hotelName" },
    { header: t("tableHeaders.ownerName"), accessor: "ownerName" },
    { header: t("tableHeaders.contact"), accessor: "contactInfo" },
    { header: t("tableHeaders.email"), accessor: "email" },
    { header: t("tableHeaders.country"), accessor: "country" },
    { header: t("tableHeaders.state"), accessor: "state" },
    { header: t("tableHeaders.district"), accessor: "district" },
    { header: t("tableHeaders.city"), accessor: "city" },
    {
      header: t("tableHeaders.subscriptionPlan"),
      accessor: "subscriptionPlan",
    },
    {
      header: t("tableHeaders.subscriptionStatus"),
      accessor: "subscriptionStatus",
    },
    {
      header: t("tableHeaders.subscriptionExpiry"),
      accessor: "subscriptionExpiry",
    },
    {
      header: t("tableHeaders.monthlyRevenue"),
      accessor: "monthlyRevenue",
      formatter: (value) => `₹${value || 0}`,
    },
    {
      header: t("tableHeaders.totalPaid"),
      accessor: "totalPaid",
      formatter: (value) => `₹${value || 0}`,
    },
    { header: t("tableHeaders.lastPaymentDate"), accessor: "lastPaymentDate" },
    { header: t("tableHeaders.paymentMethod"), accessor: "paymentMethod" },
    { header: t("tableHeaders.status"), accessor: "status" },
    { header: t("tableHeaders.createdAt"), accessor: "createdDate" },
  ];

  // View Offers Columns
  const ViewOffersColumns = [
    {
      header: t("tableHeaders.srNo"),
      accessor: "srNo",
      width: 80,
      Cell: ({ value }) => (
        <span className="text-gray-600 font-medium">{value}</span>
      ),
    },
    {
      header: t("tableHeaders.offerName"),
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
      header: t("tableHeaders.type"),
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
      header: t("tableHeaders.discount"),
      accessor: "discountValue",
      width: 100,
      Cell: ({ value, row }) => {
        const { offerType } = row.original;
        if (offerType === "free_delivery")
          return (
            <span className="text-green-600 font-medium">Free Delivery</span>
          );
        if (offerType === "buy_one_get_one")
          return <span className="text-purple-600 font-medium">BOGO</span>;
        if (!value) return <span className="text-gray-400">-</span>;
        if (offerType === "percentage")
          return <span className="text-blue-600 font-medium">{value}%</span>;
        return <span className="text-green-600 font-medium">₹{value}</span>;
      },
    },
    {
      header: t("tableHeaders.minOrder"),
      accessor: "minimumOrderAmount",
      width: 100,
      Cell: ({ value }) => (
        <span className="text-gray-600">
          {value ? `₹${value}` : "No minimum"}
        </span>
      ),
    },
    {
      header: t("tableHeaders.validPeriod"),
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
      header: t("tableHeaders.usage"),
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
      header: t("tableHeaders.status"),
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
      header: t("tableHeaders.actions"),
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
              <i
                className={`fas ${offer.isActive ? "fa-pause" : "fa-play"}`}
              ></i>
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

  // View Captain Columns
  const ViewCaptainColumns = [
    {
      header: t("tableHeaders.srNo"),
      accessor: "srNo",
      sortable: true,
      width: "60px",
      cell: (row) => (
        <span className="font-medium text-gray-900">{row.srNo}</span>
      ),
    },
    {
      header: t("tableHeaders.name"),
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
      header: t("tableHeaders.contact"),
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
      header: t("tableHeaders.email"),
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
      header: t("tableHeaders.adharNo"),
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
      header: t("tableHeaders.address"),
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
      header: t("tableHeaders.status"),
      accessor: "status",
      sortable: true,
      width: "100px",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: t("tableHeaders.createdAt"),
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
      header: t("tableHeaders.actions"),
      accessor: "actions",
      sortable: false,
      width: "120px",
    },
  ];

  // Order status configuration
  const orderStatuses = [
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

  // Order Columns
  const orderColumns = [
    {
      header: t("tableHeaders.orderNumber"),
      accessor: "orderNumber",
      sortable: true,
      render: (value, item) => `#${value || item.id}`,
    },
    {
      header: t("tableHeaders.table"),
      accessor: "tableNumber",
      sortable: true,
      render: (value, item) => `Table ${value || item.tableNo || "N/A"}`,
    },
    {
      header: t("tableHeaders.items"),
      accessor: "totalItems",
      sortable: true,
      render: (value, item) =>
        `${item.orderDetails?.totalItems || item.items?.length || 0} items`,
    },
    {
      header: t("tableHeaders.total"),
      accessor: "total",
      sortable: true,
      render: (value, item) => `₹${item.pricing?.total || value || 0}`,
    },
    {
      header: t("tableHeaders.status"),
      accessor: "status",
      sortable: true,
      render: (status, item) => (
        <OrderStatusBadge status={status} orderStatuses={orderStatuses} />
      ),
    },
    {
      header: t("tableHeaders.time"),
      accessor: "orderTime",
      sortable: true,
      render: (value, item) =>
        item.timestamps?.orderPlacedLocal ||
        (value ? new Date(value).toLocaleTimeString() : "N/A"),
    },
  ];

  // Order status configuration for categories
  const ORDER_STATUSES = [
    { value: "received", label: "Received", color: "blue", icon: Package },
    {
      value: "completed",
      label: "Completed",
      color: "gray",
      icon: CheckCircle,
    },
  ];

  // Orders By Category Columns
  const OrdersByCategoryColumn = [
    {
      header: t("tableHeaders.category"),
      accessor: "category",
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
          </div>
        </div>
      ),
    },
    {
      header: t("tableHeaders.revenue"),
      accessor: "revenue",
      render: (value) => (
        <span className="text-sm text-gray-600">
          ₹{value?.toLocaleString()}
        </span>
      ),
    },
    {
      header: t("tableHeaders.orders"),
      accessor: "orderCount",
      render: (value) => (
        <span className="font-semibold text-gray-900">{value} orders</span>
      ),
    },
    {
      header: t("tableHeaders.percentage"),
      accessor: "percentage",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 min-w-[40px]">
            {value.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  // Orders By Menu Columns
  const OrdersByMenuColumn = [
    {
      header: t("tableHeaders.menuItem"),
      accessor: "menuName",
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          {!item.imageUrl && (
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{value}</p>
          </div>
        </div>
      ),
    },
    {
      header: t("tableHeaders.revenue"),
      accessor: "revenue",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          ₹{value?.toLocaleString()}
        </span>
      ),
    },
    {
      header: t("tableHeaders.orders"),
      accessor: "orderCount",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">{value} orders</span>
      ),
    },
    {
      header: t("tableHeaders.percentage"),
      accessor: "percentage",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 min-w-[40px]">
            {value.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  const ViewAdminColumns = [
    {
      Header: "S.No",
      accessor: "srNo",
      Cell: ({ value }) => <span>{value}</span>,
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Phone",
      accessor: "phone",
    },
    {
      Header: "Role",
      accessor: "role",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row, onEdit, onDelete }) => (
        <div className="flex gap-2">
          <button onClick={() => onEdit(row.original)}>Edit</button>
          <button onClick={() => onDelete(row.original)}>Delete</button>
        </div>
      ),
    },
  ];

  const ViewHotelColumns = [
    {
      Header: "S.No",
      accessor: "srNo",
    },
    {
      Header: "Hotel Name",
      accessor: "hotelName",
    },
    {
      Header: "Address",
      accessor: "address",
    },
    {
      Header: "Phone",
      accessor: "phone",
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row, onEdit, onDelete }) => (
        <div className="flex gap-2">
          <button onClick={() => onEdit(row.original)}>Edit</button>
          <button onClick={() => onDelete(row.original)}>Delete</button>
        </div>
      ),
    },
  ];

  const ViewSubscriptionPlanColumns = [
    {
      Header: "Sr No",
      accessor: "srNo",
      width: "60px",
      disableSortBy: true,
      Cell: ({ value }) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      Header: "Plan Name",
      accessor: "planName",
      Cell: ({ value }) => (
        <div className="flex items-center">
          <span className="text-sm font-semibold text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      Header: "Price",
      accessor: "price",
      Cell: ({ value }) => (
        <span className="text-sm font-medium text-green-600">
          ₹{parseFloat(value || 0).toFixed(2)}
        </span>
      ),
    },
    {
      Header: "Duration",
      accessor: "duration",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-700 capitalize">
          {value || "N/A"}
        </span>
      ),
    },
    {
      Header: "Max Users",
      accessor: "maxUsers",
      Cell: ({ value }) => (
        <span className="text-sm text-gray-700">
          {value ? `${value} users` : "Unlimited"}
        </span>
      ),
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => {
        const status = value || "active";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status === "active" ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      Header: "Features",
      accessor: "features",
      Cell: ({ value }) => (
        <div className="text-sm text-gray-600 max-w-xs">
          <div className="truncate" title={value}>
            {value
              ? value.slice(0, 50) + (value.length > 50 ? "..." : "")
              : "No features"}
          </div>
        </div>
      ),
    },
    // {
    //   Header: "Created",
    //   accessor: "createdAt",
    //   Cell: ({ value }) => {
    //     if (!value) return <span className="text-sm text-gray-500">N/A</span>;

    //     try {
    //       // Handle Firebase Timestamp objects
    //       let date;
    //       if (value && typeof value === "object" && value.seconds) {
    //         // Firebase Timestamp object
    //         date = new Date(value.seconds * 1000);
    //       } else if (value && value.toDate) {
    //         // Firebase Timestamp with toDate method
    //         date = value.toDate();
    //       } else if (value instanceof Date) {
    //         // Already a Date object
    //         date = value;
    //       } else if (typeof value === "string" || typeof value === "number") {
    //         // String or number timestamp
    //         date = new Date(value);
    //       } else {
    //         return <span className="text-sm text-gray-500">N/A</span>;
    //       }

    //       return (
    //         <span className="text-sm text-gray-600">
    //           {date.toLocaleDateString()}
    //         </span>
    //       );
    //     } catch (error) {
    //       console.error("Error formatting date:", error);
    //       return <span className="text-sm text-gray-500">Invalid Date</span>;
    //     }
    //   },
    // },
    {
      Header: "Actions",
      accessor: "actions",
      disableSortBy: true,
      Cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              row.original.onEdit && row.original.onEdit(row.original)
            }
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Edit Plan"
          >
            Edit
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() =>
              row.original.onDelete && row.original.onDelete(row.original)
            }
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Delete Plan"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return {
    ViewCategoryColumns,
    ViewMenuColumns,
    adminsListColumn,
    hotelsListColumn,
    hotelsSubscriptionListColumn,
    ViewOffersColumns,
    ViewCaptainColumns,
    orderColumns,
    OrdersByCategoryColumn,
    OrdersByMenuColumn,
    orderStatuses,
    ORDER_STATUSES,
    ViewAdminColumns,
    ViewHotelColumns,
    ViewSubscriptionPlanColumns,
  };
};

export default useColumns;
