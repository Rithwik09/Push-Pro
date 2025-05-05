import React, { useEffect, useState } from "react";
import { Card, Col, Row, Tab } from "react-bootstrap";
import Pageheader from "../../../../shared/layout-components/header/pageheader";
import { useTranslation } from "react-i18next";
import ProjectNavTabs from "../../../components/ProjectNavTabs";
import ProjectNavTabsMobile from "../../../components/mobile/ProjectNavTabsMobile";
import ServiceAddressContent from "../../../components/ServiceAddressContent";
import SchedulePaneContent from "../../../components/SchedulePaneContent";
import BudgetPaneContent from "../../../components/BudgetPaneContent";
import RequirementsPane from "../../../components/RequirementsPane";
import SummaryPane from "../../../components/SummaryPaneContent";
import { getDeviceType } from "../../../utils/device";
import { useRouter } from "next/router";
import useService from "@/hooks/useService";

const CreateProject = () => {
  const [isMobile, setIsMobile] = useState();
  const [deviceType, setDeviceType] = useState("");
  const [projectID, setProjectID] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [responseData, setResponseData] = useState();
  const [areas, setAreas] = useState();
  const [services, setServices] = useState();
  const service = useService();
  const router = useRouter();
  const newProjectID = router.query.projectID;
  const updateURL = (tabIndex) => {
    if (projectID) {
      const tabNames = [
        "address",
        "schedule",
        "budget",
        "requirements",
        "summary"
      ];
      const newURL = `${basePath}/myprojects/edit/${projectID}/${
        tabNames[tabIndex - 1]
      }`;
      window.history.pushState({}, "", newURL);
    }
  };
  useEffect(() => {
    const path = router.asPath;
    const pathParts = path.split("/");
    if (
      pathParts.length >= 5 &&
      pathParts[1] === "myprojects" &&
      pathParts[2] === "edit"
    ) {
      const projectId = pathParts[3];
      const tabName = pathParts[4];
      const tabIndex =
        ["address", "schedule", "budget", "requirements", "summary"].indexOf(
          tabName
        ) + 1;
      if (tabIndex > 0) {
        setActiveTab(tabIndex);
        setProjectID(projectId);
        for (let i = 1; i < tabIndex; i++) {
          setCompletedTabs((prevState) => [...prevState, i]);
        }
      }
    }
  }, [router.asPath]);

  const fetchData = async () => {
    try {
      const id = newProjectID || projectID;
      const response = await service.get(`/project/${id}`);
      if (response?.success) {
        setResponseData(response);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const fetchAreas = async () => {
    try {
      const response = await service.get("/areas");
      if (response?.success) {
        const areas = response.data.map((area) => ({
          value: area.id,
          label: area.name
        }));
        setAreas(areas);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }
  };
  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await service.get("/services");
      if (response?.success) {
        const servicesData = response.data.map((service) => ({
          value: service.id,
          label: service.name
        }));
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (projectID) {
      fetchData();
    }
  }, [projectID]);

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    updateURL(tabIndex);
  };

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const type = getDeviceType();
      setDeviceType(type);
    }
  }, []);
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(1);
  const [showRenAddForm, setShowRenAddForm] = useState(true);
  const [showResCommForm, setShowResCommForm] = useState(false);
  const [showWhatRenovateForm, setShowWhatRenovateForm] = useState(false);
  const [showServicesForm, setShowServicesForm] = useState(false);
  const [showDocumentsForm, setShowDocumentsForm] = useState(false);
  const [completedTabs, setCompletedTabs] = useState([]);
  const [rows, setRows] = useState([
    {
      id: 1,
      title: "",
      document: null
    }
  ]);
  const [schedulePreferences, setschedulePreferences] = useState("off");
  const [budgetSwitch, setbudgetSwitch] = useState("off");
  const markTabAsCompleted = (tabIndex, isComplete) => {
    if (isComplete) {
      if (!completedTabs.includes(tabIndex)) {
        setCompletedTabs([...completedTabs, tabIndex]);
      }
    } else {
      setCompletedTabs(completedTabs.filter((tab) => tab !== tabIndex));
    }
  };

  // Service Addresss clicks
  const handleServiceNextClick = () => {
    // if (projectID) {
    markTabAsCompleted(1, true);
    setActiveTab(2);
    handleTabChange(2);
    // }
  };

  // callback function to update projectID
  const handleProjectIDChange = (newProjectID) => {
    setProjectID(newProjectID);
  };

  // Schedule clicks
  const handleScheduleBackClick = () => {
    markTabAsCompleted(1, false);
    setActiveTab(1);
    handleTabChange(1);
    setActivePage(1);
    fetchData();
  };
  const handleScheduleNextClick = () => {
    markTabAsCompleted(2, true);
    setActiveTab(3);
    handleTabChange(3);
  };
  const toggleSchedulePreferences = () => {
    setschedulePreferences((prevState) => (prevState === "on" ? "off" : "on"));
  };

  // Budget clicks
  const toggleBudget = () => {
    setbudgetSwitch((prevState) => (prevState === "on" ? "off" : "on"));
  };
  const handleBudgetBackClick = () => {
    markTabAsCompleted(2, false);
    setActiveTab(2);
    handleTabChange(2);
    setActivePage(2);
    fetchData();
  };
  const handleBudgetNextClick = () => {
    markTabAsCompleted(3, true);
    setActiveTab(4);
    handleTabChange(4);
    setShowRenAddForm(false);
    setShowDocumentsForm(false);
    setShowServicesForm(false);
    setShowWhatRenovateForm(false);
    setShowResCommForm(true);
  };
  const handleBudgetSkipClick = () => {
    markTabAsCompleted(3, true);
    setActiveTab(4);
    handleTabChange(4);
    setShowRenAddForm(false);
    setShowDocumentsForm(false);
    setShowServicesForm(false);
    setShowWhatRenovateForm(false);
    setShowResCommForm(true);
  };

  // Requirements Ressidential Commercial
  const handleResComBackClick = () => {
    markTabAsCompleted(3, false);
    setActiveTab(3);
    handleTabChange(3);
    setActivePage(3);
    fetchData();
  };
  const handleResComNextClick = () => setShowRenAddForm(true);
  // Requirements Renovation Addition
  const handleRenAddBackClick = () => setShowRenAddForm(false);
  const handleRenAddNextClick = () => setShowWhatRenovateForm(true);
  // Requirements What to renovate
  const handleWhatRenovateBack = () => setShowWhatRenovateForm(false);
  const handleWhatRenovateNext = () => setShowServicesForm(true);
  const handleWhatRenovateSkip = () => setShowServicesForm(true);
  // Requirements Services
  const handleServicesBackClick = () => setShowServicesForm(false);
  const handleServicesNextClick = () => setShowDocumentsForm(true);
  const handleServicesSkipClick = () => setShowDocumentsForm(true);

  //Requirements documents
  const handleAddRow = () => {
    const newRows = [...rows, { id: Date.now(), title: "", document: null }];
    setRows(newRows);
  };
  const handleDocumentsSkipClick = () => {
    markTabAsCompleted(4, true);
    setActiveTab(5);
    handleTabChange(5);
  };
  // const handleDocumentsBackClick = () => setShowDocumentsForm(false);
  const handleDocumentsBackClick = () => {
    setShowDocumentsForm(false);
    setActiveTab(4);
    handleTabChange(4);
    setActivePage(4);
    fetchData();
  };
  const handleDocumentsNextClick = () => {
    markTabAsCompleted(4, true);
    setActiveTab(5);
    handleTabChange(5);
    fetchAreas();
    fetchServices();
    fetchData();
  };

  // Summary
  const handleSummaryBackClick = () => {
    const resetRows = rows.map((row) => ({
      row,
      title: "",
      document: ""
    }));
    setRows(resetRows);
    markTabAsCompleted(4, false);
    setActiveTab(4);
    handleTabChange(4);
    setShowDocumentsForm(true);
    setActivePage(4);
    fetchData();
  };
  const handleRowChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprojects`, title: t("breadCrumb.myProjects") },
    { url: "#", title: t("createProject.createPro") }
  ];
  return (
    <>
      <Row>
        <Col xxl={12} xl={12} lg={12} md={12} sm={12} xs={12}>
          <Pageheader breadcrumbItems={breadcrumbItems} />
          <Card className="custom-card height-scrollable">
            <Card.Header>
              <Card.Title>Create Project</Card.Title>
            </Card.Header>
            <Card.Body className="pb-0">
              <Tab.Container
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
              >
                {isMobile ? (
                  <ProjectNavTabsMobile
                    t={t}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    completedTabs={completedTabs}
                    setCompletedTabs={setCompletedTabs}
                    projectID={projectID}
                  />
                ) : (
                  <ProjectNavTabs
                    t={t}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    completedTabs={completedTabs}
                    setCompletedTabs={setCompletedTabs}
                    projectID={projectID}
                  />
                )}
                <Tab.Content id="myTabContent">
                  <ServiceAddressContent
                    t={t}
                    i18n={i18n}
                    handleServiceNextClick={handleServiceNextClick}
                    onProjectIDChange={handleProjectIDChange}
                    projectID={projectID}
                    respData={responseData}
                  />
                  <SchedulePaneContent
                    t={t}
                    i18n={i18n}
                    schedulePreferences={schedulePreferences}
                    toggleSchedulePreferences={toggleSchedulePreferences}
                    handleScheduleBackClick={handleScheduleBackClick}
                    handleScheduleNextClick={handleScheduleNextClick}
                    projectID={projectID}
                    respData={responseData}
                  />
                  <BudgetPaneContent
                    t={t}
                    budgetSwitch={budgetSwitch}
                    setbudgetSwitch={setbudgetSwitch}
                    toggleBudget={toggleBudget}
                    handleBudgetBackClick={handleBudgetBackClick}
                    handleBudgetNextClick={handleBudgetNextClick}
                    handleBudgetSkipClick={handleBudgetSkipClick}
                    showResCommForm={showResCommForm}
                    setShowResCommForm={setShowResCommForm}
                    projectID={projectID}
                    respData={responseData}
                  />
                  <RequirementsPane
                    t={t}
                    i18n={i18n}
                    handleResComBackClick={handleResComBackClick}
                    handleResComNextClick={handleResComNextClick}
                    handleRenAddBackClick={handleRenAddBackClick}
                    handleRenAddNextClick={handleRenAddNextClick}
                    handleWhatRenovateBack={handleWhatRenovateBack}
                    handleWhatRenovateNext={handleWhatRenovateNext}
                    handleWhatRenovateSkip={handleWhatRenovateSkip}
                    handleServicesBackClick={handleServicesBackClick}
                    handleServicesNextClick={handleServicesNextClick}
                    handleServicesSkipClick={handleServicesSkipClick}
                    showRenAddForm={showRenAddForm}
                    setShowRenAddForm={setShowRenAddForm}
                    showResCommForm={showResCommForm}
                    setShowResCommForm={setShowResCommForm}
                    showWhatRenovateForm={showWhatRenovateForm}
                    setShowWhatRenovateForm={setShowWhatRenovateForm}
                    showServicesForm={showServicesForm}
                    setShowServicesForm={setShowServicesForm}
                    showDocumentsForm={showDocumentsForm}
                    setShowDocumentsForm={setShowDocumentsForm}
                    rows={rows}
                    handleAddRow={handleAddRow}
                    handleRowChange={handleRowChange}
                    handleDeleteRow={handleDeleteRow}
                    handleDocumentsSkipClick={handleDocumentsSkipClick}
                    handleDocumentsBackClick={handleDocumentsBackClick}
                    handleDocumentsNextClick={handleDocumentsNextClick}
                    projectID={projectID}
                    respData={responseData}
                    fetchData={() => fetchData()}
                    areasData={areas}
                    servicesData={services}
                  />
                  <SummaryPane
                    t={t}
                    handleSummaryBackClick={handleSummaryBackClick}
                    projectID={projectID}
                    respData={responseData}
                    areasData={areas}
                    servicesData={services}
                  />
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

CreateProject.layout = "Contentlayout";
export default CreateProject;
