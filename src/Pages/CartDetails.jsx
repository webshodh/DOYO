import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import CheckoutForm from "../components/Form/CheckoutForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, ref, push, set } from "../data/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import CartCard from "../components/Cards/CartCard";
import { Navbar } from "../components";
import { colors } from "../theme/theme";

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
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 2];
    setHotelName(hotelNameFromPath);
  }, []);

  const handleCheckout = async (data) => {
    const removeCartItems = (data) => {
      const updatedData = { ...data };
      delete updatedData.cartItems;
      return updatedData;
    };

    const updatedData = removeCartItems(data);
    setCheckoutData(updatedData);

    const currentDate = new Date().toISOString();

    try {
      const ordersRef = ref(
        db,
        `/admins/${adminID}/hotels/${hotelName}/orders/`
      );

      for (const item of cartItems) {
        const newOrderRef = push(ordersRef);
        const itemWithDetails = {
          ...item,
          status: "Pending",
          checkoutData: {
            ...data,
            date: currentDate,
          },
        };

        await set(newOrderRef, {
          orderData: itemWithDetails,
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

    const totalAmount = cartItems.reduce(
      (total, item) => total + item.menuPrice * item.quantity,
      0
    );

    // Pass user info along with the checkout data to the OrderStatus page
    // navigate(`/${hotelName}/orders/details`, {
    //   state: {
    //     checkoutData: updatedData,
    //     totalAmount: totalAmount,
    //     userInfo: { name: data.name, mobile: data.mobileNo },
    //   },
    // });
    navigate(`/${hotelName}/orders/details/thank-you`, {
      state: {
        checkoutData: updatedData,
        totalAmount: totalAmount,
        userInfo: { name: data.name, mobile: data.mobileNo },
      },
    });
  };

  const handleBack = () => {
    navigate(`/viewMenu/${hotelName}`);
  };

  const handleRemoveQuantity = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.reduce((updatedItems, item) => {
        if (item.uuid === menuId) {
          if (item.quantity === 1) {
            return updatedItems;
          } else {
            return [...updatedItems, { ...item, quantity: item.quantity - 1 }];
          }
        } else {
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
      <Container fluid className="px-3 px-md-5">
        <Row>
          <div className="d-flex mb-2">
            <i
              class="bi bi-arrow-left-square-fill"
              onClick={handleBack}
              style={{ color: `${colors.Orange}`, fontSize: "30px" }}
            ></i>
            <h5 style={{ marginLeft: "20px", marginTop: "10px" }}>My Cart</h5>
          </div>

          {cartItems.map((item) => (
            <Col xs={12} md={6} lg={4} key={item.uuid} className="mb-1">
              <CartCard
                item={item}
                onAddQuantity={handleAddQuantity}
                onRemoveQuantity={handleRemoveQuantity}
              />
            </Col>
          ))}
        </Row>
        <Row className="mt-3">
          <Col xs={12}>
            <Button
              style={{
                background: `${colors.Orange}`,
                border: `${colors.Orange}`,
              }}
              onClick={clearCart}
              className="w-100 mb-1"
            >
              Clear Cart
            </Button>
          </Col>
        </Row>
        <Row style={{ marginRight: "8px" }}>
          <Container>
            <Col
              xs={12}
              md={6}
              className="mb-3 background-card"
              style={{ padding: "10px" }}
            >
              <h5>Order Summary</h5>
              <p>
                Total Items: <b>{cartItems.length}</b>
              </p>
              <p>
                Total Price:{" "}
                <b>
                  ₹{" "}
                  {cartItems.reduce(
                    (total, item) => total + item.menuPrice * item.quantity,
                    0
                  )}
                </b>
              </p>
            </Col>
          </Container>
          <Container>
            <Col
              xs={12}
              md={6}
              className="mb-3 background-card"
              style={{ padding: "10px" }}
            >
              <h5>Order Details</h5>
              <CheckoutForm cartItems={cartItems} onCheckout={handleCheckout} />
            </Col>
          </Container>
        </Row>
        <ToastContainer />
      </Container>
    </>
  );
}

export default CartDetails;
