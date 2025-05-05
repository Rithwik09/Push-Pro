import React from "react";
import { useRouter } from "next/router";
import { Card } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useTranslation } from "react-i18next";
import statusData from "../../../shared/data/json/status.json";

Chart.register(...registerables);

const DoughnutChart = ({ projectstatus }) => {
  const { t } = useTranslation();
  const router = useRouter(); // Use the Next.js router for navigation

  const labels = statusData.map((status) => status.value);
  const counts = statusData.map((status) => {
    const statusCount = projectstatus?.find(
      (item) => item.status_id === status.id
    );
    return statusCount ? statusCount.count : 0;
  });

  //   const backgroundColors = [
  //     "rgb(255, 182, 193)", // Pink
  //     "rgb(75, 192, 192)", // Teal
  //     "rgb(255, 205, 86)", // Yellow
  //     "rgb(54, 11, 235)", // Blue
  //     "rgb(255, 159, 64)", // Orange
  //     "rgb(255, 11, 11)", // Purple
  //     "rgb(101, 203, 104)", // Green
  //     "rgb(0, 255, 255)" // Cyan (new unique color)
  //   ];

  //   const backgroundColors = [
  //     "rgb(0, 102, 204)", // Darker Cyan
  //     "rgb(0, 77, 128)", // Dark Teal
  //     "rgb(0, 51, 153)", // Dark Yellowish-Blue
  //     "rgb(0, 0, 153)", // Dark Blue
  //     "rgb(0, 64, 128)", // Dark Orange-Blue
  //     "rgb(0, 0, 139)", // Dark Purple-Blue
  //     "rgb(0, 102, 153)", // Dark Green-Blue
  //     "rgb(0, 0, 128)" // New Dark Cyan
  //   ];

  const backgroundColors = [
    "rgb(224, 255, 255)", // Light Cyan
    "rgb(173, 216, 230)", // Light Blue
    "rgb(135, 206, 250)", // Sky Blue
    "rgb(100, 149, 237)", // Cornflower Blue
    "rgb(70, 130, 180)", // Steel Blue
    "rgb(0, 180, 175)", // Royal Blue
    "rgb(0, 0, 255)", // Blue
    "rgb(0, 0, 139)" // Dark Blue
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Count",
        data: counts,
        backgroundColor: backgroundColors,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const statusId = statusData[index].id;
        handleProjectStatusClick(statusId);
      }
    }
  };

  // Function to navigate to project page with status ID
  const handleProjectStatusClick = (id) => {
    router.push(`/myprojects?status=${id}`);
  };

  return (
    <div style={{ width: "auto", minHeight: "400px", height: "500px" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
