import React, { useState, useEffect } from "react";
import { Button, Card } from "react-bootstrap";
import { useRouter } from "next/router";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import { useTranslation } from "react-i18next";
import MyProfile from "../../components/MyProfile";
import { getDeviceType } from "../../utils/device";
import MyProfileMobile from "../../components/mobile/MyProfileMobile";

const Index = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState();
  const [deviceType, setDeviceType] = useState("");

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

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const type = getDeviceType();
      setDeviceType(type);
    }
  }, []);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprofile`, title: t("profile.editProfile") }
  ];

  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card">
        <Card.Header className="d-flex justify-content-between">
          <Card.Title className="dark-text">
            {t("editProfileSidebar.editProfile")}
          </Card.Title>
          <div className="prism-toggle">
            <Button
              variant="primary-light"
              className="btn btn-sm d-flex align-items-center"
              onClick={goBack}
            >
              <i
                className="bx bx-left-arrow-circle me-1"
                style={{ fontSize: "20px" }}
              ></i>{" "}
              {t("buttons.back")}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* {deviceType === 'desktop' ? <MyProfile /> : <MyProfileMobile/> } */}
          {isMobile ? <MyProfileMobile /> : <MyProfile />}
        </Card.Body>
      </Card>
    </>
  );
};

Index.layout = "Contentlayout";

export default Index;
