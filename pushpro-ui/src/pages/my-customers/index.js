import React, { useEffect, useState } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import { getDeviceType } from "../../utils/device";
import PaginationComponent from "@/components/PaginationComponent";
import { set } from "date-fns";

const Select = dynamic(() => import("react-select"), { ssr: false });

const Index = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const { t } = useTranslation();
  const router = useRouter();
  const service = useService();
  const [customers, setCustomers] = useState([]);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const fetchCustomers = async () => {
    try {
      const response = await service.post("/my-customers",{
        currentPage,
        pageSize,
      });
      if (response?.success) {
        const transformedData = (response.data || []).map((customer) => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email_address,
          phone: customer.phone_no,
          address: customer.address || "No Phone Number provided"
        }));
        setTotalPages(response.pagination.totalPages);
        setPageSize(response.pagination.pageSize);
        setCurrentPage(response.pagination.currentPage);
        setTotalCustomers(response.pagination.totalItems);
        setCustomers(transformedData);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching my customers:", error);
      setCustomers([]);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await service.get(`/customers?name=${searchTerm}`);
      if (response?.success) {
        const transformedData = (response.data || []).map((customer) => ({
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email_address,
          address: customer.address || "No Phone Number provided"
        }));
        setCustomers(transformedData);
      }
    } catch (error) {
      console.error(error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pageSize, currentPage]);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleView = (id) => {
    router.push(`/my-customers/view/${id}`);
  };

  const handleReset = () => {
    setSearchTerm("");
    fetchCustomers();
  };

  const goBack = () => {
    router.back();
  };

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/my-customers`, title: t("myCustomers") }
  ];

  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        <Card.Header className="d-flex justify-content-between align-items-center p-relative">
          <Card.Title>{t("myCustomers")}</Card.Title>
          <div
            className="d-flex justify-content-end"
            style={{ marginTop: isMobile ? "10px" : "0" }}
          >
            <Button
              variant="primary-light"
              className="btn-spacing btn btn-sm mb-2 mb-sm-0 d-flex align-items-center"
              onClick={goBack}
            >
              <i className="bx bx-left-arrow-circle fs-5"></i>
              {t("buttons.back")}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div
            className={`row ${
              isMobile ? "gx-2" : "gy-1"
            } align-items-center border text-muted mb-2 p-2 rounded border-2`}
          >
            <div className={`col-${isMobile ? "12" : "xl-6 col-md-6"}`}>
              <Form.Label htmlFor="search" className="fs-14">
                {t("customer.searchCustomer")}
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="search"
                  className="border text-muted p-2"
                  placeholder={t("customer.customerName")}
                  aria-label="search"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleEnter}
                />
              </InputGroup>
            </div>
            <div
              className={`col-${
                isMobile ? "12" : "xl-3 col-md-3"
              } postion-relative mt-4`}
            >
              <button
                className="btn btn-primary m-2 mt-4"
                type="submit"
                onClick={handleSearch}
              >
                {t("contractor.searchBtn")}
              </button>
              <button
                className="btn btn-primary m-2 mt-4"
                type="button"
                onClick={handleReset}
              >
                {t("contractor.resetBtn")}
              </button>
            </div>
          </div>
          {customers.length === 0 ? (
            <div className="text-center mt-3">
              <p>{t("project.noRecordsFound")}</p>
            </div>
          ) : (
            <div className="row">
              <div className="table-responsive rounded p-0">
                {isMobile ? (
                  <div className="row gx-2 align-items-center p-0 ">
                    {customers.map((contractor, index) => (
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
                              <th>{t("accountInfoForm.email")}</th>
                              <td>{contractor?.email || "-"}</td>
                            </tr>
                            <tr className="">
                              <th>{t("accountInfoForm.phoneNo")}</th>
                              <td>{contractor?.phone || "-"}</td>
                            </tr>
                            <tr className="">
                              <th>{t("general.action")}</th>
                              <td>{contractor?.address || "-"}</td>
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
                        <th>{t("accountInfoForm.email")}</th>
                        <th>{t("accountInfoForm.phoneNo")}</th>
                        <th>{t("general.action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((contractor, index) => (
                        <tr key={index}>
                          <td>{contractor?.name || "-"}</td>
                          <td>{contractor?.email || "-"}</td>
                          <td>{contractor?.phone || "-"}</td>
                          <td className="">
                            <i
                              title="View"
                              className="ms-4 btn-sm btn btn-primary-light rounded-pill"
                              onClick={() => handleView(contractor.id)}
                            >
                              <i
                                className="bi bi-eye"
                                style={{ fontSize: "14px" }}
                              ></i>
                            </i>
                            {/*<i
                              title="Chat"
                              className="ms-4 btn-sm btn btn-primary-light rounded-pill"
                              onClick={() => handleCommunication(project.id)}
                            >
                              <i
                                className="bi bi-chat-quote"
                                style={{ fontSize: "14px" }}
                              ></i>
                            </i> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              <PaginationComponent
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              totalitem={totalCustomers}
              paginate={paginate}
              setTotalPages={setTotalPages}
              />
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
