import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutForm from "../components/Form/CheckoutForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, ref, push, set } from "../data/firebase/firebaseConfig"; // Ensure imports are correct
import { getAuth } from "firebase/auth";
import CartCard from "../components/Cards/CartCard";
import { PageTitle } from "../Atoms";
import { Navbar } from "../components";

function CartDetails() {
  const location = useLocation();
  const { cartItems: initialCartItems } = location.state || { cartItems: [] };
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [checkoutData, setCheckoutData] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const [hotelName, setHotelName] = useState("");

  useEffect(() => {
    // Get the current pathname
    const path = window.location.pathname;

    // Split the path into segments
    const pathSegments = path.split("/");

    // Assuming the hotel name is the last segment in the path
    const hotelNameFromPath = pathSegments[pathSegments.length - 2];

    // Set the hotel name in state
    setHotelName(hotelNameFromPath);
  }, []);

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
      const ordersRef = ref(
        db,
        `/admins/${adminID}/hotels/${hotelName}/orders/`
      );

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
      console.log("hotelName", hotelName);
      toast.success("Order placed successfully!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error("Error saving order data:", error);
      toast.error("Error placing order. Please try again.", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.menuPrice * item.quantity,
      0
    );
    navigate(`/${hotelName}/cart-details/split-bill`, {
      state: { checkoutData: updatedData, totalAmount: totalAmount },
    });
  };

  const handleRemoveQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.reduce((updatedItems, item) => {
        if (item.uuid === menuId) {
          // If the item quantity is 1, remove it from the cart
          if (item.quantity === 1) {
            return updatedItems; // Skip adding this item, effectively removing it
          } else {
            // Otherwise, decrement the quantity
            return [
              ...updatedItems,
              { ...item, quantity: item.quantity - 1 }, // Decrement quantity
            ];
          }
        } else {
          // Keep other items as they are
          return [...updatedItems, item];
        }
      }, [])
    );
  };

  const handleAddQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.uuid === menuId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  return (
    <>
      <Navbar title={`${hotelName}`} />
      {/* <Container> */}
        {/* <PageTitle pageTitle={"Cart Details"} /> */}
        <Row>
          <Col md={8}>
            <Card className="p-2" style={{ width: "100%" }}>
              <Card.Header><b>My Cart</b></Card.Header>
              <Card.Body>
                {cartItems.map((item) => (
                  <CartCard
                    key={item.uuid}
                    item={item}
                    onAddQuantity={handleAddQuantity}
                    onRemoveQuantity={handleRemoveQuantity}
                  />
                ))}
              </Card.Body>
              <Card.Footer>
                <Button variant="danger" onClick={clearCart} className="mt-2" style={{width:'100%'}}>
                  Clear Cart
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              className="p-2"
              style={{ width: "100%", marginRight: "10px" }}
            >
              <Card.Header><b>Order Summary</b></Card.Header>
              <Card.Body>
                <p>Total Items: {cartItems.length}</p>
                <p>
                  Total Price:{" "}
                  {cartItems.reduce(
                    (total, item) => total + item.menuPrice * item.quantity,
                    0
                  )}{" "}
                  INR
                </p>
              </Card.Body>
             
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-2" style={{ width: "100%" }}>
              <Card.Header><b>Order Details</b></Card.Header>
              <Card.Body>
                <CheckoutForm
                  cartItems={cartItems}
                  onCheckout={handleCheckout}
                />

                {/* {checkoutData && (
                  <div>
                    <p>Checkout Details:</p>
                    <p>Name: {checkoutData.name}</p>
                    <p>Mobile No: {checkoutData.mobileNo}</p>
                    <p>Table Number: {checkoutData.tableNo}</p>
                    <p>Date: {checkoutData.date}</p>
                  </div>
                )} */}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <ToastContainer />
      {/* </Container> */}
    </>
  );
}

export default CartDetails;
