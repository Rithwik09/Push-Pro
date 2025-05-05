import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import { localStorageProfile } from "../../shared/layout-components/header/header";

const AccountInformation = (props) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    profile_url: ""
  });
  const [profileImg, setProfileImg] = useState();

  const fetchData = async () => {
    try {
      const response = await service.get("/myprofile");
      if (response?.success) {
        setUser({
          fname: response.data.first_name,
          lname: response.data.last_name,
          email: response.data.email_address,
          phone: response.data.phone_no,
          profile_url: response.data.profile_url
        });
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (props.active) {
      fetchData();
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
    try {
      await profileSchema.validate(user, { abortEarly: false });
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
          "Content-Type": "multipart/form-data"
        }
      });
      if (response?.success) {
        const updatedUserData = {
          fname: response?.data?.first_name,
          lname: response?.data?.last_name,
          email: response?.data?.email_address,
          phone: response?.data?.phone_no,
          profile_url: response.data.profile_url
        };
        setUser(updatedUserData);
        handleSuccessDialog(response);
        let localUserData = localStorage.getItem("user_data");
        let tokenData = response.data.token;
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
      }
    } catch (validationErrors) {
      if (validationErrors.response) {
        setError({ email: validationErrors.response.data.errors });
      } else {
        const errors = {};
        validationErrors.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setError(errors);
        console.error(validationErrors);
      }
    }
  };

  const handleInput = (e) => {
    e.preventDefault();
    setError({});
    const { name, value } = e.target;
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
      setUser((prevUser) => ({ ...prevUser, [name]: formattedNumber }));
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
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
      .email("Invalid email")
      .matches(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        `${t("accountInfoForm.validateEmailFormat")}`
      )
      .required(`${t("accountInfoForm.validateEmail")}`),
    phone: Yup.string()
      .test(
        "len",
        `${t("accountInfoForm.validatePhoneLength")}`,
        (val) => !val || val.length >= 10
      )
      .required(`${t("accountInfoForm.validatePhone")}`)
  });

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUser((prevUser) => ({
        ...prevUser,
        profileImage: file
      }));
      setProfileImg(file);
    }
  };

  return (
    <>
      <Form>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="fname" className="form-label fs-14 ">
              {t("accountInfoForm.firstName")}{" "}
              <span className="text-danger">*</span>
            </label>
            <InputGroup
              className={`${error.fname ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="fname"
                name="fname"
                placeholder={t("accountInfoForm.enterFirstName")}
                value={user.fname}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.fname && (
              <div variant="danger" className="error-message text-danger">
                {error.fname}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="lname" className="form-label fs-14 ">
              {t("accountInfoForm.lastName")}{" "}
              <span className="text-danger">*</span>
            </label>
            <InputGroup
              className={`${error.lname ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="lname"
                name="lname"
                placeholder={t("accountInfoForm.enterLastName")}
                value={user.lname}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.lname && (
              <div variant="danger" className="error-message text-danger">
                {error.lname}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="email" className="form-label fs-14 ">
              {t("accountInfoForm.email")}{" "}
              <span className="text-danger">*</span>
            </label>
            <InputGroup
              className={`${error.email ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="email"
                id="email"
                name="email"
                placeholder={t("accountInfoForm.enterEmail")}
                value={user.email}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.email && (
              <div variant="danger" className="error-message text-danger">
                {error.email}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="phone" className="form-label fs-14">
              {t("accountInfoForm.phoneNo")}{" "}
              <span className="text-danger">*</span>
            </label>
            <InputGroup
              className={`${error.phone ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="phone"
                name="phone"
                placeholder={t("accountInfoForm.enterPhoneNo")}
                value={user.phone}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.phone && (
              <div variant="danger" className="error-message text-danger">
                {error.phone}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="profileImage" className="form-label fs-14">
              {t("accountInfoForm.profileImage")}
            </label>
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
              onClick={handleDetailsSubmit}
            >
              {t("buttons.save")}
            </Button>
            <Button className="btn btn-danger" type="button" onClick={refresh}>
              {t("buttons.cancel")}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default AccountInformation;
