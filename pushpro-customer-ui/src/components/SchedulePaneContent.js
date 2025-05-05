import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row, Tab } from "react-bootstrap";
import * as Yup from "yup";
import useService from "@/hooks/useService";
import moment from "moment";
import { useRouter } from "next/router";

const SchedulePaneContent = ({
  t,
  i18n,
  schedulePreferences,
  toggleSchedulePreferences,
  handleScheduleBackClick,
  handleScheduleNextClick,
  projectID,
  respData
}) => {
  const [errors, setErrors] = useState({});
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const service = useService();
  const { handleSuccessDialog } = service;
  const router = useRouter();
  const newProjectID = router.query.projectID;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }
  };

  const validateSchedule = async () => {
    const schema = Yup.object().shape({
      startDate: Yup.date()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .min(
          new Date(),
          t("scheduleValidations.startDateGreaterThanCurrentDate")
        ),
      endDate: Yup.date()
        .nullable()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .min(
          Yup.ref("startDate"),
          t("scheduleValidations.endDateGreaterThanStartDate")
        )
        .test(
          "is-valid-date",
          t("scheduleValidations.invalidEndDate"),
          (value) => {
            if (value === null) return true; // Allow null values
            return moment(value, "YYYY-MM-DD", true).isValid();
          }
        )
    });

    return schema
      .validate({ startDate, endDate }, { abortEarly: false })
      .then(() => {
        if (!startDate && !endDate) {
          setErrors({
            startEndDate: t("scheduleValidations.startEndDate")
          });
          return false;
        }
        setErrors({});
        setStartDateError("");
        setEndDateError("");
        return true;
      })
      .catch((validationErrors) => {
        const formattedErrors = {};
        validationErrors.inner.forEach((error) => {
          formattedErrors[error.path] = error.message;
          if (error.path === "startDate") {
            setStartDateError(error.message);
            setEndDateError("");
          }
          if (error.path === "endDate") {
            setEndDateError(error.message);
            setStartDateError("");
          }
        });
        setErrors(formattedErrors);
        return false;
      });
  };

  const onScheduleNextClick = async () => {
    let payload;
    if (schedulePreferences === "on") {
      const isValid = await validateSchedule();
      if (!isValid) return;
      payload = {
        date_preference: true,
        start_date: moment(startDate, "YYYY-MM-DD").format("MM/DD/YYYY"),
        end_date: moment(endDate, "YYYY-MM-DD").format("MM/DD/YYYY")
      };
    } else {
      if (startDate) {
        payload = {
          date_preference: true,
          start_date:
            respData?.data?.start_date || startDate
              ? moment(
                  startDate || respData?.data?.start_date,
                  "YYYY-MM-DD"
                ).format("MM/DD/YYYY")
              : "",
          end_date:
            respData?.data?.end_date || endDate
              ? moment(
                  endDate || respData?.data?.end_date,
                  "YYYY-MM-DD"
                ).format("MM/DD/YYYY")
              : ""
        };
      } else {
        payload = {
          date_preference: false,
          start_date: null,
          end_date: null
        };
      }
    }
    await updateProjectDatePreference(payload);
    handleScheduleNextClick();
  };

  const updateProjectDatePreference = async (payload) => {
    try {
      const id = newProjectID || projectID;
      const response = await service.patch(
        `/myprojects/edit/date/${id}`,
        payload
      );
      if (response?.success) {
        handleSuccessDialog(response.data);
      }
    } catch (error) {
      console.error("Failed to update project data preference:", error);
    }
  };

  useEffect(() => {
    if (respData) {
      if (respData?.data?.date_preference == true) {
        const startDateLocale = new Date(
          respData?.data?.start_date
        ).toLocaleDateString("en-CA");
        const endDateLocale = new Date(
          respData?.data?.end_date
        ).toLocaleDateString("en-CA");
        setStartDate(startDateLocale);
        setEndDate(endDateLocale);
        toggleSchedulePreferences();
      }
    }
  }, [respData]);

  useEffect(() => {
    setErrors({});
    setStartDateError("");
    setEndDateError("");
  }, [i18n.language]);

  return (
    <>
      <Tab.Pane
        className="fade text-muted border-zero pb-0"
        id="schedule-pane"
        eventKey={2}
        role="tabpanel"
        aria-labelledby="profile-tab"
        tabIndex="0"
      >
        <Form>
          <Row className="mb-3">
            <Col xl={12} className=" mb-3 d-flex">
              <Form.Label
                htmlFor="schedulePreference"
                className="form-label me-2 "
              >
                {t("schedule.shedulePreferenceSwitchText")}
              </Form.Label>
              <div
                id="schedulePreference"
                className={`toggle ${schedulePreferences}`}
                onClick={toggleSchedulePreferences}
              >
                <span></span>
              </div>
            </Col>
          </Row>
          {schedulePreferences === "on" && (
            <div className="showBtnToggle">
              <Form.Label
                htmlFor="schedulePreference"
                className="form-label me-2 mb-4 "
              >
                {" "}
                <span className="fw-bold"> {t("schedule.note")}:</span>{" "}
                {t("schedule.scheduleNote")}
              </Form.Label>
              {errors.startEndDate && (
                <div
                  variant="danger"
                  className="error-message text-danger mb-3"
                >
                  {errors.startEndDate}
                </div>
              )}
              <Row className="mb-3 align-items-center">
                <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={4}>
                  <label htmlFor="startDate" className="form-label fs-14">
                    {t("project.startDate")}
                  </label>
                </Col>
                <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={8}>
                  <InputGroup>
                    <Form.Control
                      type="date"
                      id="startDate"
                      name="startDate"
                      className="form-control"
                      value={startDate}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                  {startDateError && (
                    <div className="error-message text-danger mt-2">
                      {startDateError}
                    </div>
                  )}
                </Col>
              </Row>
              <Row className="mb-3 align-items-center">
                <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={4}>
                  <label htmlFor="endDate" className="form-label fs-14">
                    {t("project.endDate")}
                  </label>
                </Col>
                <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={8}>
                  <InputGroup>
                    <Form.Control
                      type="date"
                      id="endDate"
                      name="endDate"
                      className="form-control"
                      value={endDate}
                      onChange={handleInputChange}
                    />
                  </InputGroup>
                  {endDateError && (
                    <div className="error-message text-danger mt-2">
                      {endDateError}
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          )}
          <Row className="mb-3 schedule-btns">
            <Col className="d-flex justify-content-end mt-5">
              <Button
                className="btn btn-primary me-2 schedule-back"
                type="button"
                onClick={handleScheduleBackClick}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={onScheduleNextClick}
              >
                {t("buttons.next")}
              </Button>
            </Col>
          </Row>
        </Form>
      </Tab.Pane>
    </>
  );
};

export default SchedulePaneContent;
