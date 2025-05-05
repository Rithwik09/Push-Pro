import React, {useState, useEffect} from "react";
import {Form, Col, OverlayTrigger, Popover} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import useService from "@/hooks/useService";

const NotificationsPreferences = (props) => {
    const {t} = useTranslation();
    const service = useService();
    const {handleErrorDialog, handleSuccessDialog} = service;
    const [emailNotification, setEmailNotification] = useState("");
    const [smsNotification, setSmsNotification] = useState("");
    const [error, setError] = useState({});

    const fetchUserProfile = async () => {
        try {
            const response = await service.get("/myprofile/notification-preferences");
            const {notification_email, notification_sms} = response.data;
            setEmailNotification(notification_email ? "on" : "off");
            setSmsNotification(notification_sms ? "on" : "off");
        } catch (error) {
            let errors = {};
            if (Array.isArray(error.inner)) {
                error.inner.forEach((err) => {
                    errors[err.path] = err.message;
                });
            }
            setError(errors);
            console.error("Error Fetching User Profile : ", error);
        }
    };

    useEffect(() => {
        if (props.active) {
            fetchUserProfile();
        }
    }, [props.active]);

    const updateNotificationPreference = async (preference, value) => {
        try {
            const response = await service.patch("/myprofile/notification-preferences", {
                [preference]: value === "on",
            });
            if (response?.success) {
                handleSuccessDialog(response);
            }
        } catch (validationErrors) {
            const errors = {};
            if (Array.isArray(validationErrors.inner)) {
                validationErrors.inner.forEach((error) => {
                    errors[error.path] = error.message;
                });
            }
            setError(errors);
            validationErrors = {
                message: "Error Updating Notification Preference",
            };
            handleErrorDialog(validationErrors);
        }
    };

    const toggleEmailNotification = async () => {
        const newEmailNotification = emailNotification === "on" ? "off" : "on";
        setEmailNotification(newEmailNotification);
        await updateNotificationPreference("notification_email", newEmailNotification);
    };

    const toggleSmsNotification = async () => {
        const newSmsNotification = smsNotification === "on" ? "off" : "on";
        setSmsNotification(newSmsNotification);
        await updateNotificationPreference("notification_sms", newSmsNotification);
    };

    return (
        <>
            <Col xl={12} className="mb-3 d-flex">
                <Form.Label htmlFor="emailNotification" className="form-label me-2 text-nowrap col-md-3 col-lg-3">
                    {t("notificationPreferencesForm.emailNotification")}
                    <OverlayTrigger
                        trigger={["hover", "focus"]}
                        placement="top"
                        overlay={
                            <Popover id="popover-profileImage">
                                <Popover.Body>{t("tooltips.emailNotification")}</Popover.Body>
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
                </Form.Label>
                <div
                    id="emailNotification"
                    className={`toggle col-md-3 col-lg-3 ${emailNotification}`}
                    onClick={toggleEmailNotification}
                >
                    <span></span>
                </div>
            </Col>
            <Col xl={12} className="mb-3 d-flex">
                <Form.Label htmlFor="sms-notification" className="form-label me-2 text-nowrap col-md-3 col-lg-3">
                    {t("notificationPreferencesForm.smsNotification")}
                    <OverlayTrigger
                        trigger={["hover", "focus"]}
                        placement="top"
                        overlay={
                            <Popover id="popover-profileImage">
                                <Popover.Body>{t("tooltips.smsNotification")}</Popover.Body>
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
                </Form.Label>
                <div
                    id="sms-notification"
                    className={`toggle col-md-3 col-lg-3 ${smsNotification}`}
                    onClick={toggleSmsNotification}
                >
                    <span></span>
                </div>
            </Col>
        </>
    );
};

export default NotificationsPreferences;
