import React, { useState, useEffect } from "react";
import { Button, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import Link from "next/link";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";

const ProjectDocumentFormMobile = ({
  t,
  rows,
  handleAddRow,
  handleDocumentsSkipClick,
  handleDocumentsBackClick,
  handleDocumentsNextClick,
  handleDeleteRow,
  handleRowChange,
  id,
  respData
}) => {
  const [imgData, setImgData] = useState(
    respData?.data?.documents?.filter(
      (doc) =>
        doc.file_url &&
        doc.file_url.trim() !== "" &&
        doc.title &&
        doc.title.trim() !== ""
    ) || []
  );
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [documentPreference, setDocumentPreference] = useState("off");
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const router = useRouter();
  const newProjectID = router.query.projectID || id;
  const service = useService();

  const toggleDocumentPreference = () => {
    const newPreference = documentPreference === "on" ? "off" : "on";
    setDocumentPreference(newPreference);
    if (newPreference === "on") {
      setImgData(
        respData?.data?.documents?.filter(
          (doc) =>
            doc.file_url &&
            doc.file_url.trim() !== "" &&
            doc.title &&
            doc.title.trim() !== ""
        ) || []
      );
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      setImgData([]);
    };
  }, [newProjectID]);

  const fetchData = async () => {
    try {
      const id = newProjectID;
      const response = await service.get(`/project/${id}`);
      if (response?.success && response?.data) {
        setImgData(
          response?.data?.documents?.filter(
            (doc) =>
              doc.file_url &&
              doc.file_url.trim() !== "" &&
              doc.title &&
              doc.title.trim() !== ""
          ) || []
        );
      }
    } catch (error) {
      console.error("Fetch Data Error : ", error);
    }
  };

  const handleDoc = async (file_id) => {
    file_id = parseInt(file_id);
    try {
      const response = await service.delete(`/document/delete/${file_id}`);
      if (response?.success) {
        setImgData((prevImgData) =>
          prevImgData.filter((doc) => doc.id !== file_id)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    for (let row of rows) {
      if (!row.document) continue;
      const formData = new FormData();
      formData.append("title", row.title);
      formData.append("file_url", row.document);
      const id = newProjectID;
      try {
        const response = await service.post(
          `/document/create/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
        if (response?.success) {
          setImgData((prevImgData) => [...prevImgData, response?.data]);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    rows.forEach((row, index) => {
      handleRowChange(index, "document", null);
    });
    setIsUploading(false);
    handleDocumentsNextClick();
  };

  return (
    <div className="">
      <Col xl={12} className="mb-3">
        <Form.Label
          htmlFor="requirementsLabel"
          className="form-label me-2 d-flex "
        >
          {t("requirements.requirementsDocumentsText")}
          <div
            id="schedulePreference"
            className={`toggle ${documentPreference}`}
            onClick={toggleDocumentPreference}
          >
            <span></span>
          </div>
        </Form.Label>
      </Col>
      {documentPreference === "on" ? (
        <div className="">
          <Form.Label htmlFor="requirementsLabel" className="form-label me-2">
            <span className="fw-bold"> {t("requirements.note")}: </span>
            {t("requirements.requirementsDocumentsNote")}
          </Form.Label>
          {imgData.map((doc, index) => (
            <div key={doc.id} className="mb-3">
              <div className="custom-border p-3">
                <div className="hstack gap-2 flex-wrap justify-content-end">
                  <Link
                    href="#"
                    className="text-danger fs-19 lh-1"
                    onClick={() => handleDoc(doc.id)}
                  >
                    <i className="ri-delete-bin-5-line"></i>
                  </Link>
                </div>
                <Row className="mb-3 align-items-center">
                  <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={4}>
                    <label htmlFor="startDate" className="form-label fs-14">
                      Title
                    </label>
                  </Col>
                  <Col xxl={8} xl={5} lg={5} md={6} sm={7} xs={8}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        id={`projectTitle-${doc.id}`}
                        name="projectTitle"
                        className={`form-control`}
                        value={
                          doc.title
                            ? `${doc.title}`
                            : `${(() => {
                                if (doc.file_url) {
                                  const filename = doc.file_url
                                    .split("/")
                                    .pop();
                                  const [name, extension] = filename.split(".");
                                  if (name.length > 3) {
                                    return `${name.substring(
                                      0,
                                      5
                                    )}...${extension}`;
                                  }
                                  return filename;
                                }
                                return "";
                              })()}`
                        }
                        onChange={(e) =>
                          handleRowChange(index, "title", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="align-items-center">
                  <Col sm={3} xs={4}>
                    <label htmlFor="startDate" className="form-label fs-14">
                      {t("project.document")}
                    </label>
                  </Col>
                  <Col sm={7} xs={8}>
                    {doc.file_url && (
                      <>
                        <span>
                          {(() => {
                            const filename = doc.file_url.split("/").pop();
                            const [name, extension] = filename.split(".");
                            if (name.length > 3) {
                              return `${name.substring(0, 5)}...${extension}`;
                            }
                            return filename;
                          })()}
                        </span>
                        <a
                          href={`${s3BasePath}${doc.file_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i
                            title="View"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                          >
                            <i className="bi bi-eye"></i>
                          </i>
                        </a>
                      </>
                    )}
                  </Col>
                </Row>
              </div>
            </div>
          ))}
          {rows.map((row, index) => (
            <div key={row.id} className="mb-3">
              <div className="custom-border p-3">
                <div className="hstack gap-2 flex-wrap justify-content-end">
                  {rows.length > 1 && (
                    <Link
                      href="#"
                      className="text-danger fs-19 lh-1"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <i className="ri-delete-bin-5-line"></i>
                    </Link>
                  )}
                </div>
                <Row className="mb-3 align-items-center">
                  <Col sm={3} xs={4}>
                    <label htmlFor="startDate" className="form-label fs-14">
                      Title
                    </label>
                  </Col>
                  <Col sm={7} xs={8}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        id={`projectTitle-${row.id}`}
                        name="projectTitle"
                        className={`form-control`}
                        value={row.title}
                        onChange={(e) =>
                          handleRowChange(index, "title", e.target.value)
                        }
                      />
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="align-items-center">
                  <Col sm={3} xs={4}>
                    <label htmlFor="startDate" className="form-label fs-14">
                      {t("project.document")}
                    </label>
                  </Col>
                  <Col sm={7} xs={8}>
                    <InputGroup>
                      <Form.Control
                        type="file"
                        name="document"
                        onChange={(e) =>
                          handleRowChange(index, "document", e.target.files[0])
                        }
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-end mb-5">
            <Button
              className="btn btn-primary me-2 schedule-back mt-2 ms-3"
              type="button"
              onClick={handleAddRow}
            >
              + {t("buttons.addMore")}
            </Button>
          </div>
        </div>
      ) : null}
      <Row className="mb-3 schedule-btnss">
        <Col className="d-flex justify-content-end document-btns">
          {isUploading ? (
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              size="md"
            >
              <span className="visually-hidden">
                {t("projectChat.loading")}
              </span>
            </Spinner>
          ) : (
            <>
              <Button
                className="btn btn-primary me-2 schedule-skip"
                type="button"
                onClick={handleDocumentsSkipClick}
                disabled={isUploading}
              >
                {t("buttons.skip")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-back"
                type="button"
                onClick={handleDocumentsBackClick}
                disabled={isUploading}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {t("buttons.next")}
              </Button>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDocumentFormMobile;
