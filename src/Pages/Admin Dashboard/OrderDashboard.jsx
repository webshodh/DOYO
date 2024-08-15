import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { db, ref, onValue, update } from "../../data/firebase/firebaseConfig";
import { PageTitle } from "../../Atoms";
import PendingOrders from "../PendingOrders";
import AcceptedOrders from "../AcceptedOrders";
import { Tab } from "../../components";
import CancelledOrders from "../CancelledOrders";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";

const OrderDashboard = () => {
  const location = useLocation();
  const { orderData: initialOrderData, checkoutData } = location.state || {
    orderData: [],
    checkoutData: null,
  };

  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [actionType, setActionType] = useState("");

  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [acceptedOrderCount, setAcceptedOrderCount] = useState(0);
  const [completedOrderCount, setCompletedOrderCount] = useState(0);
  const [cancelledOrderCount, setCancelledOrderCount] = useState(0);
  const [waiterName, setWaiterName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { hotelName } = useHotelContext();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;

  useEffect(() => {
    const ordersRef = ref(db, `/admins/${adminID}/hotels/${hotelName}/orders/`);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        let pendingOrders = [];
        let acceptedOrders = [];
        let completedOrders = [];
        let cancelledOrders = [];

        Object.keys(data).forEach((orderId) => {
          const order = data[orderId].orderData; // Access orderData directly
          const status = order.status || "Pending";

          if (status === "Pending") {
            pendingOrders.push({ ...order, orderId });
          } else if (status === "Accepted") {
            acceptedOrders.push({ ...order, orderId });
          } else if (status === "Completed") {
            completedOrders.push({ ...order, orderId });
          } else if (status === "Cancelled") {
            cancelledOrders.push({ ...order, orderId });
          }
        });

        setPendingOrders(pendingOrders);
        setAcceptedOrders(acceptedOrders);
        setCompletedOrders(completedOrders);
        setCancelledOrders(cancelledOrders);
        setPendingOrderCount(pendingOrders.length);
        setAcceptedOrderCount(acceptedOrders.length);
        setCompletedOrderCount(completedOrders.length);
        setCancelledOrderCount(cancelledOrders.length);
      } else {
        setPendingOrders([]);
        setAcceptedOrders([]);
        setCompletedOrders([]);
        setCancelledOrders([]);
        setPendingOrderCount(0);
        setAcceptedOrderCount(0);
        setCompletedOrderCount(0);
        setCancelledOrderCount(0);
      }
    });

    return () => unsubscribe();
  }, [hotelName, adminID]); // Added adminID as a dependency

  const handleActionClick = (order, action) => {
    setCurrentOrder(order);
    setActionType(action);
    setShowPopup(true);
    setWaiterName(""); // Reset the input fields
    setRejectionReason("");
  };

  const handleConfirmAction = async () => {
    if (!currentOrder) return;

    const { orderId } = currentOrder;

    let newStatus;
    let updateRef = `/admins/${adminID}/hotels/${hotelName}/orders/${orderId}/orderData/`;

    if (actionType === "accept") {
      newStatus = "Accepted";
    } else if (actionType === "complete") {
      newStatus = "Completed";
    } else if (actionType === "reject") {
      newStatus = "Cancelled";
    }

    try {
      if (actionType === "reject") {
        // Update order with cancellation reason and waiter name
        await update(ref(db, updateRef), {
          status: newStatus,
          waiterName,
          rejectionReason,
        });
        setPendingOrders((prevOrders) =>
          prevOrders.filter((order) => order.orderId !== orderId)
        );
        setPendingOrderCount((prevCount) => prevCount - 1);
        setCancelledOrders((prevOrders) => [
          ...prevOrders,
          { ...currentOrder, status: newStatus, waiterName, rejectionReason },
        ]);
        setCancelledOrderCount((prevCount) => prevCount + 1);
      } else {
        await update(ref(db, updateRef), { status: newStatus });
      }

      setShowPopup(false);
    } catch (error) {
      console.error("Error handling action:", error);
    }
  };

  const handleMarkAsCompleted = async (order) => {
    const itemRef = `/admins/${adminID}/hotels/${hotelName}/orders/${order.orderId}/orderData/`;

    await update(ref(db, itemRef), { status: "Completed" });

    setAcceptedOrders((prevOrders) =>
      prevOrders.filter((o) => o.orderId !== order.orderId)
    );
    setCompletedOrders((prevOrders) => [
      ...prevOrders,
      { ...order, status: "Completed" },
    ]);
    setCompletedOrderCount((prevCount) => prevCount + 1);
    setAcceptedOrderCount((prevCount) => prevCount - 1);
  };

  const extractCheckoutData = (orders) => {
    return orders.map((order) => order.checkoutData);
  };

  const checkoutDataArray = extractCheckoutData(pendingOrders);

  const tabs = [
    {
      label: (
        <>
          <i
            className="bi bi-exclamation-circle-fill"
            style={{ color: "red" }}
          ></i>{" "}
          Pending Orders ({pendingOrderCount})
        </>
      ),
      content: (
        <PendingOrders
          checkoutData={checkoutDataArray}
          orders={pendingOrders}
          onAccept={(order) => handleActionClick(order, "accept")}
          onReject={(order) => handleActionClick(order, "reject")}
          count={pendingOrderCount}
        />
      ),
    },
    {
      label: (
        <>
          <i className="bi bi-check-circle" style={{ color: "orange" }}></i>{" "}
          Accepted Orders ({acceptedOrderCount})
        </>
      ),
      content: (
        <AcceptedOrders
          orders={acceptedOrders}
          onMarkAsCompleted={handleMarkAsCompleted}
          count={acceptedOrderCount}
        />
      ),
    },
    {
      label: (
        <>
          <i
            className="bi bi-check-circle-fill"
            style={{ color: "#00C000" }}
          ></i>{" "}
          Completed Orders ({completedOrderCount})
        </>
      ),
      content: (
        <CancelledOrders orders={completedOrders} count={completedOrderCount} />
      ),
    },
    {
      label: (
        <>
          <i className="bi bi-x-circle-fill" style={{ color: "#DC3545" }}></i>{" "}
          Cancelled Orders ({cancelledOrderCount})
        </>
      ),
      content: (
        <CancelledOrders orders={cancelledOrders} count={cancelledOrderCount} />
      ),
    },
  ];

  return (
    <>
      <div style={{ marginTop: "70px" }}>
        <PageTitle pageTitle="Order Dashboard" />
        <Tab tabs={tabs} width="70vw" />
      </div>

      <Modal show={showPopup} onHide={() => setShowPopup(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm{" "}
            {actionType === "accept"
              ? "Acceptance"
              : actionType === "reject"
              ? "Rejection"
              : "Action"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === "reject" ? (
            <>
              <Form>
                <Form.Group controlId="waiterName">
                  <Form.Label>Waiter Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter waiter's name"
                    value={waiterName}
                    onChange={(e) => setWaiterName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="rejectionReason">
                  <Form.Label>Reason for Rejection</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </Form.Group>
              </Form>
            </>
          ) : (
            <>
              Are you sure you want to{" "}
              {actionType === "accept" ? "accept" : "complete"} this order?
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPopup(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmAction}
            disabled={
              actionType === "reject" && (!waiterName || !rejectionReason)
            }
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderDashboard;
