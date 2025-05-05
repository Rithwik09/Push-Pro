import useService from "@/hooks/useService";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import * as Yup from "yup";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Invitations = ({
  showModal,
  handleCloseModal,
  inviteType,
  contactMethod,
  setContactMethod,
  currentInput,
  setCurrentInput,
  contacts,
  setContacts,
  errors,
  setErrors,
  editIndex,
  setEditIndex,
  loading,
  setLoading,
  customer,
  contractor,
  t
}) => {
  const [message, setMessage] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const service = useService();
  const { handleSuccessDialog, handleErrorDialog } = service;
  const SMS_MAX_LENGTH = 320;

  useEffect(() => {
    if (inviteType === "customer") {
      setMessage(customer?.email);
      setSmsMessage(customer?.sms);
    }
    if (inviteType === "contractor") {
      setMessage(contractor?.email);
      setSmsMessage(contractor?.sms);
    }
  }, [inviteType]);

  const handleQuillChange = (content) => {
    setMessage(content);
  };

  const validateSmsTemplate = (template) => {
    if (template.length > SMS_MAX_LENGTH) {
      return `SMS template exceeds maximum length of ${SMS_MAX_LENGTH} characters`;
    }
    return null;
  };

  const validateEmail = Yup.object().shape({
    input: Yup.string()
      .email(t("accountInfoForm.invalidEmail"))
      .required(t("accountInfoForm.validateEmail"))
  });

  const validateSms = Yup.object().shape({
    input: Yup.string()
      .matches(
        /^\+1 \(\d{3}\)\s\d{3}-\d{4}$/,
        t("accountInfoForm.invalidPhone")
      )
      .required(t("accountInfoForm.validatePhone"))
  });

  const formatPhoneNumberForApi = (phoneNumber) => {
    return phoneNumber.replace(/[()\s-]/g, "");
  };

  const handleContactMethodChange = (e) => {
    setContactMethod(e.target.value);
    if (e.target.value === "sms") {
      setCurrentInput("+1 ");
    } else {
      setCurrentInput("");
    }
    setEditIndex(null);
    setErrors([]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (contacts.length === 0) {
        contactMethod === "email"
          ? setErrors([t("accountInfoForm.validateEmail")])
          : setErrors([t("accountInfoForm.validatePhone")]);
        return;
      }
      let response = null;
      if (contactMethod === "email") {
        for (const contact of contacts) {
          await validateEmail.validate(
            { input: contact },
            { abortEarly: false }
          );
        }
        response = await service.post("/sendBulkMails", {
          emails: contacts,
          email_for: inviteType,
          message: message
        });
      }
      if (contactMethod === "sms") {
        for (const contact of contacts) {
          await validateSms.validate({ input: contact }, { abortEarly: false });
        }
        const formattedContacts = contacts.map(formatPhoneNumberForApi);
        response = await service.post("/sendBulkSMS", {
          phone_numbers: formattedContacts,
          sms_for: inviteType,
          message: smsMessage
        });
      }
      if (response?.success) {
        handleSuccessDialog(response);
        handleCloseModal();
      } else {
        console.error("Error Sending Invitations : ", response);
      }
    } catch (error) {
      console.error("Error Sending Invitations : ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let input = e.target.value;
    if (contactMethod === "sms") {
      input = input.replace(/\D/g, "");
      if (!input.startsWith("1")) {
        input = "1" + input;
      }
      const digitsOnly = input;
      let formattedNumber = "+1 (";
      for (let i = 1; i < digitsOnly.length; i++) {
        const digit = digitsOnly[i];
        if (i === 4) {
          formattedNumber += `) ${digit}`;
        } else if (i === 7) {
          formattedNumber += `-${digit}`;
        } else {
          formattedNumber += digit;
        }
      }
      input = formattedNumber;
      if (input.length > 17) {
        input = input.slice(0, 17);
      }
    }
    setCurrentInput(input);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleAddContact();
    }
  };

  const handleAddContact = async () => {
    try {
      if (contactMethod === "email") {
        await validateEmail.validate(
          { input: currentInput },
          { abortEarly: false }
        );
      } else {
        await validateSms.validate(
          { input: currentInput },
          { abortEarly: false }
        );
      }
      if (editIndex !== null) {
        const updatedContacts = [...contacts];
        updatedContacts[editIndex] = currentInput;
        setContacts(updatedContacts);
        setEditIndex(null);
      } else {
        setContacts([...contacts, currentInput]);
      }
      if (contactMethod === "sms") {
        setCurrentInput("+1 ");
      } else {
        setCurrentInput("");
      }
      setErrors([]);
    } catch (err) {
      setErrors([err.message]);
    }
  };

  const handleEditContact = (index) => {
    setCurrentInput(contacts[index]);
    setEditIndex(index);
  };

  const handleDeleteContact = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" }
      ],
      ["link"],
      ["clean"]
    ]
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link"
  ];

  return (
    <Modal show={showModal} onHide={handleCloseModal}>
      <Modal.Header>
        <Modal.Title>
          {inviteType === "customer"
            ? t("general.inviteCustomer")
            : t("general.inviteContractor")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="justify-content-center align-items-center">
        <Form
          onSubmit={(event) => event.preventDefault()}
          className="w-100 d-flex flex-column"
        >
          {/* {Radio Buttons} */}
          <Form.Group className="d-flex flex-row gap-4">
            <Form.Check
              type="radio"
              label="Email"
              name="contactMethod"
              value="email"
              id="email"
              checked={contactMethod === "email"}
              onChange={handleContactMethodChange}
            />
            <Form.Check
              type="radio"
              label="SMS"
              name="contactMethod"
              value="sms"
              id="sms"
              checked={contactMethod === "sms"}
              onChange={handleContactMethodChange}
            />
          </Form.Group>
          {/* {Added Emails and Numbers List} */}
          <div className="mt-3">
            <Form.Label>{t("general.to")} :</Form.Label>
            <ul>
              {contacts.map((contact, index) => {
                let error = null;
                try {
                  if (contactMethod === "email") {
                    validateEmail.validateSync(
                      { input: contact },
                      { abortEarly: false }
                    );
                  } else {
                    validateSms.validateSync(
                      { input: contact },
                      { abortEarly: false }
                    );
                  }
                } catch (err) {
                  error = err.message;
                }
                return (
                  <li key={index} className="d-flex justify-content-between">
                    <div>
                      {contact}
                      {error && <div className="text-danger">{error}</div>}
                    </div>
                    <div>
                      <i
                        title="Edit"
                        className="ms-2 btn-sm btn btn-secondary-light rounded-pill"
                        onClick={() => handleEditContact(index)}
                      >
                        <i className="bi bi-pencil"></i>
                      </i>
                      <i
                        title="Delete"
                        className="ms-2 btn-sm btn btn-danger-light rounded-pill"
                        onClick={() => handleDeleteContact(index)}
                      >
                        <i className="bi bi-trash"></i>
                      </i>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <Form.Group className="mt-3">
            <Form.Label>
              {contactMethod === "email"
                ? t("accountInfoForm.email")
                : t("accountInfoForm.phoneNo")}{" "}
              :
            </Form.Label>
            <Form.Control
              type="text"
              value={currentInput || ""}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={
                contactMethod === "email"
                  ? t("accountInfoForm.enterEmail")
                  : t("accountInfoForm.enterPhoneNo")
              }
            />
            {errors.length > 0 && (
              <div className="text-danger">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </Form.Group>
          <div className="w-100 d-flex justify-content-end">
            {editIndex !== null ? (
              <Button
                variant="secondary-light"
                onClick={handleAddContact}
                className="mt-2"
              >
                {t("buttons.update")}
              </Button>
            ) : (
              <Button
                variant="primary-light"
                onClick={handleAddContact}
                className="mt-2"
              >
                {t("buttons.add")} +
              </Button>
            )}
          </div>
          <div className="w-100 d-flex flex-row">
            <Form.Group className="mt-4">
              <Form.Label>{t("general.message")} :</Form.Label>
              {contactMethod === "email" ? (
                <ReactQuill
                  value={message}
                  onChange={handleQuillChange}
                  modules={modules}
                  formats={formats}
                  placeholder={message || "Enter message"}
                />
              ) : (
                <Form.Control
                  as="textarea"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  maxLength={SMS_MAX_LENGTH}
                  placeholder={smsMessage || "Enter message"}
                  style={{ width: "300px", height: "40vh" }}
                />
              )}
              {contactMethod === "sms" && (
                <div className="text-muted mt-2">
                  Characters: {smsMessage.length}/{SMS_MAX_LENGTH}
                </div>
              )}
              {contactMethod === "sms" && validateSmsTemplate(smsMessage) && (
                <div className="text-danger mt-2">
                  {validateSmsTemplate(smsMessage)}
                </div>
              )}
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary-light"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            t("buttons.sendInvite")
          )}
        </Button>
        <Button
          variant="danger-light"
          onClick={handleCloseModal}
          disabled={loading}
        >
          {t("buttons.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Invitations;
