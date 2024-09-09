import Chart from "react-apexcharts";

const BarChart = ({ series, options }) => {
  // Default options that can be overridden by props
  const defaultOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        backgroundColor: "#000000",
      },
      theme: "dark",
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#CBD5E0",
          fontSize: "14px",
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "40px",
      },
    },
  };

  // Merge default options with incoming options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    xaxis: {
      ...defaultOptions.xaxis,
      ...options.xaxis,
    },
    yaxis: {
      ...defaultOptions.yaxis,
      ...options.yaxis,
    },
    fill: {
      ...defaultOptions.fill,
      ...options.fill,
    },
  };

  return (
    <Chart
      options={mergedOptions}
      series={series}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default BarChart;
