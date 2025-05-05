import React, { useState, useEffect, useRef } from "react";
import { assetPrefix } from "../../../next.config";
import {
  Badge,
  Card,
  Col,
  Row,
  Button,
  Form,
  InputGroup
} from "react-bootstrap";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";

const Select = dynamic(() => import("react-select"), { ssr: false });

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [notificationsPerPage, setNotificationsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [notificationTypesData, setNotificationTypesData] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const service = useService();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  useEffect(() => {
    fetchNotifications();
    fetchNotificationTypes();
  }, []);
  useEffect(() => {
    fetchNotifications();
    fetchNotificationTypes();
  }, [currentPage, pageSize]);

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, notificationsPerPage));
    filterNotifications();
  }, [notifications, notificationsPerPage]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await service.post("/notifications", {
        pageNo: currentPage,
        limit: pageSize,
        search: inputValue,
        type_id: selectedTypes.map((type) => type.value)
      });
      if (response?.success) {
        setNotifications(response?.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationTypes = async () => {
    try {
      const response = await service.get("/notification-type");
      if (response?.success) {
        setNotificationTypes(response?.data);
      }
    } catch (error) {
      console.error("Error fetching notification types:", error);
    }
  };

  const handleNotificationClose = async (notifiation_id, project_id) => {
    try {
      const response = await service.patch(
        `/update-notification/${notifiation_id}`,
        {
          project_id,
          is_read: true
        }
      );
      if (response?.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };
  const filterNotifications = () => {
    const filtered = notificationTypes.filter((type) =>
      notifications.find((notification) => notification.type.id == type.id)
    );
    setNotificationTypesData(filtered);
  };
  const statusOptions = notificationTypesData.map((status) => ({
    value: status.id,
    label: status.title
  }));

  const goBack = () => {
    router.back();
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setInputValue(e.target.value);
  };
  const handleSearchBtn = (e) => {
    e.preventDefault();
    fetchNotifications();
  };
  const handleReset = (e) => {
    e.preventDefault();
    setInputValue("");
    setSelectedTypes([]);
    fetchNotifications();
  };
  const notificationsBC = `${t("notificationForm.notificationTitle")}`;
  const homeBC = `${t("notificationForm.homeBC")}`;
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: "", title: t("notificationForm.notificationTitle") }
  ];

  const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInHours = (now - createdDate) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} mins ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays <= 30) {
      return `${diffInDays} days ago`;
    } else {
      return `${diffInMonths} months ago`;
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card">
        <Card.Header className="d-flex justify-content-between">
          <Card.Title className="dark-text">
            {" "}
            {t("notificationForm.notificationTitle")}{" "}
          </Card.Title>
          <div className="prism-toggle">
            <Button
              variant="primary-light"
              className="btn-spacing btn btn-sm d-flex align-items-center"
              onClick={goBack}
            >
              <i
                className="bx bx-left-arrow-circle me-1"
                style={{ fontSize: "20px" }}
              ></i>{" "}
              {t("buttons.back")}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="ms-1 mb-3 align-items-center">
            <div className="header-element header-search border text-muted rounded-3 p-2">
              <Form className="row">
                <Row className="mb-1">
                  <Col xl={3} md={3} sm={6} xs={12} className="mb-xl-1">
                    <label htmlFor="search" className="form-label fs-14 ms-2">
                      {t("notificationForm.searchTitle")}
                    </label>
                    <InputGroup>
                      <Form.Control
                        type="search"
                        className="border text-muted p-2"
                        placeholder={t("notificationForm.searchTitle")}
                        aria-label="search"
                        value={inputValue}
                        autoComplete="off"
                        onChange={(e) => handleSearch(e)}
                      />
                    </InputGroup>
                  </Col>
                  <Col xl={3} md={3} sm={6} xs={12} className="mb-xl-1">
                    <label htmlFor="search" className="form-label fs-14">
                      {t("notificationForm.typeTitle")}
                    </label>
                    <InputGroup className="d-inline-block">
                      <Select
                        placeholder={t("notificationForm.selectType")}
                        isSearchable={true}
                        value={selectedTypes}
                        isMulti
                        name="notificationType"
                        options={statusOptions}
                        onChange={(selectedOptions) =>
                          setSelectedTypes(
                            selectedOptions.map((option) => option)
                          )
                        }
                        className="basic-multi-select"
                        id="choices-multiple-default"
                        menuPlacement="auto"
                        classNamePrefix="Select2"
                      />
                    </InputGroup>
                  </Col>
                  <Col
                    xl={3}
                    md={4}
                    sm={6}
                    xs={12}
                    className="mb-xl-0 align-items-xl-end"
                  >
                    <label htmlFor="search" className="form-label fs-14">
                      &nbsp;
                    </label>
                    <div>
                      <Button
                        className="btn btn-primary me-1 mb-1 "
                        type="submit"
                        onClick={(e) => {
                          handleSearchBtn(e);
                        }}
                      >
                        {t("buttons.search")}
                      </Button>
                      <Button
                        className="btn btn-danger ms-2 me-2 mb-1"
                        type="button"
                        onClick={(e) => {
                          handleReset(e);
                        }}
                      >
                        {t("buttons.reset")}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>

          <Row className="justify-content-center border text-muted rounded-3">
            <Col xxl={8} xl={12} lg={12} md={12} sm={12} className="mt-2">
              <ul className="list-unstyled mb-0 notification-container m-2">
                {visibleNotifications.map((notification) => (
                  <li key={notification.id}>
                    <Card className="custom-card un-read">
                      <Card.Body className="p-3">
                        <a href="#">
                          <div className="d-flex align-items-top mt-0 flex-wrap">
                            <div className="lh-1">
                              <span className="avatar avatar-md me-3 avatar-rounded">
                                <img
                                  alt="avatar"
                                  src={
                                    notification.project.contractor.profile_url
                                      ? `${s3BasePath}${notification.project.contractor.profile_url}`
                                      : `${assetPrefix}/assets/images/imgs/no_image_found.jpg`
                                  }
                                />
                              </span>
                            </div>
                            <div className="flex-fill">
                              <div className="d-flex align-items-center">
                                <div className="mt-sm-0 mt-2">
                                  <p className="mb-0 fs-14 fw-semibold">
                                    {notification.type.title}
                                  </p>
                                  <p className="mb-0 text-muted">
                                    Project Title :{" "}
                                    {notification.project.title.length > 35
                                      ? notification.project.title.substring(
                                          0,
                                          35
                                        ) + "..."
                                      : notification.project.title}
                                  </p>
                                  <p className="mb-0 text-muted">
                                    Customer Name :{" "}
                                    {`${notification.project.customer.first_name} ${notification.project.customer.last_name}`}
                                  </p>
                                  {notification.link && (
                                    <p
                                      className="mb-0 text-muted"
                                      onClick={() =>
                                        handleNotificationClose(
                                          notification.id,
                                          notification.project.id
                                        )
                                      }
                                    >
                                      <a
                                        href={notification.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-info"
                                      >
                                        {" "}
                                        <i className="bi bi-box-arrow-up-right"></i>
                                      </a>
                                    </p>
                                  )}
                                  <span className="mb-0 d-block text-muted fs-12">
                                    {formatTimeAgo(notification.createdAt)}
                                  </span>
                                </div>
                                <div className="ms-auto">
                                  <Badge bg="float-end bg-light text-muted">
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleDateString("en-GB", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "2-digit"
                                    })}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </Card.Body>
                    </Card>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-end align-items-center gap-3 mt-2 flex-wrap">
                <div className="col-auto align-items-center d-flex">
                  <span className="form-label text-nowrap me-2 mb-0">
                    {t("project.pageSize")}{" "}
                  </span>
                  <Form.Select
                    className="form-label border-2 gap-2 mb-0"
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                  >
                    {[5, 10, 15].map((size, index) => (
                      <option key={index} value={size}>
                        {size}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-auto align-items-center">
                  <span className="form-label">{`${
                    (currentPage - 1) * pageSize + 1
                  } to ${Math.min(
                    currentPage * pageSize,
                    notifications.length
                  )} of ${notifications.length}`}</span>
                </div>
                <div className="col-auto align-items-center">
                  <nav aria-label="Page navigation">
                    <ul className="pagination mb-0 d-flex align-items-center">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <a
                          className="page-link border-0"
                          href="#"
                          aria-label="First"
                          onClick={() => paginate(1)}
                        >
                          <span aria-hidden="true">&laquo;</span>
                          <span className="sr-only">First</span>
                        </a>
                      </li>
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <a
                          className="page-link border-0"
                          href="#"
                          aria-label="Previous"
                          onClick={() => paginate(currentPage - 1)}
                        >
                          <span aria-hidden="true">&lsaquo;</span>
                          <span className="sr-only">Previous</span>
                        </a>
                      </li>
                      <li className="disabled">
                        <span className="form-label border-0">{`${t(
                          "project.pageOf"
                        )} ${currentPage} of ${totalPages}`}</span>
                      </li>
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <a
                          className="page-link border-0"
                          href="#"
                          aria-label="Next"
                          onClick={() => paginate(currentPage + 1)}
                        >
                          <span aria-hidden="true">&rsaquo;</span>
                          <span className="sr-only">Next</span>
                        </a>
                      </li>
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <a
                          className="page-link border-0"
                          href="#"
                          aria-label="Last"
                          onClick={() => paginate(totalPages)}
                        >
                          <span aria-hidden="true">&raquo;</span>
                          <span className="sr-only">Last</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              {loading && (
                <div className="d-flex justify-content-center">
                  <button className="btn btn-info-transparent btn-loader my-3">
                    <span className="me-2">{t("general.loading")}</span>
                    <span className="loading">
                      <i className="ri-loader-4-line fs-16"></i>
                    </span>
                  </button>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

Notifications.layout = "Contentlayout";

export default Notifications;
