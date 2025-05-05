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
  const filteredStatusData = statusData.filter((status) => status.id !== 1);
  const filteredProjectStatus = projectstatus.filter(
    (item) => item.status_id !== 1
  );

  const labels = filteredStatusData.map((status) => status.value);
  const counts = filteredStatusData.map((status) => {
    const statusCount = filteredProjectStatus.find(
      (item) => item.status_id === status.id
    );
    return statusCount ? statusCount.count : 0;
  });

  const backgroundColors = [
    "rgb(224, 255, 255)", // Light Cyan
    "rgb(173, 216, 230)", // Light Blue
    "rgb(135, 206, 250)", // Sky Blue
    "rgb(100, 149, 237)", // Cornflower Blue
    "rgb(70, 130, 180)", // Steel Blue
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
        const statusId = filteredStatusData[index].id;
        handleProjectStatusClick(statusId);
      }
    }
  };

  // Function to navigate to project page with status ID
  const handleProjectStatusClick = (id) => {
    router.push(`/myprojects?status=${id}`);
  };
  const allCountsZero = counts.every((count) => count === 0);
  return (
    <div className="col-md-6">
      <Card className="custom-card h-100">
        <Card.Header className="d-flex justify-content-between">
          <Card.Title className="mb-lg-0 col-8">
            {t("dashboard.Projectstatus")}
          </Card.Title>
        </Card.Header>
        <div style={{ width: "100%", height: "400px" }}>
          {allCountsZero ? (
            <p className="text-center mt-5">No Records Found</p>
          ) : (
            <Doughnut data={data} options={options} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default DoughnutChart;
