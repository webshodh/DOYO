import React, { useState, useContext } from "react";
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutForm from "../components/Form/CheckoutForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HotelContext } from "../Context/HotelContext";
import { db, ref, push, set } from "../firebase/firebase"; // Ensure imports are correct
import { DynamicTable } from "../components";
import { CartDetailscolumns } from "../data/Columns";

function CartDetails() {
  const location = useLocation();
  const { cartItems: initialCartItems } = location.state || { cartItems: [] };
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [checkoutData, setCheckoutData] = useState(null);
  const hotelName = useContext(HotelContext);
  const navigate = useNavigate();

  const handleCheckout = async (data) => {
    const removeCartItems = (data) => {
      const updatedData = { ...data }; // Create a copy of the data object
      delete updatedData.cartItems; // Remove the cartItems property
      return updatedData; // Return the updated object
    };

    const updatedData = removeCartItems(data);
    setCheckoutData(updatedData);

    const currentDate = new Date().toISOString(); // Get current date in ISO format

    try {
      const ordersRef = ref(db, `${hotelName}/orders/`);

      // Loop through each item and push it as a separate order entry
      for (const item of cartItems) {
        const newOrderRef = push(ordersRef); // Create a new order entry for each item
        const itemWithDetails = {
          ...item,
          status: "Pending", // Add status to each item
          checkoutData: {
            ...data,
            date: currentDate, // Add the current date to the checkoutData
          },
        };

        await set(newOrderRef, {
          orderData: itemWithDetails, // Set individual item as orderData
        });
      }

      toast.success("Order placed successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error("Error saving order data:", error);
      toast.error("Error placing order. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }

    navigate(`/${hotelName}/order-dashboard`, {
      state: { checkoutData: updatedData },
    });
  };

  const handleRemoveQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.uuid === menuId
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  const handleAddQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleRemoveFromCart = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.uuid !== menuId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const columns = CartDetailscolumns;

  const data = cartItems.map((item, index) => ({
    "Sr.No": index + 1,
    "Item Name": item.menuName,
    Quantity: (
      <>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleRemoveQuantity(item.uuid)}
        >
          -
        </Button>{" "}
        {item.quantity}{" "}
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => handleAddQuantity(item.uuid)}
        >
          +
        </Button>
      </>
    ),
    "Price (INR)": item.menuPrice,
    "Total Price (INR)": item.menuPrice * item.quantity,
    Action: (
      <Button variant="danger" onClick={() => handleRemoveFromCart(item.uuid)}>
        Remove
      </Button>
    ),
  }));

  return (
    <div>
      <h2>Cart Details</h2>
      <DynamicTable
        columns={columns}
        data={data}
        onEdit={null} // If not needed, just pass null
        onDelete={null} // If not needed, just pass null
      />
      <div>
        <p>Total Items: {cartItems.length}</p>
        <p>
          Total Price:{" "}
          {cartItems.reduce(
            (total, item) => total + item.menuPrice * item.quantity,
            0
          )}{" "}
          INR
        </p>
        {checkoutData && (
          <div>
            <p>Checkout Details:</p>
            <p>Name: {checkoutData.name}</p>
            <p>Mobile No: {checkoutData.mobileNo}</p>
            <p>Table Number: {checkoutData.tableNo}</p>
            <p>Date: {checkoutData.date}</p>
          </div>
        )}

        <CheckoutForm cartItems={cartItems} onCheckout={handleCheckout} />
        <Button variant="danger" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default CartDetails;
