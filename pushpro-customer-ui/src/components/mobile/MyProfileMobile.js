import React, { useState } from "react";
import { Nav, Accordion } from "react-bootstrap";
import { useRouter } from "next/router";
import AccountInformation from "../AccountInformation";
import ChangePassword from "../ChangePassword";
import NotificationsPreferences from "../NotificationsPreferences";
import { useTranslation } from "react-i18next";
import { getDeviceType } from "../../utils/device";

const MyProfileMobile = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const router = useRouter();
  const deviceType = getDeviceType();
  const goBack = () => {
    router.back();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprofile`, title: t("profile.editProfile") }
  ];
  return (
    <>
      <Accordion defaultActiveKey="" className="accordion">
        <Accordion.Item eventKey="0">
          <Accordion.Header onClick={() => handleTabChange("edit-profile")}>
            <Nav.Link
              className={`nav-link ${
                activeTab === "edit-profile" ? "active" : ""
              }`}
            >
              <i className="ri-account-circle-line me-2 align-middle d-inline-block "></i>{" "}
              {t("editProfileSidebar.accountInformation")}
            </Nav.Link>
          </Accordion.Header>
          <Accordion.Body>
            <AccountInformation active={activeTab === "edit-profile"} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header onClick={() => handleTabChange("change-password")}>
            <Nav.Link
              className={`nav-link ${
                activeTab === "change-password" ? "active" : ""
              }  `}
            >
              <i className="ri-home-gear-line me-2 align-middle d-inline-block"></i>
              {t("editProfileSidebar.changePassword")}
            </Nav.Link>
          </Accordion.Header>
          <Accordion.Body>
            <ChangePassword active={activeTab === "change-password"} />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header
            onClick={() => handleTabChange("notification-preferences")}
          >
            <Nav.Link
              className={`nav-link ${
                activeTab === "notification-preferences" ? "active" : ""
              } `}
            >
              <i className="ri-notification-2-line me-2 align-middle d-inline-block"></i>
              {t("editProfileSidebar.notificationPreferences")}
            </Nav.Link>
          </Accordion.Header>
          <Accordion.Body>
            <NotificationsPreferences
              active={activeTab === "notification-preferences"}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export default MyProfileMobile;
