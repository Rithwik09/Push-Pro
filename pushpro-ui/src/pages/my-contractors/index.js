import React, { useEffect, useState } from "react";
import { Card, Form, InputGroup } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import { getDeviceType } from "../../utils/device";

const Select = dynamic(() => import("react-select"), { ssr: false });

const Index = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState("");
  const { t } = useTranslation();
  const router = useRouter();
  const service = useService();
  const [contractors, setContractors] = useState([]);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [industry, setIndustry] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [industriesId, setIndustriesId] = useState([]);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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

  const fetchContractors = async () => {
    try {
      const response = await service.get("/subContractors");
      if (response?.success) {
        setContractors(response.data);
      }
    } catch (error) {
      console.error("Error fetching my contractors :", error);
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

  useEffect(() => {
    fetchContractors();
    fetchServices();
  }, [currentPage, pageSize]);

  const handleView = (id) => {
    router.push(`/view-subcontractor/${id}`);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = async () => {
    try {
      const response = await service.post("/subContractors", {
        name: searchTerm,
        services: industriesId
      });
      if (response?.success) {
        setContractors(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleReset = () => {
    fetchContractors();
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

  const getServiceNameById = (id) => {
    const service = industry.find((industry) => industry.id === id);
    return service ? service.label : id;
  };

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/my-contractors`, title: t("myContractors") }
  ];

  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center p-relative">
          <Card.Title>{t("myContractors")}</Card.Title>
        </Card.Header>
        <Card.Body>
          <div
            className={`row ${
              isMobile ? "gx-2" : "gy-1"
            } align-items-center border text-muted mb-2 p-2 rounded border-2`}
          >
            <div className={`col-${isMobile ? "12" : "xl-3 col-md-3"}`}>
              <Form.Label htmlFor="search" className="fs-14">
                {t("contractor.contractorName")}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="search"
                  className="border text-muted p-2"
                  placeholder={t("contractor.contractorName")}
                  aria-label="search"
                  autoComplete="off"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleEnter}
                />
              </InputGroup>
            </div>
            <div className={`col-${isMobile ? "12" : "xl-3 col-md-3"}`}>
              <Form.Label htmlFor="search" className="fs-14">
                {t("contractor.services")}
              </Form.Label>
              <InputGroup className="d-inline-block">
                <Select
                  placeholder={t("contractor.serviceBox")}
                  isSearchable={true}
                  isMulti
                  name="serviceType"
                  className={`${isMobile ? "default" : ""} basic-multi-select`}
                  id="choices-multiple-default"
                  menuPlacement="auto"
                  classNamePrefix="Select2"
                  options={industry}
                  value={selectedIndustries}
                  onChange={handleIndustryChange}
                />
              </InputGroup>
            </div>
            <div
              className={`col-${
                isMobile ? "12" : "xl-3 col-md-3"
              } postion-relative mt-auto`}
            >
              <button
                className="btn btn-primary m-2"
                type="submit"
                onClick={handleSearch}
              >
                {t("contractor.searchBtn")}
              </button>
              <button
                className="btn btn-primary m-2"
                type="button"
                onClick={handleReset}
              >
                {t("contractor.resetBtn")}
              </button>
            </div>
          </div>
          {contractors.length === 0 ? (
            <div className="text-center mt-3">
              <p>{t("project.noRecordsFound")}</p>
            </div>
          ) : (
            <div className="row">
              <div className="table-responsive rounded p-0">
                {isMobile ? (
                  <div className="row gx-2 align-items-center p-0 ">
                    {contractors.map((contractor, index) => (
                      <div className="col-12 p-0" key={index}>
                        <table className="table table-bordered custom-border text-muted mt-2 ">
                          <thead>
                            <tr className="">
                              <th width="30%">{t("popUp.name")}</th>
                              <td className="d-flex justify-content-between align-items-center">
                                {contractor?.name || "-"}
                                <div>
                                  <i
                                    title="View"
                                    className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                                    onClick={() => handleView(contractor.id)}
                                  >
                                    <i className="bi bi-eye"></i>
                                  </i>
                                </div>
                              </td>
                            </tr>
                            <tr className="">
                              <th>{t("contractor.tableAddress")}</th>
                              <td>{contractor?.email || "-"}</td>
                            </tr>
                            <tr className="">
                              <th>{t("contractor.companyDetails")}</th>
                              <td>
                                {contractor?.companyDetails === null ? (
                                  "-"
                                ) : (
                                  <>
                                    <div>
                                      <i className="bi bi-building icon-color">
                                        {": "}
                                      </i>
                                      {contractor?.companyDetails.name}
                                    </div>
                                    <div>
                                      <i className="bi bi-geo-alt icon-color">
                                        {": "}
                                      </i>
                                      {contractor?.companyDetails.address}
                                    </div>
                                    <div>
                                      <i className="bi bi-phone icon-color">
                                        {": "}
                                      </i>
                                      {contractor?.companyDetails.phone_no}
                                    </div>
                                    <div>
                                      <i className="bi bi-envelope icon-color">
                                        {": "}
                                      </i>
                                      {contractor?.companyDetails.email}
                                    </div>
                                    {/* <div>
                                      <i className="bi bi-globe icon-color">
                                        {": "}
                                      </i>
                                      {contractor?.companyDetails.website}
                                    </div> */}
                                  </>
                                )}
                              </td>
                            </tr>
                            <tr className="">
                              <th>{t("contractor.services")}</th>
                              <td>
                                {contractor?.services.map((serviceId) => (
                                  <div key={serviceId}>
                                    {getServiceNameById(serviceId)}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          </thead>
                        </table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="table table-bordered border text-muted border-2 rounded ">
                    <thead>
                      <tr>
                        <th width="20%">{t("popUp.name")}</th>
                        <th>{t("contractor.tableAddress")}</th>
                        <th>{t("contractor.companyDetails")}</th>
                        <th>{t("contractor.services")}</th>
                        <th width="13%">{t("contractor.tableAction")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractors.map((contractor, index) => (
                        <tr key={index}>
                          <td>{contractor?.name}</td>
                          <td>{contractor?.email}</td>
                          <td>
                            {contractor?.companyDetails === null ? (
                              "-"
                            ) : (
                              <>
                                <div>
                                  <i className="bi bi-building icon-color">
                                    {": "}
                                  </i>
                                  {contractor?.companyDetails?.name || "-"}
                                </div>
                                <div>
                                  <i className="bi bi-geo-alt icon-color">
                                    {": "}
                                  </i>
                                  {contractor?.companyDetails?.address || "-"}
                                </div>
                                <div>
                                  <i className="bi bi-phone icon-color">
                                    {": "}
                                  </i>
                                  {contractor?.companyDetails?.phone_no || "-"}
                                </div>
                                <div>
                                  <i className="bi bi-envelope icon-color">
                                    {": "}
                                  </i>
                                  {contractor?.companyDetails?.email || "-"}
                                </div>
                                {/* <div>
                                  <i className="bi bi-globe icon-color">
                                    {": "}
                                  </i>
                                  {contractor?.companyDetails?.website}
                                </div> */}
                              </>
                            )}
                          </td>
                          <td>
                            {contractor?.services.map((serviceId) => (
                              <div key={serviceId}>
                                {getServiceNameById(serviceId)}
                              </div>
                            ))}
                          </td>
                          <td className="">
                            <i
                              title="View"
                              className="ms-2 btn-sm btn btn-primary-light rounded-pill"
                              onClick={() => handleView(contractor.id)}
                            >
                              <i className="bi bi-eye"></i>
                            </i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

Index.layout = "Contentlayout";
export default Index;
