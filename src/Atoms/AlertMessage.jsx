import React, { useState } from "react";
import PropTypes from "prop-types";

const AlertMessage = ({
  message,
  type = "warning",
  icon = "bi-exclamation-triangle",
  linkText,
  linkUrl,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`alert alert-${type} d-flex align-items-center justify-content-between`}
      role="alert"
      style={{marginBottom:'0px'}}
    >
      <div className="d-flex align-items-center" >
        <svg
          className="bi flex-shrink-0 me-2"
          width="24"
          height="24"
          role="img"
          aria-label="Alert icon"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use href={`#${icon}`} />
        </svg>
        <div>
          <strong>{message}</strong>{" "}
          {linkUrl && (
            <a href={linkUrl} className="alert-link">
              {linkText}
            </a>
          )}
        </div>
      </div>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={handleClose}
      ></button>
    </div>
  );
};

AlertMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["warning", "danger", "info", "success"]),
  icon: PropTypes.string,
  linkText: PropTypes.string,
  linkUrl: PropTypes.string,
};

export default AlertMessage;
