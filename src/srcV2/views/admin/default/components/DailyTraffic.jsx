import BarChart from "../../../../components/charts/BarChart";
import { MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import Card from "../../../../components/card";
import { colors } from "theme/theme";
import { useOrdersData } from "data";
import { useHotelContext } from "Context/HotelContext";

const DailyTraffic = () => {
  const { hotelName } = useHotelContext();
  const { completedOrders } = useOrdersData(hotelName);

  // Object to store visitor counts by date
  const visitorCountByDate = {};

  // Iterate over the order data to calculate visitor counts per day
  completedOrders.forEach((order) => {
    const dateObj = new Date(order.checkoutData.date);
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    // Increment the visitor count for the corresponding date
    if (visitorCountByDate[formattedDate]) {
      visitorCountByDate[formattedDate]++;
    } else {
      visitorCountByDate[formattedDate] = 1;
    }
  });

  // Separate the data into arrays for the chart
  const dates = Object.keys(visitorCountByDate);
  const visitors = Object.values(visitorCountByDate);

  // Calculate the total number of visitors
  const totalVisitors = visitors.reduce((sum, count) => sum + count, 0);

  // Calculate the percentage change from the previous day
  let percentageChange = 0;
  if (visitors.length > 1) {
    const previousDayVisitors = visitors[visitors.length - 2];
    const currentDayVisitors = visitors[visitors.length - 1];
    percentageChange = ((currentDayVisitors - previousDayVisitors) / previousDayVisitors) * 100;
  }

  // Determine the color based on the percentage change
  const changeColor = percentageChange >= 0 ? "text-green-500" : "text-red-500";
  const Icon = percentageChange >= 0 ? MdArrowDropUp : MdArrowDropDown;

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
      name: "Visitors",
      data: visitors,
    },
  ];

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Daily Visitors
          </p>
          <p className="text-[34px] font-bold text-navy-700 dark:text-white">
            {totalVisitors.toLocaleString()}{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Total Visitors
            </span>
          </p>
        </div>
        <div className="mt-2 flex items-start">
          <div className={`flex items-center text-sm ${changeColor}`}>
            <Icon className="h-5 w-5" />
            <p className="font-bold">
              {percentageChange.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full pt-10 pb-0">
        <BarChart series={customData} options={customOptions} />
      </div>
    </Card>
  );
};

export default DailyTraffic;
