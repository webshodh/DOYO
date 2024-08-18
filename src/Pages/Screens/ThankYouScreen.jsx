import React, {useState, useEffect} from "react";
import { colors } from "../../theme/theme";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

const ThankYouPage = () => {
    const [hotelName, setHotelName] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const { checkoutData, totalAmount, userInfo } = location.state || {};
  
    useEffect(() => {
      const path = window.location.pathname;
      const pathSegments = path.split("/");
      const hotelNameFromPath = pathSegments[pathSegments.length - 4];
      setHotelName(hotelNameFromPath);
    }, []);
    
    const handleNext = () => {
        navigate(`/${hotelName}/orders/track-orders`, {
          state: {
            checkoutData,
            totalAmount,
            userInfo,
          },
        });
      };
  return (
    <Container
      fluid
      className="text-center py-5"
      style={{ backgroundColor: colors.Grey, minHeight: "100vh" }}
    >
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="p-4 bg-white shadow rounded">
            <i
              className="bi bi-check-circle-fill"
              style={{ fontSize: "4rem", color: colors.Orange }}
            ></i>
            <h2 className="mt-3">Thank You!</h2>
            <p className="lead">Your order has been placed successfully.</p>
            <p>
              We're excited to serve you! Your food is being prepared with love
              and care. Meanwhile, you can relax and track your order status.
            </p>
            <Button
              variant="warning"
              className="mt-4 px-4 py-2"
              style={{
                backgroundColor: colors.Orange,
                color: colors.White,
                borderColor: colors.Orange,
              }}
              onClick={handleNext}
            >
              Track Your Orders
            </Button>

            {/* <div className="p-4 text-black">
              <h5>Want to add more items?</h5>
              <p>
                Feel free to explore our menu and add more delicious dishes to
                your order.
              </p>
              <Button
                className="mt-2"
                style={{
                  backgroundColor: colors.Orange,
                  color: colors.White,
                  borderColor: colors.Orange,
                }}
              >
                View Menu
              </Button>
            </div> */}
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col md={8} lg={6}></Col>
      </Row>
    </Container>
  );
};

export default ThankYouPage;
