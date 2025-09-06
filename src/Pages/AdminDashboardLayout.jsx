import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "components/SideBarComponent";
import Navbar from "components/NavBarComponent";

// Dashboard Layout Component
const AdminDashboardLayout = ({ children }) => {
  const { hotelName } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024; // lg breakpoint
      setIsDesktop(desktop);

      // Auto-close sidebar on mobile when resizing
      if (!desktop) {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.8)_1px,transparent_0)] bg-[size:20px_20px]"></div>
      </div>

      <div className="relative flex h-screen">
        {/* Mobile Overlay */}
        {!isDesktop && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar - Desktop: Always visible, Mobile: Overlay */}
        {isDesktop ? (
          // Desktop Sidebar - Always visible beside content
          <div className="relative flex-shrink-0 w-64 bg-white border-r border-gray-200/50">
            <Sidebar
              isOpen={true}
              onClose={closeSidebar}
              admin={true}
            />
          </div>
        ) : (
          // Mobile Sidebar - Overlay when open
          <div 
            className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={closeSidebar}
              admin={true}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isDesktop ? 'ml-0' : ''}`}>
          {/* Navbar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
            <Navbar
              title="Admin Dashboard"
              hotelName={hotelName}
              onMenuToggle={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              admin={true}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {/* Content Container */}
            <div className="h-full overflow-y-auto custom-scrollbar">
              {/* Content Wrapper with improved spacing and background */}
              <div className="min-h-full">
                {/* Content Area */}
                <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                  {/* Content Background with improved responsive spacing */}
                  <div className="relative max-w-7xl mx-auto">
                    {/* Decorative elements - adjusted for mobile */}
                    <div className="absolute top-0 right-0 -z-10 opacity-20">
                      <div className="w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-br from-orange-200 via-amber-200 to-orange-300 rounded-full blur-3xl"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 -z-10 opacity-10">
                      <div className="w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-200 via-indigo-200 to-blue-300 rounded-full blur-3xl"></div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10">{children}</div>
                  </div>
                </div>

                {/* Footer - Improved responsive design */}
                <footer className="mt-auto border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                  <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        {/* Left side - Copyright */}
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              Hotel Management System
                            </p>
                            <p className="text-xs text-gray-600">
                              © 2024 All rights reserved
                            </p>
                          </div>
                        </div>

                        {/* Right side - Status and links */}
                        <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                          {/* System Status */}
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-600 font-medium">
                                Online
                              </span>
                            </div>
                          </div>

                          {/* Quick Links - Hidden on mobile to save space */}
                          <div className="hidden md:flex items-center space-x-4 text-xs text-gray-500">
                            <button className="hover:text-gray-700 transition-colors">
                              Help
                            </button>
                            <button className="hover:text-gray-700 transition-colors">
                              Privacy
                            </button>
                            <button className="hover:text-gray-700 transition-colors">
                              Terms
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Performance indicator - Simplified for mobile */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="truncate">
                            Updated: {new Date().toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            <span>Optimal</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom Styles */}
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
            rgba(249, 115, 22, 0.6),
            rgba(245, 158, 11, 0.6)
          );
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            rgba(249, 115, 22, 0.8),
            rgba(245, 158, 11, 0.8)
          );
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Smooth scrolling */
        .custom-scrollbar {
          scroll-behavior: smooth;
        }

        /* Background pattern animation */
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

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardLayout;