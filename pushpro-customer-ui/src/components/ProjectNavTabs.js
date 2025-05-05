import React from "react";
import { Nav } from "react-bootstrap";

const ProjectNavTabs = ({
  activeTab,
  setActiveTab,
  t,
  completedTabs,
  setCompletedTabs,
  projectID
}) => {
  const isTabEnabled = (tabIndex) => tabIndex <= activeTab;

  const updateURL = (tabIndex) => {
    if (projectID) {
      const tabNames = [
        "address",
        "schedule",
        "budget",
        "requirements",
        "summary"
      ];
      const newURL = `/myprojects/edit/${projectID}/${tabNames[tabIndex - 1]}`;
      window.history.pushState({}, "", newURL);
    }
  };

  const handleTabClick = (eventKey) => {
    if (isTabEnabled(eventKey)) {
      setActiveTab(eventKey);
      updateURL(eventKey);
    }
    const newCompletedTabs = completedTabs.filter((tab) => tab < eventKey);
    setCompletedTabs(newCompletedTabs);
  };

  const tabs = [
    {
      eventKey: 1,
      icon: "bi bi-geo-alt icon-01",
      label: t("projectNavTabs.serviceAddress")
    },
    {
      eventKey: 2,
      icon: "bi bi-calendar2-week icon-02",
      label: t("projectNavTabs.schedule")
    },
    {
      eventKey: 3,
      icon: "bi bi-cash-coin icon-03",
      label: t("projectNavTabs.budget")
    },
    {
      eventKey: 4,
      icon: "bi bi-journal-text icon-04",
      label: t("projectNavTabs.requirements")
    },
    {
      eventKey: 5,
      icon: "bi bi-journal-check icon-04",
      label: t("projectNavTabs.projectSummary")
    }
  ];

  return (
    <>
      <Nav
        className="nav-tabs tab-style-2 nav-justified mb-3 d-sm-flex d-block align-items-center"
        id="myTab1"
        role="tablist"
      >
        {tabs.map((tab) => (
          <Nav.Item as="li" role="presentation" key={tab.eventKey}>
            <Nav.Link
              data-bs-toggle="tab"
              eventKey={tab.eventKey}
              data-bs-target={`#${tab.label
                .toLowerCase()
                .replace(" ", "-")}-pane`}
              type="button"
              role="tab"
              aria-controls={`${tab.label
                .toLowerCase()
                .replace(" ", "-")}-pane`}
              aria-selected={activeTab === tab.eventKey}
              className={`d-flex align-items-center flex-column ${
                completedTabs.includes(tab.eventKey) ? "completed" : ""
              }`}
              onClick={() => handleTabClick(tab.eventKey)}
              style={
                !isTabEnabled(tab.eventKey) ? { pointerEvents: "none" } : {}
              }
            >
              <i className={tab.icon}></i>
              <label className="max-content-width">{tab.label}</label>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </>
  );
};

export default ProjectNavTabs;
