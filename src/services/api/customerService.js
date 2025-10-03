import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const firestore = getFirestore();

export const updateCustomerData = async (customerInfo, hotelName) => {
  try {
    const { name, mobile, orderAmount, orderId } = customerInfo;

    // Use mobile number as the document ID for uniqueness per hotel
    const customerDocId = `${hotelName}_${mobile}`;
    const customerDocRef = doc(firestore, "customers", customerDocId);

    // Check if customer exists
    const customerDoc = await getDoc(customerDocRef);

    if (customerDoc.exists()) {
      // Existing customer - update their data
      const existingData = customerDoc.data();

      await setDoc(
        customerDocRef,
        {
          name: name.trim(),
          mobile: mobile.trim(),
          hotelName,
          orderCount: increment(1),
          totalOrderValue: increment(orderAmount),
          lastOrderDate: serverTimestamp(),
          lastOrderAmount: orderAmount,
          lastOrderId: orderId,
          averageOrderValue:
            (existingData.totalOrderValue + orderAmount) /
            (existingData.orderCount + 1),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return { isNewCustomer: false, orderCount: existingData.orderCount + 1 };
    } else {
      // New customer - create new record
      await setDoc(customerDocRef, {
        name: name.trim(),
        mobile: mobile.trim(),
        email: "",
        hotelName,
        orderCount: 1,
        totalOrderValue: orderAmount,
        averageOrderValue: orderAmount,
        firstOrderDate: serverTimestamp(),
        lastOrderDate: serverTimestamp(),
        lastOrderAmount: orderAmount,
        firstOrderId: orderId,
        lastOrderId: orderId,
        status: "New",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { isNewCustomer: true, orderCount: 1 };
    }
  } catch (error) {
    console.error("Error updating customer data:", error);
    throw error;
  }
};
