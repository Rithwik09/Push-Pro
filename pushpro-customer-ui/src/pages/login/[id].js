import React, { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { Button, Col, Form, InputGroup, Spinner } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useRouter } from "next/router";
import Logo from "../../components/Logo";
import Swal from "sweetalert2";
import AuthenticationRightSection from "../../components/AuthenticationRightSection";
import ResponsiveLogo from "../../components/ResponsiveLogo";
import * as Yup from "yup";
import useService from "../../hooks/useService";
import { assetPrefix } from "../../../next.config";

const Cover = () => {
  const [email, setEmail] = useState("");
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);
  const [themeData, setThemeData] = useState({});
  const router = useRouter();
  const uuid = router.query.id;
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required")
  });

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

  const fetchAndSetTheme = async (contractorID) => {
    try {
      const response = await service.get(
        `get-contractor-branding/${contractorID}`
      );
      if (response?.success) {
        let contractorTheme = response?.data;
        localStorage.setItem("currentContractor", contractorID);
        localStorage.setItem("mainLogo", response.data.main_logo || "");
        localStorage.setItem(
          "mainLogoDark",
          response.data.main_logo_dark || ""
        );
        localStorage.setItem("toggleLogo", response.data.toggle_logo || "");
        localStorage.setItem("toggleLogoDark", response.data.toggle_logo || "");
        if (
          !contractorTheme?.theme_data ||
          Object.keys(contractorTheme?.theme_data).length === 0
        ) {
          localStorage.setItem("ynexMenu", "color");
          localStorage.setItem("ynexHeader", "color");
          localStorage.setItem("primaryRGB", "152,172,54");
          localStorage.setItem("primaryRGB1", "152,172,54");
          localStorage.setItem("dynamiccolor", "152,172,54");
          localStorage.setItem("ynexmenuscrollable", "MenuFixed");
          localStorage.setItem("ynexheaderscrollable", "FixedHeader");
          localStorage.setItem("ynexlayout", "vertical");
        } else {
          Object.keys(contractorTheme?.theme_data).forEach((key) => {
            localStorage.setItem(key, contractorTheme?.theme_data[key]);
          });
        }
        localStorage.removeItem("ynexdarktheme");
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

  const handleLogin = async (event) => {
    event.preventDefault();
    setError({});
    try {
      await validationSchema.validate(
        { email, password },
        { abortEarly: false }
      );
      const response = await service.post(`login/${uuid}`, {
        email_address: email,
        password: password
      });
      if (
        response?.data?.account_status == "Inactive" ||
        response?.data?.is_verified == false
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
      } else if (validationErrors.response) {
        setError({ login: validationErrors.response.data.errors });
        if (validationErrors.response.status === 422) {
          handleErrorDialog(
            "Invalid Email or Password. Enter a Valid Email or Password."
          );
        } else if (validationErrors.response.status === 423) {
          handleErrorDialogverify();
        } else if (validationErrors.response.status === 424) {
          handleErrorDialog(
            "Your account is currently Inactive. Please contact support for assistance."
          );
        } else if (validationErrors.response.status === 401) {
          handleErrorDialog(
            "Cannot Login : Customer Not Associated with Contractor."
          );
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
      text: "Your account has not been verified. Please verify it first!!!",
      showCancelButton: true,
      confirmButtonText: "Resend Verification Link",
      cancelButtonText: "Close",
      preConfirm: async () => {
        Swal.showLoading();
        return resendVerificationLink()
          .then((response) => {
            if (response?.success) {
              Swal.close();
              handleSuccessDialog({
                success: true,
                message: response?.message
              });
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
      const response = await service.post(`/resend-verification`, {
        email_address: email
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const Loader = () => {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 w-100">
        <div className="mb-5 ms-5">
          {themeData?.main_logo ? (
            <img
              className="login-img"
              src={`${s3BasePath}${themeData.main_logo}`}
              width={200}
              alt="Logo image"
            />
          ) : (
            <img
              className="login-img"
              src={`${assetPrefix}/assets/images/brand-logos/dark-logo.png`}
              width={300}
              alt="Login image"
            />
          )}
        </div>
        <div className="d-flex fs-5 gap-3 fw-bold justify-content-center align-items-center">
          <Spinner animation="grow" size="sm" variant="black" />
          <Spinner animation="grow" size="sm" variant="black" />
          <Spinner animation="grow" size="sm" variant="black" />
        </div>
      </div>
    );
  };

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      handleLogin(e);
    }
  };

  const getCustomStyles = (themeData) => {
    const defaultRGB = "152, 172, 54";
    if (
      !themeData?.theme_data ||
      Object.keys(themeData.theme_data).length === 0
    ) {
      return `
      --primary-rgb: ${defaultRGB};
      --body-bg-rgb: ${defaultRGB};
      --body-bg-rgb2: ${defaultRGB};
      --primary-rgb1: ${defaultRGB};
    `;
    } else if (
      !themeData?.theme_data?.primaryRGB &&
      themeData?.theme_data?.primaryRGB === "152, 172, 54"
    ) {
      const primaryRGB = themeData?.theme_data?.primaryRGB;
      const bodyBg1 = themeData?.theme_data?.primaryRGB;
      const bodyBg2 = themeData?.theme_data?.primaryRGB;
      return `
      --primary-rgb: ${primaryRGB};
      --primary-rgb1: ${primaryRGB};
      --body-bg-rgb: ${bodyBg1};
      --body-bg-rgb2: ${bodyBg2};
    `;
    } else if (
      !themeData?.theme_data?.dynamiccolor &&
      themeData?.theme_data?.dynamiccolor === "152, 172, 54"
    ) {
      const primaryRGB = themeData?.theme_data?.dynamiccolor;
      const bodyBg1 = themeData?.theme_data?.dynamiccolor;
      const bodyBg2 = themeData?.theme_data?.dynamiccolor;
      return `
      --primary-rgb: ${primaryRGB};
      --primary-rgb1: ${primaryRGB};
      --body-bg-rgb: ${bodyBg1};
      --body-bg-rgb2: ${bodyBg2};
    `;
    } else {
      const primaryRGB =
        themeData?.theme_data?.primaryRGB ||
        themeData?.theme_data?.dynamiccolor;
      const bodyBg1 =
        themeData?.theme_data?.primaryRGB ||
        themeData?.theme_data?.dynamiccolor;
      const bodyBg2 =
        themeData?.theme_data?.primaryRGB ||
        themeData?.theme_data?.dynamiccolor;
      return `
      --primary-rgb: ${primaryRGB};
      --body-bg-rgb: ${bodyBg1};
      --body-bg-rgb2: ${bodyBg2};
    `;
    }
  };

  return (
    <Fragment>
      <HelmetProvider>
        <Helmet>
          <html
            dir={themeData?.dir}
            data-theme-mode={themeData?.ynexdarktheme}
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
                        <p className="h5 fw-semibold mb-2 text-clr-white">
                          Sign In
                        </p>
                        <p className="mb-3 text-muted op-7 fw-normal">
                          Welcome back!
                        </p>
                        <Form onSubmit={handleLogin}>
                          <div className="row gy-3 mt-4">
                            <Col xl={12} className="mt-0">
                              <Form.Label
                                htmlFor="signin-email"
                                className="form-label auth-field-color"
                              >
                                Email Address
                              </Form.Label>
                              <InputGroup
                                className={`${
                                  error?.email ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type="text"
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signin-email"
                                  placeholder="Enter Email Address"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  autoComplete="email"
                                />
                              </InputGroup>
                              {error?.email && (
                                <div
                                  variant="danger"
                                  className="error-message text-danger"
                                >
                                  {error.email}
                                </div>
                              )}
                            </Col>
                            <Col xl={12} className="mb-3">
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
                                  error?.password ? "border border-danger" : ""
                                }`}
                              >
                                <Form.Control
                                  type={showPassword ? "text" : "password"}
                                  className="form-control-lg dark-input auth-input-color"
                                  id="signin-password"
                                  placeholder="Enter Password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  autoComplete="current-password"
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
                              {error?.password && (
                                <div
                                  variant="danger"
                                  className="error-message text-danger"
                                >
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
                                className="btn btn-lg btn-primary btn-style"
                              >
                                Sign In
                              </Button>
                            </Col>
                          </div>
                        </Form>
                        <div className="text-center">
                          <p className="fs-12 text-muted mt-4">
                            Dont have an account?{" "}
                            <Link
                              href={`/register/${uuid}`}
                              className="text-primary fw-bold"
                            >
                              Sign Up
                            </Link>
                          </p>
                        </div>
                      </div>
                    </Col>
                  </div>
                </Col>
                <AuthenticationRightSection />
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
