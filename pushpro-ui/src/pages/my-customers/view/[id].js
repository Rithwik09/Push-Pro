import { useRouter } from "next/router";
import useService from "@/hooks/useService";
import { useTranslation } from "react-i18next";
import { getDeviceType } from "../../../utils/device";
import React, { useEffect, useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
import Pageheader from "../../../../shared/layout-components/header/pageheader";

const CustomerDetails = () => {
  const router = useRouter();
  const service = useService();
  const { t } = useTranslation();
  const { id } = router.query;
  const [details, setDetails] = useState();
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState("");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [customerAddress, setCustomerAddress] = useState([]);
  const goBack = () => {
    router.back();
  };

  const fetchData = async (id) => {
    try {
      const response = await service.get(`/view-customer/${id}`, {});
      setDetails(response.data.cus2);
      setCustomerAddress(response.customerAddress);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const type = getDeviceType();
      setDeviceType(type);
    }
  }, []);

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/my-customers`, title: t("myCustomers") },
    {
      url: `${basePath}/my-customers/view/${id}`,
      title: t("project.customerDetails")
    }
  ];

  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        <Card.Header>
          <Card.Title className="mb-5 mb-sm-0">
            {t("project.customerDetails")}
          </Card.Title>
          <div
            className="d-flex flex-column flex-sm-row justify-content-end"
            style={{ flexDirection: isMobile ? "column" : "row" }}
          >
            <div
              className="d-flex justify-content-end"
              style={{ marginTop: isMobile ? "10px" : "0" }}
            >
              <Button
                variant="primary-light"
                className="btn-spacing btn btn-sm mb-2 mb-sm-0 d-flex align-items-center"
                onClick={goBack}
              >
                <i className="bx bx-left-arrow-circle fs-5"></i>
                {t("buttons.back")}
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {details ? (
            <>
              <div className="row g-3 align-items-start border text-muted rounded border-2 mt-1">
                <div className="row p-2 m-0 mb-4 border-0 rounded-0 border-label bg-primary text-start">
                  <Form.Label className="text-light m-0 ms-2 form-label">
                    {t("contractor.details")}
                  </Form.Label>
                </div>
                <div className="col-lg-11 col-11 mx-4 my-2 project-detail-section">
                  <div className="row mb-3">
                    <div className="col-lg-2 col-4 col-sm-4 text-start">
                      <span className="form-label">{t("popUp.name")}</span>
                    </div>
                    <div className="col-lg-9 col-6 col-sm-8 text-start p-0">
                      <span className="form-label">
                        :{" "}
                        <span style={{ marginLeft: "10px" }}>
                          {" "}
                          {`${details?.first_name || "N/A"} ${
                            details?.last_name || ""
                          }`.trim()}{" "}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-lg-2 col-4 col-sm-4 text-start">
                      <span className="form-label">
                        {t("accountInfoForm.email")}
                      </span>
                    </div>
                    <div className="col-lg-9 col-6 col-sm-8 text-start p-0">
                      <span className="form-label">
                        :{" "}
                        <span style={{ marginLeft: "10px" }}>
                          {" "}
                          {details?.email_address || ""}{" "}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-lg-2 col-4 col-sm-4 text-start">
                      <span className="form-label">
                        {t("accountInfoForm.phoneNo")}
                      </span>
                    </div>
                    <div className="col-lg-9 col-6 col-sm-8 text-start p-0">
                      <span className="form-label">
                        :{" "}
                        <span style={{ marginLeft: "10px" }}>
                          {" "}
                          {details?.phone_no || "-"}{" "}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-3 align-items-start border text-muted rounded border-2 mt-4">
                <div className="row p-2 m-0 mb-4 border-0 rounded-0 border-label bg-primary text-start">
                  <Form.Label className="text-light m-0 ms-2 form-label">
                    {t("project.projectAddress")}
                  </Form.Label>
                </div>
                <div className="col-lg-12 col-12 project-detail-section table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>{t("general.srNumber")}</th>
                        <th>{t("project.projectAddress")}</th>
                        <th>{t("serviceAddress.city")}</th>
                        <th>{t("serviceAddress.state")}</th>
                        <th>{t("companyInformationForm.countryProvince")}</th>
                        <th>{t("serviceAddress.zipCode")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerAddress && customerAddress.length > 0 ? (
                        customerAddress.map((address, index) => (
                          <tr key={address.id}>
                            <td>{index + 1}</td>
                            <td>
                              {`${address.address_line_1 || ""} ${
                                address.address_line_2 || ""
                              }`.trim() || "N/A"}
                            </td>
                            <td>{address.city || "N/A"}</td>
                            <td>{address.state || "N/A"}</td>
                            <td>{address.country || "N/A"}</td>
                            <td>{address.zip_code || "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            {t("project.noRecordsFound")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p>{t("general.loading")}</p>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

CustomerDetails.layout = "Contentlayout";
export default CustomerDetails;
