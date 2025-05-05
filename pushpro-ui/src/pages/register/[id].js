import Link from "next/link";
import React, { Fragment, useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Logo from "@/components/Logo";
import AuthenticationRightSection from "@/components/AuthenticationRightSection";
import ResponsiveLogo from "@/components/ResponsiveLogo";
import { useRouter } from "next/router";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useService from "@/hooks/useService";
import { assetPrefix } from "../../../next.config";

const Register = () => {
  const router = useRouter();
  const service = useService();
  const [passwordshow1, setpasswordshow1] = useState(false);
  const [passwordshow2, setpasswordshow2] = useState(false);
  const { handleSuccessDialog, handleErrorDialog } = service;
  const [loading, setLoading] = useState(true);
  const [themeData, setThemeData] = useState({});
  const [error, setError] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });

  const uuid = router.query.id;

  const fetchAndSetTheme = async (contractorID) => {
    try {
      const response = await service.get(
        `get-contractor-branding/${contractorID}`
      );
      if (response?.success) {
        let contractorTheme = response.data;
        localStorage.setItem("currentContractor", contractorID);
        localStorage.setItem("mainLogo", response.data.main_logo || "");
        localStorage.setItem(
          "mainLogoDark",
          response.data.main_logo_dark || ""
        );
        localStorage.setItem("toggleLogo", response.data.toggle_logo || "");
        localStorage.setItem("toggleLogoDark", response.data.toggle_logo || "");
        if (contractorTheme?.theme_data) {
          Object.keys(contractorTheme?.theme_data).forEach((key) => {
            localStorage.setItem(key, contractorTheme?.theme_data[key]);
          });
        }
        setThemeData(contractorTheme);
      } else {
        console.error("No data received from API");
      }
    } catch (error) {
      if (error.response?.status === 500) {
        router.push("/404");
      }
    }
  };

  useEffect(() => {
    if (uuid) {
      localStorage.clear();
      fetchAndSetTheme(uuid);
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [uuid]);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/,
        "Password must be between 8 to 16 characters, and contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
    agreeTerms: Yup.boolean()
      .oneOf([true], "Must agree to terms and conditions and privacy policy")
      .required("Must agree to terms and conditions and privacy policy")
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setError({});
    const val = type === "checkbox" ? checked : value;
    setFormData({
      ...formData,
      [name]: val
    });
  };

  const handleConfirm = async (response) => {
    const result = await Swal.fire({
      icon: "question",
      title: " ",
      text: response,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    });
    if (result.isConfirmed) {
      try {
        await service.post(`/register/existing/${uuid}`, {
          email_address: formData.email
        });
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully Registered. Please Login to proceed with the new contractor",
          showConfirmButton: true
        });
        router.push(`/login`);
      } catch (error) {
        console.error("Error adding new contractor:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add new contractor. Please try again."
        });
      }
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      if (!formData.agreeTerms) {
        setError({
          agreeTerms: "Must agree to terms and conditions and privacy policy"
        });
        return;
      }
      const response = await service.post(`/register/${uuid}`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email_address: formData.email,
        password: formData.password
      });
      if (response?.alertCode == "REGISTER_FOR_ANOTHER_CONTRACTOR") {
        handleConfirm(response?.message);
      }
      if (response?.success) {
        handleSuccessDialog(response);
        router.push(`/login`);
      } else {
        setError("Use active email, mobile number and strong password.");
      }
    } catch (validationErrors) {
      if (
        validationErrors?.response?.status === 423 ||
        validationErrors?.response?.status === 424
      ) {
        handleErrorDialog(validationErrors?.response?.data?.message);
      }
      if (validationErrors.path === "agreeTerms") {
        setError({ agreeTerms: validationErrors.message });
      } else if (validationErrors.response) {
        if (
          validationErrors?.response?.status === 422 &&
          validationErrors?.response?.data?.errors[0] !==
            "Strong Password Required"
        ) {
          setError({ email: validationErrors.response.data.errors });
        } else if (
          validationErrors?.response?.status === 422 &&
          validationErrors?.response?.data?.errors[0] ===
            "Strong Password Required"
        ) {
          setError({ password: validationErrors.response.data.errors });
        } else {
          setError({ general: validationErrors.response.data.errors });
        }
      } else {
        const errors = {};
        if (validationErrors.inner) {
          validationErrors.inner.forEach((err) => {
            errors[err.path] = err.message;
          });
        } else {
          errors["general"] = "Validation error occurred";
        }
        setError(errors);
        console.error(validationErrors);
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token") || localStorage.getItem("user_data")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      handleSignup(e);
    }
  };

  const getCustomStyles = (themeData) => {
    const primaryRGB =
      themeData?.theme_data?.primaryRGB === ""
        ? themeData?.theme_data?.dynamiccolor === ""
          ? "152, 172, 54"
          : themeData?.theme_data?.dynamiccolor
        : themeData?.theme_data?.primaryRGB;
    const bodyBg1 =
      themeData?.theme_data?.primaryRGB === ""
        ? themeData?.theme_data?.dynamiccolor === ""
          ? "152, 172, 54"
          : themeData?.theme_data?.dynamiccolor
        : themeData?.theme_data?.primaryRGB;
    const bodyBg2 =
      themeData?.theme_data?.primaryRGB === ""
        ? themeData?.theme_data?.dynamiccolor === ""
          ? "152, 172, 54"
          : themeData?.theme_data?.dynamiccolor
        : themeData?.theme_data?.primaryRGB;
    return `
    --primary-rgb:${primaryRGB};
    --body-bg-rgb:${bodyBg1};
    --body-bg-rgb2:${bodyBg2};
  `;
  };

  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <html
            dir={themeData?.dir}
            data-theme-mode={themeData?.theme_data?.ynexdarktheme}
            data-header-styles={themeData?.theme_data?.ynexHeader}
            data-vertical-style={themeData?.dataVerticalStyle}
            data-nav-layout={themeData?.dataNavLayout}
            data-menu-styles={themeData?.theme_data?.ynexMenu}
            data-toggled={themeData?.toggled}
            data-nav-style={themeData?.dataNavStyle}
            hor-style={themeData?.horStyle}
            data-page-style={themeData?.dataPageStyle}
            data-width={themeData?.dataWidth}
            data-menu-position={themeData?.theme_data?.ynexmenuscrollable}
            data-header-position={themeData?.theme_data?.ynexheaderscrollable}
            data-icon-overlay={themeData?.iconOverlay}
            data-bg-img={themeData?.bgImg}
            data-icon-text={themeData?.iconText}
            data-loader={"enabled"}
            style={getCustomStyles(themeData)}
          ></html>
          <body className="bg-primary"></body>
        </Helmet>
        {loading ? (
          <div className="d-flex justify-content-center bg-white align-items-center vh-100 w-100">
            <div className="w-10 mt-5">
              <img
                src={`${assetPrefix}/assets/images/brand-logos/dark-logo.png`}
                width={250}
                alt=""
                className="authentication-brand desktop-logo m-0"
              />
            </div>
            <div className="loader ms-4 mt-4"></div>
          </div>
        ) : (
          <div className="bg-white">
            <div className="main-parent">
              <div className="grey-sec"></div>
              <ResponsiveLogo className="mb-4" />
              <Row className=" row authentication mx-0">
                <Col xxl={7} xl={7} lg={12}>
                  <Row className="row justify-content-center align-items-center h-100">
                    <Col xxl={7} xl={8} lg={7} md={7} sm={8} className="col-12">
                      <div className="p-5 same-pad">
                        <Logo />
                        <form onSubmit={(e) => e.preventDefault()}>
                          <p className="h5 fw-semibold mb-1 text-clr-white">
                            Sign Up
                          </p>
                          <p className="mb-1 op-7 fw-normal text-clr-white">
                            Welcome and Join us by creating a free account!
                          </p>
                          <div className="row gy-3 mt-4">
                            <Col xl={12} className=" mb-3">
                              <Form.Label
                                htmlFor="signup-firstname"
                                className="form-label auth-field-color"
                              >
                                First Name
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.firstName
                                    ? "border border-danger"
                                    : "border border-primary"
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-firstname"
                                  value={formData.firstName}
                                  name="firstName"
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  placeholder="Enter First Name"
                                  autoComplete="first-name"
                                />
                              </InputGroup>
                              {error.firstName && (
                                <div className="error-message text-danger">
                                  {error.firstName}
                                </div>
                              )}
                            </Col>
                            <Col xl={12} className=" mb-3">
                              <Form.Label
                                htmlFor="signup-lastname"
                                className="form-label auth-field-color"
                              >
                                Last Name
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.lastName
                                    ? "border border-danger"
                                    : "border border-primary"
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-lastname"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  placeholder="Enter Last Name"
                                  autoComplete="family-name"
                                />
                              </InputGroup>
                              {error.lastName && (
                                <div className="error-message text-danger">
                                  {error.lastName}
                                </div>
                              )}
                            </Col>

                            <Col xl={12} className="mb-3">
                              <Form.Label
                                htmlFor="registerEmail"
                                className="form-label auth-field-color"
                              >
                                Email Address
                              </Form.Label>
                              <InputGroup
                                className={` ${
                                  error.email
                                    ? "border border-danger"
                                    : "border border-primary"
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="registerEmail"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  placeholder="Enter Email Address"
                                  autoComplete="email"
                                />
                              </InputGroup>
                              {error.email && (
                                <div className="error-message text-danger">
                                  {error.email}
                                </div>
                              )}
                            </Col>

                            <Col xl={12} className=" mb-3">
                              <Form.Label
                                htmlFor="signup-password"
                                className="form-label d-block auth-field-color"
                              >
                                Password
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.password
                                    ? "border border-danger"
                                    : "border border-primary"
                                }`}
                              >
                                <Form.Control
                                  type={passwordshow1 ? "text" : "password"}
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  placeholder="Enter password"
                                  autoComplete="new-password"
                                />
                                <Button
                                  variant="light"
                                  className="btn"
                                  onClick={() =>
                                    setpasswordshow1(!passwordshow1)
                                  }
                                  type="button"
                                  id="button-addon2"
                                >
                                  <i
                                    className={`${
                                      passwordshow1
                                        ? "ri-eye-line"
                                        : "ri-eye-off-line"
                                    } align-middle`}
                                    aria-hidden="true"
                                  ></i>
                                </Button>
                              </InputGroup>
                              {error.password ? (
                                <div className="error-message text-danger">
                                  {error.password}
                                </div>
                              ) : (
                                <div className="form-text">
                                  Note : Password must be between 8 to 16
                                  characters long, and contain at least 1 a-z, 1
                                  A-Z, 1 number, and 1 special character
                                  character.
                                </div>
                              )}
                            </Col>

                            <Col xl={12} className=" mb-3">
                              <Form.Label
                                htmlFor="signup-confirmpassword"
                                className="form-label d-block auth-field-color"
                              >
                                Confirm Password
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.confirmPassword
                                    ? "border border-danger"
                                    : "border border-primary"
                                }`}
                              >
                                <Form.Control
                                  type={passwordshow2 ? "text" : "password"}
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-confirmpassword"
                                  name="confirmPassword"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  placeholder="Enter Confirm Password"
                                  autoComplete="new-password"
                                />
                                <Button
                                  variant="light"
                                  className="btn"
                                  onClick={() =>
                                    setpasswordshow2(!passwordshow2)
                                  }
                                  type="button"
                                  id="button-addon21"
                                >
                                  <i
                                    className={`${
                                      passwordshow2
                                        ? "ri-eye-line"
                                        : "ri-eye-off-line"
                                    } align-middle`}
                                    aria-hidden="true"
                                  ></i>
                                </Button>
                              </InputGroup>
                              {error.confirmPassword && (
                                <div className="error-message text-danger">
                                  {error.confirmPassword}
                                </div>
                              )}
                              <div className="form-check mt-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value={formData.agreeTerms}
                                  id="defaultCheck1"
                                  name="agreeTerms"
                                  checked={formData.agreeTerms}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                />
                                <label
                                  className="form-check-label text-muted fw-normal"
                                  htmlFor="defaultCheck1"
                                >
                                  By creating an account you agree to our{" "}
                                  <Link
                                    href="/components/pages/terms$conditions/"
                                    className="text-primary"
                                  >
                                    <u>Terms & Conditions</u>
                                  </Link>{" "}
                                  and{" "}
                                  <a className="text-primary">
                                    <u>Privacy Policy</u>
                                  </a>
                                </label>
                                {error.agreeTerms && (
                                  <div className="error-message text-danger">
                                    {error.agreeTerms}
                                  </div>
                                )}
                              </div>
                            </Col>

                            <div className="col-xl-12 d-grid mt-2">
                              <button
                                type="submit"
                                className="btn btn-lg btn-primary btn-style"
                                onClick={handleSignup}
                              >
                                Create Account
                              </button>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="fs-12 text-muted mt-4">
                              Already have an account?{" "}
                              <Link
                                href={`/login`}
                                className="text-primary fw-bold"
                              >
                                Sign In
                              </Link>
                            </p>
                          </div>
                        </form>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <AuthenticationRightSection />
              </Row>
            </div>
          </div>
        )}
      </HelmetProvider>
    </Fragment>
  );
};
Register.layout = "AuthenticationLayout";
export default Register;
