import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import * as tf from '@tensorflow/tfjs';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

const dummyData = {
  // Dummy data for 7 days
  "2024-08-11": [{ "orderData": { "quantity": 3 } }],
  "2024-08-12": [{ "orderData": { "quantity": 2 } }],
  "2024-08-13": [{ "orderData": { "quantity": 5 } }],
  "2024-08-14": [{ "orderData": { "quantity": 4 } }],
  "2024-08-15": [{ "orderData": { "quantity": 6 } }],
  "2024-08-16": [{ "orderData": { "quantity": 3 } }],
  "2024-08-17": [{ "orderData": { "quantity": 7 } }],
};

const aggregateOrdersPerDay = (data) => {
  return Object.keys(data).map((date) => {
    const orders = data[date];
    return Math.round(orders.reduce((total, order) => total + order.orderData.quantity, 0));
  });
};

const predictOrders = async (ordersPerDay) => {
  const maxOrders = Math.max(...ordersPerDay);
  const normalizedData = ordersPerDay.map((orders) => orders / maxOrders);

  const inputTensor = tf.tensor2d(normalizedData.slice(0, -1), [normalizedData.length - 1, 1]);
  const outputTensor = tf.tensor2d(normalizedData.slice(1), [normalizedData.length - 1, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, inputShape: [1], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  await model.fit(inputTensor, outputTensor, {
    epochs: 200,
    batchSize: 4,
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
  const totalError = actual.reduce((acc, val, idx) => acc + Math.abs(val - predicted[idx]), 0);
  const accuracy = ((1 - totalError / actual.reduce((acc, val) => acc + val, 0)) * 100).toFixed(2);
  return accuracy;
};

const OrderForecasting = () => {
  const [forecast, setForecast] = useState([]);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    const ordersPerDay = aggregateOrdersPerDay(dummyData);
    predictOrders(ordersPerDay).then((predictions) => {
      setForecast(predictions);
      setAccuracy(calculateAccuracy(ordersPerDay, predictions.slice(0, -1)));
    });
  }, []);

  const ordersPerDay = aggregateOrdersPerDay(dummyData);

  const chartData = {
    labels: Object.keys(dummyData),
    datasets: [
      {
        label: 'Actual Orders',
        data: ordersPerDay,
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Predicted Orders',
        data: forecast,
        borderColor: 'red',
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${Math.round(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Order Quantity',
        },
      },
    },
  };

  return (
    <div style={{ width: '80%', height: '400px', margin: '0 auto' }}>
      <h2>Order Forecast</h2>
      <p>Predicted Orders for Next Day: {forecast[forecast.length - 1]?.toFixed(0)}</p>
      <p>Prediction Accuracy: {accuracy}%</p>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default OrderForecasting;
