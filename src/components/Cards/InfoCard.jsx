import React from "react";
import { colors } from "theme/theme";

const InfoCard = ({ title, children }) => {
  return (
    <div
      className="rounded-3 bg-danger py-4 px-3 text-center"
      style={{
        background: colors.Orange,
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
