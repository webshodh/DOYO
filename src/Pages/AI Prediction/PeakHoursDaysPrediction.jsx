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

const dummyPeakData = {
  "2024-08-11": {
    hourly: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    daily: [300, 400, 350, 450, 500, 600, 700],
  },
  "2024-08-12": {
    hourly: [15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125],
    daily: [320, 410, 360, 460, 520, 610, 710],
  },
};

const preprocessPeakData = (data) => {
  const dates = Object.keys(data);
  const hourlyInputs = [];
  const hourlyOutputs = [];
  const dailyInputs = [];
  const dailyOutputs = [];

  dates.forEach((date) => {
    const item = data[date];
    hourlyInputs.push(...item.hourly.map((_, index) => [index]));
    hourlyOutputs.push(...item.hourly);

    dailyInputs.push(...item.daily.map((_, index) => [index]));
    dailyOutputs.push(...item.daily);
  });

  const normalize = (arr) => {
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    return arr.map((value) => (value - min) / (max - min));
  };

  return {
    hourlyInputs: normalize(hourlyInputs.flat()),
    hourlyOutputs: normalize(hourlyOutputs),
    dailyInputs: normalize(dailyInputs.flat()),
    dailyOutputs: normalize(dailyOutputs),
  };
};

const saveModel = async (model) => {
  await model.save("localstorage://my-model");
};

const loadModel = async () => {
  try {
    const model = await tf.loadLayersModel("localstorage://my-model");
    return model;
  } catch (error) {
    console.error("Model not found. Training new model.");
    return null;
  }
};

const buildAndTrainModel = async (
  hourlyInputs,
  hourlyOutputs,
  dailyInputs,
  dailyOutputs
) => {
  const hourlyInputTensor = tf.tensor2d(hourlyInputs, [hourlyInputs.length, 1]);
  const hourlyOutputTensor = tf.tensor2d(hourlyOutputs, [
    hourlyOutputs.length,
    1,
  ]);

  const dailyInputTensor = tf.tensor2d(dailyInputs, [dailyInputs.length, 1]);
  const dailyOutputTensor = tf.tensor2d(dailyOutputs, [dailyOutputs.length, 1]);

  const model = tf.sequential();
  model.add(
    tf.layers.dense({ units: 64, inputShape: [1], activation: "relu" })
  );
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  await model.fit(hourlyInputTensor, hourlyOutputTensor, {
    epochs: 500,
    batchSize: 8,
    validationSplit: 0.2, // Split 20% of the data for validation
  });

  await saveModel(model);

  return model;
};

const predictPeakHoursDays = async (
  hourlyInputs,
  hourlyOutputs,
  dailyInputs,
  dailyOutputs
) => {
  let model = await loadModel();

  if (!model) {
    model = await buildAndTrainModel(
      hourlyInputs,
      hourlyOutputs,
      dailyInputs,
      dailyOutputs
    );
  }

  const hourlyInputTensor = tf.tensor2d(hourlyInputs, [hourlyInputs.length, 1]);
  const dailyInputTensor = tf.tensor2d(dailyInputs, [dailyInputs.length, 1]);

  const hourlyPredictions = model.predict(hourlyInputTensor);
  const dailyPredictions = model.predict(dailyInputTensor);

  return {
    hourly: hourlyPredictions.arraySync().map((row) => row[0]),
    daily: dailyPredictions.arraySync().map((row) => row[0]),
  };
};

const PeakHoursDaysPrediction = () => {
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [dailyForecast, setDailyForecast] = useState([]);
  const [actualHourly, setActualHourly] = useState([]);
  const [actualDaily, setActualDaily] = useState([]);

  useEffect(() => {
    const {
      hourlyInputs,
      hourlyOutputs,
      dailyInputs,
      dailyOutputs,
    } = preprocessPeakData(dummyPeakData);
    predictPeakHoursDays(
      hourlyInputs,
      hourlyOutputs,
      dailyInputs,
      dailyOutputs
    ).then((predictions) => {
      setHourlyForecast(predictions.hourly.map((value) => value * 100)); // Denormalize
      setDailyForecast(predictions.daily.map((value) => value * 100)); // Denormalize

      const allHourlyData = Object.values(dummyPeakData).flatMap(
        (item) => item.hourly
      );
      const allDailyData = Object.values(dummyPeakData).flatMap(
        (item) => item.daily
      );
      setActualHourly(allHourlyData);
      setActualDaily(allDailyData);
    });
  }, []);

  const calculateAccuracy = (predictions, actuals) => {
    const total = Math.min(predictions.length, actuals.length);
    const totalError = predictions
      .slice(0, total)
      .reduce((acc, pred, index) => acc + Math.abs(pred - actuals[index]), 0);
    const totalActuals = actuals
      .slice(0, total)
      .reduce((acc, val) => acc + val, 0);
    return totalActuals
      ? ((1 - totalError / totalActuals) * 100).toFixed(2)
      : 0;
  };

  const hourlyAccuracy = calculateAccuracy(hourlyForecast, actualHourly);
  const dailyAccuracy = calculateAccuracy(dailyForecast, actualDaily);

  const chartDataHourly = {
    labels: Array.from({ length: 12 }, (_, i) => `Hour ${i + 1}`),
    datasets: [
      {
        label: "Predicted Hourly Traffic",
        data: hourlyForecast,
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Actual Hourly Traffic",
        data: actualHourly,
        borderColor: "orange",
        fill: false,
      },
    ],
  };

  const chartDataDaily = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Predicted Daily Traffic",
        data: dailyForecast,
        borderColor: "green",
        fill: false,
      },
      {
        label: "Actual Daily Traffic",
        data: actualDaily,
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
            return `${context.dataset.label}: ${Math.round(context.raw).toFixed(
              2
            )} orders`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time/Day",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Orders",
        },
      },
    },
  };

  return (
    <div>
      <>
        <InfoCard
          title={"Peak Hourly Traffic Prediction"}
          children={<p>Hourly Prediction Accuracy: {hourlyAccuracy}%</p>}
        />
        <div className="background-card">
          <div style={{ width: "80%", height: "400px", margin: "0 auto" }}>
            <Line data={chartDataHourly} options={chartOptions} />
          </div>
        </div>

        <InfoCard
          title={"Peak Daily Traffic Prediction"}
          children={<p>Daily Prediction Accuracy: {dailyAccuracy}%</p>}
        />
        <div className="background-card">
          <div
            style={{
              width: "80%",
              height: "400px",
              margin: "0 auto",
              marginTop: "20px",
            }}
          >
            <Line data={chartDataDaily} options={chartOptions} />
          </div>
        </div>
      </>
    </div>
  );
};

export default PeakHoursDaysPrediction;
