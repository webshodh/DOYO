import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();

  const data = {
    name: "Vikas",
    amount: 1,
    number: "9999999999",
    MUID: "MUID" + Date.now(),
    transactionId: "T" + Date.now(),
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    let retries = 3;
    let delay = 1000; // Start with a 1 second delay
  
    while (retries > 0) {
      try {
        const res = await axios.post("http://localhost:8000/order", data);
        console.log("Response received:", res);
  
        if (res.data && res.data.data && res.data.data.instrumentResponse.redirectInfo.url) {
          const redirectUrl = res.data.data.instrumentResponse.redirectInfo.url;
          console.log("Redirecting to:", redirectUrl);
          window.location.href = redirectUrl;
        } else {
          console.error("No redirect URL found in the response.");
        }
        break; // Exit loop on success
      } catch (error) {
        console.error("Payment request failed:", error);
        if (error.response && error.response.status === 429) {
          retries--;
          console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Double the delay for the next retry
        } else {
          break; // Exit loop on other errors
        }
      }
    }
  };
  

  return (
    <form onSubmit={handlePayment}>
      <div className="col-12">
        <p className="fs-5">
          <strong>Name:</strong> {data.name}
        </p>
      </div>
      <div className="col-12">
        <p className="fs-5">
          <strong>Number:</strong> {data.number}
        </p>
      </div>
      <div className="col-12">
        <p className="fs-5">
          <strong>Amount:</strong> {data.amount}Rs
        </p>
      </div>
      <div className="col-12 center">
        <button className="w-100" type="submit">
          Pay Now
        </button>
      </div>
    </form>
  );
};

export default Payment;
