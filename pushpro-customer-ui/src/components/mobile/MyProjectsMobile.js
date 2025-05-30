import React, { useEffect, useState } from "react";
import { Card, Form, InputGroup } from "react-bootstrap";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import statusData from "../../../shared/data/json/status.json";
import useService from "@/hooks/useService";

const Select = dynamic(() => import("react-select"), { ssr: false });

const MyProjectsMobile = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalitem, setTotalitem] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [industry, setIndustry] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industriesId, setIndustriesId] = useState([]);
  const [areas, setAreas] = useState([]);
  const [contId, setContId] = useState();
  const { status } = router.query;

  useEffect(() => {
    const id = localStorage.getItem("currentContractor");
    setContId(id);
  }, []);

  useEffect(() => {
    if (contId) {
      fetchProjects();
      fetchServices();
      fetchAreas();
    }
    if (status) {
      setSelectedStatus(status);
    }
  }, [router.query, selectedStatus, currentPage, pageSize, contId]);

  const fetchProjects = async () => {
    try {
      const condition = {};
      if (searchTerm) {
        condition.title = searchTerm;
      }
      if (selectedStatus) {
        condition.status_id = selectedStatus;
      }
      const response = await service.post("/myprojects", {
        pageNo: currentPage,
        limit: pageSize,
        search: "",
        condition: condition,
        services: industriesId,
        contractorId: contId
      });
      if (response?.success) {
        setProjects(response.data.projects);
        setTotalPages(response.data.totalPages);
        setTotalitem(response.data.totalItems);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const areaData = await service.get("/areas");
      if (areaData?.success) {
        setAreas(areaData.data);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const industriesResponse = await service.get("/services");
      if (industriesResponse?.success) {
        const formattedIndustries = industriesResponse.data.map((industry) => ({
          label: industry.name,
          value: industry.name,
          id: industry.id
        }));
        setIndustry(formattedIndustries);
        setSelectedIndustries([]);
      }
    } catch (industriesError) {
      console.error("Error fetching industries:", industriesError);
    }
  };

  const statusOptions = statusData.map((status) => ({
    value: status.value,
    label: status.label,
    id: status.id
  }));

  const getStatusLabelById = (id) => {
    const status = statusData.find((status) => status.id === id);
    return status ? status.label : id;
  };

  const getAreaNameById = (id) => {
    const area = areas.find((area) => area.id === id);
    return area ? area.name : id;
  };

  const handleView = (id) => {
    router.push(`/project-detail/${id}`);
  };

  const handleCommunication = (id) => {
    router.push(`/project-communication/${id}`);
  };

  const handleSchedule = (id) => {
    router.push(`/project-schedule/${id}`);
  };

  const createProject = () => {
    router.push(`/myprojects/create/`);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = () => {
    fetchProjects();
    fetchAreas();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchProjects();
      fetchServices();
      fetchAreas();
    }
  };

  const reset = () => {
    setCurrentPage(1);
    setSearchTerm(null);
    setSelectedStatus(null);
    fetchProjects();
    fetchAreas();
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption.id);
  };

  const handleIndustryChange = (selectedIndustries) => {
    const selectedIndustriesArray = selectedIndustries.map(
      (selectedIndustry) => {
        return selectedIndustry.id;
      }
    );
    setSelectedIndustries(selectedIndustries);
    setIndustriesId(selectedIndustriesArray);
  };

  const handleEdit = (projectId) => {
    router.push(`myprojects/edit/${projectId}/address`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await service.delete(`/myprojects/del/${id}`);
      if (response?.success || response?.status === 200) {
        handleSuccessDialog(response);
        const updatedProjectData = projects.filter((idx) => idx.id !== id);
        setProjects(updatedProjectData);
        fetchProjects();
      } else {
        handleErrorDialog(response?.errors || response?.message);
      }
    } catch (error) {
      console.error("Error during delete operation:", error);
      handleErrorDialog(error);
    }
  };

  return (
    <>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>{t("breadCrumb.myProjects")}</Card.Title>
        <button
          className="btn btn-primary btn-spacing btn-sm"
          type="button"
          onClick={createProject}
        >
          {t("buttons.createNewProject")}
        </button>
      </Card.Header>
      <Card.Body>
        <div className="row gx-2 align-items-center mb-1 p-2 rounded custom-border">
          <div className="col-12">
            <Form.Label htmlFor="search" className="fs-14">
              {t("project.projectTitle")}
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="search"
                className="border text-muted p-2"
                placeholder={t("certificatesForm.title")}
                aria-label="search"
                autoComplete="off"
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleEnter}
              />
            </InputGroup>
          </div>
          <div className="col-12">
            <Form.Label htmlFor="search" className="fs-14">
              {t("project.status")}
            </Form.Label>
            <InputGroup className="d-inline-block">
              <Select
                id="selectedStatus"
                placeholder={t("project.statusBox")}
                isSearchable={true}
                name="status"
                className="default basic-multi-select"
                menuPlacement="auto"
                classNamePrefix="Select2"
                options={statusOptions}
                onChange={handleStatusChange}
              />
            </InputGroup>
          </div>
          <div className="col-12">
            <Form.Label htmlFor="search" className="fs-14">
              {t("project.services")}
            </Form.Label>
            <InputGroup className="d-inline-block">
              <Select
                id="selectedIndustries"
                placeholder={t("project.serviceBox")}
                isSearchable={true}
                isMulti
                name="serviceType"
                className="default basic-multi-select"
                menuPlacement="auto"
                classNamePrefix="Select2"
                options={industry}
                value={selectedIndustries}
                onChange={handleIndustryChange}
              />
            </InputGroup>
          </div>
          <div className="col-12 postion-relative mt-2">
            <button
              className="btn btn-primary me-1 mb-1"
              type="submit"
              onClick={handleSearch}
            >
              {t("project.searchBtn")}
            </button>
            <button
              className="btn btn-primary ms-2 me-2 mb-1"
              type="button"
              onClick={reset}
            >
              {t("project.resetBtn")}
            </button>
          </div>
        </div>
        <div className="row gx-2 align-items-center p-0 ">
          {projects.length === 0 ? (
            <div className="col-12 text-center">
              {t("project.noRecordsFound")}
            </div>
          ) : (
            projects.map((project, index) => (
              <div className="col-12 p-0" key={project.id}>
                <table className="table table-bordered custom-border text-muted mt-2">
                  <thead>
                    <tr className="">
                      <th width="30%">{t("certificatesForm.title")}</th>
                      <td className="d-flex justify-content-between align-items-center">
                        {project.title}
                        <div>
                          <i
                            title="View"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleView(project.id)}
                          >
                            <i className="bi bi-eye"></i>
                          </i>
                          <i
                            title="Chat"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleCommunication(project.id)}
                          >
                            <i className="bi bi-chat-quote"></i>
                          </i>
                          <i
                            title="Edit"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleEdit(project.id)}
                          >
                            <i className="bi bi-pencil"></i>
                          </i>
                          <i
                            title="Calendar"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleSchedule(project.id)}
                          >
                            <i className="bi bi-calendar3"></i>
                          </i>
                          <i
                            title="Delete"
                            className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                            onClick={() => handleDelete(project.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </i>
                        </div>
                      </td>
                    </tr>
                    <tr className="">
                      <th>{t("project.tableDescription")}</th>
                      <td>
                        {project.address_line_1} {project.address_line_2}
                      </td>
                    </tr>
                    <tr className="">
                      <th>{t("project.tableServices")}</th>
                      <td>
                        <span
                          title={t("project.startDate")}
                          className="bi bi-clock text-primary border-primary "
                        ></span>{" "}
                        : <span>Starts From - </span>
                        {project.start_date
                          ? new Date(project.start_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric"
                              }
                            )
                          : "-"}
                        <br />
                        <span
                          title={t("project.budget")}
                          className="bi bi-currency-dollar text-primary border-primary "
                        ></span>{" "}
                        :
                        {project.budget_min
                          ? `${new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD"
                            }).format(project.budget_min)}`
                          : ""}
                        {" - "}{" "}
                        {project.budget_max
                          ? `${new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD"
                            }).format(project.budget_max)}`
                          : ""}{" "}
                        <br />
                        <span
                          title={t("project.residentialAndCommercial")}
                          className="bi bi-house-door text-primary border-primary "
                        ></span>{" "}
                        : {project.project_type || "-"}
                        <br />
                        <span
                          title={t("project.renovationAndAddition")}
                          className="bi bi-journal-text text-primary border-primary "
                        ></span>{" "}
                        : {project.project_category || "-"}
                        <br />
                        <span
                          title={t("project.area")}
                          className="bi bi-gear text-primary border-primary "
                        ></span>
                        {" : "}
                        {project.areas.map((areaId, index) => (
                          <span key={index}>
                            {getAreaNameById(areaId)}
                            {index !== project.areas.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                    </tr>
                    <tr className="">
                      <th>{t("project.tableStatus")}</th>
                      <td>
                        <span
                          className={`badge status-btn status-${getStatusLabelById(
                            project.status_id
                          )
                            .replace(/\s+/g, "-")
                            .toLowerCase()}`}
                        >
                          {getStatusLabelById(project.status_id)}
                        </span>
                      </td>
                    </tr>
                    <tr className="">
                      <th>{t("project.tableCreatedAt")}</th>
                      <td>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  </thead>
                </table>
              </div>
            ))
          )}
          {projects.length > 0 && (
            <div className="d-flex flex-wrap justify-content-end align-items-center gap-1 mt-2">
              <div className="col-auto d-flex align-items-center">
                <span className="form-label text-nowrap me-2 mb-0">
                  {t("project.pageSize")}{" "}
                </span>
                <Form.Select
                  className="form-label border-2 gap-2 mb-0"
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                >
                  {[5, 10, 15].map((size, index) => (
                    <option key={index} value={size}>
                      {size}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-auto align-items-center">
                <span className="form-label">{`${
                  (currentPage - 1) * pageSize + 1
                } to ${Math.min(
                  currentPage * pageSize,
                  projects.length
                )} of ${totalitem}`}</span>
              </div>
              <div className="col-auto align-items-center">
                <nav aria-label="Page navigation">
                  <ul className="pagination mb-0 d-flex align-items-center">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link border-0"
                        href="#"
                        aria-label="First"
                        onClick={() => paginate(1)}
                      >
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">First</span>
                      </a>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link border-0"
                        href="#"
                        aria-label="Previous"
                        onClick={() => paginate(currentPage - 1)}
                      >
                        <span aria-hidden="true">&lsaquo;</span>
                        <span className="sr-only">Previous</span>
                      </a>
                    </li>
                    <li className="disabled">
                      <span className="form-label border-0">{`${t(
                        "project.pageOf"
                      )} ${currentPage} of ${totalPages}`}</span>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link border-0"
                        href="#"
                        aria-label="Next"
                        onClick={() => paginate(currentPage + 1)}
                      >
                        <span aria-hidden="true">&rsaquo;</span>
                        <span className="sr-only">Next</span>
                      </a>
                    </li>
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link border-0"
                        href="#"
                        aria-label="Last"
                        onClick={() => paginate(totalPages)}
                      >
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Last</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </>
  );
};

export default MyProjectsMobile;
