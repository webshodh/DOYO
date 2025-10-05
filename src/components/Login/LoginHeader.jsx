import React, { memo } from "react";

const LoginHeader = memo(({ loginConfig }) => (
  <div className="text-center mb-8">
    <loginConfig.icon
      className={`mx-auto text-5xl ${loginConfig.iconColor} mb-4`}
    />
    <h3 className={`text-4xl font-extrabold ${loginConfig.titleColor} mb-2`}>
      {loginConfig.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{loginConfig.subtitle}</p>
  </div>
));

LoginHeader.displayName = "LoginHeader";
export default LoginHeader;
