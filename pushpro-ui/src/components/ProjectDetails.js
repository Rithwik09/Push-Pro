import React, { useEffect, useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import {
  FileEarmarkText,
  FileEarmarkPdf,
  FileEarmarkWord,
  FileEarmarkExcel,
  FileEarmarkPlay
} from "react-bootstrap-icons";

const ProjectDetails = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [projects, setProjects] = useState(null);
  const [estimationId, setEstimationId] = useState(null);
  const [estimationStatus, setEstimationStatus] = useState(null);
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [mainAreas, setMainAreas] = useState([]);
  const [servicesOption, setServicesOption] = useState([]);
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const id = props.id;

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (projects) {
      fetchAreas(projects);
      fetchServices(projects);
    }
  }, [projects]);

  const fetchData = async (id) => {
    try {
      const response = await service.get(`/project/${id}`);
      if (response?.success) {
        setProjects(response?.data);
      }
      const estimation = await service.get(`/project/estimation/${id}`);
      if (estimation && estimation.success) {
        setEstimationId(estimation?.data?.id);
        setEstimationStatus(estimation?.data?.estimation_status_id);
      }
    } catch (error) {
      console.error("Error Fetching Data : ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async (project) => {
    try {
      const response = await service.get("/areas");
      if (response?.success) {
        const areas = response?.data.map((area) => ({
          value: area.id,
          label: area.name
        }));
        if (areas || project?.areas) {
          const selectedAreas = project?.areas.map((areaId) => {
            const matchingOption = areas.find((area) => area.value === areaId);
            return matchingOption ? matchingOption.label + " " : null;
          });
          setMainAreas(selectedAreas);
        }
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }
  };

  const fetchServices = async (project) => {
    try {
      const response = await service.get("/services");
      if (response?.success) {
        const servicesData = response.data.map((service) => ({
          value: service.id,
          label: service.name
        }));
        if (servicesData && project?.services) {
          const findServices = project.services
            .map((service) => servicesData.find((sid) => sid.value == service))
            .filter(Boolean);
          setServicesOption(findServices);
        }
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const fileIcons = {
    pdf: <FileEarmarkPdf size={32} />,
    doc: <FileEarmarkWord size={32} />,
    docx: <FileEarmarkWord size={32} />,
    xls: <FileEarmarkExcel size={32} />,
    xlsx: <FileEarmarkExcel size={32} />,
    mp4: <FileEarmarkPlay size={32} />,
    avi: <FileEarmarkPlay size={32} />,
    default: <FileEarmarkText size={32} />
  };

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

  const getFileIcon = (fileName) => {
    const ext = fileName && fileName.split(".").pop().toLowerCase();
    if (imageExtensions.includes(ext)) {
      return (
        <img
          src={`${s3BasePath}${fileName}`}
          alt={`Document ${fileName}`}
          className="media-thumbnail"
        />
      );
    }
    return fileIcons[ext] || fileIcons["default"];
  };

  const handleCreateEstimate = async () => {
    try {
      // Validate contract text first
      const isContractTextValid = await checkContractText();
      if (!isContractTextValid) return;
      // If contract text is valid, check main logo
      const isMainLogoValid = await checkMainLogo();
      if (!isMainLogoValid) return;
      // Both validations passed, proceed with estimation creation
      const response = await service.post(
        `/myprojects/estimation/create/${id}`,
        {}
      );
      if (response?.success && response?.data) {
        router.push(`/create-estimation/${response.data.estimate.id}`);
      }
    } catch (error) {
      console.error("Cannot Create Estimation Error:", error);
      handleErrorDialog({
        message:
          error.response?.data?.errors?.[0] ||
          "Cannot Create Estimation. Try Again."
      });
    }
  };

  const handleUpdateEstimate = async () => {
    try {
      // Validate contract text first
      const isContractTextValid = await checkContractText();
      if (!isContractTextValid) return;
      // If contract text is valid, check main logo
      const isMainLogoValid = await checkMainLogo();
      if (!isMainLogoValid) return;
      // Both checks passed, proceed with estimation update logic
      if (estimationStatus && estimationStatus > 1) {
        router.push(`/preview-estimation/${estimationId}`);
        return;
      }
      // Fetch estimation details
      const response = await service.get(
        `/myprojects/estimation/${estimationId}`
      );
      if (response?.success && response?.data) {
        router.push(`/create-estimation/${response.data.id}`);
      }
    } catch (error) {
      handleErrorDialog({
        message: "Cannot Update Estimation. Try Again."
      });
    }
  };

  const checkContractText = async () => {
    try {
      // Fetch contract text
      const contractText = await service.get("/myprofile/contract-text");
      // Extract and sanitize HTML content
      const htmlContent = contractText?.data || "";
      const sanitizedContent = htmlContent
        .replace(/&nbsp;/g, " ")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .trim();
      // Comprehensive validation checks
      const isContractTextInvalid =
        !htmlContent ||
        sanitizedContent === "" ||
        /^\s*<p>\s*<\/p>$/.test(htmlContent);
      if (isContractTextInvalid) {
        await myProfileRedirect("contract-text");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Contract Text Validation Error:", error);
      await myProfileRedirect("company-details");
      return false;
    }
  };

  const checkMainLogo = async () => {
    try {
      // Safely retrieve user data
      const userData = localStorage.getItem("user_data");
      // Parse user data
      const user = JSON.parse(userData);
      // Fetch contractor branding
      const response = await service.get(
        `/get-contractor-branding/${user?.user_uuid}`
      );
      if (!response?.success || !response?.data?.main_logo) {
        console.warn("No Main Logo Found");
        await myProfileRedirect("manage-branding");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Contractor Branding Fetch Error:", error);
      await myProfileRedirect("manage-branding");
      return false;
    }
  };

  const myProfileRedirect = async (event) => {
    try {
      await router.push({
        pathname: "/myprofile",
        query: { activeTab: event }
      });
    } catch (error) {
      console.error(`Redirect to ${event} tab failed:`, error);
    }
  };

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
        <Card.Title className="mb-5 mb-sm-2">
          {t("project.projectDetails")}
        </Card.Title>
        <div
          className="d-flex flex-column flex-sm-row justify-content-end"
          style={{ flexDirection: isMobile ? "column" : "row" }}
        >
          <div
            className="d-flex justify-content-end gap-2"
            style={{ flexDirection: isMobile ? "row" : "row" }}
          >
            {estimationId !== null ? (
              <Button
                className="btn btn-sm btn-spacing-estimate fs-7 mb-2 mb-sm-0"
                onClick={handleUpdateEstimate}
              >
                {estimationStatus && estimationStatus > 1
                  ? t("previewEstimate.preview")
                  : t("previewEstimate.update")}
              </Button>
            ) : (
              <Button
                className="btn btn-sm btn-spacing-estimate me-4 fs-7 mb-2 mb-sm-0"
                onClick={handleCreateEstimate}
              >
                {t("previewEstimate.create")}
              </Button>
            )}
          </div>
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
        {loading && <Spinner animation="border" variant="primary" />}
        {projects && (
          <div>
            <div className="row g-3 align-items-start border text-muted rounded border-2 mt-1">
              <div className="col-lg-2 col-sm-3 col-6 p-2 m-0  border-0 rounded-0 border-label btn btn-primary text-start">
                <Form.Label className="text-light m-0 ms-2  form-label ">
                  {t("project.customerDetails")}
                </Form.Label>
              </div>
              <div className="col-lg-11 mx-4 my-2 project-detail-section">
                <div className="row ">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">{t("popUp.name")}</span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-4 col-6 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {projects?.customerDetails?.first_name}{" "}
                      {projects?.customerDetails?.last_name}
                    </span>
                  </div>
                </div>
                <div className="row ">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">
                      {t("project.customerEmail")}
                    </span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-4 col-6 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {projects?.customerDetails?.email_address}
                    </span>
                  </div>
                </div>
                <div className="row ">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">
                      {t("project.customerPhone")}
                    </span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-4 col-6 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {projects?.customerDetails?.phone_no
                        ? projects.customerDetails.phone_no
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3 align-items-start border text-muted rounded border-2 mt-1">
              <div className="col-lg-2 col-sm-3 col-6 p-2 m-0  border-0 rounded-0 border-label btn btn-primary text-start">
                <Form.Label className="text-light m-0 ms-2  form-label ">
                  {t("project.projectDetails")}
                </Form.Label>
              </div>
              <div className="col-lg-11 mx-4 my-2 project-detail-section">
                <div className="row">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">{t("project.tableName")}</span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-4 col-6 col-sm-4 text-start p-0">
                    <span className="form-label">{projects?.title}</span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">
                      {t("project.projectAddress")}
                    </span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-3 col-5 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {[
                        projects?.address_line_1,
                        projects?.address_line_2,
                        projects?.city,
                        projects?.state,
                        projects?.zip_code
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">{t("project.startDate")}</span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-2 col-5 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {projects?.start_date
                        ? new Date(projects?.start_date).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="row ">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">{t("project.endDate")}</span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-3 col-5 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {projects?.end_date
                        ? new Date(projects?.end_date).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-3 col-4 col-sm-4 text-start">
                    <span className="form-label">{t("project.budget")}</span>
                  </div>
                  <div className="col-1 p-0 align-self-center">
                    <span className="colon form-label">:</span>
                  </div>
                  <div className="col-lg-2 col-4 col-sm-4 text-start p-0">
                    <span className="form-label">
                      {projects.budget_min
                        ? `${new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD"
                          }).format(projects.budget_min)} -`
                        : "-"}{" "}
                      {projects.budget_max
                        ? `${new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD"
                          }).format(projects.budget_max)}`
                        : ""}{" "}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {projects && (
          <div className="row g-3 align-items-start border text-muted rounded border-2 mt-3">
            <div className="col-lg-2 col-sm-3 col-6 p-2 m-0  border-0 rounded-0 border-label btn btn-primary text-start">
              <Form.Label className="text-light m-0 ms-2  form-label">
                {t("project.projectRequirements")}
              </Form.Label>
            </div>
            <div className="col-lg-11 col-11 mx-4 my-2 project-detail-section">
              <div className="row ">
                <div className="col-lg-3 col-6 col-sm-4 text-start">
                  <span className="form-label">
                    {t("project.residentialAndCommercial")}
                  </span>
                </div>
                <div className="col-1 p-0 align-self-center">
                  <span className="colon form-label">:</span>
                </div>
                <div className="col-lg-3 col-4 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {projects?.project_type || "-"}
                  </span>
                </div>
              </div>
              <div className="row ">
                <div className="col-lg-3 col-6 col-sm-4 text-start">
                  <span className="form-label">
                    {t("project.renovationAndAddition")}
                  </span>
                </div>
                <div className="col-1 p-0 align-self-center">
                  <span className="colon form-label">:</span>
                </div>
                <div className="col-lg-3 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {projects?.project_category || "-"}{" "}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-6 col-sm-4 text-start">
                  <span className="form-label">{t("project.areas")}</span>
                </div>
                <div className="col-1 p-0 align-self-center">
                  <span className="colon form-label">:</span>
                </div>
                <div className="col-lg-6 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {mainAreas?.join(", ") || "-"}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-3 col-6 col-sm-4 text-start">
                  <span className="form-label">{t("project.services")}</span>
                </div>
                <div className="col-1 p-0 align-self-center">
                  <span className="colon form-label">:</span>
                </div>
                <div className="col-lg-6 col-5 col-sm-4 text-start p-0">
                  <span className="form-label">
                    {Array.isArray(servicesOption) && servicesOption.length > 0
                      ? servicesOption
                          .map((service) => service.label)
                          .join(", ")
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="row ">
                <div className="col-lg-3 col-6 col-sm-4 text-start">
                  <span className="form-label">{t("project.Description")}</span>
                </div>
                <div className="col-1 p-0 align-self-center">
                  <span className="colon form-label">:</span>
                </div>
                <div className="col-lg-3 col-4 col-sm-4 text-start p-0">
                  <span className="form-label">{projects?.description}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="row g-3 align-items-start border text-muted rounded border-2 mt-3">
          <div className="col-lg-2 col-sm-3 col-6 p-2 m-0  border-0 rounded-0 border-label btn btn-primary text-start">
            <Form.Label className="text-light m-0 ms-2 form-label">
              {t("project.projectDocuments")}
            </Form.Label>
          </div>
          {projects?.documents?.length > 0 ? (
            <div className="col-11 mx-4 my-3">
              <div className="row">
                {projects?.documents?.map((document, index) => {
                  const fileUrl = `${s3BasePath}${document.file_url}`;
                  const fileExt = fileUrl.split(".").pop().toLowerCase();
                  const isVideo = fileExt === "mp4";
                  const isImage = [
                    "jpg",
                    "png",
                    "jpeg",
                    "webp",
                    "svg"
                  ].includes(fileExt);
                  const isPdf = fileExt === "pdf";
                  return (
                    <div
                      key={index}
                      className="col-11 col-sm-6 col-md-4 col-lg-3"
                    >
                      {isImage && (
                        <div className="media-box image-box">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {getFileIcon(document.file_url)}
                          </a>
                        </div>
                      )}
                      {isVideo && (
                        <div className="media-box video-box">
                          <video
                            src={fileUrl}
                            controls
                            className="media-thumbnail"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      {isPdf && (
                        <div className="media-box pdf-box">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="media-thumbnail pdf-thumbnail"
                          >
                            <FileEarmarkPdf className="pdf-icon" />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <span>{t("project.noDocuments")}</span>
          )}
        </div>
      </Card.Body>
    </>
  );
};

export default ProjectDetails;
