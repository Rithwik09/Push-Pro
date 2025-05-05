import React, { useState } from "react";
import { Button, Form, Row, Col, InputGroup, Card } from "react-bootstrap";
import { useRouter } from "next/router";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import * as Yup from "yup";
import userJson from "../../shared/data/json/users.json";
import { useTranslation } from "react-i18next";

const socialLinks = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState({});
  const [user, setUser] = useState({
    websiteUrl: userJson[3].websiteUrl,
    facebookUrl: userJson[3].facebookUrl,
    googleUrl: userJson[3].googleUrl,
    instagramUrl: userJson[3].instagramUrl,
    yelpUrl: userJson[3].websiteUrl
  });

  const handleInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleDetailsSubmit = () => {
    successDialog();
  };

  const refresh = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const successDialog = () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Social Links have been successfully updated",
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    <>
      <Form>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="websiteUrl" className="form-label fs-14 ">
              {t("socialLinksForm.websiteURL")}
            </label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-globe" aria-hidden="true"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                id="websiteUrl"
                name="websiteUrl"
                placeholder={t("socialLinksForm.enterWebsiteURL")}
                value={user.websiteUrl}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="facebookUrl" className="form-label fs-14 ">
              {t("socialLinksForm.facebookURL")}
            </label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-facebook" aria-hidden="true"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                id="facebookUrl"
                name="facebookUrl"
                placeholder={t("socialLinksForm.enterFacebookURL")}
                value={user.facebookUrl}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="googleUrl" className="form-label fs-14 ">
              {t("socialLinksForm.googleBusinessURL")}
            </label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-google" aria-hidden="true"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                id="googleUrl"
                name="googleUrl"
                placeholder={t("socialLinksForm.enterGoogleBusinessURL")}
                value={user.googleUrl}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="instagramUrl" className="form-label fs-14 ">
              {t("socialLinksForm.instaBusinessURL")}
            </label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-instagram" aria-hidden="true"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                id="instagramUrl"
                name="instagramUrl"
                placeholder={t("socialLinksForm.enterInstaBusinessURL")}
                value={user.instagramUrl}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="yelpUrl" className="form-label fs-14 ">
              {t("socialLinksForm.yelpURL")}
            </label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-yelp" aria-hidden="true"></i>
              </InputGroup.Text>
              <Form.Control
                type="url"
                id="yelpUrl"
                name="yelpUrl"
                placeholder={t("socialLinksForm.enterYelpURL")}
                value={user.yelpUrl}
                className="form-control"
                onChange={handleInput}
              />
            </InputGroup>
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

export default socialLinks;
