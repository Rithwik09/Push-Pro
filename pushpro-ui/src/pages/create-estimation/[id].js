import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  InputGroup,
  Table,
  Spinner,
  Button,
  Row,
  Col
} from "react-bootstrap";
import Pageheader from "../../../shared/layout-components/header/pageheader";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import useService from "@/hooks/useService";
import Swal from "sweetalert2";
import ContractText from "../../components/ContractText";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import DraggableSidebar from "../../components/DragableSidebar";
import PopupInput from "../../components/PopupInput";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Index = () => {
  const router = useRouter();
  const id = router.query.id;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const { t } = useTranslation();
  const service = useService();

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/myprojects`, title: t("breadCrumb.myProjects") },
    {
      url: `${basePath}/create-estimation`,
      title: t("breadCrumb.createEstimate")
    }
  ];

  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragData, setDragData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [hideDescription, setHideDescription] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [estimationId, setEstimationId] = useState(0);
  const [estimationStatus, setEstimationStatus] = useState(0);
  const [estimationNo, setEstimationNo] = useState("");
  const [isCancelDisabled, setIsCancelDisabled] = useState(false);
  const [estimationDate, setEstimationDate] = useState(formatDate(new Date()));
  const [poNumber, setPoNumber] = useState("");
  const [labourMargin, setLabourMargin] = useState(0);
  const [materialMargin, setMaterialMargin] = useState(0);
  const [subTotal, setSubTotal] = useState(0.0);
  const [subTotal1, setSubTotal1] = useState(0.0);
  const [subTotal2, setSubTotal2] = useState(0.0);
  const [total, setTotal] = useState(0.0);
  const [customer, setCustomer] = useState({});
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const { handleSuccessDialog, handleAutoCloseSuccess, handleErrorDialog } =
    useService();

  function formatDate(date) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }
  const generateRandomPoNumber = () => {
    const numbers = Math.floor(100 + Math.random() * 900);
    const letters = Array(3)
      .fill()
      .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      .join("");
    return `${numbers}-${letters}`;
  };

  const handleToggleDescriptions = () => {
    setShowDescriptions(!showDescriptions);
    setHideDescription(!hideDescription);
  };

  const fetchProjectData = async (id) => {
    try {
      const response = await service.get(`/project/${id}`);
      if (response && response?.success && response?.data) {
        setProjects(response.data);
        fetchCustomerDetails(response.data.customer_id);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const fetchCustomerDetails = async (id) => {
    try {
      const response = await service.get(`/profile/customer/${id}`);
      if (response?.success) {
        setCustomer(response.data);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  const fetchContractText = async () => {
    try {
      const response = await service.get("/myprofile/contract-text");
      if (response?.success) {
        setHtmlContent(response.data);
      }
    } catch (error) {
      console.error("Error fetching contract text:", error);
    }
  };

  const fetchEstimationData = async () => {
    try {
      const response = await service.get(`/myprojects/estimation/${id}`);
      if (response && response?.success && response?.data) {
        setEstimationId(response.data.id);
        setEstimationStatus(response.data.estimation_status_id);
        setEstimationNo(response.data.estimation_no || 0);
        setEstimationDate(
          response.data.estimation_date
            ? new Date(response.data.estimation_date)
                .toISOString()
                .split("T")[0] // This converts to yyyy-MM-dd format
            : new Date().toISOString().split("T")[0]
        );
        setPoNumber(response.data.po_number || generateRandomPoNumber());
        setLabourMargin(parseFloat(response.data.labour_margin || 0));
        setMaterialMargin(parseFloat(response.data.material_margin || 0));
        setSubTotal(parseFloat(response.data.sub_total || 0));
        setTotal(parseFloat(response.data.total) || 0);
        setHtmlContent((prevState) =>
          response.data.contract_text ? response.data.contract_text : prevState
        );
        fetchProjectData(response.data.project_id);
      }
    } catch (error) {
      console.error("Error fetching estimation data:", error);
    }
  };

  const fetchEstimationItemsData = async (estimationId) => {
    try {
      const response = await service.get(
        `/myprojects/estimation/all-items/${estimationId}`
      );
      if (response.success) {
        setTableData(response.data.estimationsItems);
      }
    } catch (error) {
      console.error("Error fetching estimation items data:", error);
    }
  };

  const handleSidebarToggle = (isOpen) => {
    setIsSidebarOpen(isOpen);
  };

  const handleDataDragStop = (data) => {
    if (data) setDragData(data);
    setShowPopup(true);
    setIsDragging(false);
  };

  const handleDeleteItem = async (index) => {
    try {
      const item = tableData[index];
      const response = await service.delete(
        `/myprojects/estimation/item/del/${item.id}`
      );
      if (response.success) {
        let updatedTableData = tableData.filter((_, i) => i !== index);
        setTableData(updatedTableData);
        setIsDragging(true);
        setShowPopup(false);
        setDragData(null);
        handleAutoCloseSuccess(response);
        setTableData(updatedTableData);
      }
    } catch (error) {
      error = {
        message: "Cannot Delete Item"
      };
      handleErrorDialog(error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handlePopupData = (data) => {
    if (data?.name !== "") {
      const newData = {
        id: data.id,
        name: data.title,
        itemId: data.item_id,
        categoryId: data.category_id,
        description: data.description,
        quantity: data.quantity,
        hours: data.hours,
        labour_cost: data.labour_cost,
        quantityRatio: data.quantity_ratio,
        hourlyRate: data.hourly_labour_rate,
        tax: data.tax,
        material_cost: data.material_cost
      };
      setTableData((prevTableData) => [...prevTableData, newData]);
      calculateSubtotals(tableData, labourMargin, materialMargin);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    handleSelectAll({ target: { checked: true } });
    const payload = {
      estimation_no: new String(estimationNo || 0),
      estimation_date: new Date(estimationDate).toISOString().split("T")[0],
      po_number: new String(poNumber || 0),
      labour_margin: new String(labourMargin),
      material_margin: new String(materialMargin),
      sub_total: new String(subTotal || 0.0),
      total: new String(total),
      contract_text: htmlContent || "Contract Text Goes Here"
    };
    try {
      calculateSubtotals(tableData, labourMargin, materialMargin);
      const response = await service.patch(
        `myprojects/estimation/edit/${id}`,
        payload
      );
      if (response?.success) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Estimation Updated Successfully",
          showConfirmButton: true,
          timer: 1500
        });
        setIsLoading(false);
        router.push(`/preview-estimation/${id}`);
      }
    } catch (error) {
      error = {
        message: "Cannot Update Estimation"
      };
      handleErrorDialog(error);
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setIsCancelDisabled(true);
    router.back();
  };

  const calculateSubtotals = (data, newLabourMargin, newMaterialMargin) => {
    const subTotal1 = data.reduce(
      (acc, item) =>
        acc +
        (isNaN(parseFloat(item.labour_cost))
          ? 0
          : parseFloat(item.labour_cost)),
      0
    );
    const subTotal2 = data.reduce(
      (acc, item) =>
        acc +
        (isNaN(
          parseFloat(item.quantity * item.material_cost * (1 + item.tax / 100))
        )
          ? 0
          : parseFloat(
              item.quantity * item.material_cost * (1 + item.tax / 100)
            )),
      0
    );
    setSubTotal1(
      parseFloat(subTotal1 + (subTotal1 * newLabourMargin) / 100).toFixed(2)
    );
    setSubTotal2(
      parseFloat(subTotal2 + (subTotal2 * newMaterialMargin) / 100).toFixed(2)
    );
    const totalValue = parseFloat(
      subTotal1 +
        (subTotal1 * newLabourMargin) / 100 +
        subTotal2 +
        (subTotal2 * newMaterialMargin) / 100
    ).toFixed(2);
    setTotal(isNaN(totalValue) ? 0.0 : totalValue);
  };

  const handleLabourMarginChange = (e) => {
    const newLabourMargin = parseFloat(e.target.value) || 0;
    setLabourMargin(newLabourMargin);
    const selectedItems = tableData.filter((_, i) => selectedRows[i]);
    calculateSubtotals(selectedItems, newLabourMargin, materialMargin);
  };

  const handleMaterialMarginChange = (e) => {
    const newMaterialMargin = parseFloat(e.target.value) || 0;
    setMaterialMargin(newMaterialMargin);
    const selectedItems = tableData.filter((_, i) => selectedRows[i]);
    calculateSubtotals(selectedItems, labourMargin, newMaterialMargin);
  };

  const handleRowSelect = (index) => {
    const updatedSelectedRows = [...selectedRows];
    updatedSelectedRows[index] = !updatedSelectedRows[index];
    setSelectedRows(updatedSelectedRows);
    if (updatedSelectedRows.every((row) => row)) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
    const selectedItems = tableData.filter((_, i) => updatedSelectedRows[i]);
    calculateSubtotals(selectedItems, labourMargin, materialMargin);
  };

  const handleSelectAll = (event) => {
    const isSelected = event.target.checked;
    setAllSelected(isSelected);
    const updatedSelectedRows = new Array(tableData.length).fill(isSelected);
    setSelectedRows(updatedSelectedRows);
    const selectedItems = isSelected ? tableData : [];
    calculateSubtotals(selectedItems, labourMargin, materialMargin);
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth < 740);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleChevronClick = (index) => {
    setExpandedRowIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    fetchContractText();
    if (id) {
      fetchEstimationData();
    }
    if (estimationId) {
      fetchEstimationItemsData(estimationId);
    }
  }, [id, estimationId, estimationStatus]);

  useEffect(() => {
    calculateSubtotals(tableData, labourMargin, materialMargin);
  }, [tableData, labourMargin, materialMargin]);

  const renderDesktopView = () => (
    <>
      <Card.Body>
        <div className="position-relative">
          <div
            className={`row m-3 border rounded border-3 p-3 ${
              isSidebarOpen ? "col-10" : "col-11"
            }`}
          >
            <div className="col-xl-11 border border-2 rounded col-md-10 p-2 m-2 col-sm-10">
              <div className="fs-5 fw-bold">{projects.title}</div>
              <span className="d-inline-block w-100">
                {projects.description}
              </span>
            </div>
            <div className="col-xl-5 col-md-5 mt-md-4 ms-md-4 ms-0 ms-lg-0 my-sm-4 py-2 border border-2 rounded text-end d-block">
              <div htmlFor="search" className="fs-14 fw-bold text-start">
                {customer.first_name + " " + customer.last_name}
              </div>
              <div className="text-start text-badge">
                {[
                  projects?.address_line_1,
                  projects?.address_line_2,
                  projects?.city,
                  projects?.state,
                  projects?.zip_code
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
            <div className="col-xl-6 ms-xl-4 border border-2 py-2 my-2 rounded col-md-6 mt-md-4 ms-md-2">
              <div className="d-flex align-items-center mb-1">
                <Form.Label
                  htmlFor="search1"
                  className="fs-14 me-2 mb-0 col-5 ms-2"
                >
                  {t("createEstimation.estimateNo")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="search"
                    id="search1"
                    className="border input-padding"
                    value={estimationNo}
                    onChange={(e) => setEstimationNo(e.target.value)}
                    aria-label="search"
                    autoComplete="off"
                  />
                </InputGroup>
              </div>
              <div className="d-flex align-items-center mb-1">
                <Form.Label
                  htmlFor="search2"
                  className="fs-14 me-2 mb-0 col-5 ms-2"
                >
                  {t("createEstimation.date")}
                </Form.Label>
                <Col xxl={6} xl={6} lg={6} md={6} sm={7} xs={8}>
                  <InputGroup>
                    <Form.Control
                      type="date"
                      id="estimationDate"
                      name="estimationDate"
                      className="form-control"
                      value={estimationDate}
                      onChange={(e) => setEstimationDate(e.target.value)}
                      placeholder="MM/DD/YYYY"
                      aria-label="date"
                      autoComplete="off"
                    />
                  </InputGroup>
                </Col>
              </div>
              <div className="d-flex align-items-center mb-1">
                <Form.Label
                  htmlFor="search3"
                  className="fs-14 me-2 mb-0 col-5 ms-2"
                >
                  {t("createEstimation.poNumber")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="search"
                    id="search3"
                    className="border input-padding"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="PO Number"
                    aria-label="search"
                    autoComplete="off"
                  />
                </InputGroup>
              </div>
            </div>
          </div>
          <div className={`row m-3 ${isSidebarOpen ? "col-10" : "col-11"}`}>
            <Table className="table border border-2 rounded">
              <thead>
                <tr>
                  <th className="d-flex align-items-center">
                    <Form.Check
                      className="me-2"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                    <span>{t("itemsForm.item")}</span>
                    <span className="ms-5 d-flex align-items-center">
                      {t("itemsForm.description")}
                      <i
                        className={`${
                          hideDescription ? "ri-eye-line" : "ri-eye-off-line"
                        } ms-2 cursor-pointer`}
                        onClick={handleToggleDescriptions}
                      />
                    </span>
                  </th>
                  <th className="text-end">{t("itemsForm.quantity")}</th>
                  <th className="text-end">{t("itemsForm.hours")}</th>
                  <th className="text-end">{t("itemsForm.tax")} (%)</th>
                  <th className="text-nowrap text-end">
                    {t("itemsForm.laborCost")}
                  </th>
                  <th className="text-nowrap text-end pe-4">
                    {" "}
                    {t("itemsForm.materialCost")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData &&
                  tableData.map((item, index) => (
                    <tr key={index}>
                      <th scope="row" className="">
                        <div className="d-flex align-items-center fw-bold">
                          <Form.Check
                            className="me-2"
                            checked={selectedRows[index]}
                            onChange={() => handleRowSelect(index)}
                          />
                          {item.title || item.name || "No Title Found"}
                          <span onClick={() => handleChevronClick(index)}>
                            <i
                              className={`bi ms-5 cursor-pointer ${
                                expandedRowIndex === index
                                  ? "bi-chevron-up"
                                  : "bi-chevron-down"
                              }`}
                            ></i>
                          </span>
                          <i
                            className="bi bi-trash text-danger cursor-pointer ms-3"
                            onClick={() => handleDeleteItem(index)}
                          ></i>
                        </div>
                        {(expandedRowIndex === index || showDescriptions) && (
                          <div className="mt-2 ms-2">{item.description}</div>
                        )}
                      </th>
                      <td className="text-end">{item.quantity}</td>
                      <td className="text-end">{item.hours}</td>
                      <td className="text-end">{item.tax || 0}</td>
                      <td className="text-end">{item.labour_cost}</td>
                      <td className="text-end pe-4">
                        {parseFloat(
                          item.material_cost *
                            item.quantity *
                            (1 + item.tax / 100)
                        ).toFixed(2) || 0}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-between align-items-center p-2 border-top">
              <div className="d-flex align-items-center gap-2">
                <div className="font-weight-bold fw-bold me-4">
                  {t("createEstimation.subtotals")}
                </div>
                <div className="d-flex align-items-center col-3">
                  {t("createEstimation.labourMargin")}
                  <Form.Control
                    type="search"
                    id="search3"
                    className="border border-sm ml-2"
                    value={labourMargin || 0}
                    onChange={handleLabourMarginChange}
                    placeholder=""
                    aria-label="search"
                    autoComplete="off"
                    style={{ width: "100%" }}
                  />
                  <span className="ml-2">%</span>
                </div>
                <div className="d-flex align-items-center col-3">
                  {t("createEstimation.materialMargin")}
                  <Form.Control
                    type="search"
                    id="search3"
                    className="border border-sm ml-2"
                    value={materialMargin}
                    onChange={handleMaterialMarginChange}
                    placeholder=""
                    aria-label="search"
                    autoComplete="off"
                    style={{ width: "100%" }}
                  />
                  <span className="ml-2">%</span>
                </div>
                <div className="d-flex align-items-center col-2">
                  <div className="me-4">$ {parseFloat(subTotal1) || 0}</div>
                </div>
                <div className="d-flex align-items-center col-2">
                  <div className="me-4">$ {parseFloat(subTotal2) || 0}</div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end align-items-center p-2 border-top gap-4 bg-gray-300">
              <div></div>
              <div className="font-weight-bold fw-bold">
                Total{" "}
                <span className="fw-normal ms-2">
                  {t("createEstimation.sfArea")}
                </span>
              </div>
              <div className="font-weight-bold fw-bold me-5">
                $ {parseFloat(total) || 0}
              </div>
            </div>
            <div className="d-flex w-100 flex-column mt-3">
              <div className="my-3 fw-bold fs-4 justify-content-center align-items-center text-center">
                {t("createEstimation.contractForm")}
                <i
                  className={`bi ms-5 cursor-pointer ${
                    showContractForm ? "bi-chevron-up" : "bi-chevron-down"
                  }`}
                  onClick={() => setShowContractForm(!showContractForm)}
                ></i>
              </div>
              <div>
                {showContractForm ? (
                  <Form onSubmit={handleSubmit} className="w-100">
                    <Row className="mb-3">
                      <Col className="">
                        <ReactQuill
                          value={htmlContent}
                          onChange={setHtmlContent}
                          modules={ContractText.modules}
                          formats={ContractText.formats}
                          className={`${error ? "border border-dange" : ""}`}
                        />
                        {error && (
                          <div className="text-danger mt-2">{error}</div>
                        )}
                      </Col>
                    </Row>
                  </Form>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              {isLoading ? (
                <Spinner variant="primary" animation="border" size="md" />
              ) : (
                <div>
                  <Button
                    variant="danger"
                    size="md"
                    className="p-2 me-2 badge"
                    type="button"
                    onClick={goBack}
                    disabled={isCancelDisabled}
                  >
                    {t("buttons.cancel")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="primary"
                    size="md"
                    className="badge m-2"
                    type="submit"
                  >
                    {t("buttons.save")}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="col-2 d-flex align-items-start justify-content-start">
            <DraggableSidebar
              isSidebarOpen={isSidebarOpen}
              onToggle={handleSidebarToggle}
              onDataDragStop={handleDataDragStop}
            />
          </div>
          <PopupInput
            est_Id={estimationId}
            show={showPopup}
            handleClose={handleClosePopup}
            dragData={dragData}
            handlePopupData={handlePopupData}
          />
        </div>
      </Card.Body>
    </>
  );

  const renderMobileView = () => (
    <>
      <Card.Body>
        <div className="position-relative">
          <div className="row gy-2 align-items-center border rounded border-2 p-2 mb-2">
            <div className="col-12 border border-2 rounded p-2">
              <Form.Label htmlFor="search" className="fs-6">
                {projects.title}
              </Form.Label>
              <span className="d-inline-block w-100">
                {projects.description}
              </span>
            </div>
            <div className="col-12 p-1 border border-2 rounded text-start d-block">
              <Form.Label htmlFor="search" className="fs-6">
                {customer.first_name + " " + customer.last_name}
              </Form.Label>
              <span className="d-block w-100 text-end">
                {projects.address_line_1 +
                  ", " +
                  projects.address_line_2 +
                  ", "}
                {projects.city +
                  ", " +
                  projects.state +
                  "-" +
                  projects.zip_code}
              </span>
            </div>
            <div className="col-12 p-0">
              <div className="d-flex flex-column align-items-start mb-1 me-1">
                <Form.Label htmlFor="search1" className="fs-14 me-2 mb-0">
                  {t("createEstimation.estimateNo")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="search"
                    id="search1"
                    value={estimationNo}
                    onChange={(e) => setEstimationNo(e.target.value)}
                    className="border estimate-input-padding"
                    aria-label="search"
                    autoComplete="off"
                  />
                </InputGroup>
              </div>
            </div>
            <div className="col-12 p-0">
              <div className="d-flex flex-column align-items-start mb-1 me-1">
                <Form.Label htmlFor="search1" className="fs-14 me-2 mb-0">
                  {t("createEstimation.date")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="date"
                    id="estimationDate"
                    name="estimationDate"
                    className="form-control"
                    value={estimationDate}
                    onChange={(e) => setEstimationDate(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    aria-label="date"
                    autoComplete="on"
                  />
                </InputGroup>
              </div>
            </div>
            <div className="col-12 p-0">
              <div className="d-flex flex-column align-items-start mb-1 me-1">
                <Form.Label
                  htmlFor="search1"
                  className="fs-14 me-2 mb-0 w-max-content"
                >
                  {t("createEstimation.poNumber")}
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="search"
                    id="search3"
                    className="border input-padding"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="PO Number"
                    aria-label="search"
                    autoComplete="off"
                  />
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="p-0">
              <div className="border border-2 p-0">
                <div className="d-flex align-items-center w-100 justify-content-between py-3 bg-f6f6ff px-2">
                  <div className="d-flex gap-1 fw-bold">
                    <Form.Check
                      className="me-2"
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                    <span> {t("itemsForm.item")} </span>
                  </div>
                  <div className="fw-bold d-flex align-items-center ms-4">
                    {t("itemsForm.description")}{" "}
                    <i
                      className={`${
                        hideDescription ? "ri-eye-line" : "ri-eye-off-line"
                      } ms-2 cursor-pointer`}
                      onClick={handleToggleDescriptions}
                    />
                  </div>
                  <div className="bg-primary w-25"></div>
                </div>
                {tableData &&
                  tableData.map((item, index) => (
                    <div className="" key={index}>
                      <div className="d-flex align-items-center justify-content-between my-2 px-2">
                        <span className="fw-bold d-flex align-items-center">
                          <div className="d-flex align-items-center fw-bold">
                            <Form.Check
                              className="me-2"
                              checked={selectedRows[index]}
                              onChange={() => handleRowSelect(index)}
                            />
                            {item.title || item.name || "No Title Found"}
                          </div>
                          {(expandedRowIndex === index || showDescriptions) && (
                            <div className="mt-2 ms-2">{item.description}</div>
                          )}
                        </span>
                        <span onClick={() => handleChevronClick(index)}>
                          <i
                            className={`bi ms-5 cursor-pointer ${
                              expandedRowIndex === index
                                ? "bi-chevron-up"
                                : "bi-chevron-down"
                            }`}
                          ></i>
                          <i
                            className="bi bi-trash text-danger cursor-pointer ms-3"
                            onClick={() => handleDeleteItem(index)}
                          ></i>
                        </span>
                      </div>
                      <div className="px-2">
                        <div className="row text-center primary-clr">
                          <div className="col-3">{t("itemsForm.quantity")}</div>
                          <div className="col-3">{t("itemsForm.hours")}</div>
                          <div className="col-3">
                            {t("itemsForm.laborCost")}
                          </div>
                          <div className="col-3">
                            {t("itemsForm.materialCost")}
                          </div>
                        </div>
                        <div className="row text-center fw-bold">
                          <div className="col-3">{item.quantity}</div>
                          <div className="col-3">{item.hours}</div>
                          <div className="col-3">${item.labour_cost}</div>
                          <div className="col-3">${item.material_cost}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="row mt-5 border-top px-1 m-0 bg-FAFAFB ">
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <div className="d-flex align-items-center me-4 col-5">
                      {t("createEstimation.labourMargin")}
                      <Form.Control
                        type="search"
                        id="search3"
                        className="border border-sm ml-2"
                        value={labourMargin || 0}
                        onChange={handleLabourMarginChange}
                        placeholder=""
                        aria-label="search"
                        autoComplete="off"
                        style={{ width: "100%" }}
                      />
                      <span className="ml-2">%</span>
                    </div>
                    <div className="d-flex align-items-center col-5">
                      {t("createEstimation.materialMargin")}
                      <Form.Control
                        type="search"
                        id="search3"
                        className="border border-sm ml-2"
                        value={materialMargin}
                        onChange={handleMaterialMarginChange}
                        placeholder=""
                        aria-label="search"
                        autoComplete="off"
                        style={{ width: "100%" }}
                      />
                      <span className="ml-2">%</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="font-weight-bold fw-bold me-4">
                    {t("createEstimation.subTotals")}
                  </div>
                  <div className="d-flex align-items-center col-4">
                    <div className="me-4">$ {parseFloat(subTotal1) || 0}</div>
                  </div>
                  <div className="d-flex align-items-center col-4">
                    <div className="me-4">$ {parseFloat(subTotal2) || 0}</div>
                  </div>
                </div>
                <div className="d-flex justify-content-end align-items-center p-2 border-top gap-4 bg-gray-300">
                  <div></div>
                  <div className="font-weight-bold fw-bold">
                    Total{" "}
                    <span className="fw-normal ms-2">
                      {t("createEstimation.sfArea")}
                    </span>
                  </div>
                  <div className="font-weight-bold fw-bold me-5">
                    $ {parseFloat(total) || 0}
                  </div>
                </div>
                <div className="d-flex w-100 flex-column mt-3">
                  <div className="my-3 fw-bold fs-4 justify-content-center align-items-center text-center">
                    {t("createEstimation.contractForm")}
                    <i
                      className={`bi ms-5 cursor-pointer ${
                        showContractForm ? "bi-chevron-up" : "bi-chevron-down"
                      }`}
                      onClick={() => setShowContractForm(!showContractForm)}
                    ></i>
                  </div>
                  <div>
                    {showContractForm ? (
                      <Form onSubmit={handleSubmit} className="w-100">
                        <Row className="mb-3">
                          <Col className="">
                            <ReactQuill
                              value={htmlContent}
                              onChange={setHtmlContent}
                              modules={ContractText.modules}
                              formats={ContractText.formats}
                              className={`${
                                error ? "border border-dange" : ""
                              }`}
                            />
                            {error && (
                              <div className="text-danger mt-2">{error}</div>
                            )}
                          </Col>
                        </Row>
                      </Form>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div className="d-flex justify-content-end mt-3">
                  {isLoading ? (
                    <Spinner variant="primary" animation="border" size="md" />
                  ) : (
                    <div>
                      <Button
                        variant="danger"
                        size="sm"
                        className="p-2 m-2 badge"
                        type="button"
                        onClick={goBack}
                        disabled={isCancelDisabled}
                      >
                        {t("buttons.cancel")}
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        variant="primary"
                        size="md"
                        className="badge m-2"
                        type="submit"
                      >
                        {t("buttons.save")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-2">
                <DraggableSidebar
                  isSidebarOpen={isSidebarOpen}
                  onToggle={handleSidebarToggle}
                  onDataDragStop={handleDataDragStop}
                />
              </div>
              <PopupInput
                est_Id={estimationId}
                show={showPopup}
                handleClose={handleClosePopup}
                dragData={dragData}
                handlePopupData={handlePopupData}
              />
            </div>
          </div>
        </div>
      </Card.Body>
    </>
  );

  return (
    <>
      <Pageheader breadcrumbItems={breadcrumbItems} />
      <Card className="custom-card mt-4">
        <Card.Header>
          <Card.Title>{t("previewEstimate.create")}</Card.Title>
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
        </Card.Header>
        <Card.Body>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </Card.Body>
      </Card>
    </>
  );
};

Index.layout = "Contentlayout";
export default Index;
