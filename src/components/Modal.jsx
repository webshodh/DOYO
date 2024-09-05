import React from "react";

const Modal = ({ handleClose, title, children }) => {
  return (
    <>
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div
          className="modal-dialog"
          style={{ maxWidth: "80%", height: "auto" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body bg-white">{children}</div>
          </div>
          <div className="modal-footer bg-white"></div>
        </div>
      </div>
    </>
  );
};

export default Modal;
