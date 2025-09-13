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
import {
  Menu,
  X,
  Wifi,
  WifiOff,
  Clock,
  Server,
  Activity,
  Shield,
  HelpCircle,
  Settings,
  ChevronUp,
  Building,
} from "lucide-react";

import Sidebar from "organisms/SideBarComponent";
import Navbar from "organisms/NavBarComponent";

// Layout context for child components
const LayoutContext = createContext({
  isSidebarOpen: false,
  isDesktop: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const useLayout = () => useContext(LayoutContext);

// Custom hook for responsive behavior
const useResponsive = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1024);
      setIsMobile(width < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isDesktop, isMobile };
};

// Background pattern component
const BackgroundPattern = memo(() => (
  <div className="fixed inset-0 opacity-30 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.8)_1px,transparent_0)] bg-[size:20px_20px]" />

    {/* Floating decorative elements */}
    <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-indigo-200/10 rounded-full blur-3xl animate-pulse delay-1000" />
  </div>
));

BackgroundPattern.displayName = "BackgroundPattern";

// System status component
const SystemStatus = memo(({ isOnline = true, lastUpdate }) => (
  <div className="flex items-center gap-2 text-xs">
    <div className="flex items-center gap-1">
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3 text-green-500" />
          <span className="text-green-600 font-medium">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-red-500" />
          <span className="text-red-600 font-medium">Offline</span>
        </>
      )}
    </div>

    {lastUpdate && (
      <div className="flex items-center gap-1 text-gray-500">
        <Clock className="w-3 h-3" />
        <span>{lastUpdate}</span>
      </div>
    )}
  </div>
));

SystemStatus.displayName = "SystemStatus";

// Performance indicator component
const PerformanceIndicator = memo(({ status = "optimal" }) => {
  const statusConfig = {
    optimal: {
      color: "bg-green-400",
      text: "Optimal",
      textColor: "text-green-600",
    },
    good: {
      color: "bg-yellow-400",
      text: "Good",
      textColor: "text-yellow-600",
    },
    slow: { color: "bg-red-400", text: "Slow", textColor: "text-red-600" },
  };

  const config = statusConfig[status] || statusConfig.optimal;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.text}
        </span>
      </div>
      <Activity className="w-3 h-3 text-gray-400" />
    </div>
  );
});

PerformanceIndicator.displayName = "PerformanceIndicator";

// Footer component
const Footer = memo(({ className = "" }) => {
  const currentTime = useMemo(
    () =>
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  return (
    <footer
      className={`mt-auto border-t border-gray-200/80 bg-white/90 backdrop-blur-md ${className}`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left side - Branding */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <Building className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  Hotel Management System
                </p>
                <p className="text-xs text-gray-500">
                  &copy; 2025 All rights reserved
                </p>
              </div>
            </div>

            {/* Right side - Status and links */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <SystemStatus isOnline={true} lastUpdate={currentTime} />

              {/* Quick links - Hidden on mobile */}
              <nav className="hidden md:flex items-center gap-4 text-xs text-gray-500">
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  <HelpCircle className="w-3 h-3" />
                  Help
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  <Shield className="w-3 h-3" />
                  Privacy
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                  <Settings className="w-3 h-3" />
                  Settings
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

// Main content wrapper component
const MainContent = memo(({ children, className = "" }) => (
  <main className={`flex-1 overflow-hidden ${className}`}>
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="min-h-full">
        {/* Content padding wrapper */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="relative max-w-7xl mx-auto">
            {/* Decorative background elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-2xl opacity-60 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-2xl opacity-40 pointer-events-none" />

            {/* Actual content */}
            <div className="relative z-10">{children}</div>
          </div>
        </div>
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

    const scrollContainer = document.querySelector(".custom-scrollbar");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.querySelector(".custom-scrollbar");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
});

ScrollToTop.displayName = "ScrollToTop";

// Main AdminDashboardLayout component
const AdminDashboardLayout = memo(({ children }) => {
  const { hotelName } = useParams();
  const location = useLocation();
  const { isDesktop, isMobile } = useResponsive();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isDesktop]);

  // Handle initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Sidebar handlers
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Memoized layout context value
  const layoutContextValue = useMemo(
    () => ({
      isSidebarOpen,
      isDesktop,
      isMobile,
      toggleSidebar,
      closeSidebar,
    }),
    [isSidebarOpen, isDesktop, isMobile, toggleSidebar, closeSidebar]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
        {/* Background Pattern */}
        <BackgroundPattern />

        <div className="relative flex h-screen">
          {/* Mobile overlay */}
          {!isDesktop && isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            />
          )}

          {/* Sidebar */}
          {isDesktop ? (
            // Desktop: Always visible sidebar
            <aside className="relative flex-shrink-0 w-64 bg-white/95 backdrop-blur-md border-r border-gray-200/80 shadow-lg">
              <Sidebar isOpen={true} onClose={closeSidebar} admin={true} />
            </aside>
          ) : (
            // Mobile: Overlay sidebar
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                admin={true}
              />
            </aside>
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
            {/* Navbar */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
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

            {/* Footer */}
            <Footer />
          </div>
        </div>

        {/* Scroll to top button */}
        <ScrollToTop />

        {/* Custom styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(243, 244, 246, 0.5);
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(
              to bottom,
              rgba(249, 115, 22, 0.7),
              rgba(245, 158, 11, 0.7)
            );
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              to bottom,
              rgba(249, 115, 22, 0.9),
              rgba(245, 158, 11, 0.9)
            );
          }

          .custom-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
          }

          /* Smooth scrolling */
          .custom-scrollbar {
            scroll-behavior: smooth;
          }

          /* Mobile optimizations */
          @media (max-width: 640px) {
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
              height: 4px;
            }
          }

          /* Background animations */
          @keyframes float {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
            }
            33% {
              transform: translateY(-10px) rotate(1deg);
            }
            66% {
              transform: translateY(5px) rotate(-1deg);
            }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </LayoutContext.Provider>
  );
});

AdminDashboardLayout.displayName = "AdminDashboardLayout";

// Default props
AdminDashboardLayout.defaultProps = {
  children: null,
};

export default AdminDashboardLayout;
