import Link from "next/link";
import React from "react";
import { Col, Row } from "react-bootstrap";

const Error = () => {
  return (
    <>
      <div className="page error-bg" id="particles-js">
        <div className="error-page">
          <div className="container">
            <div className="text-center p-5 my-auto">
              <Row className=" align-items-center justify-content-center h-100">
                <Col xl={7}>
                  <p className="error-text mb-sm-0 mb-2">404</p>
                  <p className="fs-18 fw-semibold mb-3">
                    Oops &#128557;,The page you are looking for is not
                    available.
                  </p>
                  <div className="row justify-content-center mb-5">
                    <div className="col-xl-6">
                      <p className="mb-0 op-7">
                        We are sorry for the inconvenience,The page you are
                        trying to access has been removed or never been existed.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="https://www.push-pro.com/"
                    className="btn btn-primary"
                  >
                    <i className="ri-arrow-left-line align-middle me-1 d-inline-block"></i>
                    BACK TO HOME
                  </Link>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
Error.layout = "AuthenticationLayout";
export default Error;
