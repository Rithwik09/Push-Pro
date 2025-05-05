import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import { useRouter } from "next/router";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { countries } from "../../shared/data/countries";
import useService from "@/hooks/useService";

const Select = dynamic(() => import("react-select"), { ssr: false });

const options = countries.map((country) => ({
  label: country,
  value: country
}));

const CompanyInfomation = (props, respData) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [error, setError] = useState({});
  const [industry, setIndustry] = useState([]);
  const [showNote, setShowNote] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState({
    label: "United States",
    value: "United States"
  });
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [user, setUser] = useState({
    companyName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "United States",
    zip: "",
    businessNumber: "",
    email: "",
    industry: ""
  });

  const fetchData = async () => {
    try {
      const response = await service.get("/myprofile/contractor-details");
      if (response?.success) {
        setUser({
          companyName: response.data.company_name,
          phone: response.data.phone_no,
          address1: response.data.address_line_1,
          address2: response.data.address_line_2,
          city: response.data.city,
          state: response.data.state,
          country: "United States",
          zip: response.data.zip_code,
          businessNumber: response.data.business_id,
          email: response.data.company_email
        });
        setShowNote(false);
      }
      const predefinedOption = options.find(
        (option) => option.value === response?.data?.country
      );
      setSelectedCountry(predefinedOption);
      const industriesResponse = await service.get("/services");
      const formattedIndustries = industriesResponse?.data?.map((industry) => ({
        label: industry.name,
        value: industry.name,
        id: industry.id
      }));
      setIndustry(formattedIndustries);
      const selectedIndustries = response?.data?.services?.map((industryId) => {
        const matchingIndustry = formattedIndustries.find(
          (ind) => ind.id === industryId
        );
        return {
          label: matchingIndustry ? matchingIndustry.label : "",
          value: matchingIndustry ? matchingIndustry.value : "",
          id: industryId
        };
      });
      setSelectedIndustries(selectedIndustries);
    } catch (error) {
      try {
        const industriesResponse = await service.get("/services");
        if (industriesResponse?.success) {
          const formattedIndustries = industriesResponse?.data?.map(
            (industry) => ({
              label: industry.name,
              value: industry.name,
              id: industry.id
            })
          );
          setIndustry(formattedIndustries);
          setSelectedIndustries([]);
        }
      } catch (industriesError) {
        console.error("Error fetching industries:", industriesError);
      }
    }
  };

  const autocompleteRef = useRef(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (typeof google === "object" && typeof google.maps === "object") {
        initAutocomplete();
      } else {
        const script = document.createElement("script");
        script.src = process.env.NEXT_PUBLIC_GOOGLE_API;
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
          setUser((prevState) => ({
            ...prevState,
            address1: street,
            city: city,
            state: state,
            zip: zip
          }));
        };
      }
    };
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (props.active) {
      fetchData();
    }
  }, [props.active]);

  useEffect(() => {
    setError({});
  }, [i18n.language]);

  useEffect(() => {
    if (respData && respData.data) {
      setUser({
        address1: respData.data.address1,
        city: respData.data.city,
        state: respData.data.state,
        zip: respData.data.zip
      });
    }
  }, [respData]);

  const validationSchema = Yup.object().shape({
    companyName: Yup.string().required(
      `${t("companyInformationForm.validateCompanyName")}`
    ),
    email: Yup.string()
      .email(`${t("accountInfoForm.invalidEmail")}`)
      .required(`${t("accountInfoForm.validateEmail")}`),
    phone: Yup.string().required(
      `${t("companyInformationForm.validatePhone")}`
    ),
    address1: Yup.string().required(
      `${t("companyInformationForm.validateAddressLine1")}`
    ),
    city: Yup.string().required(`${t("companyInformationForm.validateCity")}`),
    state: Yup.string().required(
      `${t("companyInformationForm.validateStateProvince")}`
    ),
    zip: Yup.string().required(
      `${t("companyInformationForm.validateZipPostal")}`
    ),
    businessNumber: Yup.string().required(
      `${t("companyInformationForm.validateBusinessTaxNumber")}`
    )
  });

  const handleInput = (e) => {
    e.preventDefault();
    setError({});
    const { name, value } = e.target;
    if (name === "phone") {
      let input = value.replace(/\D/g, "");
      if (!input.startsWith("1")) {
        input = "1" + input;
      }
      let formattedNumber = "+1 (";
      for (let i = 1; i < input.length; i++) {
        const digit = input[i];
        if (i === 4) {
          formattedNumber += `) ${digit}`;
        } else if (i === 7) {
          formattedNumber += `-${digit}`;
        } else {
          formattedNumber += digit;
        }
      }
      if (formattedNumber.length > 17) {
        formattedNumber = formattedNumber.slice(0, 17);
      }
      setUser((prevUser) => ({ ...prevUser, [name]: formattedNumber }));
    } else {
      setUser((prevUser) => ({ ...prevUser, [name]: value }));
    }
  };

  const handleIndustryChange = (selectedIndustries) => {
    setSelectedIndustries(selectedIndustries);
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate(user, { abortEarly: false });
      setError({});
      const selectedIndustryIds = selectedIndustries?.map(
        (service) => service.id
      );
      const updatedUser = {
        company_name: user.companyName,
        phone_no: user.phone,
        address_line_1: user.address1,
        address_line_2: user.address2,
        city: user.city,
        state: user.state,
        zip_code: user.zip,
        country: "United States",
        business_id: user.businessNumber,
        company_email: user.email,
        services: selectedIndustryIds
      };
      try {
        const updateDetails = await service.patch(
          "/myprofile/contractor-details/update",
          updatedUser
        );
        if (updateDetails && updateDetails.success && updateDetails.data) {
          handleSuccessDialog(updateDetails);
          const userData = JSON.parse(localStorage.getItem("user_data")) || {};
          userData.company_details = true;
          localStorage.setItem("user_data", JSON.stringify(userData));
          setShowNote(false);
          setError({});
          return;
        } else {
          console.error("Unexpected update Error response:", updateDetails);
          return;
        }
      } catch (serviceError) {
        const errorMessage =
          serviceError.response?.data?.message ||
          serviceError.message ||
          t("errors.unknownError");
        handleErrorDialog({
          message: errorMessage
        });
        console.error("Service error updating details:", serviceError);
        setError({
          general: errorMessage
        });
      }
    } catch (validationError) {
      if (validationError.inner) {
        const formattedErrors = validationError.inner.reduce((acc, err) => {
          return { ...acc, [err.path]: err.message };
        }, {});
        setError(formattedErrors);
      } else {
        setError({
          general: validationError.message || t("errors.validationFailed")
        });
      }
      console.error("Error Updating Contractor Details :", validationError);
    }
  };

  const refresh = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <>
      <Form>
        {showNote ? (
          <div className="text-danger py-3 fs-6">
            * {t("companyInformationForm.missingCompanyDetails")}
          </div>
        ) : (
          <></>
        )}
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="companyName" className="form-label fs-14">
              {t("companyInformationForm.companyName")}{" "}
              <span className="text-danger">*</span>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Popover id="popover-profileImage">
                    <Popover.Body>{t("tooltips.companyName")}</Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="text-muted ms-2"
                  style={{
                    cursor: "help",
                    fontSize: "0.8em",
                    verticalAlign: "super"
                  }}
                >
                  <i class="bi bi-question-circle bold-icon"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup
              className={`${error.companyName ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="companyName"
                name="companyName"
                placeholder={t("companyInformationForm.enterCompanyName")}
                value={user.companyName}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.companyName && (
              <div variant="danger" className="error-message text-danger">
                {error.companyName}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="companyEmail" className="form-label fs-14">
              {t("companyInformationForm.companyEmail")}
              <span className="text-danger ms-1">*</span>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Popover id="popover-profileImage">
                    <Popover.Body>{t("tooltips.companyEmail")}</Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="text-muted ms-2"
                  style={{
                    cursor: "help",
                    fontSize: "0.8em",
                    verticalAlign: "super"
                  }}
                >
                  <i class="bi bi-question-circle bold-icon"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="email"
                id="email2"
                name="email"
                placeholder={t("companyInformationForm.enterCompanyEmail")}
                value={user.email}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.email && (
              <div variant="danger" className="error-message text-danger">
                {error.email}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="phone" className="form-label fs-14">
              {t("companyInformationForm.phoneNo")}{" "}
              <span className="text-danger ms-1">*</span>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Popover id="popover-profileImage">
                    <Popover.Body>{t("tooltips.companyPhone")}</Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="text-muted ms-2"
                  style={{
                    cursor: "help",
                    fontSize: "0.8em",
                    verticalAlign: "super"
                  }}
                >
                  <i class="bi bi-question-circle bold-icon"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup
              className={`${error.phone ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="phone2"
                name="phone"
                placeholder={t("companyInformationForm.enterPhoneNo")}
                value={user.phone}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.phone && (
              <div variant="danger" className="error-message text-danger">
                {error.phone}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="address1" className="form-label fs-14">
              {t("companyInformationForm.addressLine1")}{" "}
              <span className="text-danger">*</span>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Popover id="popover-profileImage">
                    <Popover.Body>{t("tooltips.companyAddress")}</Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="text-muted ms-2"
                  style={{
                    cursor: "help",
                    fontSize: "0.8em",
                    verticalAlign: "super"
                  }}
                >
                  <i class="bi bi-question-circle bold-icon"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup
              className={`${error.address1 ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="address1"
                name="address1"
                ref={autocompleteRef}
                placeholder={t("companyInformationForm.enterAddressLine1")}
                value={user.address1}
                className="form-control"
                onChange={handleInput}
                isInvalid={!!error.address1}
              />
            </InputGroup>
            <Form.Control.Feedback type="invalid">
              {error.address1}
            </Form.Control.Feedback>
            {error.address1 && (
              <div variant="danger" className="error-message text-danger">
                {error.address1}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="address2" className="form-label fs-14">
              {t("companyInformationForm.addressLine2")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                id="address2"
                name="address2"
                placeholder={t("companyInformationForm.enterAddressLine2")}
                value={user.address2}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="city" className="form-label fs-14">
              {t("companyInformationForm.city")}{" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup
              className={`${error.city ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="city"
                name="city"
                placeholder={t("companyInformationForm.enterCity")}
                value={user.city}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.city && (
              <div variant="danger" className="error-message text-danger">
                {error.city}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="state" className="form-label fs-14">
              {t("companyInformationForm.stateProvince")}{" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup
              className={`${error.state ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="state"
                name="state"
                placeholder={t("companyInformationForm.enterStateProvince")}
                value={user.state}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.state && (
              <div variant="danger" className="error-message text-danger">
                {error.state}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="country" className="form-label fs-14">
              {t("companyInformationForm.countryProvince")}{" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup
              className={`d-inline-block ${
                error.country ? "border border-danger" : ""
              }`}
            >
              <Select
                placeholder="Select a country"
                isSearchable={true}
                name="country"
                value={selectedCountry}
                options={options}
                className="default basic-multi-select"
                id="choices-multiple-default"
                menuPlacement="auto"
                classNamePrefix="Select2"
                isDisabled={true}
                // onChange={handleCountryChange}
              />
            </InputGroup>
            {error.country && !selectedCountry && (
              <div variant="danger" className="error-message text-danger">
                {error.country}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="zip" className="form-label fs-14">
              {t("companyInformationForm.zipPostalCode")}{" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup
              className={`${error.zip ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="zip"
                name="zip"
                placeholder={t("companyInformationForm.enterZipPostalCode")}
                value={user.zip}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.zip && (
              <div variant="danger" className="error-message text-danger">
                {error.zip}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="businessNumber" className="form-label fs-14 ">
              {t("companyInformationForm.businessTaxNumber")}
              <span className="text-danger ms-1">*</span>
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Popover id="popover-profileImage">
                    <Popover.Body>
                      {t("tooltips.businessTaxNumber")}
                    </Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="text-muted ms-2"
                  style={{
                    cursor: "help",
                    fontSize: "0.8em",
                    verticalAlign: "super"
                  }}
                >
                  <i class="bi bi-question-circle bold-icon"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                id="businessNumber"
                name="businessNumber"
                placeholder={t("companyInformationForm.enterBusinessTaxNumber")}
                value={user.businessNumber}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
            {error.businessNumber && (
              <div variant="danger" className="error-message text-danger">
                {error.businessNumber}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="industry" className="form-label fs-14">
              {t("companyInformationForm.industry")}
              <OverlayTrigger
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Popover id="popover-profileImage">
                    <Popover.Body>{t("tooltips.serviceName")}</Popover.Body>
                  </Popover>
                }
              >
                <span
                  className="text-muted ms-2"
                  style={{
                    cursor: "help",
                    fontSize: "0.8em",
                    verticalAlign: "super"
                  }}
                >
                  <i class="bi bi-question-circle bold-icon"></i>
                </span>
              </OverlayTrigger>
            </Form.Label>
            <InputGroup className="d-inline-block">
              <Select
                placeholder={t("companyInformationForm.selectIndustry")}
                isMulti
                name="states[]"
                options={industry}
                value={selectedIndustries}
                className="basic-multi-select"
                isSearchable
                menuPlacement="auto"
                classNamePrefix="Select2"
                onChange={handleIndustryChange}
              />
            </InputGroup>
            {error.selectedIndustries && (
              <div variant="danger" className="error-message text-danger">
                {error.selectedIndustries}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Button
              className="btn btn-primary me-2"
              type="submit"
              onClick={handleDetailsSubmit}
            >
              {t("buttons.save")}
            </Button>
            <Button className="btn btn-danger" type="button" onClick={refresh}>
              {t("buttons.cancel")}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CompanyInfomation;
