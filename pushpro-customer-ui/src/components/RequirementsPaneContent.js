import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row, Tab } from "react-bootstrap";
import dynamic from "next/dynamic";
import * as Yup from "yup";
import ProjectDocumentForm from "./ProjectDocumentForm";
import ProjectDocumentFormMobile from "./mobile/ProjectDocumentFormMobile";
import { getDeviceType } from "../utils/device";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";

const Select = dynamic(() => import("react-select"), { ssr: false });

const RequirementsPane = ({
  t,
  i18n,
  handleResComBackClick,
  handleResComNextClick,
  handleRenAddBackClick,
  handleRenAddNextClick,
  handleWhatRenovateBack,
  handleWhatRenovateNext,
  handleWhatRenovateSkip,
  handleServicesBackClick,
  handleServicesNextClick,
  handleServicesSkipClick,
  showRenAddForm,
  setShowRenAddForm,
  showResCommForm,
  setShowResCommForm,
  showWhatRenovateForm,
  setShowWhatRenovateForm,
  showServicesForm,
  setShowServicesForm,
  showDocumentsForm,
  setShowDocumentsForm,
  rows,
  handleAddRow,
  handleRowChange,
  handleDeleteRow,
  handleDocumentsSkipClick,
  handleDocumentsBackClick,
  handleDocumentsNextClick,
  projectID,
  respData,
  fetchData,
  areasData,
  servicesData
}) => {
  const [isMobile, setIsMobile] = useState();
  const [deviceType, setDeviceType] = useState("");
  const service = useService();
  const { handleSuccessDialog } = service;
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
    if (typeof window !== "undefined") {
      const type = getDeviceType();
      setDeviceType(type);
    }
  }, []);

  const [currentForm, setCurrentForm] = useState("resCom");
  const [residentialCommercial, setResidentialCommercial] = useState(null);
  const [renovationAddition, setRenovationAddition] = useState(null);
  const [whatToRenovate, setWhatToRenovate] = useState([]);
  const [services, setServices] = useState(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [whatToRenovateOptions, setWhatToRenovateOptions] = useState([]);
  const [servicesOptions, setServicesOptions] = useState([]);
  const router = useRouter();
  const newProjectID = router.query.projectID;
  useEffect(() => {
    const fetchAreas = () => {
      setWhatToRenovateOptions(areasData);
    };
    if (areasData) {
      fetchAreas();
    }
  }, [areasData]);

  useEffect(() => {
    const fetchServices = () => {
      setServicesOptions(servicesData);
    };
    if (servicesData) {
      fetchServices();
    }
  }, [servicesData]);

  const handleSaveAreas = async () => {
    try {
      const id = newProjectID || projectID;
      if (!whatToRenovate.length) {
        setErrors({ areas: t("requirementsValidations.areasRequired") });
        return;
      }
      const response = await service.patch(`/myprojects/edit/areas/${id}`, {
        areas: whatToRenovate.map((area) => area.value)
      });
      if (response?.success) {
        handleSuccessDialog(response?.data);
        handleWhatRenovateNext();
      }
    } catch (error) {
      console.error("Failed to update project areas:", error);
      setErrors({ areas: t("requirementsValidations.areasRequired") });
    }
  };

  useEffect(() => {
    if (respData) {
      if (respData?.data.project_type) {
        const selectedOption = {
          value: respData?.data.project_type,
          label: respData?.data.project_type
        };
        setResidentialCommercial(selectedOption);
      }
      if (respData?.data.project_category) {
        const selectedOption = {
          value: respData?.data.project_category,
          label: respData?.data.project_category
        };
        setRenovationAddition(selectedOption);
      }
      if (respData.data.areas) {
        const selectedAreas = respData.data.areas
          .map((area) => {
            const matchingOption = whatToRenovateOptions.find(
              (wto) => wto.value == area
            );
            return matchingOption
              ? { value: matchingOption.value, label: matchingOption.label }
              : null;
          })
          .filter(Boolean);
        setWhatToRenovate(selectedAreas);
      }
      if (respData?.data.services) {
        const selectedServices = respData.data.services
          .map((service) => {
            const matchingOption = servicesOptions.find(
              (option) => option.value === service
            );
            return matchingOption
              ? {
                value: matchingOption.value,
                label: matchingOption.label
              }
              : null;
          })
          .filter(Boolean);
        setServices(selectedServices);
      }
      if (respData?.data.description) {
        setDescription(respData?.data.description);
      }
    }
  }, [respData]);
  const residentialCommercialOptions = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" }
  ];
  const renovationAdditionOptions = [
    { value: "Renovation", label: "Renovation" },
    { value: "Addition", label: "Addition" }
  ];

  const residentialCommercialSchema = Yup.object().shape({
    residentialCommercial: Yup.object()
      .nullable()
      .required(t("requirementsValidations.selectionRequired"))
  });
  const validateResidentialCommercialForm = async () => {
    try {
      const formData = { residentialCommercial };
      await residentialCommercialSchema.validate(formData, {
        abortEarly: false
      });
      await updateProjectType();
      handleResComNextClick();
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setErrors(errors);
    }
  };

  const updateProjectType = async () => {
    try {
      const id = newProjectID || projectID;
      const projectType = residentialCommercial.value;
      const response = await service.patch(`/myprojects/edit/type/${id}`, {
        project_type: projectType
      });
      if (response?.success) {
        handleSuccessDialog(response?.data);
      }
    } catch (error) {
      console.error("Failed to update project type:", error);
    }
  };

  const renovationAdditionSchema = Yup.object().shape({
    renovationAddition: Yup.object()
      .nullable()
      .required(t("requirementsValidations.selectionRequired"))
  });
  const validateRenovationAdditionForm = async () => {
    try {
      const formData = { renovationAddition };
      await renovationAdditionSchema.validate(formData, { abortEarly: false });
      await updateProjectCategory();
      handleRenAddNextClick();
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setErrors(errors);
    }
  };

  const updateProjectCategory = async () => {
    try {
      const id = newProjectID || projectID;
      const projectCategory = renovationAddition.value;
      const response = await service.patch(`/myprojects/edit/category/${id}`, {
        project_category: projectCategory
      });
      if (response?.success) {
        handleSuccessDialog(response?.data);
      }
    } catch (error) {
      console.error("Failed to update project category:", error);
    }
  };

  const whatToRenovateSchema = Yup.object().shape({
    whatToRenovate: Yup.array()
      .nullable()
      .required(t("requirementsValidations.selectionRequired"))
  });

  const validateWhatToRenovateForm = async () => {
    try {
      const formData = { whatToRenovate };
      await whatToRenovateSchema.validate(formData, { abortEarly: false });
      setErrors({});
      handleSaveAreas();
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setErrors(errors);
    }
  };

  const serviceSchema = Yup.object().shape({
    services: Yup.array()
      .nullable()
      .required(t("requirementsValidations.serviceRequired"))
  });

  const validateServicesForm = async () => {
    try {
      await serviceSchema.validate(
        { services, description },
        { abortEarly: false }
      );
      const hasValidData = services.length > 0 || description.trim();
      if (hasValidData) {
        await saveDescriptionAndServices();
        handleServicesNextClick();
      } else {
        setErrors({ services: t("requirementsValidations.serviceRequired") });
      }
    } catch (err) {
      let errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      setErrors(errors);
    }
  };

  const saveDescriptionAndServices = async () => {
    try {
      resetErrors();
      const id = newProjectID || projectID;
      const descriptionResponse = await service.patch(
        `/myprojects/edit/description/${id}`,
        {
          description
        }
      );
      if (descriptionResponse?.success) {
        handleSuccessDialog(descriptionResponse.data);
      }
      if (!services || !services.length || services.length === 0) {
        setErrors({ services: t("requirementsValidations.serviceRequired") });
        return;
      }
      const serviceResponse = await service.patch(
        `/myprojects/edit/services/${id}`,
        {
          services: services.map((service) => service.value || null)
        }
      );
      if (serviceResponse?.success) {
        handleSuccessDialog(serviceResponse.data);
      }
    } catch (error) {
      console.error("Failed to update project description or services:", error);
    }
  };

  const resetErrors = () => {
    setErrors({});
  };
  useEffect(() => {
    setErrors({});
  }, [i18n.language]);

  return (
    <Tab.Pane
      className="fade text-muted b-none pb-0"
      id="requirements-pane"
      role="tabpanel"
      tabIndex="0"
      eventKey={4}
      onFocus={resetErrors}
    >
      {showDocumentsForm ? (
        isMobile ? (
          <ProjectDocumentFormMobile
            t={t}
            id={projectID}
            rows={rows}
            handleAddRow={handleAddRow}
            handleDocumentsSkipClick={handleDocumentsSkipClick}
            handleDocumentsBackClick={handleDocumentsBackClick}
            handleDocumentsNextClick={handleDocumentsNextClick}
            handleDeleteRow={handleDeleteRow}
            handleRowChange={handleRowChange}
            respData={respData}
            fetchData={fetchData}
          />
        ) : (
          <ProjectDocumentForm
            t={t}
            id={projectID}
            rows={rows}
            handleAddRow={handleAddRow}
            handleDocumentsSkipClick={handleDocumentsSkipClick}
            handleDocumentsBackClick={handleDocumentsBackClick}
            handleDocumentsNextClick={handleDocumentsNextClick}
            handleDeleteRow={handleDeleteRow}
            handleRowChange={handleRowChange}
            respData={respData}
            fetchData={fetchData}
          />
        )
      ) : showServicesForm ? (
        <Form>
          <Row className="mb-3 d-block">
            <Col className="mb-3 d-flex flex-column">
              <Form.Label
                htmlFor="requirementsLabel"
                className="form-label me-2"
              >
                {t("requirements.requirementsServices")}
              </Form.Label>
              <Form.Label
                htmlFor="requirementsLabel"
                className="form-label me-2"
              >
                <span className="fw-bold"> {t("requirements.note")}: </span>
                {t("requirements.requirementsServicesNote")}
              </Form.Label>
              {errors.services && (
                <div variant="danger" className="error-message text-danger">
                  {errors.services}
                </div>
              )}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xxl={4} xl={5} lg={5} md={5} sm={7} xs={10}>
              <InputGroup className={`d-inline-block`}>
                <Select
                  placeholder="Select an option"
                  isSearchable={true}
                  name="services"
                  options={servicesOptions}
                  isMulti
                  className="basic-multi-select"
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                  value={services}
                  onChange={(selectedOptions) => setServices(selectedOptions)}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xxl={6} xl={7} lg={7} md={7} sm={9} xs={12}>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  name="description"
                  placeholder="Enter a description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <div variant="danger" className="error-message text-danger">
                    {errors.description}
                  </div>
                )}
              </InputGroup>
            </Col>
          </Row>
          <Row className="mb-3 schedule-btns">
            <Col className="d-flex justify-content-end mt-5">
              <Button
                className="btn btn-primary me-2 schedule-skip"
                type="button"
                onClick={handleServicesSkipClick}
              >
                {t("buttons.skip")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-back max-content-width"
                type="button"
                onClick={handleServicesBackClick}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={validateServicesForm}
              >
                {t("buttons.next")}
              </Button>
            </Col>
          </Row>
        </Form>
      ) : showWhatRenovateForm ? (
        <Form>
          <Row className="mb-3">
            <Col
              xxl={12}
              xl={12}
              md={12}
              lg={12}
              sm={12}
              xs={12}
              className=" mb-3 d-flex"
            >
              <Form.Label
                htmlFor="requirementsLabel"
                className="form-label me-2"
              >
                {t("requirements.requirementsWhatRenovate")}{" "}
                <span className="text-danger">*</span>{" "}
                <span style={{ fontSize: "12px", color: "#6c757d" }}>
                 {t("requirements.selectthatapply")}
                </span>
              </Form.Label>
            </Col>
            <Col xxl={4} xl={4} md={5} lg={5} sm={7} xs={9}>
              {errors.areas && (
                <div variant="danger" className="error-message text-danger">
                  {errors.areas}
                </div>
              )}
              <InputGroup
                className={`d-inline-block ${errors.areas ? "border border-danger" : ""
                  }`}
              >
                <Select
                  placeholder="Select an option"
                  isSearchable={true}
                  name="whatToRenovate"
                  options={whatToRenovateOptions}
                  isMulti
                  className="basic-multi-select"
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                  value={whatToRenovate}
                  onChange={setWhatToRenovate}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="mb-3 schedule-btns">
            <Col className="d-flex justify-content-end mt-5">
              <Button
                className="btn btn-primary me-2 schedule-skip"
                type="button"
                onClick={handleWhatRenovateSkip}
              >
                {t("buttons.skip")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-back"
                type="button"
                onClick={handleWhatRenovateBack}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={validateWhatToRenovateForm}
              >
                {t("buttons.next")}
              </Button>
            </Col>
          </Row>
        </Form>
      ) : showRenAddForm ? (
        <Form>
          <Row className="mb-3">
            <Col
              xxl={12}
              xl={12}
              md={12}
              lg={12}
              sm={12}
              xs={12}
              className=" mb-3 d-flex"
            >
              <Form.Label
                htmlFor="requirementsLabel"
                className="form-label me-2"
              >
                {t("requirements.requirementsRenAdd")}{" "}
                <span className="text-danger">*</span>{" "}
              </Form.Label>
            </Col>
            <Col xxl={4} xl={4} md={5} lg={5} sm={7} xs={9}>
              {errors.renovationAddition && (
                <div variant="danger" className="error-message text-danger">
                  {errors.renovationAddition}
                </div>
              )}
              <InputGroup
                className={`d-inline-block ${errors.renovationAddition ? "border border-danger" : ""
                  }`}
              >
                <Select
                  placeholder="Select an option"
                  isSearchable={true}
                  name="renovationAddition"
                  options={renovationAdditionOptions}
                  className="default basic-multi-select"
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                  value={renovationAddition}
                  onChange={setRenovationAddition}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="mb-3 schedule-btns">
            <Col className="d-flex justify-content-end mt-5">
              <Button
                className="btn btn-primary me-2 schedule-back"
                type="button"
                onClick={handleRenAddBackClick}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={validateRenovationAdditionForm}
              >
                {t("buttons.next")}
              </Button>
            </Col>
          </Row>
        </Form>
      ) : showResCommForm ? (
        <Form>
          <Row className="mb-3">
            <Col
              xxl={12}
              xl={12}
              md={12}
              lg={12}
              sm={12}
              xs={12}
              className=" mb-3 d-flex"
            >
              <Form.Label
                htmlFor="requirementsLabel"
                className="form-label me-2"
              >
                {t("requirements.requirementsCommRes")}{" "}
                <span className="text-danger">*</span>{" "}
              </Form.Label>
            </Col>
            <Col xxl={4} xl={4} md={5} lg={5} sm={7} xs={9}>
              {errors.residentialCommercial && (
                <div variant="danger" className="error-message text-danger">
                  {errors.residentialCommercial}
                </div>
              )}
              <InputGroup
                className={`d-inline-block ${errors.residentialCommercial ? "border border-danger" : ""
                  }`}
              >
                <Select
                  placeholder="Select an option"
                  isSearchable={true}
                  name="residentialCommercial"
                  options={residentialCommercialOptions}
                  className="default basic-multi-select"
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                  value={residentialCommercial}
                  onChange={setResidentialCommercial}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row className="mb-3 schedule-btns">
            <Col className="d-flex justify-content-end mt-5">
              <Button
                className="btn btn-primary me-2 schedule-back"
                type="button"
                onClick={handleResComBackClick}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={validateResidentialCommercialForm}
              >
                {t("buttons.next")}
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        ""
      )}
    </Tab.Pane>
  );
};

export default RequirementsPane;
