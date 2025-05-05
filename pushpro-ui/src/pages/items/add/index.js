import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Pageheader from "../../../../shared/layout-components/header/pageheader";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useService from "@/hooks/useService";

const Select = dynamic(() => import("react-select"), { ssr: false });

const addItem = () => {
  const [formValues, setFormValues] = useState({
    item: "",
    description: "",
    quantity: "",
    hours: "",
    laborCost: "",
    materialCost: "",
    category: null
  });
  const [categories, setCategories] = useState([]);
  const service = useService();
  const { handleSuccessDialog } = service;
  const [errors, setErrors] = useState({});
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const validationSchema = Yup.object().shape({
    item: Yup.string().required(`${t("itemsForm.validateItem")}`),
    description: Yup.string().required(`${t("itemsForm.validateDescription")}`),
    quantity: Yup.string().required(`${t("itemsForm.validateQuantity")}`),
    hours: Yup.string().required(`${t("itemsForm.validateHours")}`),
    laborCost: Yup.string().required(`${t("itemsForm.validateLaborcost")}`),
    materialCost: Yup.string().required(
      `${t("itemsForm.validateMaterialcost")}`
    ),
    category: Yup.mixed().required(`Category Required`)
  });

  const fetchCategories = async () => {
    try {
      const response = await service.get("/myprofile/all-item-categories");
      if (response?.success) {
        const categoryOptions = response.data.map((category) => ({
          value: category.id,
          label: category.category_title
        }));
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    fetchCategories();
    setErrors({});
  }, [i18n.language]);

  const refresh = (e) => {
    e.preventDefault();
    router.push("/dashboard ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      const quantityPerHour = formValues.quantity / formValues.hours;
      const hourlyLaborRate = formValues.laborCost / formValues.hours;
      const response = await service.post("/myprofile/item/add", {
        title: formValues.item,
        description: formValues.description,
        quantity: formValues.quantity,
        hours: formValues.hours,
        labour_cost: formValues.laborCost,
        material_cost: formValues.materialCost,
        category_id: formValues.category.value,
        quantityPerHour: quantityPerHour,
        hourlyLaborRate: hourlyLaborRate
      });
      if (response?.success) {
        setFormValues({
          item: "",
          description: "",
          quantity: "",
          hours: "",
          laborCost: "",
          materialCost: "",
          category: null
        });
        handleSuccessDialog(response);
        successDialog();
        router.push("/items/");
      }
    } catch (error) {
      if (error.inner) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else {
        console.error("Error:", error);
      }
    }
  };

  const successDialog = () => {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Item Added Successfully",
      showConfirmButton: false,
      timer: 1500
    });
  };

  const breadcrumbItems = [
    { url: `${basePath}/dashboard`, title: t("breadCrumb.dashboard") },
    { url: `${basePath}/items`, title: t("breadCrumb.items") },
    { url: `${basePath}/items/add`, title: t("breadCrumb.addItem") }
  ];

  return (
    <>
      <div className="col-12">
        <Pageheader breadcrumbItems={breadcrumbItems} />
        <Card className="custom-card mt-4">
          <Card.Header className="justify-content-between">
            <Card.Title>{t("itemsForm.addItem")}</Card.Title>
            <div className="prism-toggle">
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
            </div>
          </Card.Header>
          <Card.Body>
            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.item")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.item ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="text"
                  value={formValues.item}
                  placeholder={t("itemsForm.enterItemTitlePlaceholder")}
                  onChange={(e) =>
                    setFormValues({ ...formValues, item: e.target.value })
                  }
                  className="form-control"
                />
              </InputGroup>
              {errors.item && (
                <div variant="danger" className="error-message text-danger">
                  {errors.item}
                </div>
              )}
            </div>

            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.category")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup className="d-inline-block">
                <Select
                  placeholder="Select a category"
                  isSearchable={true}
                  name="category"
                  value={formValues.category}
                  options={categories}
                  className="default basic-multi-select"
                  id="choices-multiple-default"
                  menuPlacement="auto"
                  onChange={(selectedOption) =>
                    setFormValues({ ...formValues, category: selectedOption })
                  }
                  classNamePrefix="Select2"
                />
              </InputGroup>
              {errors.category && (
                <div variant="danger" className="error-message text-danger">
                  {errors.category}
                </div>
              )}
            </div>

            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.description")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.description ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="text"
                  value={formValues.description}
                  placeholder={t("itemsForm.enterDescriptionPlaceholder")}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      description: e.target.value
                    })
                  }
                  className="form-control"
                />
              </InputGroup>
              {errors.description && (
                <div variant="danger" className="error-message text-danger">
                  {errors.description}
                </div>
              )}
            </div>
            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.quantity")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.quantity ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="number"
                  value={formValues.quantity}
                  placeholder={t("itemsForm.quantity")}
                  onChange={(e) =>
                    setFormValues({ ...formValues, quantity: e.target.value })
                  }
                  className="form-control"
                />
              </InputGroup>
              {errors.quantity && (
                <div variant="danger" className="error-message text-danger">
                  {errors.quantity}
                </div>
              )}
            </div>
            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.hours")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.hours ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="number"
                  value={formValues.hours}
                  placeholder={t("itemsForm.enterHoursPlaceholder")}
                  onChange={(e) =>
                    setFormValues({ ...formValues, hours: e.target.value })
                  }
                  className="form-control"
                />
              </InputGroup>
              {errors.hours && (
                <div variant="danger" className="error-message text-danger">
                  {errors.hours}
                </div>
              )}
              <div className="form-text">
                {t("itemsForm.quantityProducedPerHour")} :{" "}
                {(() => {
                  const result =
                    formValues.hours === 0
                      ? 0
                      : formValues.quantity / formValues.hours;
                  return isFinite(result)
                    ? parseFloat(result).toFixed(2)
                    : "0.00";
                })()}
              </div>
            </div>
            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.laborCost")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${errors.laborCost ? "border border-danger" : ""}`}
              >
                <Form.Control
                  type="number"
                  value={formValues.laborCost}
                  placeholder={t("itemsForm.laborCostPlaceholder")}
                  onChange={(e) =>
                    setFormValues({ ...formValues, laborCost: e.target.value })
                  }
                  className="form-control"
                />
              </InputGroup>
              {errors.laborCost && (
                <div variant="danger" className="error-message text-danger">
                  {errors.laborCost}
                </div>
              )}
              <div className="form-text">
                {t("itemsForm.hourlyLaborCost")} :{" "}
                {(() => {
                  const result =
                    formValues.hours === 0
                      ? 0
                      : formValues.laborCost / formValues.hours;
                  return isFinite(result)
                    ? parseFloat(result).toFixed(2)
                    : "0.00";
                })()}
              </div>
            </div>
            <div className="col-12 mb-3 col-md-6 col-lg-5 ">
              <Form.Label className="form-label fs-14">
                {t("itemsForm.materialCost")}
                <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup
                className={`${
                  errors.materialCost ? "border border-danger" : ""
                }`}
              >
                <Form.Control
                  type="number"
                  value={formValues.materialCost}
                  placeholder={t("itemsForm.materialCostPlaceholder")}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      materialCost: e.target.value
                    })
                  }
                  className="form-control"
                />
              </InputGroup>
              {errors.materialCost && (
                <div variant="danger" className="error-message text-danger">
                  {errors.materialCost}
                </div>
              )}
            </div>
            <div className="col-12">
              <Button
                className="btn btn-primary me-2"
                type="submit"
                onClick={handleSubmit}
              >
                {t("buttons.save")}
              </Button>
              <Button className="btn btn-danger" type="button" onClick={goBack}>
                {t("buttons.cancel")}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

addItem.layout = "Contentlayout";
export default addItem;
