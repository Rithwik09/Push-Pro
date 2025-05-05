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
import DatePicker from "react-datepicker";
import dynamic from "next/dynamic";
import "react-datepicker/dist/react-datepicker.css";
import * as yup from "yup";
import industry from "../../shared/data/json/industry.json";
import { useTranslation } from "react-i18next";
import statesData from "../../shared/data/json/us-statelist.json";

const Select = dynamic(() => import("react-select"), { ssr: false });

const LicenseAndInsurance = () => {
  const { t, i18n } = useTranslation();
  const [primary1, setprimary1] = useState("off");
  const [primary2, setprimary2] = useState("off");
  const [statesOptions, setStatesOptions] = useState([]);
  const [licenseFiles, setLicenseFiles] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [licenceNumber, setLicenseNumber] = useState("");
  const [licenceState, setLicenseState] = useState([]);
  const [fileExpiry, setFileExpiry] = useState(new Date());
  const [fileExpiry2, setFileExpiry2] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null);
  const [errors, setErrors] = useState({});
  const [industryOptions, setIndustryOptions] = useState([]);
  const [insuranceVisible, setInsuranceVisible] = useState([]);

  let licenseSchema = yup.object().shape({
    licenceNumber: yup
      .string()
      .required(`${t("licenseAndInsuranceForm.validateLicenseNumber")}`),
    selectedFile: yup
      .mixed()
      .nullable()
      .required(`${t("licenseAndInsuranceForm.validateLicenseFile")}`),
    fileExpiry: yup
      .date()
      .required(`${t("licenseAndInsuranceForm.validateExpirationDate")}`)
  });
  if (primary2 === "off") {
    licenseSchema = licenseSchema.concat(
      yup.object().shape({
        licenceState: yup
          .array()
          .required(`${t("licenseAndInsuranceForm.validateLicenseState")}`)
          .min(1, `${t("licenseAndInsuranceForm.validateLicenseState")}`)
      })
    );
  }
  let editLicenseSchema = yup.object().shape({
    licenceNumber: yup
      .string()
      .required(`${t("licenseAndInsuranceForm.validateLicenseNumber")}`),
    fileExpiry: yup
      .date()
      .required(`${t("licenseAndInsuranceForm.validateExpirationDate")}`)
  });
  if (primary2 === "off") {
    editLicenseSchema = editLicenseSchema.concat(
      yup.object().shape({
        licenceState: yup
          .array()
          .required(`${t("licenseAndInsuranceForm.validateLicenseState")}`)
          .min(1, `${t("licenseAndInsuranceForm.validateLicenseState")}`)
      })
    );
  }
  const insuranceSchema = yup.object().shape({
    selectedFile2: yup
      .mixed()
      .nullable()
      .required(`${t("licenseAndInsuranceForm.validateInsurance")}`),
    fileExpiry2: yup
      .date()
      .required(`${t("licenseAndInsuranceForm.validateExpirationDate")}`)
  });

  useEffect(() => {
    const options = Object.entries(statesData).map(([value, label]) => ({
      value,
      label
    }));
    setStatesOptions(options);
  }, []);
  useEffect(() => {
    const storedOptions = JSON.parse(localStorage.getItem("industry"));
    if (storedOptions && storedOptions.length > 0) {
      setIndustryOptions(storedOptions);
    }
  }, []);

  useEffect(() => {
    if (primary2 === "off") {
      setLicenseState(null);
    }
  }, [primary2]);

  const handleFileChange = (fileType) => {
    setFileType(fileType);
    setShowModal(true);
  };
  const handleFileChange2 = (fileType) => {
    setFileType(fileType);
    setShowModal2(true);
  };
  const handleEditFile = () => {
    setShowEditModal(true);
  };

  useEffect(() => {
    setErrors({});
  }, [i18n.language]);

  const handleSaveFileLicense = async () => {
    try {
      await licenseSchema.validate(
        { selectedFile, licenceNumber, licenceState, fileExpiry },
        { abortEarly: false }
      );
      let finalFileName = fileName.trim();
      localStorage.setItem("industry", JSON.stringify(industryOptions));
      if (!finalFileName) {
        const fileExtensionIndex = selectedFile.name.lastIndexOf(".");
        const fileNameWithoutExtension = selectedFile.name.substring(
          0,
          fileExtensionIndex
        );
        finalFileName = `${fileNameWithoutExtension}`;
      }
      const newFile = {
        file: selectedFile,
        fileName: finalFileName,
        selectedIndustry,
        licenceState,
        licenceNumber,
        selectedIndustry,
        fileExpiry,
        isVisible,
        industry: selectedIndustry,
        toggleState: true
      };

      setLicenseFiles((prevFiles) => [...prevFiles, newFile]);

      setShowModal(false);
      setShowModal2(false);
      setFileName("");
      setFileExpiry(new Date());
      setIsVisible(false);
      setSelectedFile(null);
      setErrors({});
    } catch (err) {
      console.error(err);
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
    }
  };
  const handleEditFileLicense = async () => {
    try {
      await editLicenseSchema.validate(
        { licenceNumber, licenceState, fileExpiry },
        { abortEarly: false }
      );
      setShowEditModal(false);
      setFileName("");
      setIsVisible(false);
      setSelectedFile(null);
      setErrors({});
    } catch (err) {
      console.error(err);
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
    }
  };

  const handleSaveFileInsurance = async () => {
    try {
      await insuranceSchema.validate(
        { fileName, selectedFile2, fileExpiry2 },
        { abortEarly: false }
      );
      let finalFileName = fileName.trim();
      localStorage.setItem("industry", JSON.stringify(industryOptions));
      if (!finalFileName) {
        const fileExtensionIndex = selectedFile2.name.lastIndexOf(".");
        const fileNameWithoutExtension = selectedFile2.name.substring(
          0,
          fileExtensionIndex
        );
        finalFileName = `${fileNameWithoutExtension}`;
      }
      const newFile = {
        file: selectedFile2,
        fileName: finalFileName,
        fileExpiry,
        isVisible,
        toggleState: true
      };

      setInsuranceFiles((prevFiles) => [...prevFiles, newFile]);

      setShowModal(false);
      setShowModal2(false);
      setFileName("");
      setFileExpiry(new Date());
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
  const handleVisibilityToggle = (type, index) => {
    if (type === "license") {
      const updatedFiles = [...licenseFiles];
      updatedFiles[index].isVisible = !updatedFiles[index].isVisible;
      setLicenseFiles(updatedFiles);
    } else if (type === "insurance") {
      const updatedVisibility = [...insuranceVisible];
      updatedVisibility[index] = !updatedVisibility[index];
      setInsuranceVisible(updatedVisibility);
    }
  };

  const handleFileCancel = (type, index) => {
    if (type === "license") {
      setLicenseFiles((prevFiles) =>
        prevFiles.filter((file, i) => i !== index)
      );
    } else if (type === "insurance") {
      setInsuranceFiles((prevFiles) =>
        prevFiles.filter((file, i) => i !== index)
      );
    }
  };

  const handleDateChange = (date) => {
    setFileExpiry(date);
  };
  const handleDateChange2 = (date) => {
    setFileExpiry2(date);
  };

  return (
    <>
      <Row className="mb-3">
        <Col xl={7}>
          <Form.Label htmlFor="license" className="form-label fs-14">
            {" "}
            {t("licenseAndInsuranceForm.licenses")}{" "}
          </Form.Label>
        </Col>
      </Row>
      {licenseFiles.length === 0 ? (
        <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
      ) : (
        <div className="table-responsive">
          <Table className="table table-bordered">
            <thead>
              <tr className="text-nowrap">
                <th>{t("general.srNumber")}</th>
                <th>{t("licenseAndInsuranceForm.name")}</th>
                <th>{t("licenseAndInsuranceForm.licenceNumber")}</th>
                <th>{t("licenseAndInsuranceForm.licenceState")}</th>
                <th>{t("licenseAndInsuranceForm.expiryDate")}</th>
                <th>{t("general.action")}</th>
              </tr>
            </thead>
            <tbody>
              {licenseFiles.map((file, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{file.selectedIndustry}</td>
                  <td>{file.licenceNumber}</td>
                  <td>
                    {file.licenceState !== null
                      ? file.licenceState.join(", ")
                      : ""}
                  </td>
                  <td>{file.fileExpiry.toLocaleDateString()}</td>
                  <td className="d-flex">
                    <i
                      title="View License File"
                      className="ms-2 btn-sm btn btn-primary-light"
                      onClick={() => handleFileView(file.file)}
                    >
                      <i className="ri-eye-line"></i>
                    </i>
                    <i
                      title="Edit License File"
                      className="ms-2 btn-sm btn btn-primary-light"
                      onClick={() => handleEditFile()}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </i>
                    <i
                      title="Delete License File"
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
        </div>
      )}
      <Row className="mb-3 d-flex justify-content-end mt-2">
        <Col xl={5} className="text-end">
          <Button onClick={() => handleFileChange("license")}>
            {t("buttons.addFile")}
          </Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col xl={7}>
          <Form.Label htmlFor="insurance" className="form-label fs-14">
            {t("licenseAndInsuranceForm.insurance")}
          </Form.Label>
        </Col>
      </Row>
      {insuranceFiles.length === 0 ? (
        <div>{t("licenseAndInsuranceForm.noDocumentsFound")}</div>
      ) : (
        <div className="table-responsive">
          <Table className="table table-bordered">
            <thead>
              <tr className="text-nowrap">
                <th>{t("general.srNumber")}</th>
                <th>{t("certificatesForm.title")}</th>
                <th>{t("licenseAndInsuranceForm.expiryDate")}</th>
                <th>{t("licenseAndInsuranceForm.visibleOnProfile")}</th>
                <th>{t("general.action")}</th>
              </tr>
            </thead>
            <tbody>
              {insuranceFiles.map((file, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{file.fileName}</td>
                  <td>{file.fileExpiry.toLocaleDateString()}</td>
                  <td>
                    <div
                      className={`toggle ${
                        insuranceVisible[index] ? "on" : "off"
                      }`}
                      onClick={() => handleVisibilityToggle("insurance", index)}
                    >
                      <span></span>
                    </div>
                  </td>
                  <td className="d-flex">
                    <i
                      title="View Insurance File"
                      className="ms-1 btn-sm btn btn-primary-light"
                      onClick={() => handleFileView(file.file)}
                    >
                      <i className="ri-eye-line"></i>
                    </i>
                    <i
                      title="Delete Insurance File"
                      className="ms-1 btn-sm btn btn-danger-light"
                      onClick={() => handleFileCancel("insurance", index)}
                    >
                      <i className="ri-delete-bin-5-line"></i>
                    </i>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <Row className="mb-3 d-flex justify-content-end mt-2">
        <Col xl={5} className="text-end">
          <Button onClick={() => handleFileChange2("insurance")}>
            {t("buttons.addFile")}
          </Button>
        </Col>
      </Row>

      {/* Add file */}
      <Modal show={showModal}>
        <Modal.Header closeButton onClick={() => setShowModal(false)}>
          <Modal.Title>{t("licenseAndInsuranceForm.license")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.name")}
              </Form.Label>
              <InputGroup>
                <Select
                  placeholder={t("licenseAndInsuranceForm.enterName")}
                  isSearchable={true}
                  name="industry"
                  options={industry}
                  className="default basic-multi-select w-100"
                  id="choices-multiple-default"
                  onChange={(selectedOption) =>
                    setSelectedIndustry(selectedOption.label)
                  }
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                />
              </InputGroup>
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.licenceNumber")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.licenceNumber ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="text"
                  value={licenceNumber}
                  placeholder={t("licenseAndInsuranceForm.enterLicenceNumber")}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
              {errors.licenceNumber && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.licenceNumber}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <div className="d-flex mt-2">
                <Form.Label className="form-label fs-14">
                  {t("general.nationWide")}
                </Form.Label>
                <div
                  className={`toggle  ${primary2}`}
                  onClick={() => {
                    primary2 == "on" ? setprimary2("off") : setprimary2("on");
                  }}
                  onChange={() => setIsVisible(!isVisible)}
                  checked={isVisible}
                >
                  <span></span>
                </div>
              </div>
            </div>
            {primary2 === "off" && (
              <div className="col-md-12">
                <Form.Label className="form-label fs-14">
                  {t("licenseAndInsuranceForm.licenceState")}
                  <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup
                  className={`d-inline-block ${
                    errors.licenceState ? "border border-danger" : ""
                  }`}
                >
                  <Select
                    placeholder={t(
                      "licenseAndInsuranceForm.selectLicenceState"
                    )}
                    isSearchable={true}
                    name="states"
                    options={statesOptions}
                    onChange={(selectedOptions) => {
                      if (selectedOptions) {
                        const selectedLabels = selectedOptions.map(
                          (option) => option.label
                        );
                        setLicenseState(selectedLabels);
                      } else {
                        setLicenseState([]);
                      }
                    }}
                    isMulti
                    className="basic-multi-select"
                    menuPlacement="auto"
                    classNamePrefix="Select2"
                  />
                </InputGroup>
                {errors.licenceState && (
                  <div
                    type="invalid"
                    variant="danger"
                    className="error-message text-danger"
                  >
                    {errors.licenceState}
                  </div>
                )}
              </div>
            )}
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.licenseFile")}
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
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.expiryDate")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.fileExpiry ? "border border-danger" : ""}`}
              >
                <DatePicker
                  selected={fileExpiry}
                  onChange={handleDateChange}
                  dateFormat="MM/dd/yyyy"
                />
              </InputGroup>
              {errors.fileExpiry && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.fileExpiry}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <div className="d-flex mt-2">
                <Form.Label className="form-label fs-14">
                  {t("licenseAndInsuranceForm.isVisible")}
                </Form.Label>
                <div
                  className={`toggle  ${primary1}`}
                  onClick={() => {
                    primary1 == "on" ? setprimary1("off") : setprimary1("on");
                  }}
                  onChange={() => setIsVisible(!isVisible)}
                  checked={isVisible}
                >
                  <span></span>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-primary me-2"
            onClick={handleSaveFileLicense}
          >
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
      {/* Edit file Modal */}
      <Modal show={showEditModal}>
        <Modal.Header closeButton onClick={() => setShowEditModal(false)}>
          <Modal.Title>
            {t("licenseAndInsuranceForm.editLicenseFile")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.name")}
              </Form.Label>
              <InputGroup>
                <Select
                  placeholder={t("licenseAndInsuranceForm.enterName")}
                  isSearchable={true}
                  name="industry"
                  options={industry}
                  defaultValue={industry[0]}
                  className="default basic-multi-select w-100"
                  id="choices-multiple-default"
                  onChange={(selectedOption) =>
                    setSelectedIndustry(selectedOption.label)
                  }
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                />
              </InputGroup>
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.licenceNumber")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.licenceNumber ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="text"
                  value={licenceNumber}
                  placeholder={t("licenseAndInsuranceForm.enterLicenceNumber")}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
              {errors.licenceNumber && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.licenceNumber}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <div className="d-flex mt-2">
                <Form.Label className="form-label fs-14">
                  {t("general.nationWide")}
                </Form.Label>
                <div
                  className={`toggle  ${primary2}`}
                  onClick={() => {
                    primary2 == "on" ? setprimary2("off") : setprimary2("on");
                  }}
                  onChange={() => setIsVisible(!isVisible)}
                  checked={isVisible}
                >
                  <span></span>
                </div>
              </div>
            </div>
            {primary2 === "off" && (
              <div className="col-md-12">
                <Form.Label className="form-label fs-14">
                  {t("licenseAndInsuranceForm.licenceState")}
                  <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup
                  className={`d-inline-block ${
                    errors.fileExpiry ? "border border-danger" : ""
                  }`}
                >
                  <Select
                    placeholder={t(
                      "licenseAndInsuranceForm.selectLicenceState"
                    )}
                    isSearchable={true}
                    name="states"
                    options={statesOptions}
                    onChange={(selectedOptions) => {
                      if (selectedOptions) {
                        const selectedLabels = selectedOptions.map(
                          (option) => option.label
                        );
                        setLicenseState(selectedLabels);
                      } else {
                        setLicenseState([]);
                      }
                    }}
                    isMulti
                    className="basic-multi-select"
                    menuPlacement="auto"
                    classNamePrefix="Select2"
                  />
                </InputGroup>
                {errors.licenceState && (
                  <div
                    type="invalid"
                    variant="danger"
                    className="error-message text-danger"
                  >
                    {errors.licenceState}
                  </div>
                )}
              </div>
            )}
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.licenseFile")}
                {/* <span className='text-danger'>*</span> */}
              </Form.Label>
              <InputGroup>
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
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.expiryDate")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.fileExpiry ? "border border-danger" : ""}`}
              >
                <DatePicker
                  selected={fileExpiry}
                  onChange={handleDateChange}
                  dateFormat="MM/dd/yyyy"
                />
              </InputGroup>
              {errors.fileExpiry && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.fileExpiry}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <div className="d-flex">
                <Form.Label className="form-label fs-14">
                  {t("licenseAndInsuranceForm.isVisible")}
                </Form.Label>
                <div
                  className={`toggle  ${primary1}`}
                  onClick={() => {
                    primary1 == "on" ? setprimary1("off") : setprimary1("on");
                  }}
                  onChange={() => setIsVisible(!isVisible)}
                  checked={isVisible}
                >
                  <span></span>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-primary me-2"
            onClick={() => handleEditFileLicense()}
          >
            {t("buttons.save")}
          </Button>
          <Button
            className="btn btn-danger"
            onClick={() => setShowEditModal(false)}
          >
            {t("buttons.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Insurance Add file */}
      <Modal show={showModal2}>
        <Modal.Header closeButton onClick={() => setShowModal2(false)}>
          <Modal.Title>{t("licenseAndInsuranceForm.insurance")}</Modal.Title>
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
                  placeholder={t("licenseAndInsuranceForm.titlePlaceHolder")}
                  onChange={(e) => setFileName(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.insuranceFile")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.selectedFile2 ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile2(e.target.files[0])}
                  className="form-control"
                />
              </InputGroup>
              <div className="form-text">
                Allowed file types: .pdf, .jpg, .png. Allowed file size: up to
                10MB.
              </div>
              {errors.selectedFile2 && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.selectedFile2}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.expiryDate")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.fileExpiry2 ? "border border-danger" : ""
                }`}
              >
                <DatePicker
                  selected={fileExpiry2}
                  onChange={handleDateChange2}
                  dateFormat="MM/dd/yyyy"
                />
              </InputGroup>
              {errors.fileExpiry2 && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.fileExpiry2}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <div className="d-flex">
                <Form.Label className="form-label fs-14">
                  {t("licenseAndInsuranceForm.isVisible")}
                </Form.Label>
                <div
                  className={`toggle ${primary1}`}
                  onClick={() => setprimary1(primary1 === "on" ? "off" : "on")}
                  checked={isVisible}
                >
                  <span></span>
                </div>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn btn-primary me-2"
            onClick={handleSaveFileInsurance}
          >
            {t("buttons.save")}
          </Button>
          <Button
            className="btn btn-danger"
            onClick={() => setShowModal2(false)}
          >
            {t("buttons.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LicenseAndInsurance;
