import React, { useEffect, useState } from "react";
import { Card, Button, Form, Table } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import { getDeviceType } from "../utils/device";
import { assetPrefix } from "../../next.config";

const SubContractorDetails = ({ id }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [details, setDetails] = useState([]);
  const service = useService();
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState("");
  const [licenseFiles, setLicenseFiles] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [industry, setIndustry] = useState([]);
  const [statesOptions, setStatesOptions] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";

  const goBack = () => {
    router.back();
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  const handleFileView = (url) => {
    const blobUrl = url;
    window.open(blobUrl, "_blank");
  };

  const fetchData = async (projectId) => {
    try {
      const response = await service.get(`/view-subcontractor/${projectId}`);
      if (response?.success) {
        fetchServices();
        fetchStates();
        setDetails(response?.data || {});
        setLicenseFiles(response?.data.licenses || []);
        setInsuranceFiles(response?.data.insurances || []);
        setCertificates(response?.data.certificates || []);
      } else if (response?.response?.data?.status > 400) {
        goToDashboard();
      } else {
        console.error("Error fetching sub-contractors:", response);
      }
    } catch (error) {
      console.error("Error fetching sub-contractors:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await service.get("/states");
      const state = response.data.map((states) => ({
        label: states.name,
        value: states.state_code,
        id: states.id
      }));
      setStatesOptions(state);
    } catch (error) {
      console.error("Error Fetching States : ", error);
    }
  };

  const fetchServices = async () => {
    try {
      const industriesResponse = await service.get("/services");
      const formattedIndustries = industriesResponse.data.map((industry) => ({
        label: industry.name,
        value: industry.name,
        id: industry.id
      }));
      setIndustry(formattedIndustries);
      setSelectedIndustries([]);
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  };

  const getServiceNameById = (id) => {
    const service = industry.find((industry) => industry.id === id);
    return service ? service.label : id;
  };

  const getStateNamesById = (ids) => {
    if (!Array.isArray(ids)) {
      ids = JSON.parse(ids);
    }
    return ids
      .map((id) => {
        const state = statesOptions.find((state) => state.id === id);
        return state ? state.label : id;
      })
      .join(", ");
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 450);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Card.Header className="">
        <Card.Title className="mb-5 mb-sm-0">
          {t("breadCrumb.contractorDetails")}
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
        {details && (
          <div className="row g-3 align-items-start border text-muted rounded border-2 mt-1">
            <div className="row p-2 m-0 mb-4 border-0 rounded-0 border-label bg-primary text-start">
              <Form.Label className="text-light m-0 ms-2 form-label ">
                {t("contractor.details")}
              </Form.Label>
            </div>
            <div className="col-lg-7 mx-4 my-2 project-detail-section">
              <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">{t("popUp.name")}</span>
                </div>
                <div className="col-lg-9 col-6 col-sm-4 text-start p-0">
                  <span className="form-label">{details?.name || "-"}</span>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">
                    {t("contractor.companyName")}
                  </span>
                </div>
                <div className="col-lg-9 col-6 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {details?.companyDetails?.name || "-"}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">
                    {t("project.projectAddress")}
                  </span>
                </div>
                <div className="col-lg-9 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {details?.companyDetails?.address || "-"}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">
                    {t("accountInfoForm.email")}
                  </span>
                </div>
                <div className="col-lg-9 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">{details?.email || "-"}</span>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">
                    {t("companyInformationForm.companyEmail")}
                  </span>
                </div>
                <div className="col-lg-9 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {details?.companyDetails?.email || "-"}
                  </span>
                </div>
              </div>
              {/* <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">
                    {t("companyInformationForm.website")}
                  </span>
                </div>
                <div className="col-lg-9 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {details?.companyDetails?.website}
                  </span>
                </div>
              </div> */}
              <div className="row">
                <div className="col-lg-3 col-4 col-sm-4 text-start">
                  <span className="form-label">
                    {t("accountInfoForm.phoneNo")}
                  </span>
                </div>
                <div className="col-lg-9 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {details?.companyDetails?.phone_no || "-"}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-12 d-flex justify-content-center align-content-center rounded m-1 mb-4 form-label">
              <img
                src={
                  details?.logo
                    ? `${s3BasePath}${details?.logo}`
                    : `${assetPrefix}/assets/images/imgs/no_image_found.jpg`
                }
                alt={t(`manageBrandingForm.imageNotFound`)}
                style={{ width: "200px" }}
                className="shadow-1-strong rounded border border-3 rounded-2"
              />
            </div>
          </div>
        )}
        {details && (
          <div className="row g-3 align-items-start border text-muted rounded border-2 mt-3">
            <div className="row p-2 m-0 mb-1 border-0 rounded-0 border-label bg-primary text-start">
              <Form.Label className="text-light m-0 ms-2  form-label">
                {t("contractor.services")}
              </Form.Label>
            </div>
            <div className="col-lg-11 col-11 mx-4 my-2 project-detail-section">
              <div className="row">
                <div className="col-lg-6 col-5 col-sm-4 text-start p-0 gap-2">
                  {details.services && details.services.length > 0 ? (
                    details.services.map((serviceId) => (
                      <div className="form-label m-2" key={serviceId}>
                        {getServiceNameById(serviceId)}
                      </div>
                    ))
                  ) : (
                    <span className="form-label">
                      {t("contractor.noServices")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="row g-3 mt-4 align-items-start border text-muted rounded border-2 mt-1">
          <div className="row p-2 m-0 mb-4 border-0 rounded-0 border-label bg-primary text-start">
            <Form.Label className="text-light m-0 ms-2 form-label ">
              {t("licenseAndInsuranceForm.licenses")}
            </Form.Label>
          </div>
          <div className="col-lg-11 col-11 mx-4 my-2 mb-4 project-detail-section">
            {licenseFiles.length === 0 ? (
              <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th width="10%">{t("general.srNumber")}</th>
                      <th>{t("licenseAndInsuranceForm.name")}</th>
                      <th>{t("licenseAndInsuranceForm.licenceNumber")}</th>
                      <th>{t("licenseAndInsuranceForm.licenceState")}</th>
                      <th>{t("licenseAndInsuranceForm.expiryDate")}</th>
                      <th width="15%">{t("general.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenseFiles.map((file, index) => {
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{getServiceNameById(file.service_id)}</td>
                          <td>{file.license_number}</td>
                          <td>
                            {file.nationwide
                              ? t("licenseAndInsuranceForm.allStates")
                              : getStateNamesById(file.license_states)}
                          </td>
                          <td>
                            {
                              new Date(file.expiration_date)
                                .toISOString()
                                .split("T")[0]
                            }
                          </td>
                          <td className="d-flex">
                            <i
                              title="View License"
                              className="ms-0 btn-sm btn btn-primary-light"
                              onClick={() =>
                                handleFileView(
                                  `${s3BasePath}${file.license_url}`
                                )
                              }
                            >
                              <i className="ri-eye-line"></i>
                            </i>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="row g-3 mt-4 align-items-start border text-muted rounded border-2 mt-1">
          <div className="row p-2 m-0 mb-4 border-0 rounded-0 border-label bg-primary text-start">
            <Form.Label className="text-light m-0 ms-2 form-label ">
              {t("licenseAndInsuranceForm.insurance")}
            </Form.Label>
          </div>
          <div className="col-lg-11 col-11 mx-4 my-2 mb-4 project-detail-section">
            {insuranceFiles.length === 0 ? (
              <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th width="10%">{t("general.srNumber")}</th>
                      <th>{t("licenseAndInsuranceForm.tableTitle")}</th>
                      <th>{t("licenseAndInsuranceForm.expiryDate")}</th>
                      <th width="15%">{t("general.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceFiles.map((file, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{file.title}</td>
                        <td>
                          {
                            new Date(file.expiration_date)
                              .toISOString()
                              .split("T")[0]
                          }
                        </td>
                        <td className="d-flex">
                          <i
                            title="View Insurance"
                            className="ms-1 btn-sm btn btn-primary-light"
                            onClick={() =>
                              handleFileView(
                                `${s3BasePath}${file.insurance_url}`
                              )
                            }
                          >
                            <i className="ri-eye-line"></i>
                          </i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="row g-3 mt-4 align-items-start border text-muted rounded border-2 mt-1">
          <div className="row p-2 m-0 mb-4 border-0 rounded-0 border-label bg-primary text-start">
            <Form.Label className="text-light m-0 ms-2 form-label ">
              {t("certificatesForm.certificates")}
            </Form.Label>
          </div>
          <div className="col-lg-11 col-11 mx-4 my-2 mb-4 project-detail-section">
            {certificates.length === 0 ? (
              <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
            ) : (
              <Table className="table text-nowrap table-bordered">
                <thead>
                  <tr>
                    <th width="10%">{t("general.srNumber")}</th>
                    <th>{t("certificatesForm.title")}</th>
                    <th width="15%">{t("general.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((file, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{file.title}</td>
                      <td className="d-flex">
                        <i
                          title="View Certificates"
                          className="ms-1 btn-sm btn btn-primary-light"
                          onClick={() =>
                            handleFileView(
                              `${s3BasePath}${file.certificate_url}`
                            )
                          }
                        >
                          <i className="ri-eye-line"></i>
                        </i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </div>
      </Card.Body>
    </>
  );
};

export default SubContractorDetails;
