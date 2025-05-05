import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Tab, Spinner } from "react-bootstrap";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";
import {
  FileEarmarkText,
  FileEarmarkPdf,
  FileEarmarkWord,
  FileEarmarkExcel,
  FileEarmarkPlay
} from "react-bootstrap-icons";
const SummaryPane = ({
  t,
  handleSummaryBackClick,
  projectID,
  respData,
  servicesData,
  areasData
}) => {
  const [projects, setProjects] = useState({});
  const service = useService();
  const router = useRouter();
  const [mainAreas, setMainAreas] = useState([]);
  const [mainServices, setMainServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSuccessDialog } = service;
  const newProjectID = router.query.projectID;
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";

  const handleVerifyAndSubmit = async () => {
    try {
      setIsLoading(true);
      const id = newProjectID || projectID;
      const response = await service.patch(
        `/myprojects/project-submit/${id}`,
        {}
      );
      if (response?.success) {
        handleSuccessDialog(response?.data);
        router.push(`/myprojects`);
      } else {
        console.error("Verifying and Submitting Errors : ");
        router.push(`/myprojects`);
      }
    } catch (error) {
      console.error("Failed to verify and submit the project: ");
      router.push(`/myprojects`);
    } finally {
      setIsLoading(false);
    }
  };

  const setAreas = () => {
    const selectedAreas = projects?.data?.areas.map((areaId) => {
      const matchingOption = areasData.find((area) => area.value === areaId);
      return matchingOption ? matchingOption.label + " " : null;
    });
    setMainAreas(selectedAreas);
  };

  const setServices = () => {
    const selectedServices = projects?.data?.services.map((serviceId) => {
      const matchingOption = servicesData.find(
        (service) => service.value === serviceId
      );
      return matchingOption ? matchingOption.label + " " : null;
    });
    setMainServices(selectedServices);
  };

  useEffect(() => {
    if (respData) {
      setProjects(respData);
    }
  }, [respData]);

  useEffect(() => {
    if (projects && respData) {
      setAreas();
      setServices();
    }
  }, [projects, respData, areasData, servicesData]);

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

  return (
    <>
      <Tab.Pane
        className="fade text-muted b-none pb-0"
        id="summary-tab-pane"
        role="tabpanel"
        tabIndex="0"
        eventKey={5}
      >
        <div className="row g-3 align-items-start border text-muted rounded border-2 mt-1">
          <div className="col-lg-2 col-sm-3 col-6 p-2 m-0  border-0 rounded-0 border-label btn btn-primary text-start">
            <Form.Label className="text-light m-0 ms-2  form-label ">
              {t("project.projectDetails")}
            </Form.Label>
          </div>
          <div className="col-lg-11 mx-4 my-2 project-detail-section">
            <div className="row">
              <div className="col-lg-3 col-4 col-sm-4 text-start">
                <span className="form-label">{t("project.projectTitle")}</span>
              </div>
              <div className="col-1 p-0 align-self-center">
                <span className="colon form-label">:</span>
              </div>
              <div className="col-lg-4 col-6 col-sm-4 text-start p-0">
                <span className="form-label">{projects.data?.title}</span>
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
              <div className="col-lg-7 col-6 col-sm-4 text-start p-0">
                <span className="form-label">
                  {[
                    projects?.data?.address_line_1,
                    projects?.data?.address_line_2,
                    projects?.data?.city,
                    projects?.data?.state,
                    projects?.data?.zip_code
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
                  {projects.data?.start_date
                    ? new Date(projects.data?.start_date).toLocaleDateString()
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
                  {projects.data?.end_date
                    ? new Date(projects.data?.end_date).toLocaleDateString()
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
                  {projects.data?.budget_min !== 0 || null
                    ? `${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(projects.data?.budget_min)}`
                    : ""}
                  {" - "}
                  {projects.data?.budget_max !== 0 || null
                    ? `${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(projects.data?.budget_max)}`
                    : ""}{" "}
                </span>
              </div>
            </div>
          </div>
        </div>
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
                  {projects.data?.project_type || "-"}
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
                  {projects.data?.project_category || "-"}
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
                  {mainServices?.join(", ") || "-"}
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
                <span className="form-label">
                  {projects.data?.description || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-3 align-items-start border text-muted rounded border-2 mt-3">
          <div className="col-lg-2 col-sm-3 col-6 p-2 m-0 border-0 rounded-0 border-label btn btn-primary text-start">
            <Form.Label className="text-light m-0 ms-2 form-label">
              {t("project.projectDocuments")}
            </Form.Label>
          </div>
          {projects?.data?.documents?.length > 0 ? (
            <div className="col-11 mx-4 my-3">
              <div className="col-11 mx-4 my-3">
                <div className="row">
                  {projects?.data?.documents?.map((document, index) => {
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
            </div>
          ) : (
            <span>{t("project.noDocuments")}</span>
          )}
        </div>
        <Row className="my-3">
          <Col className="d-flex justify-content-end mt-5">
            {isLoading ? (
              <Spinner animation="border" variant="primary" size="md" />
            ) : (
              <div>
                <Button
                  className="btn btn-primary me-2 schedule-back"
                  type="button"
                  onClick={handleSummaryBackClick}
                >
                  {t("buttons.back")}
                </Button>
                <Button
                  className="btn btn-primary me-2 schedule-verifyNSubmit"
                  type="button"
                  onClick={handleVerifyAndSubmit}
                >
                  {t("buttons.verifyAndSubmit")}
                </Button>
              </div>
            )}
          </Col>
        </Row>
        <div></div>
      </Tab.Pane>
    </>
  );
};

export default SummaryPane;
