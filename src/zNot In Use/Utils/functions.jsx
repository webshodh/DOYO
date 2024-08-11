// /*-------------Menu Price and Menu Category data ---------------------------*/

// export const extractData = (data) => {
//     return data.map((item) => ({
//       menuPrice: item.menuPrice,
//       menuCategory: item.menuCategory,
//     }));
//   };
  
// /*------------- Function to calculate the sum of menuPrice by category & Revenue by Category ---------------------------------------*/

//   export const calculateSums = (data) => {
//     const categorySums = {};
//     let totalSum = 0;
  
//     data.forEach((item) => {
//       if (item.menuPrice && item.menuCategory) {
//         const price = parseFloat(item.menuPrice);
//         const category = item.menuCategory.trim(); // Trim whitespace
  
//         if (!categorySums[category]) {
//           categorySums[category] = 0;
//         }
  
//         categorySums[category] += price;
//         totalSum += price;
//       }
//     });
  
//     return { categorySums, totalSum };
//   };
  
// /*--------------------------- Customers Data ---------------------------------------*/

//   export const processData = (data) => {
//     // Filter out empty entries
//     const filteredData = data.filter((entry) => entry.name);
  
//     // Count occurrences of each name
//     const nameCount = filteredData.reduce((acc, { name }) => {
//       acc[name] = (acc[name] || 0) + 1;
//       return acc;
//     }, {});
  
//     // Calculate duplicates and unique counts
//     let uniqueCount = 0;
//     let duplicateCount = 0;
  
//     for (const count of Object.values(nameCount)) {
//       if (count > 1) {
//         duplicateCount += count;
//       } else {
//         uniqueCount += 1;
//       }
//     }
  
//     return {
//       uniqueCustomers: uniqueCount,
//       duplicateCustomers: duplicateCount,
//     };
//   };
  
// /*----------------------- Orders and Revenue by Menu Data ---------------------------------------*/

//   export const mergeCategoryData = (counts, prices) => {
//     const OrdersAndRevenueByMenuData = {};
//     for (const [category, { count }] of Object.entries(counts)) {
//       const trimmedCategory = category.trim();
  
//       // If the trimmed category name exists in the prices object, add it to the merged data
//       if (prices[trimmedCategory] !== undefined) {
//         OrdersAndRevenueByMenuData[trimmedCategory] = {
//           count: count,
//           price: prices[trimmedCategory],
//         };
//       } else {
//         // For categories in counts that are not in prices
//         OrdersAndRevenueByMenuData[trimmedCategory] = {
//           count: count,
//           price: 0, // Assign 0 if price is not available
//         };
//       }
//     }
  
//     return OrdersAndRevenueByMenuData;
//   };
  

//   // utils.js
// export const categorizeOrders = (orders) => {
//     const categorized = {
//       pending: [],
//       accepted: [],
//       completed: [],
//     };
  
//     Object.keys(orders).forEach((orderId) => {
//       const order = orders[orderId]?.orderData || {};
//       const status = order.status || "Pending";
  
//       if (status === "Pending") {
//         categorized.pending.push({ ...order, orderId });
//       } else if (status === "Accepted") {
//         categorized.accepted.push({ ...order, orderId });
//       } else if (status === "Completed") {
//         categorized.completed.push({ ...order, orderId });
//       }
//     });
  
//     return categorized;
//   };
  

//   // utils.js
// export const extractAndAggregateData = (data, extractFn, aggregateFn) => {
//     const extractedData = extractFn(data);
//     return aggregateFn(extractedData);
//   };

  
//   // utils.js
// export const countItemsByProperty = (items, property) => {
//     return items.reduce((acc, item) => {
//       const key = item[property];
//       if (!acc[key]) {
//         acc[key] = { count: 0 };
//       }
//       acc[key].count += 1;
//       return acc;
//     }, {});
//   };
  


// import {
//     extractData,
//     calculateSums,
//     processData,
//     mergeCategoryData,
//     categorizeOrders,
//     extractAndAggregateData,
//     countItemsByProperty,
//   } from "../Utils/functions";


