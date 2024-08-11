// KeyInput.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { onValue, ref } from "firebase/database";

function KeyInput({ onKeyEntered }) {
  const [key, setKey] = useState("");
  const [uuidValue, setUuidValue] = useState(null);
  const path = window.location.pathname;
  let hotelName = path.split("/").pop();

  useEffect(() => {
    // Check if the URL is http://localhost:3001/viewHotel
    if (window.location.href === "http://localhost:3003/viewHotel") {
      // Set uuidValue to "123" for this specific URL
      setUuidValue("1234");
    }
    //  else if (
    //   window.location.href ===
    //   ""
    // ) {
    //   setUuidValue("1234");
    // } 
    // else {
    //   // Reference to the Firebase database key named "uuid"
    //   const uuidRef = ref(db, `/${hotelName}/uuid/`);
    //   // Fetch the value of the "uuid" key
    //   onValue(uuidRef, (snapshot) => {
    //     if (snapshot.exists()) {
    //       // If the key exists, set its value in state
    //       setUuidValue(snapshot.val());
    //     } else {
    //       // Handle the case where the key does not exist
    //       console.log("UUID key not found");
    //     }
    //   });
    // }
  }, [hotelName]); // Added hotelName to the dependency array

  const handleInputChange = (e) => {
    setKey(e.target.value);
  };

  const handleEnterKey = () => {
    // You can add your key validation logic here
    if (key === uuidValue) {
      onKeyEntered(true);
    } else {
      alert("Incorrect key. Please try again.");
    }
  };

  return (
    <div>
      <h1>Enter Key</h1>
      <input
        type="text"
        placeholder="Enter key"
        value={key}
        onChange={handleInputChange}
      />
      <button onClick={handleEnterKey}>Enter</button>
    </div>
  );
}

export default KeyInput;





//buttons on admin dashboard
 {/* <div>
        {hotels
          .filter((item) => (hotelName ? item.Hotelname === hotelName : true))
          .map((item) => (
            <div key={item.uuid}>
              <div style={{ display: "flex" }}>
                <button
                  style={{ margin: "5px 10px" }}
                  onClick={handleShow}
                  className="btn btn-dark btn-margin"
                >
                  Add Menu
                </button>
                <button
                  style={{ margin: "5px 10px" }}
                  onClick={() => handleAddCategory(item)}
                  className="btn btn-dark btn-margin"
                >
                  Add Category
                </button>
              </div>
              <div style={{ display: "flex" }}>
                <button
                  onClick={() => handleAddHotelInfo(item)}
                  className="btn btn-dark btn-margin"
                  style={{ color: "white", margin: "5px 10px" }}
                >
                  Add Info
                </button>
                <button
                  onClick={() => handleHotelHome(item)}
                  className="btn btn-dark btn-margin"
                  style={{ color: "white", margin: "5px 10px" }}
                >
                  View Home
                </button>
              </div>

              <ToastContainer />
            </div>
          ))}
      </div> */} 



      {/* {filteredAndSortedItems.map((item) => (
            <div className="column flex-container" key={item.id}>
              <div
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  opacity: item.availability === "Available" ? 1 : 0.4,
                }}
              >
                {item.availability === "Available" ? (
                  ""
                ) : (
                  <span className="text-overlay"> {item.availability}</span>
                )}
                {!imageLoaded && (
                  <div
                    className="spinner-border text-danger"
                    role="status"
                    style={{
                      position: "absolute",
                      top: "20%",
                      left: "40%",
                    }}
                  ></div>
                )}
                <img
                  src={item.imageUrl}
                  className="card-img-top"
                  alt={item.alt}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                  }}
                  onLoad={handleImageLoad}
                />

                <div className="card-body">
                  <h5 className="card-title" style={{ textAlign: "left" }}>
                    {item.menuName}
                  </h5>
                  <div className="container">
                    {item.menuCategory === "Veg" || "Dosas & Uttapam" ? (
                      <img className="logo" src={Veg} />
                    ) : item.menuCategory === "Nonveg" ? (
                      <img className="logo" src={Nonveg} />
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="card-text">
                    <img
                      style={{
                        width: "20px",
                        height: "20px",
                        margin: "-1px 2px 0px 0px",
                      }}
                      src="/time.png"
                      alt="Cooking Time"
                    />
                    {item.menuCookingTime} min
                    <br />
                    <img
                      style={{
                        width: "18px",
                        height: "18px",
                        alignItems: "center",
                        margin: "0px 2px 0px 10px",
                      }}
                      src="/rupee.png"
                      alt="Menu Price"
                    />
                    {item.menuPrice}
                  </div>
                </div>
                <div
                  style={{
                    display: "block",
                    // background: "#dc3545",
                    color: "red",
                    textAlign: "center",
                    cursor:
                      item.availability === "Available"
                        ? "pointer"
                        : "not-allowed",
                  }}
                  className="card-footer bg-transferent border-dotted"
                  onClick={() =>
                    item.availability === "Available"
                      ? showDetail(item.uuid)
                      : ""
                  }
                >
                  Read More
                </div>
                <div
                  style={{
                    display: "block",
                    background: "#dc3545",
                    color: "white",
                    textAlign: "center",
                  }}
                  className="card-footer bg-transferent border-dotted"
                  onClick={() => addToCart(item.uuid)}
                >
                  Add to Cart
                </div>
              </div>
            </div>
          ))} */}