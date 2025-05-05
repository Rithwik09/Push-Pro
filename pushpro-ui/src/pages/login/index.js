import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useRouter } from "next/router";
import Logo from "../../components/Logo";
import AuthenticationRightSections from "../../components/AuthenticationRightSection";
import ResponsiveLogo from "../../components/ResponsiveLogo";
import * as Yup from "yup";
import useService from "@/hooks/useService";
import { useTranslation } from "react-i18next";
import { assetPrefix } from "../../../next.config";

const Cover = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const router = useRouter();
  const service = useService();
  const [themeData, setThemeData] = useState({});
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [loading, setLoading] = useState(true);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required(t("accountInfoForm.validateEmail")),
    password: Yup.string().required("Password is Required")
  });

  useEffect(() => {
    localStorage.clear();
    localStorage.removeItem("dynamiccolor");
    localStorage.removeItem("ynexMenu");
    localStorage.removeItem("rightSectionImage");
    localStorage.removeItem("mainLogo");
    localStorage.removeItem("mainLogo");
    if (localStorage.getItem("token") || localStorage.getItem("user_data")) {
      router.push("/dashboard");
    }
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
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

  const handleLogin = async (event) => {
    event.preventDefault();
    setError({});
    try {
      await validationSchema.validate(
        { email, password },
        { abortEarly: false }
      );
      const response = await service.post(`login`, {
        email_address: email,
        password: password
      });
      if (
        response.data.account_status == "Inactive" ||
        response.data.is_verified == false
      ) {
        return null;
      } else if (response?.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_data", JSON.stringify(response.data));
        router.push("/dashboard");
      } else {
        setError(response?.data?.errors[0]);
      }
    } catch (validationErrors) {
      if (validationErrors.name === "ValidationError") {
        const errors = {};
        validationErrors.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setError(errors);
      } else if (validationErrors?.response) {
        if (
          validationErrors?.response?.data?.status === 423 ||
          validationErrors?.response?.data?.status === 423
        ) {
          handleErrorDialogverify();
        } else {
          handleErrorDialog(validationErrors);
        }
      } else {
        const validationErrors = {
          message: "An unexpected error occurred. Please try again later."
        };
        handleErrorDialog(validationErrors);
      }
    }
  };

  const handleErrorDialogverify = (error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Your account has not been verified. Please verify it first!",
      showCancelButton: true,
      confirmButtonText: "Resend Verification Link",
      cancelButtonText: "Close",
      preConfirm: async () => {
        Swal.showLoading();
        return resendVerificationLink()
          .then((response) => {
            if (response?.success) {
              Swal.close();
              handleSuccessDialog({ success: true, message: response.message });
            } else {
              throw new Error("Something went wrong. Please try again later.");
            }
          })
          .catch((error) => {
            handleErrorDialog(error.message);
            Swal.close();
          });
      }
    });
  };

  const resendVerificationLink = async () => {
    try {
      const response = await service.post(`resendverify`, {
        email_address: email
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin(e);
    }
  };

  const getCustomStyles = (themeData) => {
    return `
    --primary-rgb:152, 172, 54;
    --body-bg-rgb:152, 172, 54;
    --body-bg-rgb2:152, 172, 54;
  `;
  };
  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <body className="bg-white"></body>
        </Helmet>
        {loading ? (
          <Loader />
        ) : (
          <div className="">
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
                          <p className="h5 fw-semibold mb-2 text-clr-white">
                            Sign In
                          </p>
                          <p className="mb-3 text-clr-white op-7 fw-normal sub-signin">
                            Welcome back!
                          </p>
                          {error.login && (
                            <div className="error-message text-danger">
                              {error.login}
                            </div>
                          )}
                          <div className="row gy-3 mt-4">
                            <Col xl={12} className=" mt-0">
                              <Form.Label
                                htmlFor="signin-email"
                                className="form-label auth-field-color"
                              >
                                Email Address
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.email ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signin-email"
                                  placeholder="Enter Email Address"
                                  autoComplete="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  onKeyDown={(e) => handleKeyPress(e)}
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
                                htmlFor="signin-password"
                                className="form-label d-block auth-field-color"
                              >
                                Password
                                <Link
                                  href={`/forget-password`}
                                  className="float-end text-primary"
                                >
                                  Forget password ?
                                </Link>
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error.password ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type={showPassword ? "text" : "password"}
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signin-password"
                                  placeholder="Enter Password"
                                  autoComplete="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  onKeyDown={(e) => handleKeyPress(e)}
                                />
                                <Button
                                  variant="light"
                                  className="btn"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  <i
                                    className={`${
                                      showPassword
                                        ? "ri-eye-line"
                                        : "ri-eye-off-line"
                                    } align-middle`}
                                    aria-hidden="true"
                                  ></i>
                                </Button>
                              </InputGroup>
                              {error.password && (
                                <div className="error-message text-danger">
                                  {error.password}
                                </div>
                              )}
                              <div className="mt-2">
                                <div className="form-check">
                                  <Form.Check
                                    className="grey-checkbox"
                                    type="checkbox"
                                    value=""
                                    id="defaultCheck1"
                                  />
                                  <Form.Label
                                    className="form-check-label text-muted fw-normal"
                                    htmlFor="defaultCheck1"
                                  >
                                    Remember me
                                  </Form.Label>
                                </div>
                              </div>
                            </Col>
                            <Col xl={12} className="d-grid mt-2">
                              <Button
                                type="submit"
                                onClick={handleLogin}
                                className="btn btn-lg btn-style"
                              >
                                Sign In
                              </Button>
                            </Col>
                          </div>
                          <div className="text-center">
                            <p className="fs-12 text-muted mt-4">
                              Don't have an account ?{" "}
                              <Link
                                href={`/register/`}
                                className="text-primary fw-bold"
                              >
                                Sign Up
                              </Link>
                            </p>
                          </div>
                        </form>
                      </div>
                    </Col>
                  </div>
                </Col>
                <AuthenticationRightSections />
              </div>
            </div>
          </div>
        )}
      </HelmetProvider>
    </Fragment>
  );
};

Cover.layout = "AuthenticationLayout";
export default Cover;
