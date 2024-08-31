import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, ref, push, set } from "../../data/firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import CartCard from "../../components/Cards/CartCard";
import { Navbar } from "../../components";
import { colors } from "../../theme/theme";
import { UserAuthContext } from "../../Context/UserAuthContext";
import CheckoutForm from "components/Form/CheckoutForm";
import { UserContext } from "Context/UserContext";
import Footer from "Atoms/Footer";


function CartDetails() {
  const location = useLocation();
  const { cartItems: initialCartItems } = location.state || { cartItems: [] };
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [tableNumber, setTableNumber] = useState(""); // New state for table number
  const [checkoutData, setCheckoutData] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentAdminId = auth.currentUser?.uid;
  const adminID = currentAdminId;
  const [hotelName, setHotelName] = useState("");
  const { currentUser, loading } = useContext(UserAuthContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
  }, []);

  const handleCheckout = async () => {
    if (!tableNumber) {
      toast.error("Please enter your table number.", {
        position: toast.POSITION.TOP_RIGHT,
      });
      return;
    }

    const currentDate = new Date().toISOString();

    try {
      const ordersRef = ref(db, `/hotels/${hotelName}/orders/`);

      for (const item of cartItems) {
        const newOrderRef = push(ordersRef);
        const itemWithDetails = {
          ...item,
          status: "Pending",
          checkoutData: {
            name: user.name || "Anonymous",
            mobile: user.mobile || "No mobile provided",
            date: currentDate,
            tableNumber: tableNumber, // Added table number
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
      (total, item) => total + item.finalPrice * item.quantity,
      0
    );

    navigate(`/${hotelName}/orders/details/thank-you`, {
      state: {
        checkoutData: {
          name: user.name || "Anonymous",
          mobile: user.mobile || "No mobile provided",
          tableNumber: tableNumber, // Added table number
        },
        totalAmount: totalAmount,
        userInfo: { name: user.name, mobile: user.mobile },
      },
    });
  };

  const handleBack = () => {
    navigate(`/viewMenu/${hotelName}/home`);
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

  const onRemoveFromCart = (menuId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.uuid !== menuId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared successfully!", {
      position: toast.POSITION.TOP_RIGHT,
    });
    navigate(`/viewMenu/${hotelName}/home`);
  };

  return (
    <>
      <Navbar
        title={'Cart Summary'}
        style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
      />
      <div className="px-4 py-6 bg-whit min-h-screen">
      <span
            className="text-orange-500 cursor-pointer hover:text-orange-600 transition-colors flex"
            onClick={clearCart}
          >
            Clear Cart
          </span>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 h-full overflow-y-auto">
          {cartItems.map((item) => (
            <CartCard
              key={item.uuid}
              item={item}
              onAddQuantity={handleAddQuantity}
              onRemoveQuantity={handleRemoveQuantity}
              onRemoveFromCart={onRemoveFromCart}
            />
          ))}
        </div>

        {cartItems.length > 0 ? (
          <>
            <div className="mt-6 space-y-6 md:space-y-0 md:space-x-6 flex flex-col md:flex-row md:justify-center">
              <div className="bg-white shadow-md rounded-lg p-6 flex flex-col space-y-4 md:w-1/2">
                <h5 className="text-lg font-semibold text-gray-800">
                  Order Summary
                </h5>
                <p className="text-gray-700">
                  Total Items: <b>{cartItems.length}</b>
                </p>
                <p className="text-gray-700">
                  Total Price:{" "}
                  <b>
                    ₹{" "}
                    {cartItems.reduce(
                      (total, item) => total + item.finalPrice * item.quantity,
                      0
                    )}
                  </b>
                </p>
                {/* Table number input */}
                <div className="mt-4">
                  <label
                    htmlFor="tableNumber"
                    className="block text-gray-700 font-medium"
                  >
                    Table Number
                  </label>
                  <input
                    type="text"
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded-md w-full"
                    placeholder="Enter your table number"
                  />
                </div>
              </div>
            </div>
            <div className="d-flex justify-center mt-3">
              <button
                onClick={handleCheckout}
                className="bg-orange-500 text-white py-3 px-6 rounded-lg w-full shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                Place Order
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            No items in cart
          </div>
        )}
        {/* <Footer cartItemsCount={'cartItems.length'} handleCart={''} /> */}
        <ToastContainer />
      </div>
    </>
  );
}

export default CartDetails;
