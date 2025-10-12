import React from "react";

function PageTitle({ pageTitle, description }) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-semibold text-white mb-0">{pageTitle}</h1>
      <p className="text-white mt-1">{description}</p>
    </div>
  );
}

export default PageTitle;
