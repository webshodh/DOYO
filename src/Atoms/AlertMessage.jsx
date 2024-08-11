import React from "react";
import PropTypes from "prop-types";

const AlertMessage = ({
  message,
  type = "warning",
  icon = "bi-exclamation-triangle",
}) => {
  return (
    <div
      className={`alert alert-${type} d-flex align-items-center`}
      role="alert"
    >
      <svg
        className={`bi flex-shrink-0 me-2`}
        width="24"
        height="24"
        role="img"
        aria-label="Alert icon"
        xmlns="http://www.w3.org/2000/svg"
      >
        <use href={`#${icon}`} />
      </svg>
      <div>
        <strong>{message}</strong>
      </div>
    </div>
  );
};

AlertMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["warning", "danger", "info", "success"]),
  icon: PropTypes.string,
};

export default AlertMessage;
