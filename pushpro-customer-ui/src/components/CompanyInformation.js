import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, InputGroup, Card } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import * as Yup from "yup";
import userJson from "../../shared/data/json/users.json";
import { useTranslation } from "react-i18next";
import industry from "../../shared/data/json/industry.json";
import countries from "./Countries";

const Select = dynamic(() => import("react-select"), { ssr: false });

const options = countries.map((country) => ({
  label: country,
  value: country
}));
const BasicInfomation = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [industrySelected, setIndustrySelected] = useState(false);
  const [error, setError] = useState({});
  const [country, setCountry] = useState({});
  const [countrySelected, setCountrySelected] = useState(false);

  const [user, setUser] = useState({
    companyName: userJson[3].companyName,
    phone: userJson[3].phone,
    address1: userJson[3].address1,
    address2: userJson[3].address2,
    city: userJson[3].city,
    state: userJson[3].state,
    country: userJson[3].country,
    zip: userJson[3].zip,
    businessNumber: userJson[3].businessNumber,
    email: userJson[3].email,
    phone2: userJson[3].phone2,
    faxNumber: userJson[3].faxNumber,
    website: userJson[3].website,
    country: "",
    industry: []
  });

  useEffect(() => {
    const industryData = JSON.parse(localStorage.getItem("industry"));
    if (industryData) {
      setUser((prevUser) => ({ ...prevUser, industry: industryData }));
      setIndustrySelected(true);
    }
  }, []);

  useEffect(() => {
    setError({});
  }, [i18n.language]);

  useEffect(() => {
    if (industrySelected) {
      localStorage.setItem("industry", JSON.stringify(user.industry));
    } else {
      localStorage.removeItem("industry");
    }
  }, [user.industry, industrySelected]);

  let validationSchema = Yup.object().shape({
    companyName: Yup.string().required(
      `${t("companyInformationForm.validateCompanyName")}`
    ),
    phone: Yup.string()
      .test(
        "len",
        `${t("companyInformationForm.validatePhoneLength")}`,
        (val) => !val || val.length >= 10
      )
      .required(`${t("companyInformationForm.validatePhone")}`),
    address1: Yup.string().required(
      `${t("companyInformationForm.validateAddressLine1")}`
    ),
    city: Yup.string().required(`${t("companyInformationForm.validateCity")}`),
    state: Yup.string().required(
      `${t("companyInformationForm.validateStateProvince")}`
    ),
    country: Yup.string().required(
      `${t("companyInformationForm.validateCountry")}`
    ),
    zip: Yup.string().required(
      `${t("companyInformationForm.validateZipPostal")}`
    )
  });

  const handleInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleIndustryChange = (selectedOptions) => {
    setUser({ ...user, industry: selectedOptions });
    setIndustrySelected(selectedOptions && selectedOptions.length > 0); // Set industrySelected based on whether options are selected
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate(user, { abortEarly: false });
      successDialog();
      setError({});
    } catch (error) {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setError(errors);
    }
    if (user.country) {
      setCountrySelected(true);
    } else {
      setCountrySelected(false);
    }
  };

  const refresh = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const successDialog = () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Basic Information have been successfully updated",
      showConfirmButton: false,
      timer: 1500
    });
  };
  return (
    <>
      <Form>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="companyName" className="form-label fs-14">
              {t("companyInformationForm.companyName")}{" "}
              <span className="text-danger">*</span>
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
            <Form.Label htmlFor="phone" className="form-label fs-14">
              {t("companyInformationForm.phoneNo")}{" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup
              className={`${error.phone ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="phone"
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
            </Form.Label>
            <InputGroup
              className={`${error.address1 ? "border border-danger" : ""}`}
            >
              <Form.Control
                type="text"
                id="address1"
                name="address1"
                placeholder={t("companyInformationForm.enterAddressLine1")}
                value={user.address1}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
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
              {t("companyInformationForm.country")}{" "}
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
                options={options}
                className="default basic-multi-select"
                id="choices-multiple-default"
                menuPlacement="auto"
                classNamePrefix="Select2"
                onChange={(selectOption) => setCountry(selectOption.label)}
              />
            </InputGroup>
            {error.country && !countrySelected && (
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
          </Col>
        </Row>
        <Row className="mb-3">
          <span className="fs-14 fw-bolder mb-3 mt-1">
            {" "}
            {t("companyInformationForm.additionalInformation")}{" "}
          </span>
          <Col xl={7}>
            <Form.Label htmlFor="companyEmail" className="form-label fs-14">
              {t("companyInformationForm.companyEmail")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="email"
                id="email"
                name="email"
                placeholder={t("companyInformationForm.enterCompanyEmail")}
                value={user.email}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="phone2" className="form-label fs-14 ">
              {t("companyInformationForm.phoneNo2")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                id="phone2"
                name="phone2"
                placeholder={t("companyInformationForm.enterPhoneNo2")}
                value={user.phone2}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="faxNumber" className="form-label fs-14 ">
              {t("companyInformationForm.faxNo")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                id="faxNumber"
                name="faxNumber"
                placeholder={t("companyInformationForm.enterFaxNo")}
                value={user.faxNumber}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="website" className="form-label fs-14 ">
              {t("companyInformationForm.website")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                id="website"
                name="website"
                placeholder={t("companyInformationForm.enterWebsite")}
                value={user.website}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <Form.Label htmlFor="industry" className="form-label fs-14">
              {t("companyInformationForm.industry")}
            </Form.Label>
            <InputGroup className="d-inline-block">
              <Select
                placeholder={t("companyInformationForm.selectIndustry")}
                isMulti
                name="states[]"
                options={industry}
                className="basic-multi-select"
                isSearchable
                menuPlacement="auto"
                classNamePrefix="Select2"
                onChange={handleIndustryChange}
                value={user.industry}
              />
            </InputGroup>
            {error.website && (
              <div variant="danger" className="error-message text-danger">
                {error.website}
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

export default BasicInfomation;
