export const OrdersAndRevenueByMenuColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Category", accessor: "menuCategory" },
  { header: "Menu Name", accessor: "menuName" },
  { header: "Menu Price", accessor: "menuPrice" },
  { header: "Orders", accessor: "menuCount" },
  { header: "Total Price", accessor: "totalMenuPrice" },
];

export const RevenueByCategoryColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Category", accessor: "menuCategory" },
  { header: "Orders", accessor: "menuCategoryCount" },
  { header: "Price", accessor: "totalMenuPrice" },
];

export const OrdersAndRevenueByCutomerColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Name", accessor: "name" },
  { header: "Orders", accessor: "totalOrders" },
  { header: "Total Price", accessor: "totalMenuPrice" },
];

export const ViewCategoryColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Category Name", accessor: "categoryName" },
];

export const ViewSectionColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Section Name", accessor: "sectionName" },
];

export const ViewRoleColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Role", accessor: "roleName" },
];

export const ViewMenuColumns = [
  { header: "Sr.No", accessor: "Sr.No" },
  { header: "Menu Category", accessor: "Menu Category" },
  { header: "Menu Name", accessor: "Menu Name" },
  { header: "Cooking Time", accessor: "Cooking Time" },
  { header: "Price", accessor: "Price" },
  { header: "Availability", accessor: "Availability" },
];

export const ViewTableColumns = [
  { header: "Sr.No", accessor: "Sr.No" },
  { header: "Section", accessor: "SectionName" },
  { header: "Table Name", accessor: "TableName" },
  { header: "Capacity", accessor: "Capacity" },
];

export const customersColumns = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Customer Name", accessor: "name" },
  { header: "Mobile Number", accessor: "mobileNo" },
  { header: "Order Count", accessor: "totalOrders" },
  { header: "Order Price", accessor: "totalMenuPrice" },
  { header: "Last Visit", accessor: "date" },
];

export const adminsListColumn = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Customer Name", accessor: "name" },
  { header: "Customer Surname", accessor: "surname" },
  { header: "Mobile Number", accessor: "mobile" },
  { header: "Email", accessor: "email" },
  { header: "Role", accessor: "role" },
];

export const HotelsListColumn = [
  { header: "Sr.No", accessor: "srNo" },
  { header: "Hotel Name", accessor: "name" },
  { header: "Country", accessor: "surname" },
  { header: "State", accessor: "mobile" },
  { header: "District", accessor: "email" },
  { header: "Area", accessor: "role" },
  { header: "Created At", accessor: "role" },
];

export const CartDetailscolumns = [
  { header: "Sr.No", accessor: "Sr.No" },
  { header: "Menu Name", accessor: "Item Name" },
  { header: "Quantity", accessor: "Quantity" },
  { header: "Price", accessor: "Price (INR)" },
  { header: "Total Price", accessor: "Total Price (INR)" },
];

export const pendingOrdercolumns = [
  { header: "Sr.No", accessor: "index" },
  { header: "Menu Name", accessor: "menuName" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Table No", accessor: "tableNo" },
  { header: "Name", accessor: "name" },
];

export const completedOrderColumn = [
  { header: "Sr.No", accessor: "index" },
  { header: "Name", accessor: "name" },
  { header: "Table No", accessor: "tableNo" },
  { header: "Item Name", accessor: "menuName" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Price", accessor: "menuPrice" },
  { header: "Total", accessor: "bill" },
];

export const cancelledOrderColumn = [
  { header: "Sr.No", accessor: "index" },
  { header: "Item Name", accessor: "menuName" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Table No", accessor: "tableNo" },
  { header: "Name", accessor: "name" },
  { header: "Waiter Name", accessor: "waiterName" },
  { header: "Rejection Reason", accessor: "rejectionReason" },
];

export const AcceptedOrderColumn = [
  { header: "Sr.No", accessor: "index" },
  { header: "Item Name", accessor: "menuName" },
  { header: "Quantity", accessor: "quantity" },
  { header: "Table No", accessor: "tableNo" },
  { header: "Name", accessor: "name" },
];

export const  ViewStaffColumns = [
  { header: "Sr.No", accessor: "Sr.No" },
  { header: "First Name", accessor: "FirstName" },
  { header: "Last Name", accessor: "LastName" },
  { header: "UPI Id", accessor: "upiId" },
  { header: "Role", accessor: "Role" },
];

