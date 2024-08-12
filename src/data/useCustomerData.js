import { useMemo } from 'react';

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
      const { name, cartItems , mobile } = checkoutData;

      const totalOrderPrice = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.menuPrice) * item.quantity,
        0
      );

      if (!customerInfo[name]) {
        customerInfo[name] = { name, totalMenuPrice: 0, totalOrders: 0 };
        customerContData.newCustomers += 1;
      } else {
        customerContData.loyalCustomers += 1;
      }

      customerInfo[name].totalMenuPrice += totalOrderPrice;
      customerInfo[name].totalOrders += 1;
      customerContData.totalCustomers += 1;
    });

    const customerDataArray = Object.values(customerInfo).map(
      (customer, index) => ({
        srNo: index + 1,
        ...customer,
      })
    );

    return { customerDataArray, customerContData };
  }, [completedOrders]);

  return customerData;
};

export default useCustomerData;
