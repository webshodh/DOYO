import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import * as tf from '@tensorflow/tfjs';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

const dummyPeakData = {
  "2024-08-11": {
    "hourly": [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    "daily": [300, 400, 350, 450, 500, 600, 700]
  },
  "2024-08-12": {
    "hourly": [15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125],
    "daily": [320, 410, 360, 460, 520, 610, 710]
  }
  // Add more dates as needed
};

const preprocessPeakData = (data) => {
  const dates = Object.keys(data);
  const hourlyInputs = [];
  const hourlyOutputs = [];
  const dailyInputs = [];
  const dailyOutputs = [];

  dates.forEach(date => {
    const item = data[date];
    hourlyInputs.push(...item.hourly.map((val, index) => [index]));
    hourlyOutputs.push(...item.hourly);

    dailyInputs.push(...item.daily.map((val, index) => [index]));
    dailyOutputs.push(...item.daily);
  });

  return { hourlyInputs, hourlyOutputs, dailyInputs, dailyOutputs };
};

const predictPeakHoursDays = async (hourlyInputs, hourlyOutputs, dailyInputs, dailyOutputs) => {
  const hourlyInputTensor = tf.tensor2d(hourlyInputs);
  const hourlyOutputTensor = tf.tensor2d(hourlyOutputs, [hourlyOutputs.length, 1]);

  const dailyInputTensor = tf.tensor2d(dailyInputs);
  const dailyOutputTensor = tf.tensor2d(dailyOutputs, [dailyOutputs.length, 1]);

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 16, inputShape: [hourlyInputs[0].length], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
  });

  await model.fit(hourlyInputTensor, hourlyOutputTensor, {
    epochs: 300,
    batchSize: 8,
  });

  const hourlyPredictions = model.predict(hourlyInputTensor);
  const dailyPredictions = model.predict(dailyInputTensor);

  return {
    hourly: hourlyPredictions.arraySync().map(row => Math.round(row[0])),
    daily: dailyPredictions.arraySync().map(row => Math.round(row[0])),
  };
};

const PeakHoursDaysPrediction = () => {
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [actualHourly, setActualHourly] = useState([]);
  const [actualDaily, setActualDaily] = useState([]);

  useEffect(() => {
    const { hourlyInputs, hourlyOutputs, dailyInputs, dailyOutputs } = preprocessPeakData(dummyPeakData);
    predictPeakHoursDays(hourlyInputs, hourlyOutputs, dailyInputs, dailyOutputs).then(predictions => {
      setHourlyForecast(predictions.hourly);
      setDailyForecast(predictions.daily);

      // Extract actual data
      const allHourlyData = Object.values(dummyPeakData).flatMap(item => item.hourly);
      const allDailyData = Object.values(dummyPeakData).flatMap(item => item.daily);
      setActualHourly(allHourlyData);
      setActualDaily(allDailyData);
    });
  }, []);

  const calculateAccuracy = (predictions, actuals) => {
    const total = predictions.length;
    const correct = predictions.reduce((acc, pred, index) => {
      return acc + (Math.round(pred) === actuals[index] ? 1 : 0);
    }, 0);
    return (correct / total) * 100;
  };

  const hourlyAccuracy = calculateAccuracy(hourlyForecast, actualHourly);
  const dailyAccuracy = calculateAccuracy(dailyForecast, actualDaily);

  const chartDataHourly = {
    labels: Array.from({ length: 24 }, (_, i) => `Hour ${i + 1}`),
    datasets: [
      {
        label: 'Predicted Hourly Traffic',
        data: hourlyForecast,
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Actual Hourly Traffic',
        data: actualHourly,
        borderColor: 'orange',
        fill: false,
      },
    ],
  };

  const chartDataDaily = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Predicted Daily Traffic',
        data: dailyForecast,
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Actual Daily Traffic',
        data: actualDaily,
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
            return `${context.dataset.label}: ${Math.round(context.raw)} customers`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time/Day',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Customers',
        },
      },
    },
  };

  return (
    <div>
      <div style={{ width: '80%', height: '400px', margin: '0 auto' }}>
        <h2>Peak Hourly Traffic Prediction</h2>
        <Line data={chartDataHourly} options={chartOptions} />
      </div>
      <div style={{ width: '80%', height: '400px', margin: '0 auto', marginTop: '20px' }}>
        <h2>Peak Daily Traffic Prediction</h2>
        <Line data={chartDataDaily} options={chartOptions} />
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Hourly Prediction Accuracy: {hourlyAccuracy.toFixed(2)}%</p>
        <p>Daily Prediction Accuracy: {dailyAccuracy.toFixed(2)}%</p>
      </div>
    </div>
  );
};

export default PeakHoursDaysPrediction;
