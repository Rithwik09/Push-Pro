import React, {useEffect, useRef, useState} from "react";
import {Button, Form, Row, Col, InputGroup, Spinner, OverlayTrigger, Popover} from "react-bootstrap";
import {useRouter} from "next/router";
import * as Yup from "yup";
import {useTranslation} from "react-i18next";
import useService from "@/hooks/useService";
import {localStorageProfile} from "../../shared/layout-components/header/header";
import QRCode from "qrcode.react";

const AccountInformation = (props) => {
    const {t, i18n} = useTranslation();
    const router = useRouter();
    const service = useService();
    const {handleErrorDialog, handleSuccessDialog} = service;
    const [error, setError] = useState({});
    const [isSaveDisabled, setSaveDisabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        fname: "",
        lname: "",
        email: "",
        phone: "",
        profile_url: "",
    });
    const [profileImg, setProfileImg] = useState();
    const [qrUrls, setQrUrls] = useState({customer: "", contractor: ""});
    const [userUuid, setUserUuid] = useState("");
    const [copyStatus, setCopyStatus] = useState({
        customer: false,
        contractor: false,
    });
    const [downloadStatus, setDownloadStatus] = useState({
        customer: false,
        contractor: false,
    });
    const qrCodeRefs = {
        customer: useRef(null),
        contractor: useRef(null),
    };
    const baseUrls = {
        customer: process.env.NEXT_PUBLIC_SHORT_URL,
        contractor: process.env.NEXT_PUBLIC_SHORT_URL2,
    };

    const fetchData = async () => {
        try {
            const response = await service.get("/myprofile");
            if (response?.success) {
                setUser({
                    fname: response.data.first_name || "",
                    lname: response.data.last_name || "",
                    email: response.data.email_address || "",
                    phone: response.data.phone_no || "",
                    profile_url: response.data.profile_url || "",
                });
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error fetching data:", error);
        }
    };

    const fetchShortUrlData = async () => {
        try {
            const response = await service.get("/short-url");
            if (response?.success) {
                setQrUrls({
                    customer: response?.data?.short_url,
                    contractor: response?.data?.short_url2,
                });
            }
        } catch (error) {
            console.error("Error Fetching Short Url :", error);
        }
    };

    const createShortUrl = async (type) => {
        try {
            const response = await service.post(`/short-url${type === "contractor" ? "2" : ""}`, {
                url: `${baseUrls[type]}${userUuid}`,
            });
            if (response?.success) {
                setQrUrls((prevUrls) => ({
                    ...prevUrls,
                    [type]: response.data[`short_url${type === "contractor" ? "2" : ""}`],
                }));
            }
        } catch (error) {
            handleErrorDialog({message: "Failed to Create Short Url. Try Again."});
        }
    };

    useEffect(() => {
        const UserData = localStorage.getItem("user_data");
        if (UserData) {
            const userData = JSON.parse(UserData);
            setUserUuid(userData.user_uuid);
        }
    }, [props.active]);

    useEffect(() => {
        if (props.active) {
            fetchData();
            fetchShortUrlData();
        } else if (props.active === false) {
            setUser({});
        }
    }, [props.active]);

    useEffect(() => {
        setError({});
    }, [i18n.language]);

    if (loading) {
        return <Spinner variant="primary" animation="border" size="md" />;
    }

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setSaveDisabled(true);
        setError({});
        try {
            await profileSchema.validate(user, {abortEarly: false});
            const formData = new FormData();
            formData.append("first_name", user.fname);
            formData.append("last_name", user.lname);
            formData.append("email_address", user.email);
            formData.append("phone_no", user.phone);
            if (profileImg) {
                formData.append("profile_url", profileImg);
            }
            const response = await service.patch("/myprofile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (response?.success) {
                const updatedUserData = {
                    fname: response.data.first_name,
                    lname: response.data.last_name,
                    email: response.data.email_address,
                    phone: response.data.phone_no,
                    profile_url: response.data.profile_url,
                };
                setUser(updatedUserData);
                updateLocalStorage(updatedUserData, response.data.token);
                handleSuccessDialog(response);
            } else {
                const errorMessage = response?.data?.errors?.[0] || "An unknown error occurred during profile update";
                setError({general: errorMessage});
                handleErrorDialog({message: errorMessage});
            }
        } catch (error) {
            if (error.name === "ValidationError") {
                const errors = {};
                error.inner?.forEach((validationError) => {
                    errors[validationError.path] = validationError.message;
                });
                setError(errors);
            } else if (error.response?.data?.status === 424) {
                const errorMessage = error.response.data?.errors?.[0] || "Precondition failed while updating profile";
                handleErrorDialog({message: errorMessage});
            } else {
                console.error("Unknown Error Occurred:", error);
                handleErrorDialog({
                    message: error.message || "An unexpected error occurred",
                });
            }
        } finally {
            setSaveDisabled(false);
        }
    };

    const handleInput = (e) => {
        e.preventDefault();
        setError({});
        const {name, value} = e.target;
        if (name === "phone") {
            let input = value.replace(/\D/g, "");
            if (!input.startsWith("1")) {
                input = "1" + input;
            }
            let formattedNumber = "+1 (";
            for (let i = 1; i < input.length; i++) {
                const digit = input[i];
                if (i === 4) {
                    formattedNumber += `) ${digit}`;
                } else if (i === 7) {
                    formattedNumber += `-${digit}`;
                } else {
                    formattedNumber += digit;
                }
            }
            if (formattedNumber.length > 17) {
                formattedNumber = formattedNumber.slice(0, 17);
            }
            setUser((prevUser) => ({...prevUser, [name]: formattedNumber}));
        } else {
            setUser((prevUser) => ({...prevUser, [name]: value}));
        }
    };

    const refresh = (e) => {
        e.preventDefault();
        router.push("/dashboard");
    };

    const profileSchema = Yup.object().shape({
        fname: Yup.string().required(`${t("accountInfoForm.validateFName")}`),
        lname: Yup.string().required(`${t("accountInfoForm.validateLname")}`),
        email: Yup.string()
        .email(`${t("accountInfoForm.validateEmailFormat")}`)
        .required(`${t("accountInfoForm.validateEmail")}`),
        phone: Yup.string()
        .test("len", `${t("accountInfoForm.validatePhoneLength")}`, (val) => !val || val.length >= 10)
        .required(`${t("accountInfoForm.validatePhone")}`),
    });

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUser((prevUser) => ({
                ...prevUser,
                profileImage: file,
            }));
            setProfileImg(file);
        }
    };

    const handleQrInput = (e) => {
        handleInput(e);
        setQrUrls((prevUrls) => ({
            ...prevUrls,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCopy = (text, type) => {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
        setCopyStatus((prevStatus) => ({
            ...prevStatus,
            [type]: true,
        }));
        setTimeout(() => {
            setCopyStatus((prevStatus) => ({
                ...prevStatus,
                [type]: false,
            }));
        }, 2000);
    };

    const downloadQRCode = (type) => {
        const canvas = qrCodeRefs[type].current.querySelector("canvas");
        if (canvas) {
            const dataURL = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = `qrcode_${type}.png`;
            link.click();
            setDownloadStatus((prevStatus) => ({
                ...prevStatus,
                [type]: true,
            }));
            setTimeout(() => {
                setDownloadStatus((prevStatus) => ({
                    ...prevStatus,
                    [type]: false,
                }));
            }, 2000);
        }
    };

    const updateLocalStorage = (updatedUserData, tokenData) => {
        let localUserData = localStorage.getItem("user_data");
        if (localUserData) {
            localUserData = JSON.parse(localUserData);
            localUserData.first_name = updatedUserData.fname;
            localUserData.last_name = updatedUserData.lname;
            localUserData.profile_url = updatedUserData.profile_url;
            if (tokenData) {
                localUserData.token = tokenData;
            }
            localStorage.setItem("user_data", JSON.stringify(localUserData));
        }
        if (tokenData) {
            localStorage.setItem("token", tokenData);
        }
        localStorageProfile();
    };

    const handleValidationErrors = (validationErrors) => {
        if (validationErrors.response) {
            setError({email: validationErrors.response.data.errors});
        } else {
            const errors = {};
            validationErrors.inner?.forEach((error) => {
                errors[error.path] = error.message;
            });
            setError(errors);
            handleErrorDialog({message: "Cannot Update Details. Try Again."});
        }
    };

    const renderInputField = (label, name, type, placeholder, errorKey) => {
        const popover = (
            <Popover id={`popover-${name}`}>
                <Popover.Body>{t(`tooltips.${name}`)}</Popover.Body>
            </Popover>
        );
        return (
            <Col xl={12}>
                <div className="d-flex align-items-center">
                    <label htmlFor={name} className="form-label fs-14 mb-1 mt-2 me-2">
                        {label} <span className="text-danger">*</span>
                    </label>
                    <OverlayTrigger trigger={["hover", "focus"]} placement="top" overlay={popover}>
                        <span
                            className="text-muted"
                            style={{
                                cursor: "help",
                                fontSize: "0.8em",
                                verticalAlign: "super",
                            }}
                        >
                            <i class="bi bi-question-circle bold-icon"></i>
                        </span>
                    </OverlayTrigger>
                </div>
                <InputGroup className={`${error[errorKey] ? "border border-danger" : ""}`}>
                    <Form.Control
                        type={type}
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        value={user[name]}
                        className="form-control"
                        onChange={handleInput}
                    />
                </InputGroup>
                {error[errorKey] && (
                    <div variant="danger" className="error-message text-danger">
                        {error[errorKey]}
                    </div>
                )}
            </Col>
        );
    };

    const renderQrCodeSection = (type, label, qrUrl, generateUrl) => (
        <div className="profile-image-placeholder mt-4" ref={qrCodeRefs[type]}>
            <div className="form-label fs-14 mb-2">
                {label} <span className="text-danger">*</span>
            </div>
            {qrUrl ? (
                <>
                    <QRCode value={qrUrl} size={128} />
                    <InputGroup className="mt-2">
                        <Form.Control
                            type="text"
                            id={type}
                            name={type}
                            placeholder={t("accountInfoForm.qr")}
                            value={qrUrl}
                            className="form-control"
                            onChange={handleQrInput}
                        />
                        <i
                            title={copyStatus[type] ? t("general.copied") : t("general.copy")}
                            className="ri-clipboard-fill cursor-pointer icon-color fs-4"
                            onClick={() => handleCopy(qrUrl, type)}
                        ></i>
                        <i
                            title={downloadStatus[type] ? t("general.downloaded") : t("general.download")}
                            className="ri-file-download-fill cursor-pointer icon-color fs-4"
                            onClick={() => downloadQRCode(type)}
                        ></i>
                    </InputGroup>
                </>
            ) : (
                <Button className="btn btn-primary mt-4" type="button" onClick={() => createShortUrl(type)}>
                    {t(`buttons.generate${type.charAt(0).toUpperCase() + type.slice(1)}Qr`)}
                </Button>
            )}
        </div>
    );

    return (
        <Form>
            <Row className="mb-3">
                <Col xl={9}>
                    {renderInputField(
                        t("accountInfoForm.firstName"),
                        "fname",
                        "text",
                        t("accountInfoForm.enterFirstName"),
                        "fname",
                        t
                    )}
                    {renderInputField(
                        t("accountInfoForm.lastName"),
                        "lname",
                        "text",
                        t("accountInfoForm.enterLastName"),
                        "lname",
                        t
                    )}
                    {renderInputField(
                        t("accountInfoForm.email"),
                        "email",
                        "email",
                        t("accountInfoForm.enterEmail"),
                        "email",
                        t
                    )}
                    {renderInputField(
                        t("accountInfoForm.phoneNo"),
                        "phone",
                        "text",
                        t("accountInfoForm.enterPhoneNo"),
                        "phone",
                        t
                    )}
                    <Row className="mb-3">
                        <Col xl={12}>
                            <label htmlFor="profileImage" className="form-label fs-14 mb-1 mt-2">
                                {t("accountInfoForm.profileImage")}{" "}
                            </label>
                            <OverlayTrigger
                                trigger={["hover", "focus"]}
                                placement="top"
                                overlay={
                                    <Popover id="popover-profileImage">
                                        <Popover.Body>{t("tooltips.profileImage")}</Popover.Body>
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
                            <InputGroup>
                                <Form.Control
                                    type="file"
                                    id="profileImage"
                                    name="profileImage"
                                    accept="image/*"
                                    className="form-control"
                                    onChange={handleFileInput}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Button
                                className="btn btn-primary me-2"
                                type="submit"
                                disabled={isSaveDisabled}
                                onClick={handleDetailsSubmit}
                            >
                                {t("buttons.save")}
                            </Button>
                            <Button className="btn btn-danger" type="button" onClick={refresh}>
                                {t("buttons.cancel")}
                            </Button>
                        </Col>
                    </Row>
                </Col>
                <Col xl={3} sm={12} className="d-flex flex-column align-items-end justify-content-start qr-code-column">
                    {renderQrCodeSection("customer", t("accountInfoForm.customerQr"), qrUrls.customer, createShortUrl)}
                    {renderQrCodeSection(
                        "contractor",
                        t("accountInfoForm.contractorQr"),
                        qrUrls.contractor,
                        createShortUrl
                    )}
                </Col>
            </Row>
        </Form>
    );
};

export default AccountInformation;
