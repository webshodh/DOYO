import { ChevronDown, Loader, LogOut, User } from "lucide-react";
import LanguageSelector from "./Selector/LanguageSelector";
import UserAvatar from "./UserAvatar";
import { memo } from "react";

// Profile dropdown component
const ProfileDropdown = memo(
  ({
    user,
    isOpen,
    onToggle,
    onEditProfile,
    onLogout,
    dropdownRef,
    isLoggingOut = false,
  }) => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <UserAvatar user={user} />
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" />

          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-2">
              {/* User info */}
              <div className="px-3 py-3 border-b border-gray-100 mb-2">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {user?.displayName || "Admin User"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="space-y-1">
                <LanguageSelector />
                <button
                  onClick={onEditProfile}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="font-medium">Edit Profile</span>
                </button>

                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-red-50 text-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    {isLoggingOut ? (
                      <Loader className="w-4 h-4 text-red-500 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <span className="font-medium">
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
);

ProfileDropdown.displayName = "ProfileDropdown";
export default ProfileDropdown