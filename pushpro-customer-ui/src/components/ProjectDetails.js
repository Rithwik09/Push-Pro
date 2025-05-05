import React, { useEffect, useState } from "react";
import { Card, Button, Form } from "react-bootstrap";
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
  const service = useService();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [mainAreas, setMainAreas] = useState();
  const [servicesOption, setServicesOption] = useState();
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const { id } = props;

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
      fetchAreas();
      fetchServices();
    }
  }, [projects]);

  const fetchData = async (id) => {
    try {
      const response = await service.get(`/project/${id}`);
      if (response?.success) {
        setProjects(response?.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await service.get("/areas");
      if (response?.success) {
        const areas = response?.data.map((area) => ({
          value: area.id,
          label: area.name
        }));
        if (areas && projects?.areas) {
          const selectedAreas = projects?.areas.map((areaId) => {
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

  const fetchServices = async () => {
    try {
      const response = await service.get("/services");
      if (response?.success) {
        const servicesData = response.data.map((service) => ({
          value: service.id,
          label: service.name
        }));
        if (servicesData && projects?.services) {
          const findServices = projects.services
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

  const handleViewEstimate = () => {
    router.push(`/view-estimate/${id}`);
  };

  return (
    <>
      <Card.Header className="d-flex flex-column flex-sm-row w-100 align-items-center">
        <Card.Title className="d-flex justify-content-start col-12 col-sm-6 col-lg-8 align-items-start text-start">
          {t("project.projectDetails")}
        </Card.Title>
        <div className="d-flex justify-content-between justify-content-sm-end col-4 col-sm-4 col-lg-2 mt-2 mt-sm-0">
          {projects && (
            <Button
              className="btn btn-sm btn-spacing-estimate fs-7"
              disabled={projects?.status_id < 4}
              onClick={handleViewEstimate}
            >
              View Estimate
            </Button>
          )}
          <Button
            variant="primary-light"
            className="btn-spacing btn btn-sm d-flex mb-1 align-items-center"
            onClick={goBack}
          >
            <i className="bx bx-left-arrow-circle fs-5"></i>
            {t("buttons.back")}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
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
              <div className="col-lg-7 col-6 col-sm-4 text-start p-0">
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
                  {projects?.budget_min
                    ? `${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(projects?.budget_min)}`
                    : ""}
                  {" - "}
                  {projects?.budget_max
                    ? `${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD"
                      }).format(projects?.budget_max)}`
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
                  {projects?.project_category || "-"}
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
                    ? servicesOption.map((service) => service.label).join(", ")
                    : "-"}
                </span>
              </div>
            </div>
            <div className="row ">
              <div className="col-lg-3 col-6 col-sm-4 text-start">
                <span className="form-label">{t("itemsForm.description")}</span>
              </div>
              <div className="col-1 p-0 align-self-center">
                <span className="colon form-label">:</span>
              </div>
              <div className="col-lg-3 col-4 col-sm-4 text-start p-0">
                <span className="form-label">
                  {projects?.description || "-"}
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
          {projects?.documents?.length > 0 ? (
            <div className="col-11 mx-4 my-3">
              <div className="row">
                {projects?.documents.map((document, index) => {
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
        <div></div>
      </Card.Body>
    </>
  );
};

export default ProjectDetails;
