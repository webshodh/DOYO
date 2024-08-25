import { useMemo } from "react";

const useCustomerData = (completedOrders) => {
  const customerData = useMemo(() => {
    const customerCountData = {
      totalCustomers: 0,
      newCustomers: 0,
      loyalCustomers: 0,
    };

    const customerInfo = {};

    completedOrders.forEach((order) => {
      const { checkoutData } = order;
      const { name, email, mobile } = checkoutData; // Assuming 'mobile' is the correct field for mobile number

      // Ensure essential data is valid
      // if (!name || !mobile ) {
      //   console.warn(`Missing data for order:`, order);
      //   return; // Skip this order if essential data is missing
      // }

      const totalOrderPrice = parseFloat(order.menuPrice) * order.quantity;

      if (!customerInfo[mobile]) {
        // New customer
        customerInfo[mobile] = {
          name,
          mobile,
          email,
          totalMenuPrice: 0,
          totalOrders: 0,
        };
        customerCountData.newCustomers += 1;
      } else {
        // Existing customer (loyal)
        customerCountData.loyalCustomers += 1;
      }

      customerInfo[mobile].totalMenuPrice += totalOrderPrice;
      customerInfo[mobile].totalOrders += 1;

      customerCountData.totalCustomers += 1;
    });

    const customerDataArray = Object.values(customerInfo).map((customer, index) => ({
      srNo: index + 1,
      ...customer,
    }));

    return { customerDataArray, customerCountData };
  }, [completedOrders]);

  return customerData;
};

export default useCustomerData;











// import { useMemo } from "react";

// const useCustomerData = (completedOrders) => {
//   const customerData = useMemo(() => {
//     const customerCountData = {
//       totalCustomers: 0,
//       newCustomers: 0,
//       loyalCustomers: 0,
//     };

//     const customerInfo = {};
// console.log('useCustomerData',completedOrders)
//     completedOrders.forEach((order) => {
//       const { checkoutData } = order;
//       const { name, cartItems, mobileNo, date, email } = checkoutData;

//       // Ensure mobileNo and date are valid
//       if (!mobileNo || !name || !date || !email) {
//         console.warn(`Missing data for order:`, order);
//         return; // Skip this order if essential data is missing
//       }

//       const totalOrderPrice = cartItems.reduce(
//         (sum, item) => sum + parseFloat(item.menuPrice) * item.quantity,
//         0
//       );

//       // Format the date to "dd-mm-yyyy"
//       const formattedDate = new Date(date).toLocaleDateString("en-GB");

//       if (!customerInfo[name]) {
//         customerInfo[name] = {
//           name,
//           mobileNo,
//           email,
//           date: formattedDate, // Store the formatted date as a string
//           totalMenuPrice: 0,
//           totalOrders: 0,
//         };
//         customerCountData.newCustomers += 1;
//       } else {
//         customerCountData.loyalCustomers += 1;
//         customerInfo[name].date += `, ${formattedDate}`; // Append the formatted date as a string
//       }

//       customerInfo[name].totalMenuPrice += totalOrderPrice;
//       customerInfo[name].totalOrders += 1;

//       customerCountData.totalCustomers += 1;
//     });

//     const customerDataArray = Object.values(customerInfo).map((customer, index) => ({
//       srNo: index + 1,
//       ...customer,
//     }));
//     console.log('customerDataArraycustomerDataArray', customerDataArray)
//     return { customerDataArray, customerCountData };
//   }, [completedOrders]);

//   return customerData;
// };

// export default useCustomerData;
