import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import CartCard from "../../components/Cards/CartCard";
import { Navbar } from "../../components";
import { ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import useOrdersData from "../../data/useOrdersData";
import { colors } from "../../theme/theme";

function TrackOrders() {
  const location = useLocation();
  const { userInfo } = location.state || {}; // Get userInfo from location state
  const [hotelName, setHotelName] = useState("");
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  const navigate = useNavigate();
  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
  }, []);

  const {
    pendingOrders,
    acceptedOrders,
    completedOrders,
    cancelledOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useOrdersData(hotelName);

  // Function to filter orders by status
  const filterOrdersByStatus = (orders) => {
    return orders.filter((order) => {
      const orderDate = order.checkoutData?.date?.split("T")[0]; // Extract date part safely
      return (
        orderDate === currentDate &&
        order.checkoutData?.name === userInfo?.name &&
        order.checkoutData?.mobileNo === userInfo?.mobile
      );
    });
  };

  // Filter orders for each status
  const filteredPendingOrders = filterOrdersByStatus(pendingOrders);
  const filteredAcceptedOrders = filterOrdersByStatus(acceptedOrders);
  const filteredCompletedOrders = filterOrdersByStatus(completedOrders);
  const filteredCancelledOrders = filterOrdersByStatus(cancelledOrders);
  const handleBack = () => {
    navigate(`/viewMenu/${hotelName}`);
  };
  return (
    <>
     <Navbar
            title={`${hotelName}`}
            style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
          />
      <Container fluid className="px-3 px-md-5">
        <Row>
          <h5>My Pending Orders</h5>
          {ordersLoading ? (
            <Spinner animation="border" />
          ) : ordersError ? (
            <Alert variant="danger">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredPendingOrders.length === 0 ? (
            <Alert variant="warning">No pending orders.</Alert>
          ) : (
            filteredPendingOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-1">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <Row>
          <h5>My Accepted Orders</h5>
          {ordersLoading ? (
            <Spinner animation="border" />
          ) : ordersError ? (
            <Alert variant="danger">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredAcceptedOrders.length === 0 ? (
            <Alert variant="warning">No accepted orders.</Alert>
          ) : (
            filteredAcceptedOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-1">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <Row>
          <h5>My Completed Orders</h5>
          {ordersLoading ? (
            <Spinner animation="border" />
          ) : ordersError ? (
            <Alert variant="danger">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredCompletedOrders.length === 0 ? (
            <Alert variant="warning">No completed orders.</Alert>
          ) : (
            filteredCompletedOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-1">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <Row>
          <h5>My Cancelled Orders</h5>
          {ordersLoading ? (
            <Spinner animation="border" />
          ) : ordersError ? (
            <Alert variant="danger">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredCancelledOrders.length === 0 ? (
            <Alert variant="warning">No cancelled orders.</Alert>
          ) : (
            filteredCancelledOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-1">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>
        {/* Cart Details */}

        <div
          className="fixed-bottom p-2 bg-light border-top"
          style={{ zIndex: 1001 }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>DOYO</div>
            <div>
              <i
                class="bi bi-house-fill"
                style={{ color: `${colors.White}`, fontSize: "24px" }}
                onClick={handleBack}
              ></i>
            </div>
            <div></div>
          </div>
        </div>

        <ToastContainer />
      </Container>
    </>
  );
}

export default TrackOrders;
