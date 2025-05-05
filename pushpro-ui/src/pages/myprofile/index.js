import React, { useState, useEffect, lazy, Suspense } from "react";
import { Nav, Tab, Accordion, Card, Button, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Pageheader from "../../../shared/layout-components/header/pageheader";

// Lazy loading components
const AccountInformation = lazy(() =>
  import("../../components/AccountInformation")
);
const ChangePassword = lazy(() => import("../../components/ChangePassword"));
const NotificationsPreferences = lazy(() =>
  import("../../components/NotificationsPreferences")
);
const CompanyInformation = lazy(() =>
  import("../../components/CompanyInfomation")
);
const SocialLinks = lazy(() => import("../../components/SocialLinks"));
const ManageBranding = lazy(() => import("../../components/ManageBranding"));
const LicenseAndInsurance = lazy(() =>
  import("../../components/LicenseAndInsurance")
);
const Certificates = lazy(() => import("../../components/Certificates"));
const ContractText = lazy(() => import("../../components/ContractText"));

const MyProfile = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(
    router.query.activeTab || "edit-profile"
  );
  const [isMobile, setIsMobile] = useState(false);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Synchronize activeTab with router query
  useEffect(() => {
    if (router.query.activeTab) {
      setActiveTab(router.query.activeTab);
    }
  }, [router.query.activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, activeTab: tab }
      },
      undefined,
      { shallow: true }
    );
  };

  const goBack = () => {
    router.back();
  };

  const navItems = [
    {
      eventKey: "edit-profile",
      icon: "ri-account-circle-line",
      title: t("editProfileSidebar.accountInformation")
    },
    {
      eventKey: "change-password",
      icon: "ri-home-gear-line",
      title: t("editProfileSidebar.changePassword")
    },
    {
      eventKey: "notification-preferences",
      icon: "ri-notification-2-line",
      title: t("editProfileSidebar.notificationPreferences")
    },
    {
      eventKey: "company-information",
      icon: "ri-building-line",
      title: t("editProfileSidebar.companyInformation")
    },
    {
      eventKey: "contract-text",
      icon: "bi bi-file-medical",
      title: t("breadCrumb.contractText")
    },
    {
      eventKey: "manage-branding",
      icon: "ri-palette-line",
      title: t("editProfileSidebar.manageBranding")
    },
    {
      eventKey: "social-links",
      icon: "ri-links-line",
      title: t("editProfileSidebar.socialLinks")
    },
    {
      eventKey: "license-insurance",
      icon: "bi bi-file-earmark-break",
      title: t("editProfileSidebar.licenseAndInsurance")
    },
    {
      eventKey: "certificates",
      icon: "bi bi-file-earmark",
      title: t("editProfileSidebar.certificates")
    }
  ];

  const renderNavLinks = () => {
    return navItems.map(({ eventKey, icon, title }) => (
      <Nav.Item className="mb-0" key={eventKey}>
        <Nav.Link
          eventKey={eventKey}
          className={`nav-link ${activeTab === eventKey ? "active" : ""}`}
          onClick={() => handleTabChange(eventKey)}
        >
          <i className={`${icon} me-2 align-middle d-inline-block`}></i>
          {title}
        </Nav.Link>
      </Nav.Item>
    ));
  };

  const renderTabContent = () => {
    return navItems.map(({ eventKey }) => {
      const componentProps = {
        active: activeTab === eventKey,
        key: eventKey
      };

      // Add specific props for ContractText
      if (eventKey === "contract-text") {
        componentProps.getUrl = "/myprofile/contract-text";
        componentProps.patchUrl = "/myprofile/contract-text";
        componentProps.showButtons = true;
      }

      const componentMap = {
        "edit-profile": AccountInformation,
        "change-password": ChangePassword,
        "notification-preferences": NotificationsPreferences,
        "company-information": CompanyInformation,
        "contract-text": ContractText,
        "manage-branding": ManageBranding,
        "social-links": SocialLinks,
        "license-insurance": LicenseAndInsurance,
        certificates: Certificates
      };

      const Component = componentMap[eventKey];
      return (
        <Tab.Pane eventKey={eventKey} key={eventKey}>
          <Suspense
            fallback={
              <Spinner variant="primary" animation="border" size="md" />
            }
          >
            <Component {...componentProps} />
          </Suspense>
        </Tab.Pane>
      );
    });
  };

  const renderMobileContent = () => {
    return (
      <Accordion activeKey={activeTab} onSelect={handleTabChange}>
        {navItems.map(({ eventKey, icon, title }, index) => {
          const componentProps = {
            active: activeTab === eventKey
          };

          if (eventKey === "contract-text") {
            componentProps.getUrl = "/myprofile/contract-text";
            componentProps.patchUrl = "/myprofile/contract-text";
            componentProps.showButtons = true;
          }

          const componentMap = {
            "edit-profile": AccountInformation,
            "change-password": ChangePassword,
            "notification-preferences": NotificationsPreferences,
            "company-information": CompanyInformation,
            "contract-text": ContractText,
            "manage-branding": ManageBranding,
            "social-links": SocialLinks,
            "license-insurance": LicenseAndInsurance,
            certificates: Certificates
          };

          const Component = componentMap[eventKey];

          return (
            <Accordion.Item eventKey={eventKey} key={eventKey}>
              <Accordion.Header onClick={() => handleTabChange(eventKey)}>
                <i className={`${icon} me-2 align-middle d-inline-block`}></i>{" "}
                {title}
              </Accordion.Header>
              <Accordion.Body>
                <Suspense
                  fallback={
                    <Spinner variant="primary" animation="border" size="md" />
                  }
                >
                  <Component {...componentProps} />
                </Suspense>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    );
  };

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
              className="btn-spacing btn btn-sm d-flex align-items-center"
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
          {isMobile ? (
            renderMobileContent()
          ) : (
            <div className="row">
              <div className="col-md-4 col-xl-3 col-xxl-2 px-0">
                <Nav
                  className="nav flex-column mb-0 border-0 tab-style-7"
                  id="myTab"
                  role="tablist"
                >
                  {renderNavLinks()}
                </Nav>
              </div>
              <div className="col-md-8 col-xl-9 col-xxl-10">
                <Tab.Container activeKey={activeTab}>
                  <Tab.Content id="tab-style-7">
                    {renderTabContent()}
                  </Tab.Content>
                </Tab.Container>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

MyProfile.layout = "Contentlayout";

export default MyProfile;
