import React, { useState, useEffect } from "react";
import Sidebar from "organisms/SideBarComponent";
import Navbar from "organisms/NavBarComponent";

const SuperAdminDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {!isDesktop && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
          ${
            isDesktop
              ? "relative w-64 flex-shrink-0"
              : "fixed inset-y-0 left-0 z-50 w-64"
          }
          ${
            !isDesktop && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
          }
          transition-transform duration-300
        `}
        >
          <Sidebar isOpen={true} onClose={closeSidebar} admin={false} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <header className="sticky top-0">
            <Navbar
              onMenuToggle={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              admin={false}
            />
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400/50 scrollbar-track-transparent">
              <div>
                <div>{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardLayout;
