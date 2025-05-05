import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { assetPrefix } from "../../next.config";

const ManageBranding = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  const router = useRouter();

  const handleChange = (e, imageName) => {
    const file = e.target.files[0];
    setImage((prevImages) => ({ ...prevImages, [imageName]: file }));

    const tempImageUrl = URL.createObjectURL(file);
    setImageUrls((prevUrls) => ({ ...prevUrls, [imageName]: tempImageUrl }));
  };

  const handleUpload = async (e, imageName) => {
    e.preventDefault();
    const uploadedImage = image[imageName];
    if (!uploadedImage) {
      alert("Please select an image");
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const uploadedImageUrl = URL.createObjectURL(uploadedImage);
      setImageUrls((prevUrls) => ({
        ...prevUrls,
        [imageName]: uploadedImageUrl
      }));
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert("Error uploading image.");
    }
  };

  const refresh = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleThemeColorUpdate = () => {
    document.querySelector(".switcher-icon").click();
    document.querySelector("#switcher-profile-tab").click();
  };

  return (
    <>
      <Form>
        <Row>
          <Col className="d-flex justify-content-end">
            <Button className="btn me-2" onClick={handleThemeColorUpdate}>
              {t("manageBrandingForm.changeThemeColor")}
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="mainLogo" className="form-label fs-14">
              {" "}
              {t("manageBrandingForm.mainLogo")}
              <span className="text-danger">*</span>
            </label>
            <InputGroup>
              <Form.Control
                type="file"
                id="mainLogo"
                name="mainLogo"
                className="form-control"
                onChange={(e) => handleChange(e, "mainLogo")}
              />
            </InputGroup>
          </Col>
          {/* {imageUrls["mainLogo"] && ( */}
          <Col xl={5}>
            {/* <img src={imageUrls["mainLogo"]} alt="logo image" className="view-logo-img" /> */}
            <img
              src={`${assetPrefix}/assets/images/imgs/image-13.jpg`}
              alt="logo image"
              className="view-logo-img"
            />
          </Col>
          {/* )} */}
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="toggleLogo" className="form-label fs-14">
              {" "}
              {t("manageBrandingForm.toggleLogo")}{" "}
            </label>
            <InputGroup>
              <Form.Control
                type="file"
                id="toggleLogo"
                name="toggleLogo"
                className="form-control"
                onChange={(e) => handleChange(e, "toggleLogo")}
              />
            </InputGroup>
          </Col>
          {/* {imageUrls["toggleLogo"] && ( */}
          <Col xl={5}>
            {/* <img src={imageUrls["toggleLogo"]} alt="toggle logo" className="view-logo-img" /> */}
            <img
              src={`${assetPrefix}/assets/images/imgs/image-6.jpg`}
              alt="toggle logo"
              className="view-logo-img"
            />
          </Col>
          {/* )} */}
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="darkMainLogo" className="form-label fs-14">
              {" "}
              {t("manageBrandingForm.mainLogoDarkTheme")}{" "}
            </label>
            <InputGroup>
              <Form.Control
                type="file"
                id="darkMainLogo"
                name="darkMainLogo"
                className="form-control"
                onChange={(e) => handleChange(e, "darkMainLogo")}
              />
            </InputGroup>
          </Col>
          {/* {imageUrls["darkMainLogo"] && ( */}
          <Col xl={5}>
            {/* <img src={imageUrls["darkMainLogo"]} alt="dark main logo" className="view-logo-img" /> */}
            <img
              src={`${assetPrefix}/assets/images/imgs/image-2.jpg`}
              alt="dark main logo"
              className="view-logo-img"
            />
          </Col>
          {/* )} */}
        </Row>
        <Row className="mb-3">
          <Col xl={7}>
            <label htmlFor="darkToggleLogo" className="form-label fs-14">
              {" "}
              {t("manageBrandingForm.toggleLogoDarkTheme")}{" "}
            </label>
            <InputGroup>
              <Form.Control
                type="file"
                id="darkToggleLogo"
                name="darkToggleLogo"
                className="form-control"
                onChange={(e) => handleChange(e, "darkToggleLogo")}
              />
            </InputGroup>
          </Col>
          {/* {imageUrls["darkToggleLogo"] && ( */}
          <Col xl={5}>
            {/* <img src={imageUrls["darkToggleLogo"]} alt="dark toggle logo" className="view-logo-img" /> */}
            <img
              src={`${assetPrefix}/assets/images/imgs/image-1.jpg`}
              alt="dark toggle logo"
              className="view-logo-img"
            />
          </Col>
          {/* )} */}
        </Row>
        <Row className="mb-3">
          <Col>
            <Button
              className="btn btn-primary me-2"
              type="submit"
              onClick={(e) => handleUpload(e, "mainLogo")}
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

export default ManageBranding;
