import { useMemo } from 'react';

const useProcessedMenuData = (completedOrders) => {
  const menuData = useMemo(() => {
    const menuInfo = {};

    completedOrders.forEach((order) => {
      const { imageUrl, menuName, menuCategory, menuPrice, quantity } = order;
      const price = parseFloat(menuPrice);

      if (!menuInfo[menuName]) {
        menuInfo[menuName] = {
          menuName,
          imageUrl,
          menuCategory,
          menuPrice: price,
          menuCount: 0,
          totalMenuPrice: 0,
        };
      }

      menuInfo[menuName].menuCount += quantity;
      menuInfo[menuName].totalMenuPrice += price * quantity;
    });

    const menuDataArray = Object.values(menuInfo).map((menu, index) => ({
      srNo: index + 1,
      ...menu,
    }));

    return menuDataArray;
  }, [completedOrders]);

  return menuData;
};

export default useProcessedMenuData;
