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

const dummySalesData = {
  "2024-08-11": 200,
  "2024-08-12": 150,
  "2024-08-13": 300,
  "2024-08-14": 250,
  "2024-08-15": 400,
  "2024-08-16": 350,
  "2024-08-17": 500,
};

const aggregateSalesPerDay = (data) => {
  return Object.keys(data).map((date) => Math.round(data[date]));
};

const predictSales = async (salesPerDay) => {
  const maxSales = Math.max(...salesPerDay);
  const normalizedData = salesPerDay.map((sales) => sales / maxSales);

  const inputTensor = tf.tensor2d(normalizedData.slice(0, -1), [
    normalizedData.length - 1,
    1,
  ]);
  const outputTensor = tf.tensor2d(normalizedData.slice(1), [
    normalizedData.length - 1,
    1,
  ]);

  let model;
  try {
    model = await tf.loadLayersModel("localstorage://sales-model"); // Load model from local storage
  } catch (e) {
    // Model not found, so train it
    model = tf.sequential();
    model.add(
      tf.layers.dense({ units: 8, inputShape: [1], activation: "relu" })
    );
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({
      optimizer: "adam",
      loss: "meanSquaredError",
    });

    await model.fit(inputTensor, outputTensor, {
      epochs: 200,
      batchSize: 4,
    });

    await model.save("localstorage://sales-model"); // Save model to local storage
  }

  const predictions = [];
  for (let i = 0; i < normalizedData.length - 1; i++) {
    const prediction = model.predict(tf.tensor2d([normalizedData[i]], [1, 1]));
    predictions.push(Math.round(prediction.dataSync()[0] * maxSales));
  }

  const lastValue = normalizedData[normalizedData.length - 1];
  const forecastedValue = model.predict(tf.tensor2d([lastValue], [1, 1]));
  predictions.push(Math.round(forecastedValue.dataSync()[0] * maxSales));

  return predictions;
};

const calculateAccuracy = (actual, predicted) => {
  if (
    actual.length === 0 ||
    predicted.length === 0 ||
    actual.length !== predicted.length
  ) {
    return 0;
  }

  const totalError = actual.reduce(
    (acc, val, idx) => acc + Math.abs(val - predicted[idx]),
    0
  );
  const totalActual = actual.reduce((acc, val) => acc + val, 0);

  // Prevent division by zero
  const accuracy =
    totalActual > 0 ? ((1 - totalError / totalActual) * 100).toFixed(0) : 0;

  return accuracy;
};

const SalesForecasting = () => {
  const [forecast, setForecast] = useState([]);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    const salesPerDay = aggregateSalesPerDay(dummySalesData);
    predictSales(salesPerDay).then((predictions) => {
      // Ensure lengths match before calculating accuracy
      const adjustedPredictions = predictions.slice(0, salesPerDay.length);
      setForecast(predictions);
      setAccuracy(calculateAccuracy(salesPerDay, adjustedPredictions));
    });
  }, []);

  const salesPerDay = aggregateSalesPerDay(dummySalesData);

  const chartData = {
    labels: Object.keys(dummySalesData),
    datasets: [
      {
        label: "Actual Sales",
        data: salesPerDay,
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Predicted Sales",
        data: forecast,
        borderColor: "red",
        fill: false,
      },
    ],
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
            return `${context.dataset.label}: ₹${Math.round(context.raw)}`;
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
          text: "Sales Revenue ($)",
        },
      },
    },
  };

  return (
    <>
      <InfoCard
        title={"Sales Forecast"}
        children={
          <>
            <div style={{ display: "flex" }}>
              <p style={{ marginRight: "40px" }}>
                Predicted Sales for Next Day:{" "}
                {forecast[forecast.length - 1]?.toFixed(0)}
              </p>
              <p>Prediction Accuracy: {accuracy}%</p>
            </div>
          </>
        }
      />
      <div className="background-card">
        <div style={{ width: "80%", height: "400px", margin: "0 auto" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </>
  );
};

export default SalesForecasting;
