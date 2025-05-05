import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup, FormControl } from "react-bootstrap";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";

const ChangePassword = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [error, setError] = useState({});
  const [passwordshow1, setpasswordshow1] = useState(false);
  const [passwordshow2, setpasswordshow2] = useState(false);
  const [passwordshow3, setpasswordshow3] = useState(false);
  const [password, setPass] = useState({
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
        `${t("changePasswordForm.validateNewPassLength")}`
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

  const handlePassInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPass({ ...password, [name]: value });
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
      const response = await service.patch("/myprofile/change-password", {
        current_password: currentpassword,
        new_password: newpassword
      });
      if (response?.success) {
        handleSuccessDialog(response);
        setPass({
          currentpassword: "",
          newpassword: "",
          confirmpassword: ""
        });
      }
    } catch (validationErrors) {
      const errors = {};
      if (Array.isArray(validationErrors.inner)) {
        validationErrors.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setError(errors);
      } else {
        console.error("Unexpected Error structure:", validationErrors);
        setError(errors);
        handleErrorDialog(validationErrors);
      }
      setError(errors);
    }
  };

  useEffect(() => {
    setError({});
  }, [i18n.language]);

  return (
    <>
      <div className="row gy-3">
        <div className="col-xl-7">
          <label htmlFor="change-password" className="form-label text-default ">
            {t("changePasswordForm.currentPassword")}{" "}
            <span className="text-danger">*</span>
          </label>
          <InputGroup
            className={`${error.currentpassword ? "border border-danger" : ""}`}
          >
            <FormControl
              type={passwordshow1 ? "text" : "password"}
              className="form-control-lg"
              id="change-password"
              name="currentpassword"
              value={password.currentpassword || ""}
              placeholder={t("changePasswordForm.enterCurrentPassword")}
              onChange={handlePassInput}
            />
            <Button
              variant="light"
              className="btn "
              type="button"
              onClick={() => setpasswordshow1(!passwordshow1)}
            >
              <i
                className={`${
                  passwordshow1 ? "ri-eye-line" : "ri-eye-off-line"
                } align-middle`}
                aria-hidden="true"
              ></i>
            </Button>
          </InputGroup>
          {error.currentpassword && (
            <div variant="danger" className="error-message text-danger">
              {error.currentpassword}
            </div>
          )}
        </div>
        <div className="col-xl-7">
          <label
            htmlFor="change-newpassword"
            className="form-label text-default "
          >
            {t("changePasswordForm.newPassword")}{" "}
            <span className="text-danger">*</span>
          </label>
          <InputGroup
            className={`${error.newpassword ? "border border-danger" : ""}`}
          >
            <Form.Control
              type={passwordshow2 ? "text" : "password"}
              className="form-control-lg"
              id="change-newpassword"
              name="newpassword"
              value={password.newpassword || ""}
              placeholder={t("changePasswordForm.enterNewPassword")}
              onChange={handlePassInput}
            />
            <Button
              variant="light"
              className="btn"
              onClick={() => setpasswordshow2(!passwordshow2)}
            >
              <i
                className={`${
                  passwordshow2 ? "ri-eye-line" : "ri-eye-off-line"
                } align-middle`}
                aria-hidden="true"
              ></i>
            </Button>
          </InputGroup>
          {error.newpassword && (
            <div variant="danger" className="error-message text-danger">
              {error.newpassword}
            </div>
          )}
        </div>
        <div className="col-xl-7 mb-3">
          <label
            htmlFor="change-confirmpassword"
            className="form-label text-default"
          >
            {t("changePasswordForm.confirmPassword")}{" "}
            <span className="text-danger">*</span>
          </label>
          <InputGroup
            className={`${error.confirmpassword ? "border border-danger" : ""}`}
          >
            <Form.Control
              type={passwordshow3 ? "text" : "password"}
              className="form-control-lg"
              id="change-confirmpassword"
              name="confirmpassword"
              value={password.confirmpassword || ""}
              placeholder={t("changePasswordForm.enterConfirmPassword")}
              onChange={handlePassInput}
            />
            <Button
              variant="light"
              className="btn"
              onClick={() => setpasswordshow3(!passwordshow3)}
            >
              <i
                className={`${
                  passwordshow3 ? "ri-eye-line" : "ri-eye-off-line"
                } align-middle`}
                aria-hidden="true"
              ></i>
            </Button>
          </InputGroup>
          {error.confirmpassword && (
            <div variant="danger" className="error-message text-danger">
              {error.confirmpassword}
            </div>
          )}
        </div>
      </div>
      <Button
        className="btn btn-primary me-2"
        type="submit"
        onClick={handlePasswordChange}
      >
        {t("buttons.save")}
      </Button>
      <Button className="btn btn-danger" type="button" onClick={refresh}>
        {t("buttons.cancel")}
      </Button>
    </>
  );
};

export default ChangePassword;
