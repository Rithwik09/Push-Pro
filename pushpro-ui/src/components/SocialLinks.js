import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";

const SocialLinks = (props) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    websiteUrl: "",
    facebookUrl: "",
    googleUrl: "",
    instagramUrl: "",
    yelpUrl: "",
    linkedInUrl: ""
  });

  const fetchSocialLinks = async () => {
    try {
      const response = await service.get("/myprofile/social-links");
      if (response?.success) {
        const socialLinks = response.data.social_links;
        setUser({
          websiteUrl: socialLinks.websiteUrl || "",
          facebookUrl: socialLinks.facebookUrl || "",
          googleUrl: socialLinks.googleUrl || "",
          instagramUrl: socialLinks.instagramUrl || "",
          yelpUrl: socialLinks.yelpUrl || "",
          linkedInUrl: socialLinks.linkedInUrl || ""
        });
        setLoading(false);
      }
    } catch (error) {
      setUser({
        websiteUrl: "",
        facebookUrl: "",
        googleUrl: "",
        instagramUrl: "",
        yelpUrl: "",
        linkedInUrl: ""
      });
    }
  };
  if (loading) {
    return <Spinner variant="primary" animation="border" size="md" />;
  }
  useEffect(() => {
    if (props.active) {
      fetchSocialLinks();
    }
  }, [props.active]);

  useEffect(() => {
    setError({});
  }, [i18n.language]);

  const handleInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await service.patch("/myprofile/social-links", {
        social_links: user
      });
      if (response?.success) {
        handleSuccessDialog(response);
        setUser({
          websiteUrl: response.data.social_links.websiteUrl || "",
          facebookUrl: response.data.social_links.facebookUrl || "",
          googleUrl: response.data.social_links.googleUrl || "",
          instagramUrl: response.data.social_links.instagramUrl || "",
          yelpUrl: response.data.social_links.yelpUrl || "",
          linkedInUrl: response.data.social_links.linkedInUrl || ""
        });
      }
    } catch (err) {
      err = {
        message: "Cannot Update Social Links"
      };
      handleErrorDialog(err);
    }
  };

  const refresh = () => {
    router.push("/dashboard");
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
          <Col xl={7}>
            <label htmlFor="linkedInUrl" className="form-label fs-14 ">
              {t("socialLinksForm.linkedinURL")}
            </label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-linkedin" aria-hidden="true"></i>
              </InputGroup.Text>
              <Form.Control
                type="url"
                id="linkedInUrl"
                name="linkedInUrl"
                placeholder={t("socialLinksForm.enterlinkedinURL")}
                value={user.linkedInUrl}
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

export default SocialLinks;
