// // CategoryStats.js
// import React, { useState, useEffect } from "react";
// import { db } from "../firebase/firebase";
// import { onValue, ref } from "firebase/database";

// function CategoryStats({ hotelName }) {
//   const [categoriesWithMenuCount, setCategoriesWithMenuCount] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const snapshot = await onValue(ref(db, `/${hotelName}/categories/`));
//         const categoriesData = snapshot.val();

//         if (categoriesData !== null) {
//           const categories = Object.values(categoriesData);

//           const categoriesWithCount = await Promise.all(
//             categories.map(async (category) => {
//               const categorySnapshot = await onValue(
//                 ref(db, `/${hotelName}/menus/${category.categoryId}`)
//               );
//               const menuData = categorySnapshot.val();
//               const menuCount = menuData ? Object.keys(menuData).length : 0;

//               return {
//                 ...category,
//                 menuCount,
//               };
//             })
//           );

//           setCategoriesWithMenuCount(categoriesWithCount);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [hotelName]);

//   return (
//     <div className="category-stats-container">
//       <h1>Menu Stats for Categories</h1>
//       <table className="table">
//         <thead className="thead-dark">
//           <tr>
//             <th scope="col">Category Name</th>
//             <th scope="col">Menu Count</th>
//           </tr>
//         </thead>
//         <tbody>
//           {categoriesWithMenuCount.map((category) => (
//             <tr key={category.categoryId}>
//               <td>{category.categoryName}</td>
//               <td>{category.menuCount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default CategoryStats;
