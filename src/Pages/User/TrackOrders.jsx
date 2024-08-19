import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import CartCard from "../../components/Cards/CartCard";
import { Navbar } from "../../components";
import { ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import useOrdersData from "../../data/useOrdersData";
import { colors } from "../../theme/theme";
import { UserAuthContext } from "../../Context/UserAuthContext";

function TrackOrders() {
  const location = useLocation();
  const { currentUser, loading } = useContext(UserAuthContext);
  const { checkoutData, totalAmount } = location.state || {};
  const userInfo = {
    name: currentUser.displayName,
    email: currentUser.email,
  };
  const [hotelName, setHotelName] = useState("");
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  const navigate = useNavigate();
  console.log("userInfo", userInfo);
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
    navigate(`/viewMenu/${hotelName}/home`);
  };
  // if (!userInfo) {
  //   return <div>User information is not available.</div>;
  // }
  console.log("filteredPendingOrders", filteredPendingOrders);
  console.log("hotelNmae", hotelName);
  return (
    <>
      <Navbar
        title={hotelName}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      />
      <Container
        fluid
        className="px-3 px-md-5 mt-3"
        style={{ height: "100vh" }}
      >
        <Row className="mb-4">
          <div
            className="d-flex mb-2"
            style={{ justifyContent: "space-between" }}
          >
            <i
              class="bi bi-arrow-left-square-fill"
              onClick={handleBack}
              style={{ color: `${colors.Orange}`, fontSize: "30px" }}
            ></i>
            <h5 style={{ marginLeft: "20px", marginTop: "10px" }}>
              Track Your Orders
            </h5>
            <span></span>
          </div>
        </Row>

        <Row className="mb-4">
          <h5 className="text-start">
            My Pending Orders ({`${filteredPendingOrders.length}`})
          </h5>
          {ordersLoading ? (
            <Spinner animation="border" style={{ color: colors.Orange }} />
          ) : ordersError ? (
            <Alert variant="danger" className="text-center">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredPendingOrders.length === 0 ? (
            <Alert variant="warning" className="text-center">
              No pending orders.
            </Alert>
          ) : (
            filteredPendingOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-4">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <Row className="mb-4">
          <h5 className="text-start">
            My Accepted Orders ({`${filteredAcceptedOrders.length}`})
          </h5>
          {ordersLoading ? (
            <Spinner animation="border" style={{ color: colors.Orange }} />
          ) : ordersError ? (
            <Alert variant="danger" className="text-center">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredAcceptedOrders.length === 0 ? (
            <Alert variant="warning" className="text-center">
              No accepted orders.
            </Alert>
          ) : (
            filteredAcceptedOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-4">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <Row className="mb-4">
          <h5 className="text-start">
            My Completed Orders ({`${filteredCompletedOrders.length}`})
          </h5>
          {ordersLoading ? (
            <Spinner animation="border" style={{ color: colors.Orange }} />
          ) : ordersError ? (
            <Alert variant="danger" className="text-center">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredCompletedOrders.length === 0 ? (
            <Alert variant="warning" className="text-center">
              No completed orders.
            </Alert>
          ) : (
            filteredCompletedOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-4">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <Row className="mb-4">
          <h5 className="text-start">
            My Cancelled Orders ({`${filteredCancelledOrders.length}`})
          </h5>
          {ordersLoading ? (
            <Spinner animation="border" style={{ color: colors.Orange }} />
          ) : ordersError ? (
            <Alert variant="danger" className="text-center">
              Error loading orders: {ordersError.message}
            </Alert>
          ) : filteredCancelledOrders.length === 0 ? (
            <Alert variant="warning" className="text-center">
              No cancelled orders.
            </Alert>
          ) : (
            filteredCancelledOrders.map((item) => (
              <Col xs={12} md={6} lg={4} key={item.orderId} className="mb-4">
                <CartCard item={item} />
              </Col>
            ))
          )}
        </Row>

        <ToastContainer />
      </Container>
    </>
  );
}

export default TrackOrders;
