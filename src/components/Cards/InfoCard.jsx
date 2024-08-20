import React from "react";

const InfoCard = ({ title, children }) => {
  return (
    <div
      className="rounded-3 bg-danger py-4 px-3 text-center"
      style={{
        background: "linear-gradient(to top right, #f472b6, #ef4444, #f59e0b)", // Equivalent to Tailwind's gradient
        color: "white",
      }}
    >
      <h4 className="display-6 font-weight-bold">{title}</h4>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

export default InfoCard;
