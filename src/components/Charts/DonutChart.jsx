// src/components/DonutChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { colors } from '../../theme/theme';
ChartJS.register(Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const DonutChart = ({ data }) => {
  // Prepare data for the chart
  const chartData = {
    labels: data.map(item => item.menuCategory.trim()), // Use menuCategory for labels
    datasets: [{
      data: data.map(item => item.menuCategoryCount), // Use menuCategoryCount for values
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <Pie
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true, // Use a point (circle) instead of rectangles
                pointStyle: 'circle', // Specify the point style as a circle
                boxWidth: 8, // Size of the circle
                padding: 20, // Space around the label text and circle
              },
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  const label = tooltipItem.label || '';
                  const value = tooltipItem.raw || '';
                  return `${label}: ${value}`;
                },
              },
            },
            datalabels: {
              color: `${colors.White}`,
              formatter: (value, context) => {
                const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${percentage}%`;
              },
              anchor: 'end',
              align: 'end',
            },
          },
          cutout: '50%', // This makes the pie chart a donut chart
        }}
      />
    </div>
  );
};

export default DonutChart;
