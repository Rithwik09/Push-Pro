import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import Link from "next/link";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";

const ProjectDocumentForm = ({
  t,
  rows,
  handleAddRow,
  handleDocumentsSkipClick,
  handleDocumentsBackClick,
  handleDocumentsNextClick,
  handleRowChange,
  handleDeleteRow,
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
    <div className="height-scrollable">
      <Row className="mb-3">
        <Col xl={12} className=" mb-3">
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
          <Col xl={10}>
            <Form.Label htmlFor="requirementsLabel" className="form-label me-2">
              <span className="fw-bold"> {t("requirements.note")}: </span>
              {t("requirements.requirementsDocumentsNote")}
            </Form.Label>
            <div className="table-responsive d-flex vertical-table">
              <table className="table text-nowrap table-bordered">
                <thead>
                  <tr className="text-center">
                    <th scope="col">{t("certificatesForm.title")}</th>
                    <th scope="col">{t("project.document")}</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {imgData.map((doc, index) => (
                    <tr key={`existing-${index}`}>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <InputGroup>
                            <Form.Control
                              type="text"
                              id={`projectTitle-${doc.id}`}
                              name="projectTitle"
                              className={`form-control`}
                              value={doc.title}
                              onChange={(e) =>
                                handleRowChange(index, "title", e.target.value)
                              }
                            />
                          </InputGroup>
                        </div>
                      </th>
                      <td>
                        {doc.file_url && (
                          <>
                            <span>
                              {(() => {
                                const filename = doc.file_url.split("/").pop();
                                const [name, extension] = filename.split(".");
                                if (name.length > 3) {
                                  const reversedName = name
                                    .split("")
                                    .reverse()
                                    .join("");
                                  const shortName = reversedName.substring(
                                    0,
                                    10
                                  );
                                  return `${shortName
                                    .split("")
                                    .reverse()
                                    .join("")}.${extension}`;
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
                      </td>
                      <td>
                        <div className="hstack gap-2 flex-wrap">
                          <Link
                            href={`/myprojects/edit/${newProjectID}/requirements`}
                            as={`/myprojects/edit/${newProjectID}/requirements`}
                            className="text-danger fs-19 lh-1"
                            onClick={() => handleDoc(doc.id)}
                          >
                            <i className="ri-delete-bin-5-line"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <InputGroup>
                            <Form.Control
                              type="text"
                              id={`projectTitle-${row.id}`}
                              name="projectTitle"
                              className="form-control"
                              value={row.title || ""} // Ensuring empty string for new row
                              onChange={(e) =>
                                handleRowChange(index, "title", e.target.value)
                              }
                            />
                          </InputGroup>
                        </div>
                      </th>
                      <td>
                        <InputGroup>
                          <Form.Control
                            type="file"
                            name="document"
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                "document",
                                e.target.files[0]
                              )
                            }
                          />
                        </InputGroup>
                        {errors[row.id]?.document && (
                          <div className="text-danger">
                            {errors[row.id].document}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="hstack gap-2 flex-wrap">
                          {rows.length > 1 && (
                            <Link
                              href={`/myprojects/edit/${newProjectID}/requirements`}
                              as={`/myprojects/edit/${newProjectID}/requirements`}
                              className="text-danger fs-19 lh-1"
                              onClick={() => handleDeleteRow(index)}
                            >
                              <i className="ri-delete-bin-5-line"></i>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cw-20">
                <Button
                  className="btn btn-primary me-2 schedule-back mt-5 ms-3"
                  type="button"
                  onClick={handleAddRow}
                >
                  + {t("buttons.addMore")}
                </Button>
              </div>
            </div>
          </Col>
        ) : null}
      </Row>
      <Row className="fixed-buttons">
        <Col className="d-flex justify-content-end">
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

export default ProjectDocumentForm;
