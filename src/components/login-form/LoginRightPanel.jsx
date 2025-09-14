import React, { memo } from "react";

const LoginRightPanel = memo(({ loginConfig }) => (
  <div
    className={`md:w-2/5 w-full ${loginConfig.rightPanelBg} flex items-center justify-center p-8`}
  >
    <div className="text-center text-white">
      <img
        src={loginConfig.rightPanelImage}
        alt={loginConfig.imageAlt}
        className="max-w-full h-64 object-contain mb-6 mx-auto rounded-lg shadow-lg"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
      <div className="space-y-4">
        <loginConfig.rightPanelIcon className="mx-auto text-8xl opacity-20" />
        <h2 className="text-3xl font-bold">{loginConfig.rightPanelTitle}</h2>
        <p className="text-lg opacity-90">{loginConfig.rightPanelSubtitle}</p>
        <div className="space-y-2">
          {loginConfig.features?.map((feature, index) => (
            <p key={index} className="text-sm opacity-80">
              ✓ {feature}
            </p>
          ))}
        </div>
      </div>
    </div>
  </div>
));

LoginRightPanel.displayName = "LoginRightPanel";
export default LoginRightPanel;
