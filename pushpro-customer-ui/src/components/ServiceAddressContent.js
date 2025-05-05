import * as Yup from "yup";
import { useRouter } from "next/router";
import useService from "@/hooks/useService";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  InputGroup,
  Row,
  Tab,
  Dropdown
} from "react-bootstrap";

const ServiceAddressContent = ({
  t,
  respData,
  handleServiceNextClick,
  i18n,
  onProjectIDChange,
  projectID
}) => {
  const service = useService();
  const { handleSuccessDialog } = service;
  const [formData, setFormData] = useState({
    project_id: "",
    projectTitle: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [error, setError] = useState({});
  const [token, setToken] = useState(null);
  const [contId, setContId] = useState();
  const [address, setAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const router = useRouter();
  const newProjectID = router.query.projectID;
  const gooleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uuid = localStorage.getItem("currentContractor");
    if (token) setToken(token);
    if (uuid) setContId(uuid);
    fetchAddress();
  }, [contId, projectID]);

  // Google Maps Autocomplete initialization
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (typeof google === "object" && typeof google.maps === "object") {
        initAutocomplete();
      } else {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${gooleApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initAutocomplete;
        document.body.appendChild(script);
      }
    };

    const initAutocomplete = () => {
      if (autocompleteRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(
          autocompleteRef.current,
          {
            types: ["address"],
            componentRestrictions: { country: "us" }
          }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.address_components) {
            fillAddressComponents(place.address_components);
          }
        });

        const fillAddressComponents = (addressComponents) => {
          let street = "";
          let city = "";
          let state = "";
          let zip = "";

          addressComponents.forEach((component) => {
            const types = component.types;
            if (types.includes("street_number")) {
              street = `${component.long_name} ${street}`;
            }
            if (types.includes("route")) {
              street += component.long_name;
            }
            if (types.includes("locality")) {
              city = component.long_name;
            }
            if (types.includes("administrative_area_level_1")) {
              state = component.short_name;
            }
            if (types.includes("postal_code")) {
              zip = component.long_name;
            }
          });

          setFormData((prevState) => ({
            ...prevState,
            addressLine1: street,
            city: city,
            state: state,
            zipCode: zip
          }));
        };
      }
    };
    loadGoogleMapsScript();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressSelect = (selectedAddr) => {
    setSelectedAddress(selectedAddr);
    setFormData({
      ...formData,
      addressLine1: selectedAddr.address_line_1,
      addressLine2: selectedAddr.address_line_2 || "",
      city: selectedAddr.city,
      state: selectedAddr.state,
      zipCode: selectedAddr.zip_code
    });
    setShowSaveButton(false);
  };

  // Validation Schema (previous code remains the same)
  const validationSchema = Yup.object().shape({
    addressLine1: Yup.string().required(
      t("serviceAddressValidations.addressLine1")
    ),
    city: Yup.string().required(t("serviceAddressValidations.city")),
    state: Yup.string().required(t("serviceAddressValidations.state")),
    zipCode: Yup.string()
      .required(t("serviceAddressValidations.zipCode"))
      .matches(/^\d{5}(-\d{4})?$/, "Invalid ZIP code")
  });

  useEffect(() => {
    setError({});
  }, [i18n.language]);

  useEffect(() => {
    if (respData) {
      setFormData({
        project_id: respData.data.id,
        projectTitle: respData.data.title,
        addressLine1: respData.data.address_line_1,
        addressLine2: respData.data.address_line_2,
        city: respData.data.city,
        state: respData.data.state,
        zipCode: respData.data.zip_code
      });
    }
  }, [respData]);

  const fetchAddress = async () => {
    try {
      const response = await service.get(`/myaddressbook`);
      if (response?.success && response?.data) {
        setAddress(response?.data);
        if (response?.data?.length === 0) {
          setShowSaveButton(true);
        } else {
          setShowSaveButton(false);
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setError({});
      return true;
    } catch (validationErrors) {
      const errors = {};
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      setError(errors);
      return false;
    }
  };

  const handleServiceAddressSubmit = async (type) => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      if (type === "save") {
        await createMyAddress();
      } else if (type === "edit" && selectedAddress) {
        await updateMyAddress(selectedAddress.id);
      }
      const response = await service.post(
        "/myprojects/create",
        {
          project_id: formData.project_id,
          title: formData.projectTitle,
          address_line_1: formData.addressLine1,
          address_line_2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          user_uuid: contId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response?.success) {
        handleSuccessDialog(response?.data);
        const newProjectId = response.data.id;
        setFormData((prev) => ({ ...prev, project_id: newProjectId }));
        onProjectIDChange(newProjectId);
        handleServiceNextClick();
      }
    } catch (validationErrors) {
      if (validationErrors.name === "ValidationError") {
        const errors = {};
        validationErrors.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setError(errors);
      } else {
        console.error(validationErrors);
      }
    }
  };

  // Create new address
  const createMyAddress = async () => {
    try {
      const response = await service.post("/addressCreate", {
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        country: "US",
        zip_code: formData.zipCode,
        user_uuid: contId,
        status: "Active"
      });

      if (response?.success && response?.data) {
        fetchAddress();
        handleSuccessDialog({ message: "Address created successfully" });
      }
    } catch (error) {
      console.error("Error creating address:", error);
    }
  };

  const updateMyAddress = async (addressId) => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      const response = await service.patch(`/myaddressbook/${addressId}`, {
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        status: "Active"
      });
      if (response?.success && response?.data) {
        fetchAddress();
        handleSuccessDialog("Address updated successfully");
      }
    } catch (error) {
      console.error("Error updating address:", error);
    }
  };

  const handleAddNewClick = () => {
    setFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: ""
    });
    setSelectedAddress(null);
    setShowSaveButton(true);
  };

  return (
    <>
      <Tab.Pane
        className="fade text-muted border-zero pb-0"
        id="service-address-pan"
        role="tabpanel"
        eventKey={1}
        aria-labelledby="home-tab"
        tabIndex="0"
      >
        <Form>
          <div className="fs-6 fw-600 mb-2 form-label me-3">
            {t("certificatesForm.title")}
          </div>
          <Row className="mb-3 align-items-center">
            <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={12}>
              <label htmlFor="projectTitle" className="form-label fs-14">
                {t("serviceAddress.projectTitle")}
              </label>
            </Col>
            <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={12}>
              <InputGroup
                className={`${
                  error.projectTitle ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="text"
                  id="projectTitle"
                  name="projectTitle"
                  placeholder={t("serviceAddress.enterProjectTitle")}
                  className="form-control"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {error.projectTitle && (
                <div variant="danger" className="error-message text-danger">
                  {error.projectTitle}
                </div>
              )}
            </Col>
          </Row>
          <div className="fs-6 fw-600 mb-2 form-label">
            {t("project.projectAddress")}
          </div>
          <Dropdown className="mb-3">
            <Dropdown.Toggle
              variant="outline-primary"
              size="sm"
              id="address-dropdown"
            >
              {selectedAddress
                ? `${selectedAddress.address_line_1}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zip_code}`
                : t("buttons.selectAddress")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {address.map((addr) => (
                <Dropdown.Item
                  key={addr.id}
                  onClick={() => handleAddressSelect(addr)}
                  className="text-primary"
                >
                  {`${addr.address_line_1}, ${addr.city}, ${addr.state}, ${addr.zip_code}`}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={handleAddNewClick}
                className="text-white bg-primary"
              >
                {t("buttons.add")} +
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* {addressLine1 Input Field} */}
          <Row className="mb-3 align-items-center">
            <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={12}>
              <label htmlFor="addressLine1" className="form-label fs-14">
                {t("serviceAddress.addressLine1")}{" "}
                <span className="text-danger">*</span>
              </label>
            </Col>
            <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={12}>
              <InputGroup
                className={`${
                  error.addressLine1 ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  ref={autocompleteRef}
                  placeholder={t("serviceAddress.enterAddressLine1")}
                  className="form-control"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {error.addressLine1 && (
                <div variant="danger" className="error-message text-danger">
                  {error.addressLine1}
                </div>
              )}
            </Col>
          </Row>
          {/* {addressLine2 Input Field} */}
          <Row className="mb-3 align-items-center">
            <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={12}>
              <label htmlFor="addressLine2" className="form-label fs-14">
                {t("serviceAddress.addressLine2")}
              </label>
            </Col>
            <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={12}>
              <InputGroup>
                <Form.Control
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  placeholder={t("serviceAddress.enterAddressLine2")}
                  className="form-control"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                />
              </InputGroup>
            </Col>
          </Row>
          {/* {City Input Field} */}
          <Row className="mb-3 align-items-center">
            <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={12}>
              <label htmlFor="city" className="form-label fs-14">
                {t("serviceAddress.city")}{" "}
                <span className="text-danger">*</span>
              </label>
            </Col>
            <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={12}>
              <InputGroup
                className={`${error.city ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="text"
                  id="city"
                  name="city"
                  placeholder={t("serviceAddress.enterCity")}
                  className="form-control"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {error.city && (
                <div variant="danger" className="error-message text-danger">
                  {error.city}
                </div>
              )}
            </Col>
          </Row>
          {/* {State Input Field} */}
          <Row className="mb-3 align-items-center">
            <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={12}>
              <label htmlFor="state" className="form-label fs-14">
                {t("serviceAddress.state")}{" "}
                <span className="text-danger">*</span>
              </label>
            </Col>
            <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={12}>
              <InputGroup
                className={`${error.state ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="text"
                  id="state"
                  name="state"
                  placeholder={t("serviceAddress.enterState")}
                  className="form-control"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {error.state && (
                <div variant="danger" className="error-message text-danger">
                  {error.state}
                </div>
              )}
            </Col>
          </Row>
          {/* {Zip-Code Input Field} */}
          <Row className="mb-3 align-items-center">
            <Col xxl={2} xl={2} lg={3} md={3} sm={3} xs={12}>
              <label htmlFor="zipCode" className="form-label fs-14">
                {t("serviceAddress.zipCode")}{" "}
                <span className="text-danger">*</span>
              </label>
            </Col>
            <Col xxl={5} xl={5} lg={5} md={6} sm={7} xs={12}>
              <InputGroup
                className={`${error.zipCode ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  placeholder={t("serviceAddress.enterZipCode")}
                  className="form-control"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </InputGroup>
              {error.zipCode && (
                <div variant="danger" className="error-message text-danger">
                  {error.zipCode}
                </div>
              )}
            </Col>
          </Row>
          {/* {Buttons Next} */}
          <Row className="mb-3 align-items-center">
            <Col className="d-flex justify-content-end p-0 mt-3">
              {showSaveButton ? (
                <Button
                  className="me-2"
                  variant="primary"
                  size="sm"
                  onClick={() => handleServiceAddressSubmit("save")}
                >
                  {t("buttons.saveAddressNext")}
                </Button>
              ) : (
                <Button
                  className="me-2"
                  variant="primary"
                  size="sm"
                  onClick={() => handleServiceAddressSubmit("edit")}
                >
                  {t("buttons.updateAddressNext")}
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </Tab.Pane>
    </>
  );
};

export default ServiceAddressContent;