// const Menu_Price_and_Menu_Category_Data = extractData(completedOrders);
  // const Revenue_By_Category = calculateSums(Menu_Price_and_Menu_Category_Data);

  // const customerNames = completedOrders.map((order) => ({
  //   name: order?.checkoutData?.name,
  // }));
  // const CustomersData = processData(customerNames);

  // const menuCount = countItemsByProperty(completedOrders, "menuName");
  // const categoryCount = countItemsByProperty(completedOrders, "menuCategory");

  // const imgCardData = Object.entries(menuCount).map(
  //   ([menuName, { count, imageUrl }], index) => ({
  //     srNo: index + 1,
  //     menuName,
  //     count,
  //     imageUrl,
  //   })
  // );
  // console.log("completedOrders", completedOrders);

  // const menuDetailsMap = new Map(
  //   completedOrders.map((item) => [item.menuName, item])
  // );

  // const OrdersAndRevenueByMenuData = imgCardData.map((item) => {
  //   const detail = menuDetailsMap.get(item.menuName) || {};
  //   const menuPrice = parseFloat(detail.menuPrice) || 0;
  //   const totalPrice = menuPrice * item.count;
  //   return {
  //     ...item,
  //     menuPrice: detail.menuPrice || "Not Available",
  //     menuCategory: detail.menuCategory || "Not Available",
  //     totalPrice: totalPrice.toFixed(2),
  //   };
  // });

  // const categoriesAndCountData = Object.entries(categoryCount).map(
  //   ([menuCategory, { count }]) => ({
  //     menuCategory,
  //     count,
  //   })
  // );

  // const RevenueByCategoryData = mergeCategoryData(
  //   categoryCount,
  //   Revenue_By_Category.categorySums
  // );

  // const dataArray = Object.entries(RevenueByCategoryData).map(
  //   ([category, { count, price }], index) => ({
  //     srNo: index + 1,
  //     category,
  //     count,
  //     price:
  //       isNaN(price) || price === undefined || price === null
  //         ? "N/A"
  //         : Number(price).toFixed(2),
  //   })
  // );
  // const totalCustomers = 10;


  //==========================================================================
  //   /*--------------------------- Menu Price and Menu Category data ---------------------------------------*/

  //   const extractData = (data) => {
  //     return data.map((item) => ({
  //       menuPrice: item.menuPrice,
  //       menuCategory: item.menuCategory,
  //     }));
  //   };

  //   const Menu_Price_and_Menu_Category_Data = extractData(completedOrders);

  //   /*----------------- Function to calculate the sum of menuPrice by category & Revenue by Category ---------------------------------------*/

  //   const calculateSums = (data) => {
  //     const categorySums = {};
  //     let totalSum = 0;

  //     data.forEach((item) => {
  //       if (item.menuPrice && item.menuCategory) {
  //         const price = parseFloat(item.menuPrice);
  //         const category = item.menuCategory.trim(); // Trim whitespace

  //         if (!categorySums[category]) {
  //           categorySums[category] = 0;
  //         }

  //         categorySums[category] += price;
  //         totalSum += price;
  //       }
  //     });

  //     return { categorySums, totalSum };
  //   };

  //   const Revenue_By_Category = calculateSums(Menu_Price_and_Menu_Category_Data);

  //   /*--------------------------- Customers Data ---------------------------------------*/

  //   const customerNames = completedOrders.map((order) => ({
  //     name: order?.checkoutData?.name,
  //   }));
  //   const totalCustomers = customerNames.length;

  //   const processData = (data) => {
  //     // Filter out empty entries
  //     const filteredData = data.filter((entry) => entry.name);

  //     // Count occurrences of each name
  //     const nameCount = filteredData.reduce((acc, { name }) => {
  //       acc[name] = (acc[name] || 0) + 1;
  //       return acc;
  //     }, {});

  //     // Calculate duplicates and unique counts
  //     let uniqueCount = 0;
  //     let duplicateCount = 0;

  //     for (const count of Object.values(nameCount)) {
  //       if (count > 1) {
  //         duplicateCount += count;
  //       } else {
  //         uniqueCount += 1;
  //       }
  //     }

  //     return {
  //       uniqueCustomers: uniqueCount,
  //       duplicateCustomers: duplicateCount,
  //     };
  //   };

  //   const CustomersData = processData(customerNames);

  //   /*------------------------ Count occurrences of each menuName and menuCategory ---------------------------------------*/

  //   const menuCount = completedOrders.reduce((acc, item) => {
  //     const { menuName, imageUrl } = item;
  //     if (!acc[menuName]) {
  //       acc[menuName] = { count: 0, imageUrl };
  //     }
  //     acc[menuName].count += 1;
  //     return acc;
  //   }, {});

  //   const categoryCount = completedOrders.reduce((acc, item) => {
  //     const { menuCategory } = item;
  //     if (!acc[menuCategory]) {
  //       acc[menuCategory] = { count: 0 };
  //     }
  //     acc[menuCategory].count += 1;
  //     return acc;
  //   }, {});

  //   /*----------------------- data for imgcard ---------------------------------------*/

  //   const imgCardData = Object.entries(menuCount).map(
  //     ([menuName, { count, imageUrl }], index) => ({
  //       srNo: index + 1,
  //       menuName,
  //       count,
  //       imageUrl,
  //     })
  //   );

  //   /*----------------------- Orders And Revenue By Menu Data ---------------------------------------*/

  //   const menuDetailsMap = new Map(
  //     completedOrders.map((item) => [item.menuName, item])
  //   );

  //   // Merge the imgCardData and add totalPrice column
  //   const OrdersAndRevenueByMenuData = imgCardData.map((item) => {
  //     const detail = menuDetailsMap.get(item.menuName) || {};
  //     const menuPrice = parseFloat(detail.menuPrice) || 0; // Convert menuPrice to a number
  //     const totalPrice = menuPrice * item.count; // Calculate totalPrice
  //     return {
  //       ...item,
  //       menuPrice: detail.menuPrice || "Not Available",
  //       menuCategory: detail.menuCategory || "Not Available",
  //       totalPrice: totalPrice.toFixed(2), // Fix to 2 decimal places
  //     };
  //   });

  //   /*----------------------- Category counts Data ---------------------------------------*/

  //   const categoriesAndCountData = Object.entries(categoryCount).map(
  //     ([menuCategory, { count }]) => ({
  //       menuCategory,
  //       count,
  //     })
  //   );

  //   /*----------------------- Orders and Revenue by Menu Data ---------------------------------------*/

  //   // Function to merge categoryCounts and categoryPrices
  //   const mergeCategoryData = (counts, prices) => {
  //     const OrdersAndRevenueByMenuData = {};
  //     for (const [category, { count }] of Object.entries(counts)) {
  //       const trimmedCategory = category.trim();

  //       // If the trimmed category name exists in the prices object, add it to the merged data
  //       if (prices[trimmedCategory] !== undefined) {
  //         OrdersAndRevenueByMenuData[trimmedCategory] = {
  //           count: count,
  //           price: prices[trimmedCategory],
  //         };
  //       } else {
  //         // For categories in counts that are not in prices
  //         OrdersAndRevenueByMenuData[trimmedCategory] = {
  //           count: count,
  //           price: 0, // Assign 0 if price is not available
  //         };
  //       }
  //     }

  //     return OrdersAndRevenueByMenuData;
  //   };

  // /*----------------------- Revenue By Category Data ---------------------------------------*/

  //   const RevenueByCategoryData = mergeCategoryData(
  //     categoryCount,
  //     Revenue_By_Category.categorySums
  //   );

  //   // Convert the object to an array of objects
  //   const dataArray = Object.entries(RevenueByCategoryData).map(
  //     ([category, { count, price }], index) => ({
  //       srNo: index + 1,
  //       category,
  //       count,
  //       price:
  //         isNaN(price) || price === undefined || price === null
  //           ? "N/A"
  //           : Number(price).toFixed(2),
  //     })
  //   );
