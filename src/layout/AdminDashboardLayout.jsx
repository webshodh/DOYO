import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  createContext,
  useContext,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { ChevronUp } from "lucide-react";

import Sidebar from "organisms/SideBarComponent";
import Navbar from "organisms/NavBarComponent";

// Layout context
const LayoutContext = createContext({
  isSidebarOpen: false,
  isDesktop: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const useLayout = () => useContext(LayoutContext);

// Responsive hook
const useResponsive = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isDesktop };
};

// Main content wrapper
const MainContent = memo(({ children }) => (
  <main className="flex-1 overflow-hidden">
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/70 scrollbar-track-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto relative">{children}</div>
      </div>
    </div>
  </main>
));

MainContent.displayName = "MainContent";

// Scroll to top button
const ScrollToTop = memo(() => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      setShowScrollTop(e.target.scrollTop > 300);
    };

    const scrollContainer = document.querySelector("main > div");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector("main > div");
    scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return showScrollTop ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  ) : null;
});

ScrollToTop.displayName = "ScrollToTop";

// Main layout component
const AdminDashboardLayout = memo(({ children }) => {
  const { hotelName } = useParams();
  const location = useLocation();
  const { isDesktop } = useResponsive();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close sidebar on route change for mobile
  useEffect(() => {
    if (!isDesktop) setIsSidebarOpen(false);
  }, [location.pathname, isDesktop]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const layoutValue = useMemo(
    () => ({
      isSidebarOpen,
      isDesktop,
      toggleSidebar,
      closeSidebar,
    }),
    [isSidebarOpen, isDesktop, toggleSidebar, closeSidebar]
  );

  return (
    <LayoutContext.Provider value={layoutValue}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile overlay */}
        {!isDesktop && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          ${
            isDesktop
              ? "relative flex-shrink-0 w-64"
              : `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
          }
        `}
        >
          <Sidebar
            isOpen={isDesktop || isSidebarOpen}
            onClose={closeSidebar}
            admin={true}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Navbar */}
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
            <Navbar
              title="Admin Dashboard"
              hotelName={hotelName}
              onMenuToggle={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              admin={true}
            />
          </header>

          {/* Main content */}
          <MainContent>{children}</MainContent>
        </div>

        {/* Scroll to top */}
        <ScrollToTop />
      </div>
    </LayoutContext.Provider>
  );
});

AdminDashboardLayout.displayName = "AdminDashboardLayout";

export default AdminDashboardLayout;
