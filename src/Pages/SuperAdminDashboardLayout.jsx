import React, { useState, useEffect } from "react";
import Sidebar from "components/SideBarComponent";
import Navbar from "components/NavBarComponent";

// Super Admin Dashboard Layout Component
const SuperAdminDashboardLayout = ({ children }) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      {/* Background Pattern - More sophisticated for Super Admin */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.05)_50%,transparent_75%)] bg-[size:40px_40px]"></div>
      </div>

      {/* Floating geometric shapes for premium feel */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-pink-300/20 rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-200/20 to-blue-300/20 rounded-full blur-xl animate-float-slow"></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <div className={`${isDesktop ? "relative" : "absolute"} z-50`}>
          <Sidebar
            isOpen={isDesktop ? true : isSidebarOpen}
            onClose={closeSidebar}
            admin={false}
          />
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 `}
        >
          {/* Navbar */}
          <div className="sticky top-0 z-30">
            <Navbar
              onMenuToggle={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              admin={false}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {/* Content Container */}
            <div className="h-full overflow-y-auto custom-scrollbar">
              {/* Content Wrapper */}
              <div className="min-h-full">
                {/* Content Area */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                  {/* Content Background */}
                  <div className="relative">
                    {/* Premium decorative elements for Super Admin */}
                    <div className="absolute top-0 right-0 -z-10 opacity-15">
                      <div className="w-80 h-80 bg-gradient-to-br from-blue-300 via-indigo-300 to-purple-400 rounded-full blur-3xl"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 -z-10 opacity-10">
                      <div className="w-96 h-96 bg-gradient-to-br from-cyan-300 via-blue-300 to-indigo-400 rounded-full blur-3xl"></div>
                    </div>
                    <div className="absolute top-1/3 right-1/4 -z-10 opacity-8">
                      <div className="w-64 h-64 bg-gradient-to-br from-purple-300 via-pink-300 to-rose-400 rounded-full blur-3xl"></div>
                    </div>

                    {/* Main Content */}
                    <div className="relative z-10">{children}</div>
                  </div>
                </div>

                {/* Enhanced Footer for Super Admin */}
                <footer className="mt-auto border-t border-slate-200/50 bg-white/90 backdrop-blur-md">
                  <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-6 sm:space-y-0">
                      {/* Left side - Brand with Super Admin styling */}
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            Super Admin Control Center
                          </p>
                          <p className="text-xs text-gray-600">
                            Enterprise Management Platform
                          </p>
                        </div>
                      </div>

                      {/* Center - System metrics */}
                      <div className="flex items-center space-x-8">
                        {/* System Health */}
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              System Health
                            </p>
                            <p className="text-xs text-green-600">Excellent</p>
                          </div>
                        </div>

                        {/* Active Users */}
                        <div className="hidden md:flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">
                              Active Users
                            </p>
                            <p className="text-xs text-blue-600">
                              1,247 online
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Advanced controls */}
                      <div className="flex items-center space-x-4">
                        <div className="hidden lg:flex items-center space-x-3 text-xs text-gray-500">
                          <button className="hover:text-blue-600 transition-colors font-medium">
                            System Logs
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="hover:text-blue-600 transition-colors font-medium">
                            API Status
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="hover:text-blue-600 transition-colors font-medium">
                            Documentation
                          </button>
                        </div>

                        {/* Security Status */}
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-lg border border-green-200/50">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs font-semibold text-green-700">
                            Secure
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Advanced metrics bar */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            99.9%
                          </p>
                          <p className="text-xs text-gray-600">Uptime</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            2.3ms
                          </p>
                          <p className="text-xs text-gray-600">Response Time</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">
                            156
                          </p>
                          <p className="text-xs text-gray-600">
                            Hotels Managed
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-indigo-600">
                            4.8/5
                          </p>
                          <p className="text-xs text-gray-600">Satisfaction</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
                        <span>
                          Last system update: {new Date().toLocaleDateString()}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>Version 3.2.1 Enterprise</span>
                      </div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Enhanced loading overlay */}
      <div
        className={`fixed inset-0 bg-gradient-to-br from-white/90 to-slate-100/90 backdrop-blur-md z-[60] flex items-center justify-center transition-all duration-500 ${
          isDesktop
            ? "opacity-0 pointer-events-none"
            : "lg:opacity-0 lg:pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-600 rounded-full animate-spin animate-reverse"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              Super Admin Portal
            </p>
            <p className="text-sm text-gray-600">
              Initializing enterprise controls...
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles with Super Admin theme */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.6);
          border-radius: 12px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgba(59, 130, 246, 0.7),
            rgba(99, 102, 241, 0.7)
          );
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            rgba(59, 130, 246, 0.9),
            rgba(99, 102, 241, 0.9)
          );
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        .custom-scrollbar {
          scroll-behavior: smooth;
        }

        /* Enhanced animations for Super Admin */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-15px) rotate(2deg) scale(1.05);
          }
          66% {
            transform: translateY(8px) rotate(-1deg) scale(0.95);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(12px) rotate(-2deg) scale(1.1);
          }
          66% {
            transform: translateY(-6px) rotate(1deg) scale(0.9);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }

        @keyframes reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite 2s;
        }

        .animate-float-slow {
          animation: float-slow 12s linear infinite;
        }

        .animate-reverse {
          animation: reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboardLayout;
