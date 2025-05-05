import React, { Fragment, useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { Button, Col, Form, InputGroup } from "react-bootstrap";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useRouter } from "next/router";
import Logo from "../../components/Logo";
import AuthenticationRightSection from "../../components/AuthenticationRightSection";
import ResponsiveLogo from "../../components/ResponsiveLogo";
import * as Yup from "yup";
import useService from "@/hooks/useService";

const ForgotPassword = () => {
  const router = useRouter();
  const service = useService();
  const [currentContractor, setCurrentContractor] = useState(null);
  const { handleErrorDialog, handleAutoCloseSuccess, handleSuccessDialog } =
    service;
  const [error, setError] = useState({});
  const [email, setEmail] = useState("");

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required")
  });
  useEffect(() => {
    const contractorValue = localStorage.getItem("currentContractor");
    if (contractorValue) {
      setCurrentContractor(contractorValue);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate({ email }, { abortEarly: false });
      const response = await service.post(`/forgot-password`, {
        email_address: email
      });
      if (response?.success) {
        handleAutoCloseSuccess(response);
        router.push(`/login/${currentContractor}`);
      }
    } catch (validationErrors) {
      const responseErrors = validationErrors?.response?.data?.errors;
      if (validationErrors?.response?.status === 423) {
        handleErrorDialogverify(validationErrors);
      } else if (validationErrors?.response?.status === 422 || 424) {
        handleErrorDialog(responseErrors[0]);
      } else if (responseErrors) {
        handleErrorDialog(responseErrors[0]);
      } else {
        const errors = validationErrors.inner?.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {}) || { general: "A validation error occurred" };
        setError(errors);
        console.error(validationErrors);
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
      const response = await service.post(`/resend-verification`, {
        email_address: email
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  useEffect(() => {
    if (localStorage.getItem("token") || localStorage.getItem("user_data")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleKeyDown = (e) => {
    if (e.key == "Enter") {
      handleSubmit(e);
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
                    <p className="h5 fw-semibold mb-2 mt-5 login-text-color">
                      Forget Password
                    </p>
                    <p className="mb-3 text-muted op-7 fw-normal sub-signin">
                      Enter your email and we will send you a link to reset your
                      password.!!
                    </p>
                    <div className="row gy-3 mt-4">
                      <Col xl={12} className=" mt-0">
                        <Form.Label
                          htmlFor="signin-email"
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
                            id="signin-email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="Enter Email Address"
                            onKeyDown={(e) => handleKeyDown(e)}
                          />
                        </InputGroup>
                        {error.email && (
                          <div className="error-message text-danger">
                            {error.email}
                          </div>
                        )}
                      </Col>
                      <Col xl={12} className="d-grid mt-6">
                        <Button
                          className="btn btn-lg btn-primary btn-style"
                          onClick={handleSubmit}
                        >
                          Submit
                        </Button>
                      </Col>
                    </div>
                    <div className="text-center">
                      <p className="fs-12 text-muted mt-4">
                        Remember Your Password?{" "}
                        <Link
                          href={`/login/${currentContractor}`}
                          className="text-primary"
                        >
                          Click Here
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
      </HelmetProvider>
    </Fragment>
  );
};
ForgotPassword.layout = "AuthenticationLayout";
export default ForgotPassword;
