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
import { InfoCard } from "../../components";
import TotalSpent from "srcV2/views/admin/default/components/TotalSpent";
import { useHotelContext } from "Context/HotelContext";
import { useCompletedOrders } from "data";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

const aggregateOrdersPerDay = (data) => {
  if (!data || Object.keys(data).length === 0) return [];

  return Object.keys(data).map((date) => {
    const orders = data[date];
    return Math.round(
      orders.reduce((total, order) => total + order.orderData.quantity, 0)
    );
  });
};

const predictOrders = async (ordersPerDay) => {
  if (ordersPerDay.length === 0) return [];

  const maxOrders = Math.max(...ordersPerDay);
  const normalizedData = ordersPerDay.map((orders) => orders / maxOrders);

  const inputTensor = tf.tensor2d(normalizedData.slice(0, -1), [
    normalizedData.length - 1,
    1,
  ]);
  const outputTensor = tf.tensor2d(normalizedData.slice(1), [
    normalizedData.length - 1,
    1,
  ]);

  const model = tf.sequential();

  const initializer = tf.initializers.glorotUniform({ seed: 42 });

  model.add(
    tf.layers.dense({
      units: 8,
      inputShape: [1],
      activation: "relu",
      kernelInitializer: initializer,
    })
  );
  model.add(tf.layers.dense({ units: 1, kernelInitializer: initializer }));

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  await model.fit(inputTensor, outputTensor, {
    epochs: 200,
    batchSize: 4,
    shuffle: false, // Maintain the order of data
  });

  const predictions = [];
  for (let i = 0; i < normalizedData.length - 1; i++) {
    const prediction = model.predict(tf.tensor2d([normalizedData[i]], [1, 1]));
    predictions.push(Math.round(prediction.dataSync()[0] * maxOrders));
  }

  const lastValue = normalizedData[normalizedData.length - 1];
  const forecastedValue = model.predict(tf.tensor2d([lastValue], [1, 1]));
  predictions.push(Math.round(forecastedValue.dataSync()[0] * maxOrders));

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

  const totalActual = actual.reduce((acc, val) => acc + val, 0);
  const totalError = actual.reduce(
    (acc, val, idx) => acc + Math.abs(val - predicted[idx]),
    0
  );

  // Avoid division by zero
  const accuracy =
    totalActual > 0 ? ((1 - totalError / totalActual) * 100).toFixed(0) : 0;

  return accuracy;
};

const transformOrderData = (completedOrders) => {
  const result = {};

  completedOrders.forEach(order => {
    const date = order.checkoutData.date.split('T')[0]; // Extract the date part
    const quantity = order.quantity;

    if (!result[date]) {
      result[date] = [{ orderData: { quantity: 0 } }];
    }

    result[date][0].orderData.quantity += quantity;
  });

  return result;
};

const OrderForecasting = () => {
  const [forecast, setForecast] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const { hotelName } = useHotelContext();
  const { completedOrders, loading, error } = useCompletedOrders(hotelName);

  useEffect(() => {
    if (loading) return;
    if (error) {
      console.error("Error fetching completed orders:", error);
      return;
    }

    const transformedData = transformOrderData(completedOrders);
    const ordersPerDay = aggregateOrdersPerDay(transformedData);

    predictOrders(ordersPerDay).then((predictions) => {
      const adjustedPredictions = predictions.slice(0, ordersPerDay.length);
      setForecast(predictions);
      setAccuracy(calculateAccuracy(ordersPerDay, adjustedPredictions));
    }).catch(error => {
      console.error("Prediction error:", error);
    });
  }, [completedOrders, loading, error, hotelName]);

  const transformedData = transformOrderData(completedOrders) || {};
  const ordersPerDay = aggregateOrdersPerDay(transformedData);

  const chartData = {
    labels: Object.keys(transformedData),
    datasets: [
      {
        label: "Actual Orders",
        data: ordersPerDay,
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Predicted Orders",
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
            return `${context.dataset.label}: ${Math.round(context.raw)}`;
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
          text: "Order Quantity",
        },
      },
    },
  };

  return (
    <>
      <InfoCard
        title={"Order Forecast"}
        children={
          <>
            <div style={{ display: "flex" }}>
              <p style={{ marginRight: "40px" }}>
                Predicted Orders for Next Day:{" "}
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

export default OrderForecasting;
