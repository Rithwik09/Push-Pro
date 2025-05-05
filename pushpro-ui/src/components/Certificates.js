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
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import useService from "@/hooks/useService";

const Certificates = (props) => {
  const { t, i18n } = useTranslation();
  const service = useService();
  const { handleSuccessDialog } = service;
  const [certificates, setCertificates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileName2, setFileName2] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [fileId, setFileId] = useState({});
  const [isSaveDisabled, setSaveDisabled] = useState(false); // Added state for button disable
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const schema = yup.object().shape({
    fileName: yup.string().required(t("licenseAndInsuranceForm.validateTitle")),
    selectedFile: yup
      .mixed()
      .nullable()
      .required(t("certificatesForm.validateCertificateFile"))
  });

  const Editschema = yup.object().shape({
    fileName2: yup.string().required(t("licenseAndInsuranceForm.validateTitle"))
  });

  useEffect(() => {
    setErrors({});
  }, [i18n.language]);

  const fetchCertificates = async () => {
    setCertificates([]);
    try {
      const response = await service.get("/myprofile/contractor-certificates");
      if (response?.success) {
        setCertificates(response.data);
      }
    } catch (error) {
      setCertificates([]);
    }
  };
  useEffect(() => {
    if (props.active) {
      fetchCertificates();
    }
  }, [props.active]);

  const handleEditModal = async (id) => {
    setShowModal2(true);
    const certificate = certificates.find((cert) => cert.id === id);
    if (certificate) {
      setFileName2(certificate.title);
      setIsVisible2(certificate.visible_on_profile);
    }
    setFileId(id);
  };

  const handleEditFile = async (e) => {
    e.preventDefault();
    const id = fileId;
    setSaveDisabled(true);
    try {
      await Editschema.validate({ fileName2 }, { abortEarly: false });
      const formData = new FormData();
      formData.append("title", fileName2);
      if (selectedFile) {
        formData.append("certificate_url", selectedFile);
      }
      formData.append("visibility", isVisible2);
      const response = await service.patch(
        `/myprofile/contractor-certificate/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      setCertificates((prevCertificates) =>
        prevCertificates.map((cert) =>
          cert.id === id
            ? {
                ...cert,
                title: fileName2,
                certificate: selectedFile,
                isVisible
              }
            : cert
        )
      );
      if (response?.success) {
        handleSuccessDialog(response);
        resetModalState2();
        fetchCertificates();
      }
      setSaveDisabled(false);
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else if (err?.response?.data) {
        setErrors({ selectedFile: err?.response?.data?.message });
      }
      console.error("Error Editing Certificate:", err);
      setSaveDisabled(false);
    }
  };

  const handleFileChange = (type) => {
    setFileType(type);
    setShowModal(true);
  };

  const handleSaveFile = async (e) => {
    e.preventDefault();
    setSaveDisabled(true);
    try {
      await schema.validate({ fileName, selectedFile }, { abortEarly: false });
      const finalFileName =
        fileName.trim() || selectedFile.name.split(".").slice(0, -1).join(".");
      const formData = new FormData();
      formData.append("title", finalFileName);
      formData.append("certificate_url", selectedFile);
      formData.append("visibility", isVisible);
      const response = await service.post(
        "/myprofile/contractor-certificate/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      if (response?.success) {
        setCertificates((prev) => [...prev, response.data]);
        setErrors({});
        fetchCertificates();
        handleSuccessDialog(response);
        resetModalState();
      }
      setSaveDisabled(false);
    } catch (err) {
      if (err.inner && err.inner.length > 0) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else if (err?.response && err?.response?.data) {
        setErrors({ selectedFile: err.response.data.message });
      }
      console.error("Error Adding Certificate:", err);
      setSaveDisabled(false);
    }
  };

  const resetModalState = () => {
    setShowModal(false);
    setFileName("");
    setSelectedFile(null);
    setErrors({});
  };

  const resetModalState2 = () => {
    setShowModal2(false);
    setFileName2("");
    setSelectedFile(null);
    setErrors({});
  };

  const handleFileView = (file) => {
    const blobUrl = file;
    window.open(blobUrl, "_blank");
  };

  const handleDelete = async (id) => {
    try {
      const response = await service.delete(
        `/myprofile/contractor-certificate/delete/${id}`
      );
      if (response?.success) {
        fetchCertificates();
        handleSuccessDialog(response);
      }
    } catch (error) {
      if (err.inner && err.inner.length > 0) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      }
      console.error("Error Deleting Certificate:", error);
    }
  };

  const handleVisibilityToggle = (index) => {
    setCertificates((prev) =>
      prev.map((file, i) =>
        i === index
          ? { ...file, visible_on_profile: !file.visible_on_profile }
          : file
      )
    );
  };

  return (
    <>
      <Row className="mb-3">
        <Col xl={7}>
          <Form.Label htmlFor="license" className="form-label fs-14">
            {t("certificatesForm.certificates")}
          </Form.Label>
        </Col>
      </Row>
      {certificates.length === 0 ? (
        <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th width="10%">{t("general.srNumber")}</th>
                <th>{t("certificatesForm.title")}</th>
                <th>{t("licenseAndInsuranceForm.visibleOnProfile")}</th>
                <th width="15%">{t("general.action")}</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((file, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{file.title}</td>
                  <td>
                    {file.visible_on_profile
                      ? t("licenseAndInsuranceForm.yes")
                      : t("licenseAndInsuranceForm.no")}
                  </td>
                  <td className="d-flex">
                    <i
                      title="View Certificates"
                      className="ms-1 btn-sm btn btn-primary-light"
                      onClick={() =>
                        handleFileView(`${s3BasePath}${file.certificate_url}`)
                      }
                    >
                      <i className="ri-eye-line"></i>
                    </i>
                    <i
                      title="Edit Certificates"
                      className="ms-1 btn-sm btn btn-primary-light"
                      onClick={() => handleEditModal(file.id)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </i>
                    <i
                      title="Delete Certificates"
                      className="ms-1 btn-sm btn btn-danger-light"
                      onClick={() => handleDelete(file.id)}
                    >
                      <i className="ri-delete-bin-5-line"></i>
                    </i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Row className="mb-3 d-flex justify-content-end mt-2">
        <Col xl={5} className="text-end">
          <Button onClick={() => handleFileChange("license")}>
            {t("buttons.addFile")}
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={resetModalState}>
        <Modal.Header closeButton>
          <Modal.Title>{t("certificatesForm.certificate")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3" onSubmit={handleSaveFile}>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.title")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={errors.fileName ? "border border-danger" : ""}
              >
                <Form.Control
                  type="text"
                  value={fileName}
                  placeholder={t("certificatesForm.enterTitle")}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </InputGroup>
              {errors.fileName && (
                <div className="error-message text-danger">
                  {errors.fileName}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.certificate")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={errors.selectedFile ? "border border-danger" : ""}
              >
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </InputGroup>
              <div className="form-text">{t("general.allowedFileTypes")}</div>
              {errors.selectedFile && (
                <div className="error-message text-danger">
                  {errors.selectedFile}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.isVisible")}
              </Form.Label>
              <div
                className={`toggle ${isVisible ? "on" : "off"}`}
                onClick={() => setIsVisible(!isVisible)}
              >
                <span></span>
              </div>
            </div>
            <div className="col-md-12 text-end">
              <Button type="submit" className="me-2" disabled={isSaveDisabled}>
                {t("buttons.save")}
              </Button>
              <Button variant="danger" onClick={resetModalState}>
                {t("buttons.cancel")}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      {/* Edit */}
      <Modal show={showModal2} onHide={resetModalState2}>
        <Modal.Header closeButton>
          <Modal.Title>{t("certificatesForm.editCertificate")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3" onSubmit={handleEditFile}>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.title")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={errors.fileName2 ? "border border-danger" : ""}
              >
                <Form.Control
                  type="text"
                  value={fileName2}
                  placeholder={t("certificatesForm.enterTitle")}
                  onChange={(e) => setFileName2(e.target.value)}
                />
              </InputGroup>
              {errors.fileName2 && (
                <div className="error-message text-danger">
                  {errors.fileName2}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.certificate")}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </InputGroup>
              <div className="form-text">{t("general.allowedFileTypes")}</div>
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("certificatesForm.isVisible")}
              </Form.Label>
              <div
                className={`toggle ${isVisible2 ? "on" : "off"}`}
                onClick={() => setIsVisible2((prevState) => !prevState)}
              >
                <span></span>
              </div>
            </div>
            <div className="col-md-12 text-end">
              <Button type="submit" className="me-2" disabled={isSaveDisabled}>
                {t("buttons.save")}
              </Button>
              <Button variant="danger" onClick={resetModalState2}>
                {t("buttons.cancel")}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Certificates;
