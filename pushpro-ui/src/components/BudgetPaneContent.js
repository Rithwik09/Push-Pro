import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row, Tab } from "react-bootstrap";
import * as Yup from "yup";
import useService from "@/hooks/useService";
import { useRouter } from "next/router";

const BudgetPaneContent = ({
  t,
  budgetSwitch,
  setbudgetSwitch,
  toggleBudget,
  handleBudgetBackClick,
  handleBudgetNextClick,
  handleBudgetSkipClick,
  showResCommForm,
  setShowResCommForm,
  projectID,
  respData
}) => {
  const [errors, setErrors] = useState({});
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [formData, setFormData] = useState({
    amountFrom: "",
    amountTo: ""
  });
  const router = useRouter();
  const newProjectID = router.query.projectID;
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateBudget = () => {
    const schema = Yup.object().shape({
      amountFrom:
        budgetSwitch === "on"
          ? Yup.number()
              .transform((value, originalValue) =>
                originalValue.trim() === "" ? undefined : value
              )
              .required(t("budgetValidations.amountFromRequired"))
              .typeError(t("budgetValidations.amountFromTypeError"))
              .positive(t("budgetValidations.amountFromPositive"))
          : Yup.number().nullable(),
      amountTo:
        budgetSwitch === "on"
          ? Yup.number()
              .transform((value, originalValue) =>
                originalValue.trim() === "" ? undefined : value
              )
              .required(t("budgetValidations.amountToRequired"))
              .typeError(t("budgetValidations.amountToTypeError"))
              .positive(t("budgetValidations.amountToPositive"))
              .when("amountFrom", (amountFrom, schema) =>
                amountFrom
                  ? schema.min(
                      amountFrom,
                      t("budgetValidations.amountToGreater")
                    )
                  : schema
              )
          : Yup.number().nullable()
    });

    return schema
      .validate(formData, { abortEarly: false })
      .then(() => {
        setErrors({});
        return true;
      })
      .catch((validationErrors) => {
        const formattedErrors = {};
        validationErrors.inner.forEach((error) => {
          formattedErrors[error.path] = error.message;
        });
        setErrors(formattedErrors);
        return false;
      });
  };

  const onBudgetNextClick = async () => {
    let payload;
    if (budgetSwitch === "on") {
      const isValid = await validateBudget();
      if (!isValid) return;
      payload = {
        budget_preference: true,
        budget_min: formData.amountFrom,
        budget_max: formData.amountTo
      };
    } else {
      payload = {
        budget_preference: false,
        budget_min: 0,
        budget_max: 0
      };
    }
    await updateProjectBudgetPreference(payload);
    handleBudgetNextClick();
  };

  const updateProjectBudgetPreference = async (payload) => {
    try {
      const id = newProjectID || respData?.data?.project_id || projectID;
      const response = await service.patch(
        `/myprojects/edit/budget/${id}`,
        payload
      );
      if (response?.success) {
        handleSuccessDialog(response.data);
      }
    } catch (error) {
      console.error("Failed to update project budget preference:", error);
      handleErrorDialog(error);
    }
  };

  useEffect(() => {
    if (respData) {
      if (respData?.data?.budget_preference == true) {
        budgetSwitch = "on";
        setbudgetSwitch("on");
        setFormData({
          amountFrom: respData.data.budget_min,
          amountTo: respData.data.budget_max
        });
        toggleBudget();
      }
    }
  }, [respData]);

  useEffect(() => {
    setErrors({});
  }, [budgetSwitch, t]);

  return (
    <>
      <Tab.Pane
        className="fade text-muted"
        id="budget-pane"
        role="tabpanel"
        eventKey={3}
        aria-labelledby="contact-tab"
        tabIndex="0"
      >
        <Form>
          <Row className="mb-3">
            <Col xl={12} className="mb-3 d-flex">
              <Form.Label htmlFor="budgetPane" className="form-label me-2">
                {t("budget.budgetSwitchText")}
              </Form.Label>
              <div
                id="budgetPane"
                className={`toggle ${budgetSwitch}`}
                onClick={toggleBudget}
              >
                <span></span>
              </div>
            </Col>
          </Row>
          {budgetSwitch === "on" && (
            <div className="showBtnToggle col-lg-9">
              <Row className="mb-3 align-items-center">
                <Col xxl={2} xl={2} lg={3} md={2} sm={2} xs={12}>
                  <label htmlFor="amount" className="form-label fs-14">
                    {t("budget.amount")} <span className="text-danger">*</span>
                  </label>
                </Col>
                <Col
                  xxl={8}
                  xl={8}
                  lg={8}
                  md={7}
                  sm={8}
                  xs={12}
                  className="d-flex align-items-center"
                >
                  <div>
                    <InputGroup
                      className={`${
                        errors.amountFrom ? "border border-danger" : ""
                      }`}
                    >
                      <InputGroup.Text>
                        <i
                          className="bi bi-currency-dollar"
                          aria-hidden="true"
                        ></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="amountFrom"
                        value={formData.amountFrom}
                        placeholder={t("budget.amount")}
                        className="form-control"
                        onChange={handleInputChange}
                      />
                    </InputGroup>
                    {errors.amountFrom && (
                      <div
                        variant="danger"
                        className="error-message text-danger"
                      >
                        {errors.amountFrom}
                      </div>
                    )}
                  </div>
                  <label htmlFor="to" className="form-label fs-14 mx-3">
                    {t("budget.to")}
                  </label>
                  <div>
                    <InputGroup
                      className={`${
                        errors.amountTo ? "border border-danger" : ""
                      }`}
                    >
                      <InputGroup.Text>
                        <i
                          className="bi bi-currency-dollar"
                          aria-hidden="true"
                        ></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="amountTo"
                        value={formData.amountTo}
                        onChange={handleInputChange}
                        placeholder={t("budget.amount")}
                        className="form-control"
                      />
                    </InputGroup>
                    {errors.amountTo && (
                      <div
                        variant="danger"
                        className="error-message text-danger"
                      >
                        {errors.amountTo}
                      </div>
                    )}
                  </div>
                </Col>
                {/* <Col xl={1} className='d-flex justify-content-center'>

                </Col> */}
                {/* <Col xl={3}>
                  
                </Col> */}
              </Row>
            </div>
          )}
          <Row className="mb-3 schedule-btns">
            <Col className="d-flex justify-content-end mt-5">
              <Button
                className="btn btn-primary me-2 schedule-skip"
                type="button"
                onClick={handleBudgetSkipClick}
              >
                {t("buttons.skip")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-back"
                type="button"
                onClick={handleBudgetBackClick}
              >
                {t("buttons.back")}
              </Button>
              <Button
                className="btn btn-primary me-2 schedule-next"
                type="button"
                onClick={onBudgetNextClick}
              >
                {t("buttons.next")}
              </Button>
            </Col>
          </Row>
        </Form>
      </Tab.Pane>
    </>
  );
};

export default BudgetPaneContent;
