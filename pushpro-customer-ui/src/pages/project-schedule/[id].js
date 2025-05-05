import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import { Calendar, momentLocalizer } from "react-big-calendar";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Card,
  Modal,
  Button,
  Form,
  Toast,
  ToastContainer
} from "react-bootstrap";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const localizer = momentLocalizer(moment);

const CalendarComponent = () => {
  const service = useService();
  const { handleSuccessDialog, handleErrorDialog } = service;
  const router = useRouter();
  const id = router.query.id;
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [contractor, setContractor] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [alert, setAlert] = useState({ variant: "", message: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const formatDateTime = (date) => {
    return date.toISOString();
  };

  const fetchEvents = async () => {
    if (!id) return;
    try {
      const response = await service.get(`customer-schedules/${id}`);
      if (response?.success) {
        const fetchedEvents = response.data.schedules.map((event) => ({
          ...event,
          start: new Date(event.start_time),
          end: new Date(event.end_time)
        }));
        setEvents(fetchedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvents();
    }
  }, [id]);

  useEffect(() => {
    validateTimes();
  }, [start, end]);

  const handleClose = () => setShowModal(false);

  const handleSelect = ({ start, end }) => {
    setTitle("");
    setDescription("");
    const startOfDay = new Date(start);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    setStart(startOfDay);
    setEnd(endOfDay);
    setStatus("Pending");
    setCurrentEvent(null);
    setShowModal(true);
  };

  const handleShow = (event, start = new Date(), end = new Date()) => {
    setCurrentEvent(event);
    if (event) {
      setTitle(event.title);
      setContractor(event.contractor_name);
      setDescription(event.description);
      setStart(formatDateTime(new Date(event.start)));
      setEnd(formatDateTime(new Date(event.end)));
      setStatus(event.status);
    } else {
      setTitle("");
      setDescription("");
      setStart(formatDateTime(new Date(start)));
      setEnd(formatDateTime(new Date(end)));
      setStatus("Pending");
      setContractor("");
    }
    setShowModal(true);
  };

  const validateTimes = () => {
    const currentTime = new Date();
    const newErrors = { start_time: "", end_time: "" };
    if (start && start <= currentTime) {
      newErrors.start_time =
        "Start time must be greater than the current time.";
    }
    if (end && end <= currentTime) {
      newErrors.end_time = "End time must be greater than the current time.";
    }
    if (start && end && end <= start) {
      newErrors.end_time = "End time must be greater than the start time.";
    }
    setErrors(newErrors);
  };

  const handleSaveChanges = async () => {
    if (errors.start_time || errors.end_time) {
      setAlert({
        variant: "danger",
        message: "Please fix the errors before saving."
      });
      setShow(true);
      return;
    }
    const updatedEvent = {
      title,
      description,
      start_time: new Date(start),
      end_time: new Date(end),
      status
    };
    try {
      const response = await service.patch(
        `project-schedule/edit/${currentEvent.id}`,
        updatedEvent
      );
      if (response && typeof response?.data === "object") {
        const updatedEventFromResponse = response?.data;
        fetchEvents();
        setCurrentEvent(updatedEventFromResponse);
        handleSuccessDialog(response);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      setAlert({
        variant: "danger",
        message: "Failed to save changes. Please try again."
      });
    } finally {
      setShow(true);
      handleClose();
    }
  };

  const handleCreateEvent = async () => {
    if (errors.start_time || errors.end_time) {
      setAlert({
        variant: "danger",
        message: "Enter Valid Inputs"
      });
      setShow(true);
      return;
    }
    const newEvent = {
      title,
      description,
      start_time: new Date(start),
      end_time: new Date(end),
      status
    };
    try {
      const response = await service.post(
        `project-schedule/create/${id}`,
        newEvent
      );
      if (response?.success) {
        const createdEvent = {
          ...newEvent,
          id: response?.data.id,
          start: new Date(newEvent.start_time),
          end: new Date(newEvent.end_time)
        };
        setEvents([...events, createdEvent]);
        fetchEvents();
        handleSuccessDialog(response);
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      setAlert({
        variant: "danger",
        message: "Failed to create event. Please try again."
      });
    } finally {
      setShow(true);
      handleClose();
    }
  };

  const handleDelete = async () => {
    try {
      const response = await service.delete(
        `project-schedule/delete/${currentEvent.id}`
      );
      if (response?.success) {
        setEvents(events.filter((e) => e.id !== currentEvent.id));
        fetchEvents();
        handleSuccessDialog(response);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      setAlert({
        variant: "danger",
        message: "Failed to delete event. Please try again."
      });
    } finally {
      setShow(true);
      handleClose();
    }
  };

  const handleAccept = async () => {
    try {
      const response = await service.patch(
        `project-schedule/status/${currentEvent.id}`,
        {
          status: "Accepted"
        }
      );
      if (response?.success) {
        setEvents(
          events.map((e) =>
            e.id === currentEvent.id ? { ...e, status: "Accepted" } : e
          )
        );
        setAlert({
          variant: "success",
          message: "Event accepted successfully!"
        });
      }
    } catch (error) {
      console.error("Failed to accept event:", error);
      setAlert({
        variant: "danger",
        message: "Failed to accept event. Please try again."
      });
    } finally {
      setShow(true);
      handleClose();
    }
  };

  const handleReject = async () => {
    try {
      const response = await service.patch(
        `project-schedule/status/${currentEvent.id}`,
        {
          status: "Rejected"
        }
      );
      if (response?.success) {
        setEvents(
          events.map((e) =>
            e.id === currentEvent.id ? { ...e, status: "Rejected" } : e
          )
        );
        setAlert({
          variant: "success",
          message: "Event rejected successfully!"
        });
      }
    } catch (error) {
      console.error("Failed to reject event:", error);
      setAlert({
        variant: "danger",
        message: "Failed to reject event. Please try again."
      });
    } finally {
      setShow(true);
      handleClose();
    }
  };

  const goBack = () => {
    router.back();
  };

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprojects`, title: t("breadCrumb.myProjects") },
    {
      url: `${basePath}/project-schedule/${id}`,
      title: t("breadCrumb.projectSchedule")
    }
  ];

  const eventStyleGetter = (event) => {
    let backgroundColor = "blue";
    if (event.status === "Accepted") {
      backgroundColor = "#006600";
    } else if (event.status === "Rejected") {
      backgroundColor = "#990000";
    } else {
      backgroundColor = "#000077";
    }
    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        color: "white"
      }
    };
  };

  return (
    <div>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mb-4 p-4 fs-6">
        <Card.Header className="flex-row position-relative">
          <Card.Title>{t("breadCrumb.projectSchedule")}</Card.Title>
          <div>
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
        <Card.Body
          className="fw-bold fs-6 p-0"
          style={{ height: "70vh", width: "100%" }}
        >
          <div className="d-flex w-100 h-100 justify-content-center align-items-center p-0 p-sm-4 p-md-4 p-lg-4">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelect}
              onSelectEvent={handleShow}
              defaultView="month"
              views={["month", "agenda"]}
              className="react-calendar"
              style={{
                height: "90%",
                width: "98%"
              }}
              eventPropGetter={eventStyleGetter}
            />
          </div>
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header
              style={{
                backgroundColor:
                  status === "Rejected"
                    ? "#990000"
                    : status === "Accepted"
                    ? "#006600"
                    : "#000077"
              }}
              // className={
              //   status === "Rejected"
              //     ? "bg-danger"
              //     : status === "Accepted"
              //     ? "bg-success"
              //     : "bg-primary"
              // }
            >
              <Modal.Title className="text-white">
                {currentEvent
                  ? t("schedule.editEvent")
                  : t("schedule.addEvent")}
              </Modal.Title>
              <Button variant="transparent" onClick={handleClose}>
                <ImCross style={{ fontSize: "18px", color: "#fff" }} />
              </Button>
            </Modal.Header>
            <Modal.Body className="fw-bold">
              <Form>
                {currentEvent && (
                  <Form.Group className="mt-2 mb-2" controlId="customerName">
                    <Form.Label>{t("schedule.contractorName")}</Form.Label>
                    <Form.Control
                      type="text"
                      disabled
                      value={currentEvent.contractor_name}
                      className="border border-2 fw-bold bg-gray-200 rounded p-2 m-1"
                      plaintext
                      readOnly
                    />
                  </Form.Group>
                )}

                {/* Title Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventTitle">
                  <Form.Label>{t("certificatesForm.title")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Title Here"
                    className={`border border-2 fw-bold rounded p-2 m-1 ${
                      status === "Rejected"
                        ? "bg-gray-300"
                        : currentEvent && status !== "Rejected"
                        ? "border-info"
                        : ""
                    }`}
                    value={title}
                    disabled={
                      status === "Rejected" ||
                      (currentEvent &&
                        currentEvent.customer_id !== currentEvent.created_by)
                    }
                    onChange={(e) => setTitle(e.target.value)}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.customer_id === currentEvent.created_by &&
                        (status === "Pending" || status === "Accepted")
                      )
                    }
                  />
                </Form.Group>

                {/* Description Field */}
                <Form.Group
                  className="mt-2 mb-2"
                  controlId="formEventDescription"
                >
                  <Form.Label>{t("itemsForm.description")}</Form.Label>
                  <Form.Control
                    type="text"
                    as="textarea"
                    placeholder="Link, Message, Agenda, etc."
                    value={description}
                    disabled={
                      status === "Rejected" ||
                      (currentEvent &&
                        currentEvent.customer_id !== currentEvent.created_by)
                    }
                    className={`border border-2 fw-bold rounded p-2 m-1 ${
                      status === "Rejected"
                        ? "bg-gray-300"
                        : currentEvent && status !== "Rejected"
                        ? "border-info"
                        : ""
                    }`}
                    onChange={(e) => setDescription(e.target.value)}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.customer_id === currentEvent.created_by &&
                        status !== "Rejected"
                      )
                    }
                    style={{ resize: "both", height: "200px", width: "100%" }}
                  />
                </Form.Group>

                {/* Start Time Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventStart">
                  <Form.Label>{t("schedule.startTime")}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={moment(start).format("YYYY-MM-DDTHH:mm")}
                    className={`border border-2 fw-bold rounded p-2 m-1 ${
                      status === "Rejected"
                        ? "bg-gray-300"
                        : currentEvent && status === "Pending"
                        ? "border-info"
                        : ""
                    }`}
                    disabled={
                      status !== "Pending" ||
                      (currentEvent &&
                        currentEvent.customer_id !== currentEvent.created_by)
                    }
                    onChange={(e) => setStart(new Date(e.target.value))}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.customer_id === currentEvent.created_by &&
                        status === "Pending"
                      )
                    }
                  />
                  {errors.start_time && (
                    <Form.Text className="text-danger">
                      {errors.start_time}
                    </Form.Text>
                  )}
                </Form.Group>

                {/* End Time Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventEnd">
                  <Form.Label>{t("schedule.endTime")}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={moment(end).format("YYYY-MM-DDTHH:mm")}
                    className={`border border-2 fw-bold rounded p-2 m-1 ${
                      status === "Rejected"
                        ? "bg-gray-300"
                        : currentEvent &&
                          status !== "Rejected" &&
                          status === "Pending"
                        ? "border-info"
                        : ""
                    }`}
                    disabled={
                      status !== "Pending" ||
                      (currentEvent &&
                        currentEvent.customer_id !== currentEvent.created_by)
                    }
                    onChange={(e) => setEnd(new Date(e.target.value))}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.customer_id === currentEvent.created_by &&
                        status === "Pending"
                      )
                    }
                  />
                  {errors.end_time && (
                    <Form.Text className="text-danger">
                      {errors.end_time}
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Status Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventStatus">
                  <Form.Label>{t("project.status")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={status}
                    className="border border-2 fw-bold bg-gray-200 text-center text-white rounded p-2 m-1"
                    style={{
                      backgroundColor:
                        status === "Rejected"
                          ? "#990000"
                          : status === "Accepted"
                          ? "#006600"
                          : "#000077"
                    }}
                    plaintext
                    readOnly
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              {currentEvent &&
                (currentEvent.customer_id === currentEvent.created_by &&
                status === "Pending" ? (
                  <Button variant="danger" onClick={handleDelete}>
                    {t("buttons.delete")}
                  </Button>
                ) : null)}
              {currentEvent &&
                (currentEvent.customer_id === currentEvent.created_by &&
                status !== "Rejected" ? (
                  <Button variant="success" onClick={handleSaveChanges}>
                    {t("buttons.save")}
                  </Button>
                ) : null)}
              {status === "Pending" &&
                currentEvent &&
                currentEvent.customer_id !== currentEvent.created_by && (
                  <div className="d-flex justify-content-start gap-2">
                    <Button
                      variant="success"
                      style={{ backgroundColor: "#006600" }}
                      onClick={handleAccept}
                    >
                      {t("viewEstimate.accept")}
                    </Button>
                    <Button
                      variant="danger"
                      style={{ backgroundColor: "#990000" }}
                      onClick={handleReject}
                    >
                      {t("viewEstimate.reject")}
                    </Button>
                  </div>
                )}
              {!currentEvent && (
                <div className="d-flex justify-content-start gap-2">
                  <Button
                    variant="primary"
                    style={{ backgroundColor: "#006600" }}
                    onClick={handleCreateEvent}
                  >
                    {t("buttons.create")}
                  </Button>
                </div>
              )}
            </Modal.Footer>
          </Modal>
          <ToastContainer
            style={{
              position: "fixed",
              top: "20px",
              right: "20px"
            }}
          >
            {alert.message && (
              <Toast
                className={`colored-toast ${
                  alert.variant === "success" ? "bg-success" : "bg-danger"
                } text-white`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                onClose={() => setShow(false)}
                show={show}
                delay={3000}
                autohide
                style={{
                  minWidth: "250px",
                  maxWidth: "100%",
                  whiteSpace: "nowrap"
                }}
              >
                <Toast.Body>{alert.message}</Toast.Body>
              </Toast>
            )}
          </ToastContainer>
        </Card.Body>
      </Card>
    </div>
  );
};

CalendarComponent.layout = "Contentlayout";

export default CalendarComponent;
