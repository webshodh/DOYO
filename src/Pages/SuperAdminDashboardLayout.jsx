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

      {/* Mobile Sidebar Overlay */}
      {!isDesktop && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="relative flex h-screen">
        {/* Sidebar Container */}
        <div className={`
          ${isDesktop 
            ? "relative w-64 flex-shrink-0" 
            : "absolute inset-y-0 left-0 z-50 w-64"
          }
          ${!isDesktop && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
          transition-transform duration-300 ease-in-out
        `}>
          <Sidebar
            isOpen={true} // Always true since we handle visibility via transform
            onClose={closeSidebar}
            admin={false}
          />
        </div>

        {/* Main Content Area */}
        <div className={`
          flex-1 flex flex-col min-w-0 transition-all duration-300
          ${isDesktop ? "ml-0" : "ml-0"}
        `}>
          {/* Navbar */}
          <div className="sticky top-0 z-30">
            <Navbar
              onMenuToggle={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              admin={false}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden bg-transparent">
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
                  </div>
                </footer>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
          animation-delay: 4s;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboardLayout;