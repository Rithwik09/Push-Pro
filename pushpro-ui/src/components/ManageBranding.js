import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Col, Form, InputGroup, Row, OverlayTrigger, Popover } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { assetPrefix } from "../../next.config";
import * as Yup from "yup";
import useService from "@/hooks/useService";

const ManageBranding = (props) => {
  const { t } = useTranslation();
  const [images, setImages] = useState({});
  const [imageUrls, setImageUrls] = useState({
    mainLogo: "",
    toggleLogo: "",
    mainLogoDarkTheme: "",
    toggleLogoDarkTheme: "",
    rightSectionImage: ""
  });
  const [tempUrl, setTempUrl] = useState({
    mainLogo: "",
    toggleLogo: "",
    mainLogoDarkTheme: "",
    toggleLogoDarkTheme: "",
    rightSectionImage: ""
  });
  const [contractorTagLine, setContractorTagLine] = useState("");
  const [contractorDescription, setContractorDescription] = useState("");
  const [themeDataState, setThemeDataState] = useState({
    ynexMenu: "",
    primaryRGB: "",
    dynamiccolor: ""
  });
  const [isSaveDisabled, setSaveDisabled] = useState(false);
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const router = useRouter();
  const s3BasePath = process.env.NEXT_PUBLIC_BASE_S3_PATH || "";
  const [error, setError] = useState({});

  const validationSchema = Yup.object().shape({
    mainLogo: Yup.mixed()
      .required(t("manageBrandingForm.mainLogoRequired"))
      .test(
        "fileExists",
        t("manageBrandingForm.mainLogoRequired"),
        (value) => !!value
      )
  });

  const handleThemeColorUpdate = () => {
    document.querySelector(".switcher-icon").click();
    document.querySelector("#switcher-profile-tab").click();
  };

  const fetchBranding = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user_data"));
      const response = await service.get(
        `/get-contractor-branding/${userData?.user_uuid}`
      );

      if (response?.success && response?.data) {
        if (!response.data.main_logo || response.data.main_logo === "") {
          setError((prevError) => ({
            ...prevError,
            mainLogo: t("manageBrandingForm.mainLogoRequired")
          }));
        }
        setImageUrls({
          mainLogo: response.data.main_logo || "",
          toggleLogo: response.data.toggle_logo || "",
          mainLogoDarkTheme: response.data.main_logo_dark || "",
          toggleLogoDarkTheme: response.data.toggle_logo_dark || "",
          rightSectionImage: response.data.theme_data.rightSectionImage || ""
        });
        setContractorTagLine(response.data.theme_data.contractor_tagline || "");
        setContractorDescription(
          response.data.theme_data.contractor_description || ""
        );
      }
    } catch (error) {
      console.error("Error Fetching Branding Data :", error);
      handleErrorDialog({ message: t("errors.fetchBrandingFailed") });
    }
  };

  // set themes
  const setLocalTheme = () => {
    const storedYnexMenu = localStorage.getItem("ynexMenu");
    const storedPrimaryRGB = localStorage.getItem("primaryRGB");
    const storedDynamicColor = localStorage.getItem("dynamiccolor");
    const storedYnexHeader = localStorage.getItem("ynexHeader");
    const storedYnexdarktheme = localStorage.getItem("ynexdarktheme");
    const storedYnexmenuscrollable = localStorage.getItem("ynexmenuscrollable");
    const storedYnexheaderscrollable = localStorage.getItem(
      "ynexheaderscrollable"
    );
    const defaultColorOptions = [
      "58, 88, 146",
      "92, 144, 163",
      "161, 90, 223",
      "78, 172, 76",
      "223, 90, 90"
    ];
    const isPrimaryRGBValid = defaultColorOptions.includes(storedPrimaryRGB);
    const isDynamicColorValid =
      defaultColorOptions.includes(storedDynamicColor);
    const dynamicColor =
      isPrimaryRGBValid && isDynamicColorValid
        ? storedPrimaryRGB
        : storedDynamicColor;
    let finalColor = dynamicColor || storedPrimaryRGB;
    if (
      storedDynamicColor &&
      !defaultColorOptions.includes(storedDynamicColor)
    ) {
      finalColor = storedDynamicColor;
    }
    setThemeDataState({
      ynexMenu: storedYnexMenu ? storedYnexMenu : "",
      primaryRGB: finalColor,
      dynamiccolor: finalColor,
      storedPrimaryRGB1: finalColor,
      storedYnexHeader: storedYnexHeader ? storedYnexHeader : "",
      storedYnexdarktheme: storedYnexdarktheme ? storedYnexdarktheme : "",
      storedYnexmenuscrollable: storedYnexmenuscrollable
        ? storedYnexmenuscrollable
        : "",
      storedYnexheaderscrollable: storedYnexheaderscrollable
        ? storedYnexheaderscrollable
        : ""
    });
  };

  useEffect(() => {
    const handleClick = () => {
      setLocalTheme();
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (props.active) {
      fetchBranding();
    }
  }, [props.active]);

  const handleChange = (e, imageName) => {
    const file = e.target.files[0];
    setImages((prevImages) => ({ ...prevImages, [imageName]: file }));
    const tempImageUrl = URL.createObjectURL(file);
    setTempUrl((prevUrls) => ({ ...prevUrls, [imageName]: tempImageUrl }));
  };

  const prepareFormData = () => {
    const formData = new FormData();
    if (images.mainLogo) formData.append("main_logo", images.mainLogo);
    if (images.toggleLogo) formData.append("toggle_logo", images.toggleLogo);
    else formData.append("toggle_logo", imageUrls.toggleLogo);
    if (images.mainLogoDarkTheme)
      formData.append("main_logo_dark", images.mainLogoDarkTheme);
    else formData.append("main_logo_dark", imageUrls.mainLogoDarkTheme);
    if (images.toggleLogoDarkTheme)
      formData.append("toggle_logo_dark", images.toggleLogoDarkTheme);
    else formData.append("toggle_logo_dark", imageUrls.toggleLogoDarkTheme);
    if (images.rightSectionImage)
      formData.append("right_section_image", images.rightSectionImage);
    else
      formData.append("right_section_image", imageUrls.rightSectionImage || "");
    formData.append("theme_data", JSON.stringify(prepareThemeData()));
    return formData;
  };

  const prepareThemeData = () => {
    return {
      ynexMenu: themeDataState.ynexMenu,
      primaryRGB: themeDataState.primaryRGB,
      dynamiccolor: themeDataState.dynamiccolor,
      primaryRGB1: themeDataState.storedPrimaryRGB1,
      ynexHeader: themeDataState.storedYnexHeader,
      ynexdarktheme: themeDataState.storedYnexdarktheme,
      ynexmenuscrollable: themeDataState.storedYnexmenuscrollable,
      ynexheaderscrollable: themeDataState.storedYnexheaderscrollable,
      rightSectionImage: imageUrls.rightSectionImage || "",
      contractor_tagline: contractorTagLine,
      contractor_description: contractorDescription
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveDisabled(true);
    try {
      const isMainLogoValid =
        images.mainLogo || (imageUrls.mainLogo && imageUrls.mainLogo !== "");
      if (!isMainLogoValid) {
        setError((prevError) => ({
          ...prevError,
          mainLogo: t("manageBrandingForm.mainLogoRequired")
        }));
        handleErrorDialog({
          message: t("manageBrandingForm.mainLogoRequired")
        });
        setSaveDisabled(false);
        return;
      }
      setError({});
      const formData = prepareFormData();
      const response = await service.patch(
        `/myprofile/contractor-branding/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );
      if (response?.success && response?.data) {
        handleSuccessDialog(response);
        setError({});
      }
    } catch (error) {
      console.error("Error updating branding:", error);
      handleErrorDialog({
        message: t("errors.updateBrandingFailed")
      });
    } finally {
      setSaveDisabled(false);
    }
  };

  const refresh = (e) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
      <Form onSubmit={handleSubmit}>
          {error?.mainLogo && <div className="error-message text-danger">{error?.mainLogo}</div>}
          <Row>
              <Col className="d-flex justify-content-end">
                  <Button className="btn me-2" onClick={handleThemeColorUpdate}>
                      {t("manageBrandingForm.changeThemeColor")}
                  </Button>
                  <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="left"
                    overlay={
                        <Popover id="popover-profileImage">
                            <Popover.Body>{t("tooltips.changeThemeColor")}</Popover.Body>
                        </Popover>
                    }
                >
                    <span
                        className="text-muted ms-2"
                        style={{
                            cursor: "help",
                            fontSize: "0.8em",
                            verticalAlign: "super",
                        }}
                    >
                        <i class="bi bi-question-circle bold-icon"></i>
                    </span>
                    </OverlayTrigger>
              </Col>
          </Row>
          {["mainLogo", "toggleLogo", "mainLogoDarkTheme", "toggleLogoDarkTheme", "rightSectionImage"].map(
              (imageType) => (
                  <Row className="mb-3" key={imageType}>
                      <Col xl={7}>
                          <label htmlFor={imageType} className="form-label fs-14">
                              {t(`manageBrandingForm.${imageType}`)}
                              {imageType === "mainLogo" && <span className="text-danger">*</span>}
                              <OverlayTrigger
                                  trigger={["hover", "focus"]}
                                  placement="top"
                                  overlay={
                                      <Popover id="popover-profileImage">
                                          <Popover.Body>{t(`tooltips.${imageType}`)}</Popover.Body>
                                      </Popover>
                                  }
                              >
                                  <span
                                      className="text-muted ms-2"
                                      style={{
                                          cursor: "help",
                                          fontSize: "0.8em",
                                          verticalAlign: "super",
                                      }}
                                  >
                                      <i class="bi bi-question-circle bold-icon"></i>
                                  </span>
                              </OverlayTrigger>
                          </label>
                          <InputGroup
                              className={`${imageType === "mainLogo" && error.mainLogo ? "border border-danger" : ""}`}
                          >
                              <Form.Control
                                  type="file"
                                  id={imageType}
                                  name={imageType}
                                  className="form-control"
                                  onChange={(e) => handleChange(e, imageType)}
                              />
                          </InputGroup>
                      </Col>
                      <Col xl={5}>
                          <img
                              src={
                                  tempUrl[imageType]
                                      ? tempUrl[imageType]
                                      : imageUrls[imageType]
                                      ? `${s3BasePath}${imageUrls[imageType]}`
                                      : `${assetPrefix}/assets/images/imgs/no_image_found.jpg`
                              }
                              alt={t(`manageBrandingForm.${imageType}`)}
                              className="view-logo-img"
                          />
                      </Col>
                  </Row>
              )
          )}
          <Row className="mb-3">
              <Col xl={7}>
                  <label htmlFor="contractorTagLine" className="form-label fs-14">
                      {t("manageBrandingForm.contractorTagLine")}
                      <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={
                        <Popover id="popover-profileImage">
                            <Popover.Body>{t("tooltips.contractorTagLine")}</Popover.Body>
                        </Popover>
                    }
                >
                    <span
                        className="text-muted ms-2"
                        style={{
                            cursor: "help",
                            fontSize: "0.8em",
                            verticalAlign: "super",
                        }}
                    >
                        <i class="bi bi-question-circle bold-icon"></i>
                    </span>
                    </OverlayTrigger>
                  </label>
                  <InputGroup>
                      <Form.Control
                          type="text"
                          id="contractorTagLine"
                          name="contractorTagLine"
                          className="form-control"
                          value={contractorTagLine}
                          onChange={(e) => setContractorTagLine(e.target.value)}
                          placeholder={t("manageBrandingForm.enterContractorTagLine")}
                      />
                  </InputGroup>
              </Col>
          </Row>
          <Row className="mb-3">
              <Col xl={7}>
                  <label htmlFor="contractorDescription" className="form-label fs-14">
                      {t("manageBrandingForm.contractorDescription")}
                      <OverlayTrigger
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={
                        <Popover id="popover-profileImage">
                            <Popover.Body>{t("tooltips.contractorDescription")}</Popover.Body>
                        </Popover>
                    }
                >
                    <span
                        className="text-muted ms-2"
                        style={{
                            cursor: "help",
                            fontSize: "0.8em",
                            verticalAlign: "super",
                        }}
                    >
                        <i class="bi bi-question-circle bold-icon"></i>
                    </span>
                    </OverlayTrigger>
                  </label>
                  <InputGroup>
                      <Form.Control
                          as="textarea"
                          id="contractorDescription"
                          name="contractorDescription"
                          className="form-control"
                          rows={3}
                          value={contractorDescription}
                          onChange={(e) => setContractorDescription(e.target.value)}
                          placeholder={t("manageBrandingForm.enterContractorDescription")}
                      />
                  </InputGroup>
              </Col>
          </Row>
          <Row className="mb-3">
              <Col>
                  <Button className="btn btn-primary me-2" type="submit" disabled={isSaveDisabled}>
                      {t("buttons.save")}
                  </Button>
                  <Button className="btn btn-danger" type="button" onClick={refresh}>
                      {t("buttons.cancel")}
                  </Button>
              </Col>
          </Row>
      </Form>
  );
};

export default ManageBranding;
