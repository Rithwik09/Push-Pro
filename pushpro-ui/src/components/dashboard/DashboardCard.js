import React from "react";
import { useRouter } from "next/router";
import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import statusData from "../../../shared/data/json/status.json";
import { assetPrefix } from "../../../next.config";

const CustomCard = ({ schedules, projects, leftSideChat, subContractors }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";

  const getStatusLabelById = (id) => {
    const status = statusData.find((status) => status.id === id);
    return status ? status.label : id;
  };
  const handleSchedule = (id) => {
    router.push(`/project-schedule/${id}`);
  };

  const handleProjectStatusClick = (id) => {
    router.push(`/myprojects?status=${id}`);
  };

  const handleView = (id) => {
    router.push(`/project-detail/${id}`);
  };

  const handleViewEstimate = (id) => {
    router.push(`/preview-estimation/${id}`);
  };

  const handleViewContractor = (id) => {
    router.push(`/view-subcontractor/${id}`);
  };

  const handleCommunication = (id) => {
    router.push(`/project-communication/${id}`);
  };

  const handleChatClick = async (id) => {
    router.push(`/project-communication/${id}/`);
  };

  const handleCustmerClick = async (id) => {
    router.push(`/my-customers`);
  };

  const handleDownload = async (url) => {
    if (url) {
      window.open(`${s3BasePath}${url}`, "_blank");
    }
  };

  return (
    <>
      {/*  Meetings Section */}
      <div className="col-md-6 mt-4 mt-md-0">
        <Card className="custom-card h-100">
          <Card.Header className="d-flex justify-content-between">
            <Card.Title className="mb-3 mb-lg-0 col-8">
              {t("dashboard.upcomingMeetings")}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            {schedules?.length === 0 ? (
              <div
                className="text-center mt-3"
                style={{
                  height: "296px",
                  maxHeight: "800px",
                  overflowY: "auto"
                }}
              >
                <p>{t("project.noRecordsFound")}</p>
              </div>
            ) : (
              <div className="row">
                <div
                  className="table-responsive rounded p-0"
                  style={{
                    height: "296px",
                    maxHeight: "800px",
                    overflowY: "auto"
                  }}
                >
                  <table className="table table-bordered table-hover border text-muted border-2 rounded">
                    <thead>
                      <tr>
                        <th>{t("customer.customerName")}</th>
                        <th>{t("project.projectTitle")}</th>
                        <th>{t("project.date")}</th>
                        <th>{t("project.timings")}</th>
                        <th>{t("contractor.contractorStatus")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules &&
                        schedules.map((schedule) => (
                          <tr
                            key={schedule.id}
                            onClick={() => handleSchedule(schedule?.project_id)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{schedule.customer_name}</td>
                            <td>{schedule?.title}</td>
                            <td>
                              {new Date(
                                schedule?.start_time
                              ).toLocaleDateString("en-GB")}
                            </td>
                            <td>
                              {new Date(schedule?.start_time).toLocaleString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true
                                }
                              )}{" "}
                              -{" "}
                              {new Date(schedule?.end_time).toLocaleString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true
                                }
                              )}
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
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
      {/* Projects Mini Section */}
      <div className="col-md-6 mt-4">
        <Card className="custom-card">
          <Card.Header>
            <Card.Title>{t("dashboard.projects")}</Card.Title>
          </Card.Header>
          {projects?.length === 0 ? (
            <Card.Body>
              <div
                className="text-center"
                style={{
                  height: "310px",
                  maxHeight: "800px",
                  overflowY: "auto"
                }}
              >
                {t("project.noRecordsFound")}
              </div>
            </Card.Body>
          ) : (
            <Card.Body
              style={{
                height: "350px",
                maxHeight: "800px",
                overflowY: "auto"
              }}
            >
              <table className="table table-bordered fw-bold table-responsive table-hover">
                <thead>
                  <tr>
                    <th className="fw-bold">{t("certificatesForm.title")}</th>
                    <th className="fw-bold">{t("project.tableStatus")}</th>
                    <th className="fw-bold">{t("project.tableAction")}</th>
                  </tr>
                </thead>
                <tbody>
                  {projects?.map((project, index) => (
                    <tr key={index}>
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
                        {/* {project?.status_id > 3 ? (
                          <i
                            title="View Estimate"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleViewEstimate(project.id)}
                          >
                            <i className="bi bi-currency-dollar"></i>
                          </i>
                        ) : null} */}
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
            </Card.Body>
          )}
        </Card>
      </div>
      {/* Contractors Section */}
      <div className="col-md-6 mt-0 mt-md-4">
        <Card className="custom-card">
          <Card.Header className="d-flex justify-content-between">
            <Card.Title className="mb-lg-0 col-8">
              {t("dashboard.subContractors")}
            </Card.Title>
          </Card.Header>
          <Card.Body>
            {subContractors?.length === 0 ? (
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
            ) : (
              <div className="row">
                <div
                  className="rounded p-0"
                  style={{
                    height: "310px",
                    maxHeight: "800px",
                    overflowY: "auto"
                  }}
                >
                  <table className="table table-bordered border text-muted border-2 rounded">
                    <thead>
                      <tr>
                        <th>{t("popUp.name")}</th>
                        <th>{t("accountInfoForm.email")}</th>
                        <th>{t("contractor.companyName")}</th>
                        <th>{t("general.action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subContractors &&
                        subContractors.map((contractor, index) => (
                          <tr key={contractor.id || index}>
                            <td>{contractor?.name}</td>
                            <td>{contractor?.email}</td>
                            <td>{contractor?.companyDetails?.name}</td>
                            <td>
                              <i
                                title="View"
                                className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                                onClick={() =>
                                  handleViewContractor(contractor.id)
                                }
                              >
                                <i className="bi bi-eye"></i>
                              </i>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
      {/* Chats Section */}
      <div className="col-md-6">
        <Card className="custom-card">
          <Card.Header>
            <Card.Title>{t("dashboard.chats")}</Card.Title>
          </Card.Header>
          <Card.Body className="text-center">
            {leftSideChat?.length === 0 ? (
              <div
                className="text-center"
                style={{
                  height: "310px",
                  maxHeight: "800px",
                  overflowY: "auto"
                }}
              >
                <p>{t("project.noRecordsFound")}</p>
              </div>
            ) : (
              <div className="row">
                <div
                  className="table-responsive rounded p-0"
                  style={{
                    height: "310px",
                    maxHeight: "800px",
                    overflowY: "auto"
                  }}
                >
                  <table className="table fw-bold table-responsive table-hover">
                    <thead></thead>
                    <tbody className="text-start fs-7 text-black-50">
                      {leftSideChat &&
                        leftSideChat?.map((chat, index) => (
                          <tr
                            key={chat?.project?.id || index}
                            className="cursor-pointer"
                            onClick={() => handleChatClick(chat?.project?.id)}
                          >
                            <td className="w-100 d-flex flex-row">
                              <div className="col-3 col-sm-2 ps-2 me-2">
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
                              <div className="col-7">
                                <div className="fs-6">
                                  {t("project.projectTitle")} {": "}
                                  {chat?.project?.title || ""}
                                </div>
                                <div className="fs-10">
                                  {chat?.lastCommunication?.message ||
                                    "No Message"}
                                </div>
                              </div>
                              <div className="col-4 col-sm-3 text-end pe-2">
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
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default CustomCard;
