import React, { Fragment, useState, useEffect } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Link from "next/link";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useRouter } from "next/router";
import Logo from "@/components/Logo";
import AuthenticationRightSection from "@/components/AuthenticationRightSection";
import ResponsiveLogo from "@/components/ResponsiveLogo";
import * as Yup from "yup";
import useService from "@/hooks/useService";

const Cover = () => {
  const router = useRouter();
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [token, setToken] = useState();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const service = useService();
  const { handleAutoCloseSuccess, handleErrorDialog } = service;
  const [errors, setError] = useState({});

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token);
    }
  }, [router.query.token]);
  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required("New Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/,
        "Password must be between 8 to 16 characters, and contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm Password is required")
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      const response = await service.post(`reset-password/${token}`, {
        password: formData.newPassword
      });
      if (response.success) {
        handleAutoCloseSuccess(response);
        router.push(`/login`);
      }
    } catch (validationErrors) {
      if (validationErrors?.response) {
        if (validationErrors?.response?.status === 422 || 423 || 424) {
          handleErrorDialog({
            message: validationErrors?.response?.data?.errors[0]
          });
          setError({
            verificationCodeExp: validationErrors.response.data.errors
          });
          setTimeout(() => {
            router.push(`/login`);
          }, 3000);
        } else {
          console.error(validationErrors);
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

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      handleResetPassword(e);
    }
  };

  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <body className="bg-white"></body>
        </Helmet>
        <div className="main-parent">
          <div className="grey-sec"></div>
          <ResponsiveLogo />
          <div className="row authentication mx-0">
            <Col xxl={7} xl={7} lg={12}>
              <div className="row justify-content-center align-items-center h-100">
                <Col xxl={6} xl={9} lg={7} md={7} sm={8} className="col-12">
                  <div className="p-5">
                    <Logo />
                    <form onSubmit={(e) => e.preventDefault()}>
                      <p className="h5 fw-semibold mb-2 reset-text-color">
                        Reset Password
                      </p>
                      <div className="row gy-3 mt-4">
                        {errors.verificationCodeExp && (
                          <div className="error-message text-danger">
                            {errors.verificationCodeExp}
                          </div>
                        )}
                        <div className="col-xl-12">
                          <label
                            htmlFor="reset-newpassword"
                            className="form-label text-default reset-text-color"
                          >
                            New Password
                          </label>
                          <InputGroup
                            className={` ${
                              errors.newPassword ? "border border-danger" : ""
                            }`}
                          >
                            <Form.Control
                              type={showPassword1 ? "text" : "password"}
                              className="form-control-lg dark-input auth-input-color"
                              id="reset-newpassword"
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              onKeyDown={(e) => handleKeyDown(e)}
                              placeholder="Enter New Password"
                              autoComplete="new-password"
                            />
                            <Button
                              variant="light"
                              className="btn"
                              onClick={togglePasswordVisibility1}
                            >
                              <i
                                className={`ri-eye-${
                                  showPassword1 ? "line" : "off-line"
                                } align-middle`}
                                aria-hidden="true"
                              ></i>
                            </Button>
                          </InputGroup>
                          {errors.newPassword && (
                            <div className="error-message text-danger">
                              {errors.newPassword}
                            </div>
                          )}
                        </div>
                        <div className="col-xl-12 mb-2">
                          <label
                            htmlFor="reset-confirmpassword"
                            className="form-label text-default reset-text-color"
                          >
                            Confirm Password
                          </label>
                          <InputGroup
                            className={`${
                              errors.confirmPassword
                                ? "border border-danger"
                                : ""
                            }`}
                          >
                            <Form.Control
                              type={showPassword2 ? "text" : "password"}
                              className="form-control-lg dark-input auth-input-color"
                              id="reset-confirmpassword"
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
                              onClick={togglePasswordVisibility2}
                            >
                              <i
                                className={`ri-eye-${
                                  showPassword2 ? "line" : "off-line"
                                } align-middle`}
                                aria-hidden="true"
                              ></i>
                            </Button>
                          </InputGroup>
                          {errors.confirmPassword && (
                            <div className="error-message text-danger">
                              {errors.confirmPassword}
                            </div>
                          )}
                        </div>
                        <div className="col-xl-12 d-grid mt-2">
                          <button
                            type="submit"
                            className="btn btn-lg btn-primary btn-style"
                            onClick={handleResetPassword}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="fs-12 text-muted mt-3">
                          Remember your password?{" "}
                          <Link href={`/login`} className="text-primary">
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </form>
                  </div>
                </Col>
              </div>
            </Col>
            <AuthenticationRightSection />
          </div>
        </div>
      </HelmetProvider>
    </Fragment>
  );
};

Cover.layout = "AuthenticationLayout";
export default Cover;
