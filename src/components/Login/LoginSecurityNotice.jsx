import React, { memo } from "react";
import { FaShieldAlt } from "react-icons/fa";

const SecurityNotice = memo(({ loginConfig }) => (
  <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
    <div className="flex items-center">
      <FaShieldAlt className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" />
      <p className="text-sm text-blue-800 dark:text-blue-200">
        {loginConfig.securityNotice}
      </p>
    </div>
  </div>
));

SecurityNotice.displayName = "SecurityNotice";
export default SecurityNotice;
