import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
  createContext,
  useContext,
} from "react";
import { useLocation } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import Sidebar from "components/SideBarComponent";
import Navbar from "components/NavBarComponent";

// Layout context for Captain Dashboard
const CaptainLayoutContext = createContext({
  isSidebarOpen: false,
  isDesktop: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const useCaptainLayout = () => useContext(CaptainLayoutContext);

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

// Content area with loading overlay
const CaptainContentArea = memo(({ children, isLoading, loadingComponent }) => {
  return (
    <div className="relative h-full">
      {/* Always render children - they handle their own loading states */}
      <div className={`h-full ${isLoading ? 'pointer-events-none' : ''}`}>
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400/50 scrollbar-track-transparent">
          <div>
            <div>{children}</div>
          </div>
        </div>
      </div>

      {/* Loading overlay - only shows when explicitly requested */}
      {isLoading && loadingComponent && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/90 via-amber-50/90 to-yellow-50/90 backdrop-blur-sm z-10">
          <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400/50 scrollbar-track-transparent">
            <div>
              <div>{loadingComponent}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CaptainContentArea.displayName = "CaptainContentArea";

// Scroll to top button
const CaptainScrollToTop = memo(() => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = (e) => {
      setShowScrollTop(e.target.scrollTop > 300);
    };

    const scrollContainer = document.querySelector(".captain-content-scroll-area");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector(".captain-content-scroll-area");
    scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return showScrollTop ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
  ) : null;
});

CaptainScrollToTop.displayName = "CaptainScrollToTop";

// Main Captain Dashboard Layout
const CaptainDashboardLayout = memo(({
  children,
  isLoading = false,
  loadingComponent = null,
  showLoadingOverlay = false,
}) => {
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
    <CaptainLayoutContext.Provider value={layoutValue}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Mobile overlay */}
        {!isDesktop && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeSidebar}
          />
        )}

        <div className="flex h-screen">
          {/* Sidebar - Always visible, never shows loading */}
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
            <Sidebar
              isOpen={true}
              onClose={closeSidebar}
              admin={false}
              captain={true}
            />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Navbar - Always visible, never shows loading */}
            <header className="sticky top-0 z-30">
              <Navbar
                title="Captain Dashboard"
                onMenuToggle={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                admin={false}
                captain={true}
              />
            </header>

            {/* Main content with conditional loading */}
            <main className="flex-1 overflow-hidden">
              <div className="h-full captain-content-scroll-area">
                <CaptainContentArea
                  isLoading={showLoadingOverlay && isLoading}
                  loadingComponent={loadingComponent}
                >
                  {children}
                </CaptainContentArea>
              </div>
            </main>
          </div>
        </div>

        {/* Scroll to top */}
        <CaptainScrollToTop />
      </div>
    </CaptainLayoutContext.Provider>
  );
});

CaptainDashboardLayout.displayName = "CaptainDashboardLayout";

export default CaptainDashboardLayout;
