import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Col, Row, Table, Accordion } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import { assetPrefix } from "../../../next.config";

const ViewEstimate = () => {
  const { t } = useTranslation();
  const service = useService();
  const router = useRouter();
  const id = router.query.id;
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState({});
  const [estimation, setEstimation] = useState({});
  const [tableData, setTableData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [project, setProject] = useState({});
  const [contractor, setContractor] = useState({});
  const [contractorDetails, setContractorDetails] = useState({});
  const [contractorBranding, setContractorBranding] = useState({});
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const componentRef = useRef(null);
  const { handleErrorDialog, handleSuccessDialog } = service;

  const fetchProjectDetails = async (id) => {
    try {
      const response = await service.get(`/project/${id}`);
      if (response?.success) {
        setProject(response.data);
        if (response.data.status_id > 4) {
          setIsDisabled(true);
          if (response.data.status_id == 5) {
            setShowAccept(true);
          }
          if (response.data.status_id == 6) {
            setShowReject(true);
          }
        } else {
          setIsDisabled(false);
          setShowAccept(true);
          setShowReject(true);
        }
      }
    } catch (error) {
      console.error("Error Fetching Project Details :", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await service.get("/myprofile");
      if (response?.success) {
        setUser(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Data :", error);
    }
  };

  const fetchEstimationData = async (id) => {
    try {
      const response = await service.get(`/estimation/${id}`);
      if (response?.success) {
        setEstimation(response?.data);
        fetchEstimationItemsData(response?.data?.id);
        if (response?.data?.estimation_status_id > 2) {
          setIsDisabled(true);
        }
      }
    } catch (error) {
      console.error("Error Fetching Estimation Data :", error);
    }
  };

  const fetchEstimationItemsData = async (id) => {
    try {
      const response = await service.get(`/estimation-items/${id}`);
      if (response?.success) {
        const items = response.data.map((item) => {
          const laborTotal = parseFloat(item.labour_cost);
          const materialTotal = parseFloat(item.material_cost);
          const total = laborTotal + materialTotal;
          return { ...item, total };
        });
        setTableData(items);
      }
    } catch (error) {
      console.error("Error Fetching Estimation Items Data :", error);
    }
  };

  const fetchCompanyDetails = async (id) => {
    try {
      const response = await service.get(`/company-details/${id}`);
      if (response?.success) {
        setContractorDetails(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Company Details :", error);
    }
  };

  const fetchContractorDetails = async (id) => {
    try {
      const response = await service.get(`/profile/contractor/${id}`);
      if (response?.success) {
        setContractor(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Customer Details :", error);
    }
  };

  const handleAccept = async () => {
    try {
      const response = await service.patch(
        `/accept-estimate/${estimation.id}`,
        {
          projectId: id
        }
      );
      if (response?.success) {
        setIsDisabled(true);
        handleSuccessDialog(response);
        setShowAccept(true);
        setShowReject(false);
      }
    } catch (error) {
      handleErrorDialog(error);
      console.error("Error Accepting Estimation :", error);
    }
  };

  const handleReject = async () => {
    try {
      const response = await service.patch(
        `/reject-estimate/${estimation.id}`,
        {
          projectId: id
        }
      );
      if (response?.success) {
        setIsDisabled(true);
        handleSuccessDialog(response);
        setShowReject(true);
        setShowAccept(false);
      }
    } catch (error) {
      handleErrorDialog(error);
      console.error("Error Rejecting Estimation :", error);
    }
  };

  const handleDownload = async () => {
    router.reload();
    window.location.href = `${s3BasePath}${estimation.estimation_url}`;
  };

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
    if (id) {
      fetchProjectDetails(id);
      fetchData();
      fetchEstimationData(id);
      fetchCompanyDetails(id);
      fetchContractorDetails(id);
    }
    const mainLogo = localStorage.getItem("mainLogo");
    setContractorBranding({ main_logo: mainLogo });
  }, [id]);

  const goBack = () => {
    router.back();
  };

  return (
    <>
      <Card className="custom-card mt-4">
        <Card.Header className="">
          <Card.Title>{t("viewEstimate.view")}</Card.Title>
          <Button
            variant="primary-light"
            className="btn-spacing btn btn-sm d-flex align-items-center"
            onClick={goBack}
          >
            <i
              className="bx bx-left-arrow-circle me-1"
              style={{ fontSize: "20px" }}
            ></i>{" "}
            {t("buttons.back")}
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="d-flex w-100 justify-content-end">
            <div className="d-flex justify-content-end gap-4">
              {isMobile ? (
                <div className="flex-row justify-content-end flex-sm-column">
                  <div className="d-flex justify-content-between mb-2 gap-2">
                    <button
                      className={
                        showAccept ? "btn btn-sm btn-success-light" : "d-none"
                      }
                      disabled={isDisabled}
                      onClick={() =>
                        handleAccept(estimation.id, estimation.project_id)
                      }
                      type="button"
                    >
                      {project?.status_id === 5
                        ? t("viewEstimate.accepted")
                        : t("viewEstimate.accept")}
                    </button>
                    <button
                      className={
                        showReject ? "btn btn-sm btn-danger-light" : "d-none"
                      }
                      disabled={isDisabled}
                      onClick={() =>
                        handleReject(estimation.id, estimation.project_id)
                      }
                      type="button"
                    >
                      {project?.status_id === 6
                        ? t("viewEstimate.rejected")
                        : t("viewEstimate.reject")}
                    </button>
                    <button
                      className="btn btn-sm btn-info-light"
                      onClick={() => handleDownload()}
                      type="button"
                    >
                      {t("viewEstimate.download")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className={
                      showAccept ? "btn btn-sm btn-success-light" : "d-none"
                    }
                    disabled={isDisabled}
                    onClick={() =>
                      handleAccept(estimation.id, estimation.project_id)
                    }
                    type="button"
                  >
                    {project?.status_id === 5
                      ? t("viewEstimate.accepted")
                      : t("viewEstimate.accept")}
                  </button>
                  <button
                    className={
                      showReject ? "btn btn-sm btn-danger-light" : "d-none"
                    }
                    disabled={isDisabled}
                    onClick={() =>
                      handleReject(estimation.id, estimation.project_id)
                    }
                    type="button"
                  >
                    {project?.status_id === 6
                      ? t("viewEstimate.rejected")
                      : t("viewEstimate.reject")}
                  </button>
                  <button
                    className="btn btn-md btn-info-light"
                    onClick={() => handleDownload()}
                    type="button"
                  >
                    {t("viewEstimate.download")}
                  </button>
                </>
              )}
            </div>
          </Row>
          <div
            id="capture"
            ref={componentRef}
            className={isMobile ? "p-2" : "p-5"}
          >
            <Row className="mt-5 justify-content-between align-items-center">
              <Col xxl={4} xl={6} lg={6} md={6} sm={6} className="">
                <div className="mb-4">
                  <img
                    id="mainLogo"
                    src={
                      contractorBranding?.main_logo
                        ? `${s3BasePath}${contractorBranding.main_logo}`
                        : `${assetPrefix}/assets/images/imgs/no_image_found.jpg`
                    }
                    className=""
                    width={200}
                  />
                </div>
                <div className="fw-bold">
                  {" "}
                  {contractorDetails?.company_name || ""}
                </div>
                <div className="mt-2">
                  {[
                    contractorDetails?.address_line_1,
                    contractorDetails?.address_line_2,
                    contractorDetails?.city,
                    contractorDetails?.state,
                    contractorDetails?.zip_code
                  ]
                    .filter(Boolean)
                    .join(", ") || ""}
                </div>
                <div className="mt-3">
                  <span className="fw-bold">
                    {t("accountInfoForm.phoneNo")}
                  </span>
                  {" " + contractor?.phone_no || ""}
                </div>
                <div>
                  <span className="fw-bold">{t("accountInfoForm.email")}:</span>
                  {" " + contractor?.email_address || ""}
                </div>
                <div className="">
                  <span className="fw-bold">
                    {t("companyInformationForm.website")}:
                  </span>{" "}
                  {contractorDetails?.company_website || ""}
                </div>
              </Col>
              <Col
                xxl={4}
                xl={6}
                lg={6}
                md={6}
                className="justify-content-end text-end"
              >
                <div className="d-flex flex-column align-items-end">
                  <div className="fw-bold mb-2">{t("viewEstimate.for")}</div>
                  <div className="">
                    {user?.first_name + " " + user?.last_name}
                  </div>
                  <div className="">
                    {project?.address_line_1 + ", " + project?.address_line_2}
                  </div>
                  <div className="">
                    {[project?.city, project?.state, project?.zip_code]
                      .filter(Boolean)
                      .join(", ") || ""}
                  </div>
                </div>
                <div className="mt-4 mb-4">
                  <div className="d-flex justify-content-end">
                    <div className="justify-content-between d-flex col-xxl-7 col-xl-6 col-lg-8 col-md-8 col-sm-8">
                      <label className="ms-5 fw-bold me-2">
                        {t("viewEstimate.estimateNo")}
                      </label>
                      <label>{estimation?.estimation_no}</label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="justify-content-between d-flex col-xxl-7 col-xl-6 col-lg-8 col-md-8 col-sm-8">
                      <label className="ms-5 fw-bold">
                        {" "}
                        {t("general.date")}
                      </label>
                      <label>
                        {new Date(
                          estimation?.estimation_date
                        ).toLocaleDateString()}
                      </label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="justify-content-between d-flex col-xxl-7 col-xl-6 col-lg-8 col-md-8 col-sm-8">
                      <label className="ms-5 fw-bold">
                        {t("viewEstimate.poNumber")}
                      </label>
                      <label>{estimation?.po_number}</label>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            {isMobile ? (
              <Accordion
                id="accordionExample"
                defaultActiveKey={null}
                alwaysOpen
                className="table border-2 rounded table-responsive p-0 mt-3 "
              >
                {tableData.map((item, index) => (
                  <Accordion.Item
                    eventKey={index?.toString()}
                    key={index}
                    className="border border-2 justify-content-between"
                  >
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <Accordion.Button className="d-flex justify-content-between custom-accordion-button">
                        <div className="fw-bold">
                          {item?.name || item?.title}
                        </div>
                        <div className="accordion-total text-end">
                          <div className="fw-bold">Total</div>
                          <div className="w-100">
                            {" "}
                            {parseFloat(
                              item?.quantity *
                                item?.material_cost *
                                (1 + item?.tax / 100)
                            ).toFixed(2)}
                          </div>
                        </div>
                      </Accordion.Button>
                    </h2>
                    <Accordion.Collapse
                      eventKey={index?.toString()}
                      className="p-0"
                    >
                      <Accordion.Body className="estimate-accordion-body p-0">
                        <div className="d-flex justify-content-between">
                          <div className="estimate-height text-center">
                            <div className="fw-bold">
                              {t("itemsForm.quantity")}:
                            </div>
                            <div>{item?.quantity}</div>
                          </div>
                          <div className="estimate-height text-center">
                            <div className="fw-bold">
                              {t("itemsForm.hours")}
                            </div>
                            <div>{item?.hours}</div>
                          </div>
                          <div className="estimate-height text-center">
                            <div className="fw-bold">
                              {t("itemsForm.laborCost")}:
                            </div>
                            <div>{item?.labour_cost}</div>
                          </div>
                          <div className="estimate-height text-center">
                            <div className="fw-bold">
                              {t("itemsForm.laborCost")}:
                            </div>
                            <div>{item?.material_cost}</div>
                          </div>
                        </div>
                        <div className="mt-2">{item?.description}</div>
                      </Accordion.Body>
                    </Accordion.Collapse>
                  </Accordion.Item>
                ))}
                <div className="d-flex justify-content-end">
                  <div className="accordion-total text-end">
                    <div className="w-100 fw-bold">
                      <span className="me-2">Total</span> {"$ "}
                      {estimation?.total}
                    </div>
                  </div>
                </div>
              </Accordion>
            ) : (
              <Row className="mb-3">
                <div className="table-responsive rounded p-0 mt-3">
                  <Table className="table border border-2 rounded">
                    <thead>
                      <tr>
                        <th className="" width="40%">
                          {t("itemsForm.item")}
                        </th>
                        <th className="text-end">{t("itemsForm.quantity")}</th>
                        <th className="text-end">{t("itemsForm.hours")}</th>
                        <th className="text-end">{t("itemsForm.tax")} (%)</th>
                        <th className="text-end">
                          {t("itemsForm.laborCost")} ($)
                        </th>
                        <th className="text-end">
                          {t("itemsForm.materialCost")} ($)
                        </th>
                        <th className="text-end pe-4" width="">
                          Total ($)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData ? (
                        tableData?.map((item, index) => (
                          <tr key={index}>
                            <td className="">
                              <div className="fw-bold">
                                {item?.name || item?.title}
                              </div>
                              <div className="">{item?.description}</div>
                            </td>
                            <td className="text-end">{item?.quantity}</td>
                            <td className="text-end">{item?.hours}</td>
                            <td className="text-end">{item?.tax}</td>
                            <td className="text-end">{item?.labour_cost}</td>
                            <td className="text-end">
                              {parseFloat(
                                item?.quantity *
                                  item?.material_cost *
                                  (1 + item?.tax / 100)
                              ).toFixed(2)}
                            </td>
                            <td className="text-end pe-4">
                              {parseFloat(
                                item?.labour_cost *
                                  (1 + estimation?.labour_margin / 100) +
                                  item?.quantity *
                                    item?.material_cost *
                                    (1 + item?.tax / 100) *
                                    (1 + estimation?.material_margin / 100)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr> Data Not Found</tr>
                      )}
                    </tbody>
                  </Table>
                  <Row className="justify-content-end mt-4 border-bottom">
                    <Col xl={4} md={6} className="mb-3 custom-padding">
                      <div className="d-flex fs-6 justify-content-between ">
                        <label className="fw-bold">Total</label>
                        <label className="fw-bold">$ {estimation?.total}</label>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Row>
            )}
            <Row>
              <p className="mb-5">
                Thank You For Choosing {contractorDetails?.company_name}!
              </p>
              <div
                className="contract-details"
                dangerouslySetInnerHTML={{ __html: estimation?.contract_text }}
              ></div>
              <div className="d-flex justify-content-end my-5">
                <div className="col-xl-4 text-center fw-bold mt-2 signature">
                  {contractor?.first_name + " " + contractor?.last_name}
                </div>
              </div>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

ViewEstimate.layout = "Contentlayout";
export default ViewEstimate;
