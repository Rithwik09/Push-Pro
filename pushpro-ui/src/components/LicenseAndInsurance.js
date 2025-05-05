import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Col, Form, InputGroup, Modal, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";

const Select = dynamic(() => import("react-select"), { ssr: false });

const LicenseAndInsurance = (props) => {
  const { t, i18n } = useTranslation();
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [primary1, setprimary1] = useState("off");
  const [primary2, setprimary2] = useState("off");
  const [statesOptions, setStatesOptions] = useState([]);
  const [licenseFiles, setLicenseFiles] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [editInsurance, setEditInsurance] = useState(false);
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileName2, setFileName2] = useState("");
  const [licenceNumber, setLicenseNumber] = useState("");
  const [licenceNumber2, setLicenseNumber2] = useState("77627-IIO");
  const [licenceState, setLicenseState] = useState([]);
  const [editLicenceState, setEditLicenseState] = useState([]);
  const [fileExpiry, setFileExpiry] = useState(new Date());
  const [fileExpiry2, setFileExpiry2] = useState(new Date());
  const [isVisible, setIsVisible] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFile2, setSelectedFile2] = useState(null);
  const [errors, setErrors] = useState({});
  const [industryOptions, setIndustryOptions] = useState([]);
  const [licenseUrl, setLicenseUrl] = useState([]);
  const [dataId, setDataId] = useState("");
  const [userSelectedState, setUserSelectedState] = useState([]);
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";

  const licenseSchema = yup.object().shape({
    selectedIndustry: yup
      .mixed()
      .required(`${t("licenseAndInsuranceForm.validateselectIndustry")}`)
      .test(
        "is-valid-id",
        `${t("licenseAndInsuranceForm.validateselectIndustry")}`,
        (value) => value !== null && value !== undefined && value !== ""
      ),
    selectedFile: yup
      .mixed()
      .nullable()
      .required(`${t("licenseAndInsuranceForm.validateLicenseFile")}`),
    licenceNumber: yup
      .string()
      .required(`${t("licenseAndInsuranceForm.validateLicenseNumber")}`)
      .transform((value) => (typeof value === "string" ? value.trim() : "")), // Ensure the value is a string and trim whitespace
    fileExpiry: yup
      .date()
      .required(`${t("licenseAndInsuranceForm.validateExpirationDate")}`)
      .test(
        "is-future",
        `${t("licenseAndInsuranceForm.validateFutureDate")}`,
        (value) => value > new Date()
      ),
    ...(primary2 === "off"
      ? {
        licenceState: yup
          .array()
          .min(1, `${t("licenseAndInsuranceForm.validateLicenseState")}`)
          .required(`${t("licenseAndInsuranceForm.validateLicenseState")}`)
      }
      : {})
  });

  const editLicenseSchema = yup.object().shape({
    selectedIndustry: yup
      .mixed()
      .nullable()
      .required(t("licenseAndInsuranceForm.validateIndustry")),
    licenceNumber2: yup
      .string()
      .required(t("licenseAndInsuranceForm.validateLicenseNumber")),
    userSelectedState: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.number().required(),
        })
      )
      .test(
        "validate-user-selected-state",
        t("licenseAndInsuranceForm.validateLicenseState"),
        function (value) {
          const { primary2 } = this.options.context; 
          if (primary2 === "off" && (!value || value.length === 0)) {
            return false; 
          }
          return true; 
        }
      ),
    fileExpiry: yup
      .date()
      .required(t("licenseAndInsuranceForm.validateExpirationDate"))
      .test(
        "is-future",
        t("licenseAndInsuranceForm.validateFutureDate"),
        (value) => value > new Date()
      ),
  });   

  const insuranceSchema = yup.object().shape({
    fileName: yup
      .string()
      .transform((value) => (typeof value === "string" ? value.trim() : ""))
      .required(`${t("licenseAndInsuranceForm.validateTitle")}`),
    selectedFile2: yup
      .mixed()
      .nullable()
      .required(`${t("licenseAndInsuranceForm.validateInsurance")}`),
    fileExpiry2: yup
      .date()
      .required(`${t("licenseAndInsuranceForm.validateExpirationDate")}`)
      .test(
        "is-future",
        `${t("licenseAndInsuranceForm.validateFutureDate")}`,
        (value) => value > new Date()
      )
  });

  const EditinsuranceSchema = yup.object().shape({
    fileName2: yup
      .string()
      .required(`${t("licenseAndInsuranceForm.validateTitle")}`),
    fileExpiry2: yup
      .date()
      .required(`${t("licenseAndInsuranceForm.validateExpirationDate")}`)
      .test(
        "is-future",
        `${t("licenseAndInsuranceForm.validateFutureDate")}`,
        (value) => value > new Date()
      )
  });

  useEffect(() => {
    if (primary2 === "off") {
      setLicenseState(null);
    }
  }, [primary2]);

  const fetchStates = async () => {
    try {
      const response = await service.get("/states");
      if (response?.success) {
        const state = response?.data?.map((states) => ({
          label: states.name,
          value: states.state_code,
          id: states.id
        }));
        setStatesOptions(state);
      }
    } catch (error) {
      console.error("Error Fetching States : ", error);
    }
  };

  const fetchLicensesData = async () => {
    setLicenseFiles([]);
    try {
      const licenseResponse = await service.get(
        "/myprofile/contractor-licenses"
      );
      if (licenseResponse?.success) {
        const mappedLicenses = licenseResponse.data.map((license) => ({
          id: license.id,
          service_id: license.service_id,
          license_url: license.license_url,
          fileName: `License ${license.id}`,
          nationWide: license.nationwide,
          licenceNumber: license.license_number,
          licenceState: JSON.parse(license.license_states),
          fileExpiry: new Date(license.expiration_date),
          isVisible: license.visible_on_profile
        }));
        setLicenseFiles(mappedLicenses);
      }
    } catch (error) {
      setLicenseFiles([]);
      console.error("Error Fetching License Data:", error);
    }
  };

  const fetchInsuranceData = async () => {
    setInsuranceFiles([]);
    try {
      const insuranceResponse = await service.get(
        "/myprofile/contractor-insurances"
      );
      if (insuranceResponse?.success) {
        const formattedInsuranceData = insuranceResponse.data.map(
          (insurance) => ({
            id: insurance.id,
            insurance_url: insurance.insurance_url,
            fileName: insurance.title,
            fileExpiry: new Date(insurance.expiration_date),
            isVisible: insurance.visible_on_profile
          })
        );
        setInsuranceFiles(formattedInsuranceData);
      }
    } catch (error) {
      setInsuranceFiles([]);
      console.error("Error Fetching Insurance Data:", error);
    }
  };

  const fetchIndustryData = async () => {
    try {
      const industryResponse = await service.get("/services");
      if (industryResponse?.success) {
        const formattedIndustries = industryResponse.data.map((industry) => ({
          label: industry.name,
          value: industry.name,
          id: industry.id
        }));
        setIndustryOptions(formattedIndustries);
      }
    } catch (error) {
      console.error("Error fetching industries:", error);
    }
  };

  useEffect(() => {
    if (props.active) {
      fetchStates();
      fetchLicensesData();
      fetchInsuranceData();
      fetchIndustryData();
    }
  }, [props.active]);

  const handleFileChange = (fileType) => {
    setLicenseNumber([]);
    setFileType(fileType);
    setShowModal(true);
  };
  const handleFileChange2 = (fileType) => {
    setFileType(fileType);
    setShowModal2(true);
    setFileName([]);
  };
  const handleInsuranceEditFile = (id) => {
    setErrors({});
    setEditInsurance(true);
    setDataId(id);
    const insuranceToEdit = insuranceFiles.find(
      (insurance) => insurance.id === id
    );
    if (insuranceToEdit) {
      setFileName2(insuranceToEdit.fileName);
      setFileExpiry2(new Date(insuranceToEdit.fileExpiry));
      setIsVisible(insuranceToEdit.isVisible);
      setSelectedFile2(null); // Reset selected file
    }
  };
  const handleLicenseEditFile = async (id) => {
    setErrors({});
    setSelectedFile(null);
    setShowEditModal(true);
    setDataId(id);
    const file = licenseFiles.find((file) => file.id === id);
    const selectedIndustryOption = industryOptions.find(
      (industry) => industry.id === file.service_id
    );
    setSelectedIndustry(selectedIndustryOption);
    setLicenseNumber2(file.licenceNumber);
    setLicenseUrl(file.license_url);
    setFileExpiry(file.fileExpiry);
    setprimary2(file.nationWide ? "on" : "off");
    setprimary1(file.isVisible ? "on" : "off");
    if (!file.nationWide) {
      const selectedStates = file.licenceState.map((stateId) => {
        return statesOptions.find((state) => state.id === stateId);
      });
      setUserSelectedState(selectedStates);
    } else {
      setUserSelectedState([]);
    }
  };

  useEffect(() => {
    setErrors({});
  }, [i18n.language]);

  const handleSaveFileLicense = async () => {
    try {
      await licenseSchema.validate(
        {
          selectedFile,
          licenceNumber,
          licenceState,
          fileExpiry,
          selectedIndustry
        },
        { abortEarly: false }
      );
      let finalFileName = fileName.trim();
      if (!finalFileName) {
        const fileExtensionIndex = selectedFile.name.lastIndexOf(".");
        const fileNameWithoutExtension = selectedFile.name.substring(
          0,
          fileExtensionIndex
        );
        finalFileName = `${fileNameWithoutExtension}`;
      }
      const nationWideBtn = primary2 === "on" ? true : false;
      const visibility = primary1 === "on" ? true : false;
      const formData = new FormData();
      formData.append("service_id", selectedIndustry);
      formData.append("license_url", selectedFile);
      formData.append("nationwide", nationWideBtn);
      formData.append("license_number", licenceNumber);
      formData.append("license_states", JSON.stringify(licenceState));
      formData.append(
        "expiration_date",
        new Date(fileExpiry).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        })
      );
      formData.append("visibility", visibility);
      const response = await service.post("/myprofile/license/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response?.success) {
        setShowModal(false);
        setShowModal2(false);
        setFileName("");
        setFileExpiry(new Date());
        setIsVisible(false);
        setSelectedIndustry("");
        setSelectedFile(null);
        handleSuccessDialog(response);
        fetchLicensesData();
        setErrors({});
      }
    } catch (err) {
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else if (err?.response && err?.response?.data) {
        err.response.data.errors.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else {
        validationErrors.general = err.message;
      }
      setErrors(validationErrors);
      setFileName("");
      fetchLicensesData();
      console.error("Error Saving License:", err);
    }
  };

  const handleEditFileLicense = async () => {
    try {
      await editLicenseSchema.validate(
          {
              selectedIndustry,
              licenceNumber2,
              userSelectedState,
              fileExpiry,
          },
          {abortEarly: false, context: {primary2}}
      );
      const formData = new FormData();
      const nationWideBtn = primary2 === "on" ? true : false;
      const visibility = primary1 === "on" ? true : false;
      formData.append("license_number", licenceNumber2);
      formData.append("license_url", selectedFile ? selectedFile : licenseUrl);
      formData.append(
        "license_states",
        JSON.stringify(userSelectedState.map((state) => state.id))
      );
      formData.append(
        "expiration_date",
        fileExpiry.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        })
      );
      formData.append("visibility", visibility);
      formData.append("service_id", selectedIndustry);
      formData.append("nationwide", nationWideBtn);
      const licenseId = dataId;
      const response = await service.patch(
        `/myprofile/contractor-license/update/${licenseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      if (response?.success) {
        setShowEditModal(false);
        setFileName("");
        setIsVisible(false);
        setSelectedFile(null);
        handleSuccessDialog(response);
        fetchLicensesData();
        setErrors({});
      }
    } catch (err) {
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      } else if (err?.message) {
        validationErrors.general = err.message;
      }
      setErrors(validationErrors);
      console.error("Error Editing License:", err);
    }
  };

  const handleSaveFileInsurance = async () => {
    try {
      await insuranceSchema.validate(
        { fileName, selectedFile2, fileExpiry2 },
        { abortEarly: false }
      );
      let finalFileName = fileName.trim();
      if (!finalFileName) {
        const fileExtensionIndex = selectedFile2.name.lastIndexOf(".");
        const fileNameWithoutExtension = selectedFile2.name.substring(
          0,
          fileExtensionIndex
        );
        finalFileName = `${fileNameWithoutExtension}`;
      }
      const visibility = primary1 === "on" ? true : false;
      const formData = new FormData();
      formData.append("title", finalFileName);
      formData.append("insurance", selectedFile2);
      formData.append("visibility", visibility);
      formData.append(
        "expirationDate",
        fileExpiry2.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        })
      );
      const response = await service.post(
        "/myprofile/contractor-insurance/add",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      if (response?.success) {
        const newFile = {
          file: response.data.insurance_url,
          fileName: finalFileName,
          fileExpiry: new Date(response.data.expiration_date),
          isVisible
        };
        setInsuranceFiles((prevFiles) => [...prevFiles, newFile]);
        setShowModal2(false);
        handleSuccessDialog(response);
        setFileName("");
        setFileExpiry2(new Date());
        setIsVisible(false);
        setSelectedFile2(null);
        setErrors({});
        fetchInsuranceData();
      }
    } catch (err) {
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
      console.error("Error Saving Insurance:", err);
    }
  };

  const handleEditFileInsurance = async () => {
    try {
      await EditinsuranceSchema.validate(
        { fileName2, fileExpiry2 },
        { abortEarly: false }
      );
      let finalFileName = fileName2.trim();
      if (!finalFileName) {
        const fileExtensionIndex = selectedFile2.name.lastIndexOf(".");
        const fileNameWithoutExtension = selectedFile2.name.substring(
          0,
          fileExtensionIndex
        );
        finalFileName = `${fileNameWithoutExtension}`;
      }
      const visibility = primary1 === "on" ? true : false;
      const formData = new FormData();
      formData.append("title", finalFileName);
      if (selectedFile2) {
        formData.append("insurance", selectedFile2);
      }
      formData.append("visibility", visibility);
      formData.append(
        "expirationDate",
        fileExpiry2.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric"
        })
      );
      const insuranceId = dataId;
      const response = await service.patch(
        `/myprofile/contractor-insurance/update/${insuranceId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      if (response?.success) {
        const updatedFiles = insuranceFiles.map((file) =>
          file.id === insuranceId
            ? {
              ...file,
              file: selectedFile2 ? response.data.insurance_url : file.file,
              fileName: finalFileName,
              fileExpiry: new Date(response.data.expiration_date),
              isVisible
            }
            : file
        );
        setInsuranceFiles(updatedFiles);
        setEditInsurance(false);
        handleSuccessDialog(response);
        setFileName2("");
        setFileExpiry2(new Date());
        setIsVisible(false);
        setSelectedFile2(null);
        fetchInsuranceData();
        setErrors({});
      }
    } catch (err) {
      const validationErrors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
      console.error("Error Editing Insurance:", err);
    }
  };

  const handleDeleteInsurance = async (id) => {
    try {
      const response = await service.delete(
        `/myprofile/contractor-insurance/delete/${id}`
      );
      if (response?.success) {
        handleSuccessDialog(response);
        fetchInsuranceData();
        setInsuranceFiles([]);
      }
    } catch (error) {
      fetchInsuranceData();
      setInsuranceFiles([]);
      console.error("Error Deleting Insurance:", error);
    }
  };

  const handleDeleteLicense = async (id) => {
    try {
      const response = await service.delete(
        `/myprofile/contractor-license/delete/${id}`
      );
      if (response?.success) {
        handleSuccessDialog(response);
        setLicenseFiles([]);
        fetchLicensesData();
      }
    } catch (error) {
      setLicenseFiles([]);
      fetchLicensesData();
      console.error("Error Deleting License:", error);
    }
  };

  const handleIndustryChange = (selectedOption) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      selectedIndustry: "",
    }));
    setSelectedIndustry(selectedOption ? selectedOption.id : null);
  };
  const handleDateChange = (date) => {
    setFileExpiry(date);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };
  const handleDateChange2 = (date) => {
    setFileExpiry2(date);
  };
  const handleFileView = (url) => {
    const blobUrl = url;
    window.open(blobUrl, "_blank");
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
          <table className="table table-bordered">
            <thead>
              <tr>
                <th width="10%">{t("general.srNumber")}</th>
                <th>{t("licenseAndInsuranceForm.name")}</th>
                <th>{t("licenseAndInsuranceForm.licenceNumber")}</th>
                <th>{t("licenseAndInsuranceForm.licenceState")}</th>
                <th>{t("licenseAndInsuranceForm.expiryDate")}</th>
                <th width="15%">{t("general.action")}</th>
              </tr>
            </thead>
            <tbody>
              {licenseFiles.map((file, index) => {
                const industry = industryOptions.find(
                  (option) => option.id === file.service_id
                );
                const industryLabel = industry ? industry.label : "";
                const stateNames = file.licenceState
                  .map((stateId) => {
                    const state = statesOptions.find(
                      (state) => state.id === stateId
                    );
                    return state ? state.value : "";
                  })
                  .join(", ");
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{industryLabel}</td>
                    <td>{file.licenceNumber}</td>
                    <td>
                      {file.nationWide ? t("general.nationWide") : stateNames}
                    </td>
                    <td>{file.fileExpiry.toLocaleDateString()}</td>
                    <td className="d-flex">
                      <i
                        title="View License"
                        className="ms-0 btn-sm btn btn-primary-light"
                        onClick={() =>
                          handleFileView(`${s3BasePath}${file.license_url}`)
                        }
                      >
                        <i className="ri-eye-line"></i>
                      </i>
                      <i
                        title="Edit License"
                        className="ms-1 btn-sm btn btn-primary-light"
                        onClick={() =>
                          handleLicenseEditFile(file.id, file.licenceState)
                        }
                      >
                        <i className="bi bi-pencil-square"></i>
                      </i>
                      <i
                        title="Delete License"
                        className="ms-1 btn-sm btn btn-danger-light"
                        onClick={() => handleDeleteLicense(file.id)}
                      >
                        <i className="ri-delete-bin-5-line"></i>
                      </i>
                    </td>
                  </tr>
                );
              })}
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
          <table className="table table-bordered">
            <thead>
              <tr>
                <th width="10%">{t("general.srNumber")}</th>
                <th>{t("licenseAndInsuranceForm.tableTitle")}</th>
                <th>{t("licenseAndInsuranceForm.expiryDate")}</th>
                <th>{t("licenseAndInsuranceForm.visibleOnProfile")}</th>
                <th width="15%">{t("general.action")}</th>
              </tr>
            </thead>
            <tbody>
              {insuranceFiles.map((file, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{file.fileName}</td>
                  <td>{file.fileExpiry.toLocaleDateString()}</td>
                  <td>
                    {file.isVisible
                      ? t("licenseAndInsuranceForm.yes")
                      : t("licenseAndInsuranceForm.no")}
                  </td>
                  <td className="d-flex">
                    <i
                      title="View Insurance"
                      className="ms-1 btn-sm btn btn-primary-light"
                      onClick={() =>
                        handleFileView(`${s3BasePath}${file.insurance_url}`)
                      }
                    >
                      <i className="ri-eye-line"></i>
                    </i>
                    <i
                      title="Edit Insurance"
                      className="ms-1 btn-sm btn btn-primary-light"
                      onClick={() => handleInsuranceEditFile(file.id)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </i>
                    <i
                      title="Delete Insurance"
                      className="ms-1 btn-sm btn btn-danger-light"
                      onClick={() => handleDeleteInsurance(file.id)}
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
          <Button onClick={() => handleFileChange2("insurance")}>
            {t("buttons.addFile")}
          </Button>
        </Col>
      </Row>
      <Modal show={showModal}>
        <Modal.Header closeButton onClick={() => setShowModal(false)}>
          <Modal.Title>{t("licenseAndInsuranceForm.license")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.name")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup>
                <Select
                  placeholder={t("licenseAndInsuranceForm.enterName")}
                  isSearchable={true}
                  name="industry"
                  options={industryOptions}
                  className="default basic-multi-select w-100"
                  id="choices-multiple-default"
                  onChange={handleIndustryChange}
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                />
              </InputGroup>
              {errors.selectedIndustry && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.selectedIndustry}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.licenceNumber")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.licenceNumber ? "border border-danger" : ""
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
                  className={`d-inline-block ${errors.licenceState ? "border border-danger" : ""
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
                          (option) => option.id
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
                className={`${errors.selectedFile ? "border border-danger" : ""
                  }`}
              >
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="form-control"
                />
              </InputGroup>
              <div className="form-text">{t("general.allowedFileTypes")}</div>
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
                  options={industryOptions}
                  value={selectedIndustry}
                  className="default basic-multi-select w-100"
                  id="choices-multiple-default"
                  onChange={handleIndustryChange}
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
                className={`${errors.licenceNumber2 ? "border border-danger" : ""
                  }`}
              >
                <Form.Control
                  type="text"
                  value={licenceNumber2}
                  placeholder={t("licenseAndInsuranceForm.enterLicenceNumber")}
                  onChange={(e) => setLicenseNumber2(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
              {errors.licenceNumber2 && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.licenceNumber2}
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
                  className={`d-inline-block ${errors.userSelectedState ? "border border-danger" : ""
                    }`}
                >
                  <Select
                    placeholder={t(
                      "licenseAndInsuranceForm.selectLicenceState"
                    )}
                    isSearchable={true}
                    name="states"
                    options={statesOptions}
                    value={userSelectedState}
                    onChange={(selectedOptions) => {
                      if (selectedOptions) {
                        const selectedLabels = selectedOptions.map(
                          (option) => option.id
                        );
                        const useSelectedLabels = selectedOptions.map(
                          (option) => option
                        );
                        setEditLicenseState(selectedLabels);
                        setUserSelectedState(useSelectedLabels);
                      } else {
                        setEditLicenseState([]);
                      }
                    }}
                    isMulti
                    className="basic-multi-select"
                    menuPlacement="auto"
                    classNamePrefix="Select2"
                  />
                </InputGroup>
                {errors.userSelectedState && (
                  <div
                    type="invalid"
                    variant="danger"
                    className="error-message text-danger"
                  >
                    {errors.userSelectedState}
                  </div>
                )}
              </div>
            )}
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.licenseFile")}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="form-control"
                />
              </InputGroup>
              <div className="form-text">{t("general.allowedFileTypes")}</div>
              {licenseUrl && (
                <div className="form-text fw-bold">
                  <i className="fa fa-file-pdf-o" aria-hidden="true"></i>{" "}
                  <a
                    href={licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-underline"
                  >
                    {t("licenseAndInsuranceForm.licenseFile")}
                  </a>
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
                  onChange={(date) => setFileExpiry(date)}
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
      <Modal show={showModal2}>
        <Modal.Header closeButton onClick={() => setShowModal2(false)}>
          <Modal.Title>{t("licenseAndInsuranceForm.insurance")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.tableTitle")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.fileName ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="text"
                  value={fileName}
                  placeholder={t("licenseAndInsuranceForm.titlePlaceHolder")}
                  onChange={(e) => setFileName(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
              {errors.fileName && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.fileName}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.insuranceFile")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.selectedFile2 ? "border border-danger" : ""
                  }`}
              >
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile2(e.target.files[0])}
                  className="form-control"
                />
              </InputGroup>
              <div className="form-text">{t("general.allowedFileTypes")}</div>
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
                className={`${errors.fileExpiry2 ? "border border-danger" : ""
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
      {/* Edit Insurance file */}
      <Modal show={editInsurance}>
        <Modal.Header closeButton onClick={() => setEditInsurance(false)}>
          <Modal.Title>
            {t("licenseAndInsuranceForm.editInsuranceFile")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.tableTitle")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.fileName2 ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="text"
                  value={fileName2}
                  placeholder={t("licenseAndInsuranceForm.titlePlaceHolder")}
                  onChange={(e) => setFileName2(e.target.value)}
                  className="form-control"
                />
              </InputGroup>
              {errors.fileName2 && (
                <div
                  type="invalid"
                  variant="danger"
                  className="error-message text-danger"
                >
                  {errors.fileName2}
                </div>
              )}
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.insuranceFile")}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="file"
                  onChange={(e) => setSelectedFile2(e.target.files[0])}
                  className="form-control"
                />
              </InputGroup>
              <div className="form-text">{t("general.allowedFileTypes")}</div>
            </div>
            <div className="col-md-12">
              <Form.Label className="form-label fs-14">
                {t("licenseAndInsuranceForm.expiryDate")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.fileExpiry2 ? "border border-danger" : ""
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
            onClick={handleEditFileInsurance}
          >
            {t("buttons.save")}
          </Button>
          <Button
            className="btn btn-danger"
            onClick={() => setEditInsurance(false)}
          >
            {t("buttons.cancel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LicenseAndInsurance;
