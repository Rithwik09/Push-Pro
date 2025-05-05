import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import useService from "@/hooks/useService";
import { useTranslation } from "react-i18next";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import debounce from "lodash/debounce";

const Select = dynamic(() => import("react-select"), { ssr: false });

const CustomerSelect = ({
  showModal,
  handleCloseModal,
  handleOpenMainModal
}) => {
  const router = useRouter();
  const service = useService();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerList, setCustomerList] = useState([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  
  useEffect(() => {
    // Fetch customer list on component mount
    debouncedGetCustomerList("");
    // getCustomerList("");
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  
    // Debounced version of getCustomerList to avoid excessive API calls
    const debouncedGetCustomerList = debounce(async (searchTerm) => {
      setIsLoading(true);
      console.log("debouncedGetCustomerList called with searchTerm:", searchTerm);
      try {
        const response = await service.get(`/customers?name=${searchTerm}`);
        if (response && response.data) {
          setCustomerList(response.data);
        }
      } catch (err) {
        console.error("Error fetching customer list:", err);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Delay of 500ms for the API call after the user stops typing
   
   
    // const getCustomerList = async (searchTerm) => {
    //   if (!searchTerm.trim()) return;
    //   setIsLoading(true);
    //   try {
    //     const response = await service.get(`/customers?name=${searchTerm}`);
    //     if (response && response.data) {
    //       setCustomerList(response.data);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching customer list:", err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

  const handleSearchChange = (inputValue) => {
    setCustomerSearch(inputValue);
    debouncedGetCustomerList(inputValue);
  };

  const handleNewProject = () => {
    router.push("/myprojects/create");
  };

  const NewCustomer = async () => {
    const userData = localStorage.getItem("user_data");
    const userDataObject = userData ? JSON.parse(userData) : null;
    const user_uuid = userDataObject ? userDataObject.user_uuid : null;
    try {
      const response = await service.post("/add-customer", {
        first_name: customerName,
        last_name: customerLastName,
        email_address: customerEmail,
        phone_no: customerPhone,
        user_id: user_uuid
      });
      if (response.success) {
        setShowNewCustomerModal(false);
        handleOpenMainModal();
        localStorage.setItem("cust_id", JSON.stringify(response.data.id));
        setSelectedCustomer({
          value: response.data.id,
          label: `${response.data.first_name} ${response.data.last_name}`
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 415) {
        setError("A Customer with the provided email address already exists.");
      }
    }
  };
  
  // useEffect(() => {
  //   if (customerSearch.trim()) {
  //     debouncedGetCustomerList(customerSearch);
  //   }
  // }, [customerSearch]);

  const CustomerOptions = Array.isArray(customerList)
    ? customerList.map((customer) => ({
        value: customer.id,
        label: `${customer.first_name} ${customer.last_name}`
      }))
    : [];

  const handleAddNewCustomer = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerLastName("");
    handleCloseModal();
    setTimeout(() => setShowNewCustomerModal(true), 300);
  };

  return (
    <>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("project.newProject")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="customerSearch">
            <Form.Label>{t("customer.customerName")}</Form.Label>
            <Select
              name="state"
              options={CustomerOptions}
              isLoading={isLoading}
              className="basic-multi-select1 border-2 border-primary"
              menuPlacement="auto"
              classNamePrefix="Select2"
              onInputChange={handleSearchChange}
              placeholder={t("customer.customerName")}
              value={selectedCustomer}
              onChange={(selectedOption) => {
                setSelectedCustomer(selectedOption);
                // localStorage.removeItem("cust_id");
                localStorage.setItem(
                  "cust_id",
                  JSON.stringify(selectedOption.value)
                );
              }}
            />
            <div className="mt-3">
              <Button
                variant="link"
                className="p-0 mt-2"
                onClick={handleAddNewCustomer}
              >
                + {t("customer.addNewCustomer")}
              </Button>
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={handleNewProject}>
            {t("buttons.select")}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showNewCustomerModal}
        onHide={() => setShowNewCustomerModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("customer.addNewCustomer")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newCustomerName">
            <Form.Label>{t("customer.customerName")}</Form.Label>
            <Row>
              <Col>
                <Form.Control
                  type="text"
                  placeholder={t("customer.enterCustomerFirstName")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border border-2 border-primary"
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                  placeholder={t("customer.enterCustomerLastName")}
                  className="border border-2 border-primary"
                />
              </Col>
            </Row>
          </Form.Group>
          <Form.Group controlId="newCustomerEmail" className="mt-3">
            <Form.Label>{t("project.customerEmail")}</Form.Label>
            <Form.Control
              type="email"
              onChange={(e) => setCustomerEmail(e.target.value)}
              value={customerEmail}
              placeholder={t("customer.enterCustomerEmail")}
              className="border border-2 border-primary"
            />
            {error && <div className="text-danger mt-2">{error}</div>}
          </Form.Group>
          <Form.Group controlId="customerPhone" className="mt-3">
            <Form.Label>{t("project.customerPhone")}</Form.Label>
            <Form.Control
              type="number"
              onChange={(e) => setCustomerPhone(e.target.value)}
              value={customerPhone}
              placeholder={t("customer.enterCustomerPhone")}
              className="border border-2 border-primary"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowNewCustomerModal(false)}
          >
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={NewCustomer}>
            {t("buttons.save")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CustomerSelect;
