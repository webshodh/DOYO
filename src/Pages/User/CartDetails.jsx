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
  const { currentUser, loading } = useContext(UserAuthContext);

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split("/");
    const hotelNameFromPath = pathSegments[pathSegments.length - 3];
    setHotelName(hotelNameFromPath);
  }, []);

  const handleCheckout = async () => {
    if (loading) {
      toast.info("Loading user data...", {
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
            name: currentUser.displayName || "Anonymous",
            email: currentUser.email || "No email provided",
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

    navigate(`/${hotelName}/orders/details/thank-you`, {
      state: {
        checkoutData: {
          name: currentUser.displayName || "Anonymous",
          email: currentUser.email || "No email provided",
        },
        totalAmount: totalAmount,
        userInfo: { name: currentUser.displayName, email: currentUser.email },
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
      <Navbar title={`${hotelName}`} />
      <div className="px-4 py-2 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <i
            className="bi bi-arrow-left-square-fill text-orange-500 text-2xl cursor-pointer"
            onClick={handleBack}
          ></i>
          <h5 className="ml-4 text-lg font-semibold">Cart Summary</h5>
          <span
            className="text-orange-500 cursor-pointer"
            onClick={clearCart}
          >
            Clear Cart
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartItems.map((item) => (
           
              <CartCard
                item={item}
                onAddQuantity={handleAddQuantity}
                onRemoveQuantity={handleRemoveQuantity}
                onRemoveFromCart={onRemoveFromCart}
              />
            
          ))}
        </div>

        {cartItems.length > 0 ? (
          <div className="flex flex-col md:flex-row justify-between mt-4">
            <div className="bg-white shadow-lg rounded-lg p-4 mb-4 md:mb-0 md:w-1/2">
              <h5 className="text-lg font-semibold">Order Summary</h5>
              <p>Total Items: <b>{cartItems.length}</b></p>
              <p>
                Total Price: <b>₹ {cartItems.reduce(
                  (total, item) => total + item.menuPrice * item.quantity,
                  0
                )}</b>
              </p>
            </div>
            
              
              <button
                onClick={handleCheckout}
                className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
              >
                Place Order
              </button>
          
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            No items in cart
          </div>
        )}
        <ToastContainer />
      </div>
    </>
  );
}

export default CartDetails;
