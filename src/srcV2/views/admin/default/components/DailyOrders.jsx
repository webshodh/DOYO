import BarChart from "../../../../components/charts/BarChart";
import { MdArrowDropUp } from "react-icons/md";
import Card from "../../../../components/card";
import { colors } from "theme/theme";
import { useOrdersData } from "data";
import { useHotelContext } from "Context/HotelContext";

const DailyOrders = () => {
  const { hotelName } = useHotelContext();
  const { completedOrders } = useOrdersData(hotelName);

  // Object to store order counts by date
  const orderCountByDate = {};

  // Iterate over the order data
  completedOrders.forEach((order) => {
    // Extract the date and format it as "Mon 19 Aug"
    const dateObj = new Date(order.checkoutData.date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    // If the date is already in the object, increment the count
    if (orderCountByDate[formattedDate]) {
      orderCountByDate[formattedDate]++;
    } else {
      // Otherwise, initialize the count to 1
      orderCountByDate[formattedDate] = 1;
    }
  });

  // Separate the data into two arrays
  const dates = Object.keys(orderCountByDate);
  const orders = Object.values(orderCountByDate);

  const customOptions = {
    xaxis: {
      categories: dates,
    },
    fill: {
      gradient: {
        colorStops: [
          {
            offset: 0,
            color: colors.Orange,
            opacity: 1,
          },
          {
            offset: 100,
            color: colors.LightOrange,
            opacity: 0.28,
          },
        ],
      },
    },
  };

  const customData = [
    {
      name: "Orders",
      data: orders,
    },
  ];
  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Daily Orders 
          </p>
          <p className="text-[34px] font-bold text-navy-700 dark:text-white">
            2,579{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Total Orders
            </span>
          </p>
        </div>
        <div className="mt-2 flex items-start">
          <div className="flex items-center text-sm text-green-500">
            <MdArrowDropUp className="h-5 w-5" />
            <p className="font-bold"> +2.45% </p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full pt-10 pb-0">
        <BarChart series={customData} options={customOptions} />
      </div>
    </Card>
  );
};

export default DailyOrders;
