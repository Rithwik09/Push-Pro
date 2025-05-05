import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Logo from "../../components/Logo";
import { Helmet, HelmetProvider } from "react-helmet-async";
import AuthenticationRightSections from "../../components/AuthenticationRightSection";
import { useRouter } from "next/router";
import ResponsiveLogo from "../../components/ResponsiveLogo";
import * as Yup from "yup";
import useService from "@/hooks/useService";
import { assetPrefix } from "../../../next.config";

const Cover = () => {
  const [passwordshow1, setpasswordshow1] = useState(false);
  const [passwordshow2, setpasswordshow2] = useState(false);
  const [error, setError] = useState({});
  const service = useService();
  const [isLoading, setIsLoading] = useState(true);
  const { handleErrorDialog, handleSuccessDialog } = service;
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false // Initialize agreeTerms as false
  });

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

  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      const response = await service.post(`/register`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email_address: formData.email,
        password: formData.password,
        phone_no: ""
      });
      if (response?.success) {
        handleSuccessDialog(response);
        router.push("/login");
      }
    } catch (error) {
      if (error.inner) {
        const formErrors = error.inner.reduce((acc, err) => {
          return { ...acc, [err.path]: err.message };
        }, {});
        setError(formErrors);
      } else if (error.response) {
        const serverError = error.response.data.errors;
        const errorMessage = error.response.data.errors[0];
        if (error.response?.data) {
          setError({ email: errorMessage });
        }
        if (serverError.includes("Strong Password Required")) {
          setError({ password: serverError });
        } else {
          setError({ email: serverError });
        }
      } else {
        handleErrorDialog({ message: "Unknown Error Occurred. Try Again" });
      }
    }
  };

  useEffect(() => {
    const clearLocalStorageAndRedirect = async () => {
      setIsLoading(true);
      localStorage.clear();
      localStorage.removeItem("dynamiccolor");
      localStorage.removeItem("ynexMenu");
      localStorage.removeItem("rightSectionImage");
      localStorage.removeItem("mainLogo");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
      if (localStorage.getItem("token") || localStorage.getItem("user_data")) {
        router.push("/dashboard");
      }
    };
    clearLocalStorageAndRedirect();
  }, [router]);

  const Loader = () => (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100">
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
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSignup(e);
    }
  };

  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <body className="bg-white"></body>
        </Helmet>
        {isLoading ? (
          <Loader />
        ) : (
          <div>
            <div className="main-parent">
              <div className="grey-sec"></div>
              <ResponsiveLogo />
              <Row className="row authentication mx-0">
                <Col xxl={7} xl={7} lg={12}>
                  <Row className="row justify-content-center align-items-center h-100">
                    <Col xxl={6} xl={9} lg={7} md={7} sm={8} className="col-12">
                      <div className="p-5 same-pad">
                        <Logo />
                        <form onSubmit={(e) => e.preventDefault()}>
                          <p className="h5 fw-semibold mb-2 text-clr-white">
                            Sign Up
                          </p>
                          <p className="mb-3 text-muted op-7 fw-normal sub-signin">
                            Welcome and Join us by creating a free account !
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
                                  error.firstName ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-firstname"
                                  value={formData.firstName}
                                  name="firstName"
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyPress(e)}
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
                            <Col xl={12} className="mb-3">
                              <Form.Label
                                htmlFor="signup-lastname"
                                className="form-label auth-field-color"
                              >
                                Last Name
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.lastName ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-lastname"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyPress(e)}
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
                                  error.email ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="registerEmail"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyPress(e)}
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
                                  error.password ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type={passwordshow1 ? "text" : "password"}
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-password"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyPress(e)}
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
                                    : ""
                                }`}
                              >
                                <Form.Control
                                  type={passwordshow2 ? "text" : "password"}
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signup-confirmpassword"
                                  name="confirmPassword"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyPress(e)}
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
                            </Col>

                            <Col xl={12} className="mb-3">
                              <div className="form-check">
                                <input
                                  className={`form-check-input ${
                                    error.agreeTerms ? "is-invalid" : ""
                                  }`}
                                  type="checkbox"
                                  id="agreeTerms"
                                  name="agreeTerms"
                                  checked={formData.agreeTerms}
                                  onChange={handleChange}
                                  onKeyDown={(e) => handleKeyPress(e)}
                                />
                                <label
                                  className="form-check-label text-muted fw-normal"
                                  htmlFor="agreeTerms"
                                >
                                  By creating an account you agree to our{" "}
                                  <Link
                                    href="/components/pages/terms$conditions/"
                                    className="text-success"
                                  >
                                    <u>Terms & Conditions</u>
                                  </Link>{" "}
                                  and{" "}
                                  <a className="text-success">
                                    <u>Privacy Policy</u>
                                  </a>
                                </label>
                                {error.agreeTerms && (
                                  <div className="invalid-feedback">
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
                              <Link href="/login" className="text-primary">
                                Sign In
                              </Link>
                            </p>
                          </div>
                        </form>
                      </div>
                    </Col>
                  </Row>
                </Col>
                <AuthenticationRightSections />
              </Row>
            </div>
          </div>
        )}
      </HelmetProvider>
    </Fragment>
  );
};

Cover.layout = "AuthenticationLayout";
export default Cover;
