import Sidebar from "components/SideBarComponent";
import Navbar from "components/NavBarComponent";
const { useState } = require("react");

// Dashboard Layout Component
const AdminDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} admin={true}/>
      <div className="flex-1 flex flex-col lg:ml-0">
        <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} admin={true} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
