import { useMemo } from "react";

const useCustomerData = (completedOrders) => {
  const customerData = useMemo(() => {
    const customerContData = {
      totalCustomers: 0,
      newCustomers: 0,
      loyalCustomers: 0,
    };

    const customerInfo = {};

    completedOrders.forEach((order) => {
      const { checkoutData } = order;
      const { name, cartItems, mobileNo, date, email } = checkoutData;

      // Ensure mobileNo and date are valid
      if (!mobileNo || !name || !date || !email) {
        console.warn(`Missing data for order:`, order);
        return; // Skip this order if essential data is missing
      }

      const totalOrderPrice = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.menuPrice) * item.quantity,
        0
      );

      // Format the date to "dd-mm-yyyy"
      const formattedDate = new Date(date).toLocaleDateString("en-GB");

      if (!customerInfo[name]) {
        customerInfo[name] = {
          name,
          mobileNo,
          email,
          date: formattedDate, // Store the formatted date as a string
          totalMenuPrice: 0,
          totalOrders: 0,
        };
        customerContData.newCustomers += 1;
      } else {
        customerContData.loyalCustomers += 1;
        customerInfo[name].date += `, ${formattedDate}`; // Append the formatted date as a string
      }

      customerInfo[name].totalMenuPrice += totalOrderPrice;
      customerInfo[name].totalOrders += 1;

      customerContData.totalCustomers += 1;
    });

    const customerDataArray = Object.values(customerInfo).map((customer, index) => ({
      srNo: index + 1,
      ...customer,
    }));
    console.log('customerDataArraycustomerDataArray', customerDataArray)
    return { customerDataArray, customerContData };
  }, [completedOrders]);

  return customerData;
};

export default useCustomerData;
