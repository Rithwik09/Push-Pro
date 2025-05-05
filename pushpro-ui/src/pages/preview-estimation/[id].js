import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Button,
  Col,
  Row,
  Table,
  Accordion,
  Spinner
} from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import useService from "@/hooks/useService";
import { assetPrefix } from "../../../next.config";

const PreviewEstimate = () => {
  const { t } = useTranslation();
  const service = useService();
  const router = useRouter();
  const id = router.query.id;
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState({});
  const [estimation, setEstimation] = useState({});
  const [tableData, setTableData] = useState([]);
  const [project, setProject] = useState({});
  const [customer, setCustomer] = useState({});
  const [contractorDetails, setContractorDetails] = useState({});
  const [contractorBranding, setContractorBranding] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const componentRef = useRef(null);
  const { handleErrorDialog, handleSuccessDialog, handleAutoCloseSuccess } =
    service;

  const fetchData = async () => {
    try {
      const response = await service.get("/myprofile");
      if (response?.success) {
        setUser({
          uuid: response.data.user_uuid,
          fname: response.data.first_name,
          lname: response.data.last_name,
          email: response.data.email_address,
          phone: response.data.phone_no
        });
        fetchContractorBranding(response.data.user_uuid);
      }
    } catch (error) {
      console.error("Error Fetching Data :", error);
    }
  };

  const fetchEstimationData = async () => {
    try {
      const response = await service.get(`/myprojects/estimation/${id}`);
      if (response?.success) {
        setEstimation(response.data);
        fetchProjectDetails(response.data.project_id);
        setHtmlContent(response.data.contract_text || "");
        if (response.data.contract_text === "<p><br></p>") {
          fetchContractDetails();
        }
      }
    } catch (error) {
      console.error("Error Fetching Estimation Data :", error);
    }
  };

  const fetchContractDetails = async () => {
    if (htmlContent === null || htmlContent === "") {
      try {
        const response = await service.get("/myprofile/contract-text");
        setHtmlContent(response.data || "");
      } catch (error) {
        console.error("Error Fetching Contract Details : ", error);
      }
    }
  };

  const fetchEstimationItemsData = async () => {
    try {
      const response = await service.get(
        `/myprojects/estimation/all-items/${id}`
      );
      if (response?.success) {
        const items = response.data.estimationsItems.map((item) => {
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

  const fetchCompanyDetails = async () => {
    try {
      const response = await service.get(`/myprofile/contractor-details`);
      if (response?.success) {
        setContractorDetails(response.data);
      }
    } catch (error) {
      console.error("Error Fetching Company Details :", error);
    }
  };

  const fetchContractorBranding = async (uuid) => {
    try {
      const response = await service.get(`/get-contractor-branding/${uuid}`);
      if (response?.success) {
        setContractorBranding(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Contractor Branding :", error);
    }
  };

  const fetchProjectDetails = async (id) => {
    try {
      const response = await service.get(`/project/${id}`);
      if (response?.success) {
        setProject(response.data);
        fetchCustomerDetails(response.data.customer_id);
      }
    } catch (error) {
      console.error("Error Fetching Project Details :", error);
    }
  };

  const fetchCustomerDetails = async (id) => {
    try {
      const response = await service.get(`/profile/customer/${id}`);
      if (response?.success) {
        setCustomer(response.data);
      }
    } catch (error) {
      console.error("Error Fetching Customer Details :", error);
    }
  };

  const handleEdit = () => {
    router.push(`/create-estimation/${id}`);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current
  });

  const handleDownload = async () => {
    router.reload();
    window.location.href = `${s3BasePath}${estimation.estimation_url}`;
  };

  const handleSubmit = async () => {
    try {
      setSubmitDisabled(true);
      const response = await service.post(
        `/myprojects/estimation/submit/${id}`,
        {}
      );
      if (response?.success) {
        setEstimation(response.data);
        handleAutoCloseSuccess(response);
      }
    } catch (error) {
      error = {
        message: "Cannot Submit Estimate. Try Again."
      };
      handleErrorDialog(error);
    } finally {
      setSubmitDisabled(false);
    }
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
      fetchData();
      fetchEstimationData();
      fetchEstimationItemsData();
      fetchCompanyDetails();
    }
  }, [id]);

  const goBack = () => {
    router.back();
  };

  return (
    <>
      <Card className="custom-card mt-4">
        <Card.Header className="">
          <Card.Title>{t("previewEstimate.preview")}</Card.Title>
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
          <Row>
            <Col xxl={12} xl={12} lg={12} md={12} className="d-flex">
              <div className="col-xxl-7 col-xl-7 col-lg-5 col-md-5 col-sm-3"></div>
              <div className="col-xxl-5 col-xl-5 col-lg-7 col-md-7 col-sm-9 d-flex justify-content-between">
                {isMobile ? (
                  <div className="flex-row justify-content-end gap-4 flex-sm-column">
                    <div className="d-flex justify-content-between mb-2 gap-4">
                      <Button
                        variant="primary"
                        className="shadow shadow-lg shadow-primary"
                        onClick={handleEdit}
                        type="button"
                      >
                        {t("previewEstimate.edit")}
                      </Button>
                      <Button
                        variant="primary"
                        className="shadow shadow-lg shadow-primary"
                        onClick={handlePrint}
                        type="button"
                      >
                        {t("previewEstimate.print")}
                      </Button>
                      <Button
                        variant="primary"
                        className="shadow shadow-lg shadow-primary"
                        onClick={handleDownload}
                        type="button"
                      >
                        {t("general.download")}
                      </Button>
                    </div>
                    {submitDisabled ? (
                      <Spinner animation="border" variant="primary" size="md" />
                    ) : (
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="primary"
                          className={`shadow shadow-lg shadow-primary ${
                            submitDisabled ? "d-none" : ""
                          }`}
                          onClick={handleSubmit}
                          type="button"
                        >
                          {t("previewEstimate.submit")}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      className="shadow shadow-lg shadow-primary"
                      onClick={handleEdit}
                      type="button"
                    >
                      {t("previewEstimate.edit")}
                    </Button>
                    <Button
                      variant="primary"
                      className="shadow shadow-lg shadow-primary"
                      onClick={handlePrint}
                      type="button"
                    >
                      {t("previewEstimate.print")}
                    </Button>
                    <Button
                      variant="primary"
                      className="shadow shadow-lg shadow-primary"
                      onClick={handleDownload}
                      type="button"
                    >
                      {t("general.download")}
                    </Button>
                    {submitDisabled ? (
                      <Spinner animation="border" variant="primary" size="md" />
                    ) : (
                      <Button
                        variant="primary"
                        className={`shadow shadow-lg shadow-primary ${
                          submitDisabled ? "d-none" : ""
                        }`}
                        onClick={handleSubmit}
                        type="button"
                      >
                        {t("previewEstimate.submit")}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>
          <div
            id="capture"
            ref={componentRef}
            className={isMobile ? "p-2" : "p-4"}
          >
            <Row className="mt-5 justify-content-between align-items-center">
              <Col xxl={4} xl={6} lg={6} md={6} className="">
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
                  {" " + user?.phone || ""}
                </div>
                <div>
                  <span className="fw-bold">{t("accountInfoForm.email")}:</span>
                  {" " + user?.email || ""}
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
                  <div className="fw-bold mb-2">{t("previewEstimate.for")}</div>
                  <div className="">
                    {customer?.first_name + " " + customer?.last_name}
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
                      <label className="ms-5 fw-bold me-2">Estimate</label>
                      <label>{estimation?.estimation_no}</label>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <div className="justify-content-between d-flex col-xxl-7 col-xl-6 col-lg-8 col-md-8 col-sm-8">
                      <label className="ms-5 fw-bold">
                        {" "}
                        {t("createEstimation.date")}
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
                      <label className="ms-5 fw-bold"> PO Number</label>
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
                    className="border border-2"
                  >
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <Accordion.Button
                        variant="link"
                        className="preview-accordion d-flex justify-content-between"
                      >
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
                  <div className="justify-content-end">
                    <div className="w-100 fw-bold">
                      <span className="me-2">Total</span> {"$ "}
                      {estimation.total}
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
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              ></div>
              <div className="d-flex justify-content-end my-5">
                <div className="col-xl-4 text-center fw-bold mt-2 signature">
                  {user?.fname + " " + user?.lname}
                </div>
              </div>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

PreviewEstimate.layout = "Contentlayout";
export default PreviewEstimate;
