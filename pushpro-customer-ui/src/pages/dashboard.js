import React, { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import statusData from "../../shared/data/json/status.json";
import { AiFillProject } from "react-icons/ai";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { HiCurrencyDollar } from "react-icons/hi";
import { assetPrefix } from "../../next.config";
import DoughnutChart from "@/components/dashboard/PieChart";

const Users = () => {
  const { t } = useTranslation();
  const [projectStatuses, setProjectStatuses] = useState();
  const [projects, setProjects] = useState();
  const [total, setTotal] = useState(null);
  const [quotations, setQuotations] = useState(0);
  const [schedules, setSchedules] = useState([]);
  const [leftSideChat, setLeftSideChat] = useState();
  const service = useService();
  const router = useRouter();
  const [contId, setContId] = useState();
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";

  useEffect(() => {
    const id = localStorage.getItem("currentContractor");
    setContId(id);
  }, []);

  const fetchProjects = async (id) => {
    try {
      const response = await service.post("/myprojects", {
        pageNo: 1,
        limit: 15,
        search: "",
        condition: {},
        services: [],
        contractorId: id
      });
      if (response?.success) {
        setProjects(response?.data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchProjectStatuses = async (id) => {
    try {
      const response = await service.get(`project-statuses/${id}`);
      if (response?.success) {
        const fetchedProjects = response?.data?.projects || [];
        const mergedProjects = mergeProjectStatuses(fetchedProjects);
        setProjectStatuses(mergedProjects);
        const quotationsCount =
          response.data.total -
          mergedProjects
            .filter((project) => project.status_id < 3) // Filter for status_id > 2
            .reduce((acc, project) => acc + project.count, 0); // Sum the counts
        setTotal(response?.data?.total || 0);
        setQuotations(quotationsCount);
      }
    } catch (error) {
      console.error("Error fetching project statuses:", error);
    }
  };

  const mergeProjectStatuses = (fetchedProjects) => {
    const projectStatusMap = fetchedProjects.reduce((acc, project) => {
      acc[project.status_id] = project.count;
      return acc;
    }, {});

    return statusData.map((status) => ({
      status_id: status.id,
      count: projectStatusMap[status.id] || 0,
      label: status.label
    }));
  };

  const getStatusLabelById = (id) => {
    const status = statusData.find((status) => status.id === id);
    return status ? status.label : id;
  };

  const fetchSchedule = async (id) => {
    try {
      const response = await service.get(`my-schedules/${id}`);
      if (response?.success) {
        const allSchedules = response.data.schedules;
        const sortedSchedules = allSchedules.sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time)
        );
        setSchedules(sortedSchedules);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const leftSideChatData = async (id) => {
    try {
      const response = await service.post(
        `/my-projects/last-chat-with-project`,
        {
          contractorId: id
        }
      );
      if (response?.success) {
        setLeftSideChat(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Left Side Chat Data : ", error);
    }
  };

  useEffect(() => {
    if (contId) {
      fetchProjectStatuses(contId);
      fetchProjects(contId);
      fetchSchedule(contId);
      leftSideChatData(contId);
    }
  }, [contId]);

  const handleSchedule = (id) => {
    router.push(`/project-schedule/${id}`);
  };

  const handleChatClick = async (id) => {
    router.push(`/project-communication/${id}/`);
  };

  const handleView = (id) => {
    router.push(`/project-detail/${id}`);
  };
  const handleViewEstimate = (id) => {
    router.push(`/view-estimate/${id}`);
  };
  const handleCommunication = (id) => {
    router.push(`/project-communication/${id}`);
  };

  const createProject = () => {
    router.push("../myprojects/create/");
  };

  return (
    <div className="p-2">
      <Card className="custom-card mt-4">
        <Card.Header className="justify-content-between">
          <Card.Title>{t("dashboard.title")}</Card.Title>
          <Button
            variant="primary"
            size="sm"
            className="fw-bold"
            onClick={() => createProject()}
          >
            {t("buttons.startNewProject")}
          </Button>
        </Card.Header>
        <Card.Body>
          {/* {t("dashboard.welcomeHome")} */}
          <div className="d-flex w-100 flex-column flex-md-row gap-4 ">
            <div className="d-flex w-100 flex-row gap-4">
              <Card
                className="custom-card w-100 flex-column justify-content-center btn btn-primary text-white text-center align-items-center"
                onClick={() => router.push("/myprojects")}
              >
                <div className="d-flex justify-content-start text-white mb-1 align-itesms-center mt-2">
                  <AiFillProject
                    className="me-1"
                    style={{ fontSize: "25px" }}
                  />
                  <div className="text-white fs-6">
                    {t("dashboard.projects")}
                  </div>
                </div>
                <div className="text-white fs-5">{total || 0}</div>
              </Card>
              <Card className="custom-card w-100 flex-column justify-content-center bg-primary text-white text-center align-items-center">
                <div className="d-flex justify-content-start text-white mb-1 align-itesms-center mt-2">
                  <FaFileInvoiceDollar
                    className="me-1"
                    style={{ fontSize: "23px" }}
                  />
                  <div className="text-white fs-6">
                    {t("dashboard.estimates")}
                  </div>
                </div>
                <div className="text-white fs-5">{quotations || 0}</div>
              </Card>
            </div>
            <div className="d-flex w-100 flex-row gap-4">
              <Card className="custom-card w-100 flex-column justify-content-center bg-primary text-white text-center align-items-center">
                <div className="d-flex text-white mb-1 text-start mt-2">
                  <HiCurrencyDollar
                    className="me-1"
                    style={{ fontSize: "25px" }}
                  />
                  <div className="text-white fs-6">
                    {t("dashboard.estimationTotal")}
                  </div>
                </div>
                <div className="text-white fs-6">
                  0{/* Sum of all the Total Values of the Estimates Received */}
                </div>
              </Card>
              <Card className="custom-card w-100 flex-column justify-content-center bg-primary text-white text-center align-items-center">
                <div className="d-flex text-white text-start mb-1 mt-2">
                  <HiCurrencyDollar
                    className="me-1"
                    style={{ fontSize: "25px" }}
                  />
                  <div className="text-white fs-6">
                    {t("dashboard.paidToContractor")}
                  </div>
                </div>
                <div className="text-white fs-6">
                  0{/* Total Amount Paid Before Project Completion */}
                </div>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>
      <div className="d-flex flex-column flex-md-row justify-content-start gap-1 gap-sm-4">
        {/* Project Statuses Section Donut Chart */}
        <Card className="custom-card fw-bold p-4 w-100 w-lg-50">
          <Card.Header>
            <Card.Title>{t("dashboard.projectStatus")}</Card.Title>
          </Card.Header>
          <Card.Body className="text-center">
            {total !== 0 ? (
              <div>
                <DoughnutChart projectstatus={projectStatuses} />
              </div>
            ) : (
              <div
                className="text-center mt-3"
                style={{
                  height: "310px",
                  maxHeight: "800px",
                  overflowY: "auto"
                }}
              >
                <p>{t("project.noRecordsFound")}</p>
              </div>
            )}
          </Card.Body>
        </Card>
        {/* Upcoming Meetings Table */}
        <Card className="custom-card fw-bold p-4 w-100 w-lg-50">
          <Card.Header>
            <Card.Title>{t("dashboard.meetings")}</Card.Title>
          </Card.Header>
          <Card.Body
            className="text-center"
            style={{
              height: "310px",
              maxHeight: "800px",
              overflowY: "auto"
            }}
          >
            {schedules.length > 0 ? (
              <table className="table table-bordered fw-bold table-responsive table-hover">
                <thead>
                  <tr>
                    <th className="fw-bold">Sr.</th>
                    <th className="fw-bold">{t("general.contractor")}</th>
                    <th className="fw-bold">{t("certificatesForm.title")}</th>
                    <th className="fw-bold">{t("general.date")}</th>
                    <th className="fw-bold">{t("general.timings")}</th>
                    <th className="fw-bold">{t("project.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => (
                    <tr
                      key={schedule.id || index}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSchedule(schedule.project_id)}
                    >
                      <td>{index + 1}</td>
                      <td style={{ cursor: "pointer" }}>
                        {schedule.customer_name || ""}
                      </td>
                      <td>{schedule.title || ""}</td>
                      <td>
                        {new Date(schedule.start_time).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td>
                        {new Date(schedule.start_time).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true
                        })}{" "}
                        -
                        {new Date(schedule.end_time).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true
                        })}
                      </td>
                      <td
                        className={
                          schedule?.status === "Accepted"
                            ? "text-success"
                            : schedule?.status === "Pending"
                            ? "text-warning"
                            : "text-danger"
                        }
                      >
                        {schedule?.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center mt-3">
                <p>{t("project.noRecordsFound")}</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
      <div className="d-flex flex-column flex-md-row justify-content-start gap-1 gap-sm-4">
        {/* Projects Mini Version Card */}
        <Card className="custom-card fw-bold p-4 w-100 w-lg-50">
          <Card.Header>
            <Card.Title>{t("dashboard.projects")}</Card.Title>
          </Card.Header>
          <Card.Body
            className="text-center"
            style={{ height: "310px", maxHeight: "800px", overflow: "auto" }}
          >
            {total === 0 ? (
              <div className="text-center mt-3">
                <p>{t("project.noRecordsFound")}</p>
              </div>
            ) : (
              <table className="table table-bordered fw-bold table-responsive table-hover">
                <tbody>
                  <tr>
                    <th className="fw-bold">{t("certificatesForm.title")}</th>
                    <th className="fw-bold">{t("project.tableStatus")}</th>
                    <th className="fw-bold">{t("project.tableAction")}</th>
                  </tr>
                  {projects?.map((project, index) => (
                    <tr key={index - 1}>
                      <td className="fw-bold">{project.title}</td>
                      <td>
                        <span
                          className={`badge status-btn status-${getStatusLabelById(
                            project.status_id
                          )
                            .replace(/\s+/g, "-")
                            .toLowerCase()}`}
                        >
                          {getStatusLabelById(project.status_id)}
                        </span>
                      </td>
                      <td className="d-flex flex-row">
                        <i
                          title="View"
                          className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                          onClick={() => handleView(project.id)}
                        >
                          <i className="bi bi-eye"></i>
                        </i>
                        {project?.status_id > 3 ? (
                          <i
                            title="View Estimate"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleViewEstimate(project.id)}
                          >
                            <i className="bi bi-currency-dollar"></i>
                          </i>
                        ) : (
                          ""
                        )}
                        <i
                          title="Chat"
                          className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                          onClick={() => handleCommunication(project.id)}
                        >
                          <i className="bi bi-chat-quote"></i>
                        </i>
                        <i
                          title="Calendar"
                          className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                          onClick={() => handleSchedule(project.id)}
                        >
                          <i className="bi bi-calendar3"></i>
                        </i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card.Body>
        </Card>
        {/* Chats Card */}
        <Card className="custom-card fw-bold p-4 w-100 w-lg-50">
          <Card.Header>
            <Card.Title>{t("dashboard.chats")}</Card.Title>
          </Card.Header>
          <Card.Body
            className="text-center"
            style={{ height: "310px", maxHeight: "800px", overflow: "auto" }}
          >
            {leftSideChat?.length === 0 ? (
              <div className="text-center mt-3">
                <p>{t("project.noRecordsFound")}</p>
              </div>
            ) : (
              <table className="table fw-bold table-responsive table-hover">
                <tbody className="text-start fs-7 text-black-50">
                  {leftSideChat &&
                    leftSideChat?.map((chat, index) => (
                      <tr
                        key={chat?.project?.id || index}
                        className="cursor-pointer"
                        onClick={() => handleChatClick(chat?.project?.id)}
                      >
                        <td className="w-100 d-flex flex-row">
                          <div className="col-3 col-md-3 col-lg-2 m-2">
                            <img
                              src={
                                chat?.lastCommunication?.sender?.profile_url
                                  ? `${s3BasePath}${chat?.lastCommunication?.sender?.profile_url}`
                                  : `${assetPrefix}/assets/images/faces/1.jpg`
                              }
                              className="rounded-circle"
                              style={{ width: "50px" }}
                            />
                          </div>
                          <div className="col-8 col-md-6 m-2">
                            <div className="fs-6">
                              {t("project.projectTitle")} {": "}
                              {chat?.project?.title || ""}
                            </div>
                            <div className="fs-10">
                              {chat?.lastCommunication?.message || "No Message"}
                            </div>
                          </div>
                          <div className="col-3 text-end m-2">
                            <div className="fs-10">
                              {chat?.lastCommunication?.updatedAt
                                ? new Date(
                                    chat?.lastCommunication?.updatedAt
                                  ).toLocaleDateString("en-GB")
                                : ""}
                            </div>
                            <div className="fs-10">
                              {chat?.lastCommunication?.updatedAt
                                ? new Date(
                                    chat?.lastCommunication?.updatedAt
                                  ).toLocaleString("en-US", {
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true
                                  })
                                : ""}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};
Users.layout = "Contentlayout";

export default Users;
