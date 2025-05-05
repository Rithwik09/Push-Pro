import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, Form, InputGroup, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import statusData from "../../shared/data/json/status.json";
import useService from "@/hooks/useService";
import CustomerSelect from "./customerselect";

const Select = dynamic(() => import("react-select"), { ssr: false });

const MyProjects = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const service = useService();
  const [projects, setProjects] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalitem, setTotalitem] = useState(null);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [industry, setIndustry] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industriesId, setIndustriesId] = useState([]);
  const [areas, setAreas] = useState([]);
  const { status } = router.query;
  const [loading, setLoading] = useState(true);
  const [statusName, setStatusName] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleOpenMainModal = () => setShowModal(true);

  const fetchProjects = async (status) => {
    try {
      let condition = {};
      if (searchTerm) {
        condition.title = searchTerm;
      }
      if (status || selectedStatus) {
        condition.status_id = status || selectedStatus || 0;
      }
      const response = await service.post("/myprojects", {
        pageNo: currentPage,
        limit: pageSize,
        search: "",
        name: name || "",
        condition: condition,
        services: industriesId
      });
      if (response?.success) {
        setProjects(response.data.projects);
        setTotalPages(response?.data.totalPages);
        setTotalitem(response?.data.totalItems);
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
    } catch (error) {
      console.error("Error fetching industries:", error);
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

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (projectId) => {
    router.push(`myprojects/edit/${projectId}/address`);
  };
  const handleSearch = () => {
    fetchProjects();
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      fetchProjects();
    }
  };

  useEffect(() => {
    getSelectedOption(status);
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (status) {
        setSelectedStatus(status);
      } else {
        setSelectedStatus(null);
      }
      await fetchServices();
      await fetchAreas();
      setLoading(false);
    };
    fetchData();
  }, [status]);

  useEffect(() => {
    const fetchProjectsData = async () => {
      if (selectedStatus !== null || !status) {
        await fetchProjects();
      }
    };
    if (!loading) {
      fetchProjectsData();
    }
  }, [selectedStatus, loading, currentPage, pageSize]);

  useEffect(() => {
    if (!loading) {
      fetchProjects();
    }
  }, [currentPage, selectedStatus, searchTerm, industriesId]);

  const reset = async () => {
    setSelectedStatus(null);
    setStatusName(null);
    setIndustriesId([]);
    setSelectedIndustries([]);
    setCurrentPage(1);
    setName("");
    setSearchTerm("");
    await router.push("/myprojects", undefined, { shallow: true });
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption ? selectedOption.id : null);
    setStatusName(selectedOption);
    setCurrentPage(1);
    fetchProjects();
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
  const getSelectedOption = (statusNumber) => {
    const statusN = statusOptions.find(
      (option) => option.id === parseInt(statusNumber) || null
    );
    setStatusName(statusN);
  };

  return (
    <>
      <Card.Header className="d-flex justify-content-between align-items-center p-relative">
        <Card.Title>{t("project.title")}</Card.Title>
        <button
          className="btn btn-primary btn-spacing btn-sm"
          type="button"
          onClick={handleOpenModal}
        >
          {t("buttons.createnewproject")}
        </button>
        <CustomerSelect
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          handleOpenMainModal={handleOpenMainModal}
        />
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">
            <Spinner variant="primary" animation="border" size="md" />
          </div>
        ) : (
          <div>
            <div className="row gy-1 align-items-center border text-muted mb-2 p-2 rounded border-2">
              <div className="col-xl-2 col-md-2">
                <Form.Label htmlFor="search" className="fs-14">
                  {t("project.projectTitle")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="search"
                    className="border text-muted p-2"
                    placeholder={t("project.tableName")}
                    aria-label="search"
                    autoComplete="off"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleEnter}
                  />
                </InputGroup>
              </div>
              <div className="col-xl-2 col-md-2">
                <Form.Label htmlFor="search" className="fs-14">
                  {t("customer.customerName")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="search"
                    className="border text-muted p-2"
                    placeholder={t("popUp.name")}
                    aria-label="search"
                    autoComplete="off"
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleEnter}
                  />
                </InputGroup>
              </div>
              <div className="col-xl-2 col-md-2">
                <Form.Label htmlFor="search" className="fs-14">
                  {t("project.status")}
                </Form.Label>
                <InputGroup className="d-inline-block">
                  <Select
                    placeholder={t("project.statusBox")}
                    isSearchable={true}
                    name="serviceType"
                    className="default basic-multi-select"
                    id="choices-multiple-default"
                    menuPlacement="auto"
                    classNamePrefix="Select2"
                    options={statusOptions}
                    value={statusName}
                    onChange={handleStatusChange}
                  />
                </InputGroup>
              </div>
              <div className="col-xl-2 col-md-2">
                <Form.Label htmlFor="search" className="fs-14">
                  {t("project.services")}
                </Form.Label>
                <InputGroup className="d-inline-block">
                  <Select
                    placeholder={t("project.serviceBox")}
                    isSearchable={true}
                    isMulti
                    name="serviceType"
                    className="basic-multi-select"
                    id="choices-multiple-default"
                    menuPlacement="auto"
                    classNamePrefix="Select2"
                    options={industry}
                    value={selectedIndustries}
                    onChange={handleIndustryChange}
                  />
                </InputGroup>
              </div>
              <div className="col-xl-3 col-md-3 position-relative mt-auto">
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
            {projects.length === 0 ? (
              <div className="text-center mt-3">
                <p>{t("project.noRecordsFound")}</p>
              </div>
            ) : (
              <div className="row">
                <div className="table-responsive rounded p-0">
                  <table className="table table-bordered border text-muted border-2 rounded ">
                    <thead>
                      <tr>
                        <th width="20%">{t("project.tableName")}</th>
                        <th>{t("customer.customerName")}</th>
                        <th>{t("project.tableDescription")}</th>
                        <th>{t("project.tableServices")}</th>
                        <th>{t("project.tableStatus")}</th>
                        <th>{t("project.tableCreatedAt")}</th>
                        <th width="13%">{t("project.tableAction")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, index) => (
                        <tr key={index}>
                          <td>{project.title}</td>
                          <td>{project.customer_name}</td>
                          <td className="d-flex flex-column">
                            <div>
                              {project.address_line_1}
                              {","}
                            </div>
                            <div>{project.address_line_2}</div>
                          </td>
                          <td>
                            <span
                              title={t("project.startDate")}
                              className="bi bi-clock text-primary border-primary "
                            ></span>{" "}
                            : <span>Starts From - </span>{" "}
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
                            :{" "}
                            {project.budget_min
                              ? `${new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD"
                                }).format(project.budget_min)} -`
                              : "-"}{" "}
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
                            ></span>{" "}
                            :{" "}
                            {project.areas.map((areaId, index) => (
                              <span key={index}>
                                {getAreaNameById(areaId)}
                                {index !== project.areas.length - 1 && ", "}
                              </span>
                            ))}
                          </td>
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
                          <td>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="">
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
                            {/* <i
                              title="Edit"
                              className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                              onClick={() => handleEdit(project.id)}
                            >
                              <i className="bi bi-pencil"></i>
                            </i> */}
                            <i
                              title="Calendar"
                              className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                              onClick={() => handleSchedule(project.id)}
                            >
                              <i className="bi bi-calendar3"></i>
                            </i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {projects.length > 0 && (
                    <div className="d-flex justify-content-end align-items-center gap-3 mt-2">
                      <div className="col-auto align-items-center d-flex">
                        <span className="form-label text-nowrap me-2 mb-0">
                          {t("project.pageSize")}{" "}
                        </span>
                        <Form.Select
                          className="form-label border-2 gap-2 mb-0"
                          onChange={(e) =>
                            setPageSize(parseInt(e.target.value))
                          }
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
                          totalitem
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
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </>
  );
};

export default MyProjects;
