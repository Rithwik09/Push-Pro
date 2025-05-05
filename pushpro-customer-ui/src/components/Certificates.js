import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Table
} from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import * as yup from "yup";
import { useTranslation } from "react-i18next";

const Certificates = () => {
  const { t, i18n } = useTranslation();
  const [primary, setprimary] = useState("on");
  const [certificates, setCertificates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const schema = yup.object().shape({
    selectedFile: yup
      .mixed()
      .nullable()
      .required(`${t("certificatesForm.validateCertificateFile")}`)
  });

  useEffect(() => {
    setErrors({});
  }, [i18n.language]);

  const handleFileChange = (fileType) => {
    setFileType(fileType);
    setShowModal(true);
  };

  const handleSaveFile = async () => {
    try {
      await schema.validate({ selectedFile }, { abortEarly: false });
      let finalFileName = fileName.trim();
      if (!finalFileName) {
        const timestamp = new Date().getTime();
        const fileExtensionIndex = selectedFile.name.lastIndexOf(".");
        const fileExtension = selectedFile.name.substring(fileExtensionIndex);
        const fileNameWithoutExtension = selectedFile.name.substring(
          0,
          fileExtensionIndex
        );
        finalFileName = `${fileNameWithoutExtension}`;
      }

      // Validate form inputs
      await schema.validate({ selectedFile }, { abortEarly: false });
      const newFile = {
        file: selectedFile,
        fileName: finalFileName,
        isVisible
      };
      if (fileType === "license") {
        setCertificates((prevFiles) => [...prevFiles, newFile]);
      } else if (fileType === "insurance") {
        setInsuranceFiles((prevFiles) => [...prevFiles, newFile]);
      }
      setShowModal(false);
      setFileName("");
      setIsVisible(false);
      setSelectedFile(null);
      setErrors({});
    } catch (err) {
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
    }
  };

  const handleFileView = (file) => {
    const blobUrl = URL.createObjectURL(file);
    window.open(blobUrl, "_blank");
  };

  const handleFileCancel = (type, index) => {
    setCertificates((prevFiles) => prevFiles.filter((file, i) => i !== index));
  };
  const handleVisibilityToggle = (index) => {
    if (index >= 0 && index < certificates.length) {
      // Check if the index is valid
      const updatedCertificates = [...certificates];
      updatedCertificates[index].isVisible =
        !updatedCertificates[index].isVisible;
      setCertificates(updatedCertificates);
    } else {
      console.error("Invalid index provided to handleVisibilityToggle");
    }
  };

  return (
    <>
      <Row className="mb-3">
        <Col xl={7}>
          <Form.Label htmlFor="license" className="form-label fs-14">
            {t("certificatesForm.certificates")}{" "}
          </Form.Label>
        </Col>
      </Row>
      {certificates.length === 0 ? (
        <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
      ) : (
        <Table className="table text-nowrap table-bordered">
          <thead>
            <tr>
              <th>{t("general.srNumber")}</th>
              <th>{t("certificatesForm.title")}</th>
              <th>{t("certificatesForm.visibleOnProfile")}</th>
              <th>{t("general.action")}</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((file, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{file.fileName}</td>
                <td>
                  <div
                    className={`toggle ${file.isVisible ? "on" : "off"}`}
                    onClick={() => handleVisibilityToggle(index)}
                  >
                    <span></span>
                  </div>
                </td>
                <td className="d-flex">
                  <i
                    title="View Certificates File"
                    className="ms-2 btn-sm btn btn-primary-light"
                    onClick={() => handleFileView(file.file)}
                  >
                    <i className="ri-eye-line"></i>
                  </i>
                  <i
                    title="Delete Certificates File"
                    className="ms-1 btn-sm btn btn-danger-light"
                    onClick={() => handleFileCancel("license", index)}
                  >
                    <i className="ri-delete-bin-5-line"></i>
                  </i>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Row className="mb-3 d-flex justify-content-end mt-2">
        <Col xl={5} className="text-end">
          <Button onClick={() => handleFileChange("license")}>
            {t("buttons.addFile")}
          </Button>
        </Col>
      </Row>

      <Modal show={showModal}>
        <Modal.Header closeButton onClick={() => setShowModal(false)}>
          <Modal.Title>{t("certificatesForm.certificate")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.title")}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={fileName}
                  placeholder={t("certificatesForm.enterTitle")}
                  onChange={(e) => setFileName(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.certificate")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.selectedFile ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="form-control"
                />
              </InputGroup>
              <div className="form-text">
                Allowed file types: .pdf, .jpg, .png. Allowed file size: up to
                10MB.
              </div>
              {errors.selectedFile && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.selectedFile}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <div className="d-flex">
                <Form.Label className="form-label fs-14">
                  {t("certificatesForm.isVisible")}
                </Form.Label>
                <div
                  className={`toggle  ${primary}`}
                  onClick={() => {
                    primary == "on" ? setprimary("off") : setprimary("on");
                  }}
                  checked={isVisible}
                  onChange={() => setIsVisible(!isVisible)}
                >
                  <span></span>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-primary me-2" onClick={handleSaveFile}>
            {t("buttons.save")}
          </Button>
          <Button
            className="btn btn-danger"
            onClick={() => setShowModal(false)}
          >
            {t("buttons.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Certificates;
