import React, { useEffect, useState } from "react";
import { Button, InputGroup, FormControl, OverlayTrigger, Popover } from "react-bootstrap";
import { useRouter } from "next/router";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";

const ChangePassword = () => {
  const router = useRouter();
  const service = useService();
  const { t, i18n } = useTranslation();
  const [error, setError] = useState({});
  const { handleSuccessDialog } = service;
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showPasswordNote, setShowPasswordNote] = useState(false);  
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [password, setPassword] = useState({
    currentpassword: "",
    newpassword: "",
    confirmpassword: ""
  });

  const passwordSchema = Yup.object().shape({
    currentpassword: Yup.string().required(
      `${t("changePasswordForm.validateCurrentPass")}`
    ),
    newpassword: Yup.string()
      .required(`${t("changePasswordForm.validateNewPassword")}`)
      .notOneOf(
        [Yup.ref("currentpassword")],
        `${t("changePasswordForm.validateSamePasswords")}`
      )
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/,
        `${t("changePasswordForm.validateNewPassComplexity")}`
      )
      .min(8, `${t("changePasswordForm.validateNewPassLength")}`)
      .max(16, `${t("changePasswordForm.validateNewPassLength")}`),
    confirmpassword: Yup.string()
      .required(`${t("changePasswordForm.validateConfirmPassword")}`)
      .oneOf(
        [Yup.ref("newpassword")],
        `${t("changePasswordForm.validatePasswordMatch")}`
      )
  });

  // const handlePassInput = (e) => {
  //   const { name, value } = e.target;
  //   setPassword((prev) => ({ ...prev, [name]: value || "" }));
  // };

  const handlePassInput = (e) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
    if (name === "newpassword" && value.trim()) {
        setShowPasswordNote(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(
            setTimeout(() => {
                setShowPasswordNote(false);
            }, 5000) // 5 sec 
        );
    }
};

  const refresh = () => {
    router.push("/dashboard");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const { currentpassword, newpassword, confirmpassword } = password;
    try {
      await passwordSchema.validate(
        { currentpassword, newpassword, confirmpassword },
        { abortEarly: false }
      );
      setError({});
      setSaveDisabled(true);
      const response = await service.patch("/myprofile/change-password", {
        current_password: currentpassword,
        new_password: newpassword
      });
      if (response?.success) {
        handleSuccessDialog(response);
        setPassword({
          currentpassword: "",
          newpassword: "",
          confirmpassword: ""
        });
      }
      setSaveDisabled(false);
    } catch (validationErrors) {
      setSaveDisabled(false);
      const errors = {};
      if (Array.isArray(validationErrors.inner)) {
        validationErrors.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
      }
      setError(errors);
      Swal.fire({
        title: "Error Changing Password",
        text:
          validationErrors.response.data.errors || "Invalid Current Password",
        icon: "error",
        confirmButtonText: "OK"
      });
      console.error("Error Changing Password : ", validationErrors);
    }
  };

  useEffect(() => {
    setError({});
  }, [i18n.language]);

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
      <>
          <div className="row gy-3">
              <div className="col-xl-7">
                  <label htmlFor="change-password" className="form-label text-default">
                      {t("changePasswordForm.currentPassword")} <span className="text-danger">*</span>
                      <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="top"
                          overlay={
                              <Popover id="popover-profileImage">
                                  <Popover.Body>{t("tooltips.currentPassword")}</Popover.Body>
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
                  </label>
                  <InputGroup className={`${error?.currentpassword ? "border border-danger" : ""}`}>
                      <FormControl
                          type={passwordVisibility?.current ? "text" : "password"}
                          className="form-control-lg"
                          id="change-password"
                          name="currentpassword"
                          value={password?.currentpassword || ""}
                          placeholder={t("changePasswordForm.enterCurrentPassword")}
                          onChange={handlePassInput}
                      />
                      <Button variant="light" type="button" onClick={() => togglePasswordVisibility("current")}>
                          <i
                              className={`${
                                  passwordVisibility?.current ? "ri-eye-line" : "ri-eye-off-line"
                              } align-middle`}
                              aria-hidden="true"
                          ></i>
                      </Button>
                  </InputGroup>
                  {error?.currentpassword && <div className="error-message text-danger">{error?.currentpassword}</div>}
              </div>
              <div className="col-xl-7">
                  <label htmlFor="change-newpassword" className="form-label text-default">
                      {t("changePasswordForm.newPassword")} <span className="text-danger">*</span>
                      <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="top"
                          overlay={
                              <Popover id="popover-profileImage">
                                  <Popover.Body>{t("tooltips.newPassword")}</Popover.Body>
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
                  </label>
                  <InputGroup className={`${error?.newpassword ? "border border-danger" : ""}`}>
                      <FormControl
                          type={passwordVisibility?.new ? "text" : "password"}
                          className="form-control-lg"
                          id="change-newpassword"
                          name="newpassword"
                          value={password?.newpassword || ""}
                          placeholder={t("changePasswordForm.enterNewPassword")}
                          onChange={handlePassInput}
                      />
                      <Button variant="light" type="button" onClick={() => togglePasswordVisibility("new")}>
                          <i
                              className={`${passwordVisibility?.new ? "ri-eye-line" : "ri-eye-off-line"} align-middle`}
                              aria-hidden="true"
                          ></i>
                      </Button>
                  </InputGroup>
                  {error?.newpassword && <div className="error-message text-danger">{error?.newpassword}</div>}
                  {showPasswordNote && (
                <div className="password-note text-info mt-2">
                    {t("changePasswordForm.newPasswordRequirement")}
                </div>
            )}
              </div>
              <div className="col-xl-7 mb-3">
                  <label htmlFor="change-confirmpassword" className="form-label text-default">
                      {t("changePasswordForm.confirmPassword")} <span className="text-danger">*</span>
                      <OverlayTrigger
                          trigger={["hover", "focus"]}
                          placement="top"
                          overlay={
                              <Popover id="popover-profileImage">
                                  <Popover.Body>{t("tooltips.confirmPassword")}</Popover.Body>
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
                  </label>
                  <InputGroup className={`${error?.confirmpassword ? "border border-danger" : ""}`}>
                      <FormControl
                          type={passwordVisibility?.confirm ? "text" : "password"}
                          className="form-control-lg"
                          id="change-confirmpassword"
                          name="confirmpassword"
                          value={password?.confirmpassword || ""}
                          placeholder={t("changePasswordForm.enterConfirmPassword")}
                          onChange={handlePassInput}
                      />
                      <Button variant="light" type="button" onClick={() => togglePasswordVisibility("confirm")}>
                          <i
                              className={`${
                                  passwordVisibility?.confirm ? "ri-eye-line" : "ri-eye-off-line"
                              } align-middle`}
                              aria-hidden="true"
                          ></i>
                      </Button>
                  </InputGroup>
                  {error?.confirmpassword && <div className="error-message text-danger">{error?.confirmpassword}</div>}
              </div>
          </div>
          <Button className="btn btn-primary me-2" type="submit" onClick={handlePasswordChange} disabled={saveDisabled}>
              {t("buttons.save")}
          </Button>
          <Button className="btn btn-danger" type="button" onClick={refresh}>
              {t("buttons.cancel")}
          </Button>
      </>
  );
};

export default ChangePassword;
