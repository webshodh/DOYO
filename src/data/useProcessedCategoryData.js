import { useMemo } from 'react';

const useProcessedCategoryData = (completedOrders) => {
  const categoryData = useMemo(() => {
    const categoryInfo = {};

    completedOrders.forEach((order) => {
      const { menuCategory, menuPrice, quantity } = order;
      const price = parseFloat(menuPrice);

      if (!categoryInfo[menuCategory]) {
        categoryInfo[menuCategory] = {
          menuCategory,
          menuCategoryCount: 0,
          totalMenuPrice: 0,
        };
      }

      categoryInfo[menuCategory].menuCategoryCount += quantity;
      categoryInfo[menuCategory].totalMenuPrice += price * quantity;
    });

    const categoryDataArray = Object.values(categoryInfo).map(
      (category, index) => ({
        srNo: index + 1,
        ...category,
      })
    );

    const totalRevenue = categoryDataArray.reduce(
      (sum, category) => sum + category.totalMenuPrice,
      0
    );

    const ordersByCategoryGraphData = categoryDataArray.map(
      ({ menuCategory, menuCategoryCount }) => ({
        menuCategory,
        menuCategoryCount,
      })
    );

    return { categoryDataArray, totalRevenue, ordersByCategoryGraphData };
  }, [completedOrders]);

  return categoryData;
};

export default useProcessedCategoryData;
