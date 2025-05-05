import React from "react";
import { Nav } from "react-bootstrap";

const ProjectNavTabsMobile = ({
  activeTab,
  setActiveTab,
  t,
  completedTabs,
  setCompletedTabs,
  projectID
}) => {
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

  const isTabEnabled = (tabIndex) => {
    return tabIndex <= activeTab; // Enable tabs up to the current active tab
  };

  const handleTabClick = (eventKey) => {
    if (isTabEnabled(eventKey)) {
      setActiveTab(eventKey);
      updateURL(eventKey);
    }
    // Remove completed class from the clicked tab and all subsequent tabs
    const newCompletedTabs = completedTabs.filter((tab) => tab < eventKey);
    setCompletedTabs(newCompletedTabs);
  };

  const tabs = [
    {
      eventKey: 1,
      icon: "bi bi-geo-alt icon-01 project-icons-align",
      label: t("projectNavTabs.serviceAddress")
    },
    {
      eventKey: 2,
      icon: "bi bi-calendar2-week icon-02 project-icons-align",
      label: t("projectNavTabs.schedule")
    },
    {
      eventKey: 3,
      icon: "bi bi-cash-coin icon-03 project-icons-align",
      label: t("projectNavTabs.budget")
    },
    {
      eventKey: 4,
      icon: "bi bi-journal-text icon-04 project-icons-align",
      label: t("projectNavTabs.requirements")
    },
    {
      eventKey: 5,
      icon: "bi bi-journal-check icon-04 project-icons-align",
      label: t("projectNavTabs.projectSummaryMobile")
    }
  ];

  // Calculate the range of visible tabs based on the active tab
  const visibleTabs = () => {
    if (activeTab <= 2) {
      return tabs.slice(0, 3); // Show the first three tabs
    } else if (activeTab >= tabs.length - 1) {
      return tabs.slice(-3); // Show the last three tabs
    } else {
      return tabs.slice(activeTab - 2, activeTab + 1); // Center the active tab
    }
  };

  return (
    <>
      <Nav
        className="nav-tabs tab-style-2 tab-style-3 nav-justified mb-3 d-sm-flex align-items-center"
        id="myTab1"
        role="tablist"
      >
        {visibleTabs().map((tab) => (
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
              <label>{tab.label}</label>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    </>
  );
};

export default ProjectNavTabsMobile;
