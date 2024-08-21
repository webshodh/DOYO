import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { db, ref, onValue, update } from "../../data/firebase/firebaseConfig";
import PendingOrders from "./PendingOrders";
import AcceptedOrders from "./AcceptedOrders";
import CancelledOrders from "./CancelledOrders";
import { Tab } from "../../components";
import { useHotelContext } from "../../Context/HotelContext";
import { getAuth } from "firebase/auth";
import CompletedOrders from "./CompletedOrders";
import { PageTitle } from "Atoms";

// Filter functions
const filterDataByDateRange = (data, startDate, endDate) => {
  return data.filter((item) => {
    const itemDate = new Date(item.checkoutData.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

const filterDaily = (data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Set to the next day
  return filterDataByDateRange(data, today, tomorrow);
};

const filterWeekly = (data) => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7); // Set to 7 days before today
  return filterDataByDateRange(data, lastWeek, today);
};

const filterMonthly = (data) => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setDate(today.getDate() - 30); // Set to 30 days before today
  return filterDataByDateRange(data, lastMonth, today);
};

const OrderDashboard = () => {
  const [filterType, setFilterType] = useState("Daily");
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
    const ordersRef = ref(db, `/hotels/${hotelName}/orders/`);

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
  }, [hotelName, adminID]);

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
    let updateRef = `/hotels/${hotelName}/orders/${orderId}/orderData/`;
    if (actionType === "accept") {
      newStatus = "Accepted";
    } else if (actionType === "complete") {
      newStatus = "Completed";
    } else if (actionType === "reject") {
      newStatus = "Cancelled";
    }

    try {
      if (actionType === "reject") {
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
    const itemRef = `/hotels/${hotelName}/orders/${order.orderId}/orderData/`;
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

  // Filtered data based on selected filterType
  const filteredPendingOrders =
    filterType === "Daily"
      ? filterDaily(pendingOrders)
      : filterType === "Weekly"
      ? filterWeekly(pendingOrders)
      : filterMonthly(pendingOrders);

  const filteredAcceptedOrders =
    filterType === "Daily"
      ? filterDaily(acceptedOrders)
      : filterType === "Weekly"
      ? filterWeekly(acceptedOrders)
      : filterMonthly(acceptedOrders);

  const filteredCompletedOrders =
    filterType === "Daily"
      ? filterDaily(completedOrders)
      : filterType === "Weekly"
      ? filterWeekly(completedOrders)
      : filterMonthly(completedOrders);

  const filteredCancelledOrders =
    filterType === "Daily"
      ? filterDaily(cancelledOrders)
      : filterType === "Weekly"
      ? filterWeekly(cancelledOrders)
      : filterMonthly(cancelledOrders);

  const filteredOrderCounts = {
    pending: filteredPendingOrders.length,
    accepted: filteredAcceptedOrders.length,
    completed: filteredCompletedOrders.length,
    cancelled: filteredCancelledOrders.length,
  };

  const tabs = [
    {
      label: <div>Pending Orders ({filteredOrderCounts.pending})</div>,
      content: (
        <PendingOrders
          orders={filteredPendingOrders}
          onActionClick={handleActionClick}
        />
      ),
    },
    {
      label: <div>Accepted Orders ({filteredOrderCounts.accepted})</div>,
      content: (
        <AcceptedOrders
          orders={filteredAcceptedOrders}
          onComplete={handleMarkAsCompleted}
        />
      ),
    },
    {
      label: <div>Completed Orders ({filteredOrderCounts.completed})</div>,
      content: <CompletedOrders orders={filteredCompletedOrders} />,
    },
    {
      label: <div>Cancelled Orders ({filteredOrderCounts.cancelled})</div>,
      content: <CancelledOrders orders={filteredCancelledOrders} />,
    },
  ];

  return (
    <div>
      <div className="d-flex justify-between mt-5">
      <PageTitle title={"Order Dashboard"} />
        <div className="d-flex">
          <button
            onClick={() => setFilterType("Daily")}
            className={`px-2 py-2 text-lg font-medium transition-colors duration-300 ${
              filterType === "Daily"
                ? "text-orange-500 underline"
                : "text-gray-700 hover:text-orange-500 hover:underline"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterType("Weekly")}
            className={`px-2 py-2 text-lg font-medium transition-colors duration-300 ${
              filterType === "Weekly"
                ? "text-orange-500 underline"
                : "text-gray-700 hover:text-orange-500 hover:underline"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilterType("Monthly")}
            className={`px-2 py-2 text-lg font-medium transition-colors duration-300 ${
              filterType === "Monthly"
                ? "text-orange-500 underline"
                : "text-gray-700 hover:text-orange-500 hover:underline"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <Tab tabs={tabs} />
      <Modal show={showPopup} onHide={() => setShowPopup(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === "reject" ? "Reject Order" : "Confirm Action"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionType === "reject" && (
            <Form>
              <Form.Group controlId="formWaiterName">
                <Form.Label>Waiter Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Waiter Name"
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formRejectionReason">
                <Form.Label>Rejection Reason</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter Rejection Reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
          {actionType !== "reject" && (
            <p>Are you sure you want to {actionType} this order?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPopup(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleConfirmAction}>
            {actionType === "reject" ? "Reject Order" : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderDashboard;
