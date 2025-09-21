import React, { memo } from "react";
import { Building, X } from "lucide-react";
import { getRoleThemes } from "Constants/sideBarMenuConfig";
import { useTranslation } from "react-i18next";

// Header component
const SidebarHeader = memo(({ role, onClose }) => {
  const { t } = useTranslation();
  const theme = getRoleThemes(t)[role];

  return (
    <div
      className={`flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r ${theme.bgGradient} relative`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-8 h-8 bg-gradient-to-br ${theme.gradient} rounded-lg flex items-center justify-center shadow-md`}
        >
          <Building className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {theme.title}
          </h2>
          <p className="text-xs text-gray-600">{theme.subtitle}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="lg:hidden p-2 rounded-lg hover:bg-white/80 transition-colors"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${theme.gradient}`}
      />
    </div>
  );
});

SidebarHeader.displayName = "SidebarHeader";
export default SidebarHeader;
