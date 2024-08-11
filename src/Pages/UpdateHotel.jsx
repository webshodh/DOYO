import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { update, ref, onValue } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";

function UpdateHotel() {
  const [updatedHotelName, setupdatedHotelName] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Fetch the existing todo to display in the input field
    onValue(ref(db, `/${id}`), (snapshot) => {
      if (snapshot.exists()) {
        setupdatedHotelName(snapshot.val().Hotelname);
      }
    });
  }, [id]);

  const handleSubmitChange = () => {
    if (window.confirm("confirm update")) {
      update(ref(db, `/${id}`), {
        Hotelname: updatedHotelName,
        uuid: id,
      });
    }
    toast.success("Hotel Updated Successfully !", {
      position: toast.POSITION.TOP_RIGHT,
    });
    navigate("/viewHotel"); // Redirect back to the ViewTodos page
  };

  const handleCancelChange = () => {
    navigate("/viewHotel"); // Redirect back to the ViewTodos page
  };

  return (
    <div className="add-hotel-container">
      <h1>Update Hotel</h1>
      <input
        type="text"
        value={updatedHotelName}
        onChange={(e) => setupdatedHotelName(e.target.value)}
      />
      <div>
        <button onClick={handleSubmitChange} className="btn btn-success">
          Submit Change
        </button>
        <button
          onClick={handleCancelChange}
          className="btn btn-danger"
          style={{ marginTop: "10px" }}
        >
          Cancel Change
        </button>
        <ToastContainer />
      </div>
    </div>
  );
}

export default UpdateHotel;
