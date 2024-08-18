import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import * as tf from '@tensorflow/tfjs';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

const dummySeasonalData = {
  "2024-01-01": { "Sales": 1500, "Customers": 100, "Season": "Winter" },
  "2024-02-14": { "Sales": 2000, "Customers": 150, "Season": "Winter" },
  "2024-06-01": { "Sales": 1800, "Customers": 120, "Season": "Summer" },
  "2024-07-04": { "Sales": 2500, "Customers": 200, "Season": "Summer" },
  "2024-10-31": { "Sales": 1700, "Customers": 130, "Season": "Fall" },
  "2024-12-25": { "Sales": 3000, "Customers": 250, "Season": "Winter" }
};

const preprocessSeasonalData = (data) => {
  const dates = Object.keys(data);
  const seasons = Array.from(new Set(Object.values(data).map(item => item.Season)));

  const inputs = [];
  const salesOutputs = [];
  const customersOutputs = [];

  dates.forEach(date => {
    const item = data[date];
    const seasonIndex = seasons.indexOf(item.Season);
    inputs.push([seasonIndex]);
    salesOutputs.push(item.Sales);
    customersOutputs.push(item.Customers);
  });

  return { inputs, salesOutputs, customersOutputs, seasons };
};

const predictSeasonalTrends = async (inputs, salesOutputs, customersOutputs) => {
  const inputTensor = tf.tensor2d(inputs);
  const salesOutputTensor = tf.tensor2d(salesOutputs, [salesOutputs.length, 1]);
  const customersOutputTensor = tf.tensor2d(customersOutputs, [customersOutputs.length, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, inputShape: [inputs[0].length], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  await model.fit(inputTensor, salesOutputTensor, {
    epochs: 200,
    batchSize: 4,
  });

  const salesPredictions = model.predict(inputTensor);
  const customersPredictions = model.predict(inputTensor);
  return {
    sales: salesPredictions.arraySync().map(row => Math.round(row[0])),
    customers: customersPredictions.arraySync().map(row => Math.round(row[0])),
  };
};

const SeasonalTrendsPrediction = () => {
  const [salesForecast, setSalesForecast] = useState([]);
  const [customersForecast, setCustomersForecast] = useState([]);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    const { inputs, salesOutputs, customersOutputs, seasons } = preprocessSeasonalData(dummySeasonalData);
    setSeasons(seasons);
    predictSeasonalTrends(inputs, salesOutputs, customersOutputs).then(predictions => {
      setSalesForecast(predictions.sales);
      setCustomersForecast(predictions.customers);
    });
  }, []);

  const chartData = {
    labels: Object.keys(dummySeasonalData),
    datasets: [
      {
        label: 'Predicted Sales',
        data: salesForecast,
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Actual Sales',
        data: Object.values(dummySeasonalData).map(item => item.Sales),
        borderColor: 'orange',
        fill: false,
      },
      {
        label: 'Predicted Customers',
        data: customersForecast,
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Actual Customers',
        data: Object.values(dummySeasonalData).map(item => item.Customers),
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
            return `${context.dataset.label}: ${Math.round(context.raw)} units`;
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
          text: 'Value',
        },
      },
    },
  };

  return (
    <div style={{ width: '80%', height: '400px', margin: '0 auto' }}>
      <h2>Seasonal Trends Prediction</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SeasonalTrendsPrediction;
