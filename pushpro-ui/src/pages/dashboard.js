import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CustomCard from "@/components/dashboard/DashboardCard";
import useService from "@/hooks/useService";
import Invitations from "@/components/dashboard/Invitations";
import ProjectChart from "@/components/dashboard/ProjectChart";
import SmallCards from "@/components/dashboard/SmallCards";
import DoughnutChart from "@/components/dashboard/PieChart";
import CustomerSelect from "../components/customerselect";
import { useRouter } from "next/router";
const Select = dynamic(() => import("react-select"), { ssr: false });
const Users = () => {
  const { t } = useTranslation();
  const service = useService();
  const { handleErrorDialog } = service;
  const [showModal, setShowModal] = useState(false);
  const [inviteType, setInviteType] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);
  const [totalprojects, setTotalProjects] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [estimates, setEstimates] = useState(0);
  const [totalEstimates, setTotalEstimates] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSubcontractors, setTotalSubcontractors] = useState(0);
  const [contactMethod, setContactMethod] = useState("email");
  const [contacts, setContacts] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leftSideChat, setLeftSideChat] = useState(null);
  const [subContractors, setSubContractors] = useState(null);
  const [projects, setProjects] = useState();
  const [customerTemplates, setCustomerTemplates] = useState({});
  const [contractorTemplates, setContractorTemplates] = useState({});
  const router = useRouter();
  const [hasMainLogo, setHasMainLogo] = useState(false);
  const [showModal2, setShowModal2] = useState(false);

  const handleOpenModal = () => setShowModal2(true);
  const handleCloseModal2 = () => setShowModal2(false);
  const handleOpenMainModal = () => setShowModal2(true);

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, []);

  const fetchProjects = async () => {
    try {
      let condition = {};
      const response = await service.post("/myprojects", {
        pageNo: 1,
        limit: 15,
        search: "",
        name: "",
        condition: condition,
        services: []
      });
      if (response?.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchProjectStatus();
    fetchTotalEstimates();
    fetchTotalEarnings();
    fetchTotalSubcontractors();
    fetchTotalCustomers();
    leftSideChatData();
    fetchSubContractors();
  }, []);

  const handleNewProject = () => {
    router.push("/myprojects/create");
  };

  const handleShowModal = (type) => {
    if (!hasMainLogo) {
      handleErrorDialog({
        message: t("manageBrandingForm.mainLogoRequired")
      });
      handleRedirect();
      return;
    }
    setInviteType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setContactMethod("email");
    setContacts([]);
    setCurrentInput("");
    setEditIndex(null);
    setErrors([]);
  };

  const fetchTemplates = async () => {
    try {
      const response = await service.get("/getTemplates");
      if (response?.success && response?.data) {
        setCustomerTemplates(response?.data?.customer);
        setContractorTemplates(response?.data?.contractor);
        if (response?.main_logo) {
          setHasMainLogo(true);
        } else {
          setHasMainLogo(false);
        }
        return;
      }
    } catch (error) {
      console.error("Error fetching email template:", error);
      setHasMainLogo(false);
    }
  };

  const handleRedirect = () => {
    router.push({
      pathname: "/myprofile",
      query: { activeTab: "manage-branding" }
    });
  };

  const fetchTotalEstimates = async () => {
    try {
      const response = await service.get(`total-estimates`);
      if (response?.success) {
        setTotalEstimates(response.data.total_revenue);
      }
    } catch (error) {
      console.error("Error fetching total estimates :", error);
    }
  };

  const fetchTotalEarnings = async () => {
    try {
      const response = await service.get(`total-revenue`);
      if (response?.success) {
        setTotalEarnings(response.data.total_earning);
      }
    } catch (error) {
      console.error("Error fetching total estimates :", error);
    }
  };

  const fetchTotalSubcontractors = async () => {
    try {
      const response = await service.get(`total-subcontractors`);
      if (response?.success) {
        setTotalSubcontractors(response.data);
      }
    } catch (error) {
      console.error("Error fetching contractors :", error);
    }
  };

  const fetchProjectStatus = async () => {
    try {
      const response = await service.get(`projectStatuses`);
      if (response?.success) {
        setProjectStatus(response.data.projects);
        setTotalProjects(response.data.total);
        const projects = response.data.projects;
        const quotationsCount =
          response.data.total -
          projects
            .filter((project) => project.status_id < 3)
            .reduce((acc, project) => acc + project.count, 0);
        setEstimates(quotationsCount);
      }
    } catch (error) {
      console.error("Error fetching statuses :", error);
    }
  };

  const fetchTotalCustomers = async () => {
    try {
      const response = await service.get(`customercounts`);
      if (response?.success) {
        setTotalCustomers(response.data);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await service.get(`dashboard-schedules`);
      if (response?.success) {
        const allSchedules = response.data.schedules;
        const sortedSchedules = allSchedules.sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time)
        );
        setSchedule(sortedSchedules);
      }
    } catch (error) {
      console.error("Error fetching upcoming meetings :", error);
    }
  };

  const leftSideChatData = async () => {
    try {
      const response = await service.get("my-projects/last-chat-with-project");
      if (response?.success) {
        setLeftSideChat(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Left Side Chat Data : ", error);
    }
  };

  const fetchSubContractors = async () => {
    try {
      const response = await service.get("subContractors");
      if (response?.success) {
        setSubContractors(response?.data);
      }
    } catch (error) {
      console.error("Error Fetching Subcontractors : ", error);
    }
  };

  return (
    <>
      {/* <Pageheader breadcrumbItems={breadcrumbItems} /> */}
      <Card className="custom-card mt-4">
        <Card.Header className="d-flex w-100 justify-content-between align-items-center">
          <Card.Title className="mb-3 mb-lg-0 col-8 col-sm-2">
            {t("breadCrumb.dashboard")}
          </Card.Title>
          <div className="d-flex gap-2 col-12 col-sm-10 col-md-8 col-lg-6">
            <Button
              variant="primary-light"
              className="flex-grow-1"
              onClick={() => handleShowModal("customer")}
            >
              {t("general.inviteCustomer")}
            </Button>
            <Button
              variant="primary-light"
              className="flex-grow-1"
              onClick={() => handleShowModal("contractor")}
            >
              {t("general.inviteContractor")}
            </Button>
            <Button
              variant="primary-light"
              className="flex-grow-1 d-flex justify-content-center align-items-center"
              onClick={handleOpenModal}
            >
              {t("buttons.createnewproject")}
              <i className="bi bi-arrow-right-square ms-2 fs-5"></i>
            </Button>
          </div>
          <CustomerSelect
            showModal={showModal2}
            handleCloseModal={handleCloseModal2}
            handleOpenMainModal={handleOpenMainModal}
          />
        </Card.Header>
        <Card.Body>
          <SmallCards
            totalEarning={totalEarnings}
            totalProject={totalprojects}
            estimates={estimates}
            totalEstimate={totalEstimates}
            totalCustomers={totalCustomers}
            totalContractor={totalSubcontractors}
            totalCustomer={totalCustomers}
          />
        </Card.Body>
      </Card>
      <div className="mb-4">
        <ProjectChart />
      </div>
      <Invitations
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        inviteType={inviteType}
        contactMethod={contactMethod}
        setContactMethod={setContactMethod}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        contacts={contacts}
        setContacts={setContacts}
        errors={errors}
        setErrors={setErrors}
        editIndex={editIndex}
        setEditIndex={setEditIndex}
        loading={loading}
        setLoading={setLoading}
        contractor={contractorTemplates}
        customer={customerTemplates}
        t={t}
      />
      <div className="row">
        <DoughnutChart projectstatus={projectStatus} />
        <CustomCard
          title="Card Title"
          schedules={schedule}
          projects={projects}
          leftSideChat={leftSideChat}
          subContractors={subContractors}
        />
      </div>
    </>
  );
};

Users.layout = "Contentlayout";
export default Users;
