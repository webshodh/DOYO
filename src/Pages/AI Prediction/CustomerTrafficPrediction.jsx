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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title);

const dummyTrafficData = {
  "2024-08-11": 120,
  "2024-08-12": 150,
  "2024-08-13": 130,
  "2024-08-14": 170,
  "2024-08-15": 200,
  "2024-08-16": 180,
  "2024-08-17": 220,
};

const aggregateTrafficPerDay = (data) => {
  return Object.keys(data).map((date) => Math.round(data[date]));
};

const CustomerTrafficPrediction = () => {
  const [forecast, setForecast] = useState([]);
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    const trafficPerDay = aggregateTrafficPerDay(dummyTrafficData);

    const predictTraffic = async (trafficPerDay) => {
      const maxTraffic = Math.max(...trafficPerDay);
      const normalizedData = trafficPerDay.map(
        (traffic) => traffic / maxTraffic
      );

      const inputTensor = tf.tensor2d(normalizedData.slice(0, -1), [
        normalizedData.length - 1,
        1,
      ]);
      const outputTensor = tf.tensor2d(normalizedData.slice(1), [
        normalizedData.length - 1,
        1,
      ]);

      let model = await loadModel();

      if (!model) {
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

        await saveModel(model);
      }

      const predictions = [];
      for (let i = 0; i < normalizedData.length - 1; i++) {
        const prediction = model.predict(
          tf.tensor2d([normalizedData[i]], [1, 1])
        );
        predictions.push(Math.round(prediction.dataSync()[0] * maxTraffic));
      }

      const lastValue = normalizedData[normalizedData.length - 1];
      const forecastedValue = model.predict(tf.tensor2d([lastValue], [1, 1]));
      predictions.push(Math.round(forecastedValue.dataSync()[0] * maxTraffic));

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
        totalActual > 0 ? ((1 - totalError / totalActual) * 100).toFixed(2) : 0;

      return accuracy;
    };

    const loadModel = async () => {
      try {
        return await tf.loadLayersModel("localstorage://my-model");
      } catch (error) {
        console.error("Failed to load model:", error);
        return null;
      }
    };

    const saveModel = async (model) => {
      await model.save("localstorage://my-model");
    };

    predictTraffic(trafficPerDay).then((predictions) => {
      // Ensure lengths match before calculating accuracy
      const adjustedPredictions = predictions.slice(0, trafficPerDay.length);
      setForecast(predictions);
      setAccuracy(calculateAccuracy(trafficPerDay, adjustedPredictions));
    });
  }, []);

  const trafficPerDay = aggregateTrafficPerDay(dummyTrafficData);

  const chartData = {
    labels: Object.keys(dummyTrafficData),
    datasets: [
      {
        label: "Actual Traffic",
        data: trafficPerDay,
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Predicted Traffic",
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
            return `${context.dataset.label}: ${Math.round(
              context.raw
            )} customers`;
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
          text: "Number of Customers",
        },
      },
    },
  };

  return (
    <>
      <InfoCard
        title={"Customer Traffic Prediction"}
        children={
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <p style={{ marginRight: "40px" }}>
                Predicted Traffic for Next Day:{" "}
                {forecast[forecast.length - 1]?.toFixed(0)} customers
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

export default CustomerTrafficPrediction;
