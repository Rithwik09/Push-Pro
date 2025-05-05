import React, { useEffect, useState } from "react";
import { Nav, Tab } from "react-bootstrap";
import { useRouter } from "next/router";
import AccountInformation from "./AccountInformation";
import ChangePassword from "./ChangePassword";
import NotificationsPreferences from "./NotificationsPreferences";
import { useTranslation } from "react-i18next";

const MyProfile = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("edit-profile");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprofile`, title: t("profile.editProfile") }
  ];
  return (
    <>
      <div className="row">
        <div className="col-md-4 col-xl-3 col-xxl-2 px-0">
          <Nav
            className="nav flex-column mb-0 border-0 tab-style-7"
            id="myTab"
            role="tablist"
          >
            <Nav.Item className="mb-0">
              <Nav.Link
                eventKey="edit-profile"
                className={`nav-link ${
                  activeTab === "edit-profile" ? "active" : ""
                }`}
                onClick={() => handleTabChange("edit-profile")}
              >
                <i className="ri-account-circle-line me-2 align-middle d-inline-block "></i>{" "}
                {t("editProfileSidebar.accountInformation")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-0">
              <Nav.Link
                eventKey="change-password"
                className={`nav-link ${
                  activeTab === "change-password" ? "active" : ""
                }  `}
                onClick={() => handleTabChange("change-password")}
              >
                <i className="ri-home-gear-line me-2 align-middle d-inline-block"></i>
                {t("editProfileSidebar.changePassword")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-0">
              <Nav.Link
                eventKey="notification-preferences"
                className={`nav-link ${
                  activeTab === "notification-preferences" ? "active" : ""
                } `}
                onClick={() => handleTabChange("notification-preferences")}
              >
                <i className="ri-notification-2-line me-2 align-middle d-inline-block"></i>
                {t("editProfileSidebar.notificationPreferences")}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>
        <div className="col-md-8 col-xl-9 col-xxl-10">
          <Tab.Content id="tab-style-7">
            <Tab.Container className="fade p-0 border-0" activeKey={activeTab}>
              <Tab.Pane eventKey="edit-profile">
                <AccountInformation active={activeTab === "edit-profile"} />
              </Tab.Pane>
              <Tab.Pane eventKey="change-password">
                <ChangePassword active={activeTab === "change-password"} />
              </Tab.Pane>
              <Tab.Pane eventKey="notification-preferences">
                <NotificationsPreferences
                  active={activeTab === "notification-preferences"}
                />
              </Tab.Pane>
            </Tab.Container>
          </Tab.Content>
        </div>
      </div>
    </>
  );
};

export default MyProfile;
