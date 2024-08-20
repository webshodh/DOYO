import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import * as tf from "@tensorflow/tfjs";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
} from "chart.js";
import InfoCard from "../../components/Cards/InfoCard";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

const dummyMenuData = {
  "2024-08-11": { Pizza: 50, Burger: 30, Pasta: 20 },
  "2024-08-12": { Pizza: 60, Burger: 40, Pasta: 30 },
  "2024-08-13": { Pizza: 70, Burger: 20, Pasta: 25 },
  "2024-08-14": { Pizza: 80, Burger: 50, Pasta: 35 },
  "2024-08-15": { Pizza: 90, Burger: 30, Pasta: 45 },
  "2024-08-16": { Pizza: 100, Burger: 60, Pasta: 50 },
  "2024-08-17": { Pizza: 110, Burger: 70, Pasta: 55 },
};

const preprocessData = (data) => {
  const dates = Object.keys(data);
  const menuItems = new Set();

  // Collect all unique menu items
  dates.forEach((date) => {
    Object.keys(data[date]).forEach((item) => menuItems.add(item));
  });

  // Prepare input data
  const inputs = [];
  const outputs = [];

  dates.forEach((date) => {
    const itemCounts = Array.from(menuItems).map(
      (item) => data[date][item] || 0
    );
    inputs.push(itemCounts);
    outputs.push(itemCounts); // Predicting same values for simplicity
  });

  return { inputs, outputs, menuItems: Array.from(menuItems) };
};

const predictPopularity = async (inputs, outputs) => {
  const inputTensor = tf.tensor2d(inputs);
  const outputTensor = tf.tensor2d(outputs);

  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 8,
      inputShape: [inputs[0].length],
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: inputs[0].length }));

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  await model.fit(inputTensor, outputTensor, {
    epochs: 200,
    batchSize: 4,
  });

  const predictions = model.predict(inputTensor);
  return predictions
    .arraySync()
    .map((row) => row.map((value) => Math.round(value)));
};

const MenuItemPopularityPrediction = () => {
  const [forecast, setForecast] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const { inputs, outputs, menuItems } = preprocessData(dummyMenuData);
    setMenuItems(menuItems);
    predictPopularity(inputs, outputs).then((predictions) => {
      setForecast(predictions);
    });
  }, []);

  const chartData = {
    labels: Object.keys(dummyMenuData),
    datasets: menuItems.map((item, index) => ({
      label: item,
      data: forecast.map((row) => row[index]),
      borderColor: `hsl(${(index * 360) / menuItems.length}, 70%, 50%)`,
      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${Math.round(context.raw)} units`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Units Sold",
        },
      },
    },
  };

  return (
    <>
      <InfoCard title={"Menu Item Popularity Prediction"} />
      <div className="background-card">
        <div style={{ width: "80%", height: "400px", margin: "0 auto" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </>
  );
};

export default MenuItemPopularityPrediction;
