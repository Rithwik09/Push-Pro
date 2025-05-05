import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { ImCross } from "react-icons/im";
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
  const router = useRouter();
  const id = router.query.id;
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [alert, setAlert] = useState({ variant: "", message: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({ start_time: "", end_time: "" });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const fetchEvents = async () => {
    if (!id) return;
    try {
      const response = await service.get(`contractor-schedules/${id}`);
      if (response?.success) {
        const fetchedEvents = response.data.schedules.map((event) => ({
          ...event,
          start: moment(event.start_time, moment.ISO_8601).toDate(),
          end: moment(event.end_time, moment.ISO_8601).toDate()
        }));
        setEvents(fetchedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const formatDateTime = (date) => {
    return moment(date).format("YYYY-MM-DDTHH:mm:ss");
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
      setDescription(event.description);
      setStart(formatDateTime(moment(event.start)));
      setEnd(formatDateTime(moment(event.end)));
      setStatus(event.status);
    } else {
      setTitle("");
      setDescription("");
      setStart(formatDateTime(moment(start)));
      setEnd(formatDateTime(moment(end)));
      setStatus("Pending");
    }
    setShowModal(true);
  };

  const validateTimes = () => {
    const currentTime = new Date();
    const newErrors = { start_time: "", end_time: "" };
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (startTime <= currentTime) {
      newErrors.start_time =
        "Start time must be greater than the current time.";
    }
    if (endTime <= currentTime) {
      newErrors.end_time = "End time must be greater than the current time.";
    }
    if (startTime >= endTime) {
      newErrors.end_time = "End time must be greater than the start time.";
    }
    if (newErrors.start_time || newErrors.end_time) {
      setErrors(newErrors);
    } else {
      setErrors({ start_time: "", end_time: "" });
    }
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
      start_time: moment(start).toISOString(),
      end_time: moment(end).toISOString(),
      status
    };
    try {
      const response = await service.patch(
        `project-schedule/edit/${currentEvent.id}`,
        updatedEvent
      );
      if (response && typeof response?.data === "object") {
        const updatedEventFromResponse = response.data;
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.id === currentEvent.id ? { ...e, ...updatedEventFromResponse } : e
          )
        );
        setAlert({
          variant: "success",
          message: "Event updated successfully!"
        });
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
      fetchEvents();
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
      start_time: moment(start).toISOString(),
      end_time: moment(end).toISOString(),
      status
    };
    try {
      const response = await service.post(
        `project-schedule/create/${id}`,
        newEvent
      );
      const createdEvent = {
        ...newEvent,
        id: response.data.id,
        start: moment(newEvent.start_time).toDate(),
        end: moment(newEvent.end_time).toDate()
      };
      setEvents([...events, createdEvent]);
      setAlert({ variant: "success", message: "Event added successfully!" });
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
      await service.delete(`project-schedule/delete/${currentEvent.id}`);
      setEvents(events.filter((e) => e.id !== currentEvent.id));
      setAlert({ variant: "success", message: "Event deleted successfully!" });
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
      await service.patch(`project-schedule/status/${currentEvent.id}`, {
        status: "Accepted"
      });
      setEvents(
        events.map((e) =>
          e.id === currentEvent.id ? { ...e, status: "Accepted" } : e
        )
      );
      setAlert({ variant: "success", message: "Event accepted successfully!" });
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
      await service.patch(`project-schedule/status/${currentEvent.id}`, {
        status: "Rejected"
      });
      setEvents(
        events.map((e) =>
          e.id === currentEvent.id ? { ...e, status: "Rejected" } : e
        )
      );
      setAlert({ variant: "success", message: "Event rejected successfully!" });
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
          className="fw-bold fs-6 p-0 p-sm-4"
          style={{ height: "70vh", width: "100%" }}
        >
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
            style={{ height: "90%", margin: "50px" }}
            eventPropGetter={eventStyleGetter}
          />
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
            >
              <Modal.Title className="text-white">
                {currentEvent ? t("previewEstimate.edit") : t("buttons.add")}{" "}
                {t("buttons.event")}
              </Modal.Title>
              <Button variant="transparent" onClick={handleClose}>
                <ImCross style={{ fontSize: "18px", color: "#fff" }} />
              </Button>
            </Modal.Header>
            <Modal.Body className="fw-bold">
              <Form>
                {currentEvent && (
                  <Form.Group className="mt-2 mb-2" controlId="customerName">
                    <Form.Label>{t("customer.customerName")}</Form.Label>
                    <Form.Control
                      type="text"
                      disabled
                      value={currentEvent.customer_name}
                      className="border border-2 fw-bold bg-gray-200 rounded p-2 m-1"
                      plaintext
                      readOnly
                    />
                  </Form.Group>
                )}
                {/* Title Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventTitle">
                  <Form.Label>{t("project.projectTitle")}</Form.Label>
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
                    disabled={status === "Rejected"}
                    onChange={(e) => setTitle(e.target.value)}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.contractor_id ===
                          currentEvent.created_by &&
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
                    disabled={status === "Rejected"}
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
                        currentEvent.contractor_id ===
                          currentEvent.created_by && status !== "Rejected"
                      )
                    }
                  />
                </Form.Group>

                {/* Start Time Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventStart">
                  <Form.Label>{t("project.startTime")}</Form.Label>
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
                    disabled={status !== "Pending"}
                    onChange={(e) => setStart(new Date(e.target.value))}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.contractor_id ===
                          currentEvent.created_by && status === "Pending"
                      )
                    }
                  />
                  {errors.start_time && status === "Pending" ? (
                    <Form.Text className="text-danger">
                      {errors.start_time}
                    </Form.Text>
                  ) : (
                    <></>
                  )}
                </Form.Group>

                {/* End Time Field */}
                <Form.Group className="mt-2 mb-2" controlId="formEventEnd">
                  <Form.Label>{t("project.endTime")}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={moment(end).format("YYYY-MM-DDTHH:mm")}
                    className={`border border-2 fw-bold rounded p-2 m-1 ${
                      status === "Rejected"
                        ? "bg-gray-300"
                        : currentEvent && status === "Pending"
                        ? "border-info"
                        : ""
                    }`}
                    disabled={status !== "Pending"}
                    onChange={(e) => setEnd(new Date(e.target.value))}
                    readOnly={
                      currentEvent &&
                      !(
                        currentEvent.contractor_id ===
                          currentEvent.created_by && status === "Pending"
                      )
                    }
                  />
                  {errors.end_time && status === "Pending" ? (
                    <Form.Text className="text-danger">
                      {errors.end_time}
                    </Form.Text>
                  ) : (
                    <></>
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
              {currentEvent ? (
                <>
                  {currentEvent.contractor_id === currentEvent.created_by ? (
                    <>
                      {status === "Pending" && (
                        <Button variant="danger" onClick={handleDelete}>
                          {t("buttons.delete")} {t("buttons.event")}
                        </Button>
                      )}
                      {(status === "Pending" || status === "Accepted") && (
                        <Button variant="primary" onClick={handleSaveChanges}>
                          {t("buttons.save")} {t("buttons.event")}
                        </Button>
                      )}
                    </>
                  ) : (
                    status === "Pending" && (
                      <>
                        <Button variant="success" onClick={handleAccept}>
                          {t("buttons.accept")}
                        </Button>
                        <Button variant="danger" onClick={handleReject}>
                          {t("buttons.reject")}
                        </Button>
                      </>
                    )
                  )}
                </>
              ) : (
                <Button variant="primary" onClick={handleCreateEvent}>
                  {t("buttons.create")}
                </Button>
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
