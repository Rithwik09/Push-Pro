import { Line } from "react-chartjs-2";
import useService from "@/hooks/useService";
import { format, subMonths } from "date-fns";
import { useTranslation } from "react-i18next";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { Chart, registerables } from "chart.js";
import React, { useState, useEffect } from "react";

Chart.register(...registerables);

const ProjectChart = () => {
  const service = useService();
  const { t } = useTranslation();
  const [projectData, setProjectData] = useState([]);
  const [estimationData, setEstimationData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("6 Months");
  const [timeLabels, setTimeLabels] = useState([]);

  const currentDate = new Date();

  const generateLabels = (period) => {
    const labels = [];
    switch (period) {
      case "6 Months":
        for (let i = 6; i >= 0; i--) {
          const monthDate = subMonths(currentDate, i);
          labels.push(format(monthDate, "yyyy-MM"));
        }
        break;
      case "1 Year":
        for (let i = 12; i >= 0; i--) {
          const monthDate = subMonths(currentDate, i);
          labels.push(format(monthDate, "yyyy-MM"));
        }
        break;
      case "3 Years":
        for (let i = 36; i >= 0; i--) {
          const monthDate = subMonths(currentDate, i);
          labels.push(format(monthDate, "yyyy-MM"));
        }
        break;
      default:
        break;
    }
    return labels;
  };

  const aggregateQuarterlyData = (data, labels) => {
    if (labels.length <= 12) return data;
    const quarterlyData = [];
    for (let i = 0; i < labels.length; i += 3) {
      const sum = data
        .slice(i, Math.min(i + 3, data.length))
        .reduce((acc, val) => acc + val, 0);
      quarterlyData.push(sum);
    }
    return quarterlyData;
  };

  const getDisplayLabels = (labels, period) => {
    if (period !== "3 Years") return labels;
    const quarterlyLabels = [];
    for (let i = 0; i < labels.length; i += 3) {
      quarterlyLabels.push(labels[i]);
    }
    return quarterlyLabels;
  };

  const fetchData = async (period) => {
    const newTimeLabels = generateLabels(period);
    const projectCounts = Array(newTimeLabels.length).fill(0);
    const estimationCounts = Array(newTimeLabels.length).fill(0);

    try {
      const [projectResult, estimationResult] = await Promise.all([
        service.post("/myprojectsByTime", { period }),
        service.post("/getestimatebytime", { period })
      ]);

      if (
        projectResult?.projectData &&
        Array.isArray(projectResult.projectData)
      ) {
        projectResult.projectData.forEach((item) => {
          const monthIndex = newTimeLabels.findIndex(
            (label) => label === item.month
          );
          if (monthIndex !== -1) {
            projectCounts[monthIndex] = item.projects;
          }
        });
      }

      if (
        estimationResult?.success &&
        estimationResult.estimateData &&
        Array.isArray(estimationResult.estimateData)
      ) {
        estimationResult.estimateData.forEach((item) => {
          const monthIndex = newTimeLabels.findIndex(
            (label) => label === item.month
          );
          if (monthIndex !== -1) {
            estimationCounts[monthIndex] = item.estimates;
          }
        });
      }

      const displayLabels = getDisplayLabels(newTimeLabels, period);
      const aggregatedProjects =
        period === "3 Years"
          ? aggregateQuarterlyData(projectCounts, newTimeLabels)
          : projectCounts;
      const aggregatedEstimates =
        period === "3 Years"
          ? aggregateQuarterlyData(estimationCounts, newTimeLabels)
          : estimationCounts;

      setTimeLabels(displayLabels);
      setProjectData(aggregatedProjects);
      setEstimationData(aggregatedEstimates);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePeriodChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedPeriod(selectedValue);
  };

  useEffect(() => {
    fetchData(selectedPeriod);
  }, [selectedPeriod]);

  // Calculate max value for Y axis scale
  const maxProjectValue = Math.max(...projectData, 1); // minimum of 1 to avoid scale issues
  const yAxisMax = Math.ceil(maxProjectValue * 1.2); // Add 20% padding

  const data = {
    labels: timeLabels,
    datasets: [
      {
        label: t("dashboard.Projectsreceived"),
        data: projectData,
        fill: false,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: t("dashboard.Estimationscreated"),
        data: estimationData,
        fill: false,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true // Connects points even with zero values
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: selectedPeriod === "3 Years" ? "3 Years Data" : selectedPeriod
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text:
            selectedPeriod === "3 Years"
              ? "Total Projects / Estimations per Quarter"
              : "Number of Projects / Estimations"
        },
        max: yAxisMax,
        min: 0,
        ticks: {
          stepSize: Math.max(1, Math.floor(yAxisMax / 5)), // Adjust step size based on max value
          precision: 0 // Show whole numbers only
        },
        grid: {
          display: true
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (context) => {
            if (selectedPeriod === "3 Years") {
              return `Quarter starting ${context[0].label}`;
            }
            return context[0].label;
          },
          label: (context) => {
            const value = context.raw || 0;
            return `${context.dataset.label}: ${value}`;
          }
        }
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20
        }
      }
    }
  };

  return (
    <div
      style={{
        margin: "0 auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        backgroundColor: "#fff"
      }}
    >
      <div style={{ padding: "20px", borderBottom: "1px solid #ddd" }}>
        <h5 style={{ margin: 0 }}>{t("dashboard.projectStats")}
        <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={
                        <Popover id="popover-profileImage">
                            <Popover.Body>{t("tooltips.projvesti")}</Popover.Body>
                        </Popover>
                    }
                >
                    <span
                        className="text-muted ms-2"
                        style={{
                            cursor: "help",
                            fontSize: "0.8em",
                            verticalAlign: "super",
                        }}
                    >
                        <i class="bi bi-question-circle bold-icon"></i>
                    </span>
                    </OverlayTrigger>
        </h5>
        <select
          value={selectedPeriod}
          onChange={handlePeriodChange}
          style={{ marginTop: "10px", padding: "5px", borderRadius: "4px" }}
        >
          <option value="6 Months">{t("dashboard.6months")}</option>
          <option value="1 Year">{t("dashboard.1year")}</option>
          <option value="3 Years">{t("dashboard.3year")}</option>
        </select>
      </div>
      <div style={{ height: "400px", padding: "20px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ProjectChart;
