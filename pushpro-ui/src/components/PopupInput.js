import React, { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useService from "@/hooks/useService";
import * as Yup from "yup";

const PopupInput = ({
  est_Id,
  show,
  handleClose,
  dragData,
  handlePopupData
}) => {
  const { t } = useTranslation();
  const service = useService();
  const { handleErrorDialog, handleSuccessDialog } = service;
  const [showQuantityPerHour, setShowQuantityPerHour] = useState(false);
  const [showHourlyLabourRate, setShowHourlyLabourRate] = useState(false);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    id: 0,
    name: "",
    quantity: 0,
    hours: "0.00",
    laborCost: "0.00",
    materialCost: "0.00",
    description: "",
    quantityRatio: "0.00",
    categoryId: 0,
    tax: "0.00",
    quantityPerHour: "0.00",
    hourlyLabourRate: "0.00",
    itemCost: 0
  });

  useEffect(() => {
    if (dragData) {
      setData(dragData.subCategory);
    }
  }, [dragData]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const quantity = parseFloat(data.quantity) || 0;
    const materialCost = parseFloat(data.materialCost) || 0;
    const tax = parseFloat(data.tax) || 0;
    const itemCost = quantity * materialCost * (1 + tax / 100) + data.laborCost;
    setData((prevData) => ({
      ...prevData,
      itemCost
    }));
  }, [data.quantity, data.materialCost, data.tax]);

  const calculateItemCost = (quantity, materialCost, tax, laborCost) => {
    const cost = quantity * materialCost * (1 + tax / 100) + laborCost;
    return isNaN(cost) ? 0 : cost;
  };

  const fetchCategories = async () => {
    try {
      const response = await service.get("/myprofile/all-item-categories");
      if (response?.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error Fetching Categories :", error);
    }
  };

  const handleCloses = () => {
    handleClose();
    setData({
      id: "",
      name: "",
      quantity: "",
      hours: "",
      quantityPerHour: "",
      laborCost: "",
      hourlyLabourRate: "",
      materialCost: "",
      description: "",
      quantityRatio: "",
      category: "",
      tax: "0"
    });
  };

  const addItemToMyItems = async () => {
    try {
      const response = await service.post("/myprofile/item/add", {
        title: data.name,
        description: data.description,
        quantity: data.quantity,
        hours: data.hours,
        labour_cost: data.laborCost,
        material_cost: data.materialCost,
        category_id: data.categoryId,
        quantityPerHour: data.quantityPerHour,
        hourlyLaborRate: data.hourlyLabourRate
      });
      if (response?.successs) {
        fetchCategories();
      }
    } catch (error) {
      console.error("Error Adding Item to My Items: ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.addToItems) {
      await addItemToMyItems(data);
    }
    try {
      const response = await service.post(
        `/myprojects/estimation/item/add/${est_Id}`,
        {
          id: data.id,
          item_id: data.itemId,
          category_id: data.categoryId,
          title: data.name,
          description: data.description,
          quantity: data.quantity || 0,
          hours: data.hours,
          quantity_per_hour: data.quantityPerHour,
          labour_cost: data.laborCost,
          hourly_labour_rate: data.hourlyLabourRate,
          material_cost: data.materialCost,
          tax: data.tax
        }
      );
      if (response.data) {
        handlePopupData(response.data);
        handleClose();
        handleSuccessDialog("Item added successfully");
      }
    } catch (error) {
      error = {
        message: "Error Adding Item. Try Again."
      };
      handleErrorDialog(error);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    quantity: Yup.number()
      .typeError("Quantity must be a number")
      .required("Quantity is required")
      .positive("Quantity must be positive")
      .integer("Quantity must be an integer"),
    hours: Yup.number()
      .typeError("Hours must be a number")
      .required("Hours are required")
      .positive("Hours must be positive")
      .integer("Hours must be an integer"),
    laborCost: Yup.number()
      .typeError("Labor cost must be a number")
      .required("Labor cost is required")
      .positive("Labor cost must be positive"),
    materialCost: Yup.number()
      .typeError("Material cost must be a number")
      .positive("Material cost must be positive"),
    description: Yup.string().required("Description is required"),
    quantityRatio: Yup.number()
      .typeError("Quantity ratio must be a number")
      .required("Quantity ratio is required")
      .positive("Quantity ratio must be positive"),
    category: Yup.string().required("Category is required"),
    tax: Yup.number()
      .typeError("Tax must be a number")
      .required("Tax are required")
      .min(0, "Tax must be at least 0%")
      .max(100, "Tax cannot exceed 100%")
  });

  if (!show) {
    return null;
  }

  const handleShowQuantityPerHour = () => {
    setShowHourlyLabourRate(false);
    setShowQuantityPerHour(!showQuantityPerHour);
  };

  const handleShowHourlyLabourRate = () => {
    setShowQuantityPerHour(false);
    setShowHourlyLabourRate(!showHourlyLabourRate);
  };

  const resetShowBoth = () => {
    setShowQuantityPerHour(false);
    setShowHourlyLabourRate(false);
  };

  return (
    <>
      <div className="popup-cover">&nbsp;</div>
      <div className="popup-container popup-box p-4">
        <div className="popup-color popup-body rounded p-3">
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-xl-4 col-md-5 col-sm-12">
                <Form.Group className="mb-3">
                  <Form.Label>{t("popUp.name")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Item"
                    onClick={resetShowBoth}
                    value={data?.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    isInvalid={!!validationSchema.errors?.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-5 col-md-7 col-sm-12">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.description")}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Description"
                    value={data?.description}
                    onClick={resetShowBoth}
                    onChange={(e) =>
                      setData({ ...data, description: e.target.value })
                    }
                    isInvalid={!!validationSchema.errors?.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-3 col-md-5 col-sm-4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.category")}</Form.Label>
                  <Form.Control
                    as="select"
                    value={data?.categoryId}
                    onClick={resetShowBoth}
                    onChange={(e) =>
                      setData({ ...data, category: e.target.value })
                    }
                    isInvalid={!!validationSchema.errors?.category}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_title}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.category}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-2 col-md-3 col-sm-4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.quantity")}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Quantity"
                    value={data?.quantity}
                    onClick={resetShowBoth}
                    onChange={(e) =>
                      setData({
                        ...data,
                        quantity: e.target.value,
                        quantityPerHour: e.target.value / data?.hours,
                        itemCost:
                          e.target.value *
                          data?.materialCost *
                          (1 + data?.tax / 100 || 1)
                      })
                    }
                    isInvalid={!!validationSchema.errors?.quantity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.quantity}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-3 col-md-4 col-sm-4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.hours")}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.05"
                    min="0.00"
                    max="20000"
                    placeholder="Hours"
                    value={data?.hours}
                    onClick={handleShowQuantityPerHour}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value).toFixed(2) || 0;
                      setData({
                        ...data,
                        hours: value,
                        quantityPerHour: data?.quantity / value,
                        hourlyLabourRate: data?.laborCost / value,
                        itemCost:
                          data?.quantity *
                          data?.materialCost *
                          (1 + value / 100 || 1)
                      });
                    }}
                    isInvalid={!!validationSchema.errors?.hours}
                  />
                  {showQuantityPerHour ? (
                    <div className="mt-2 flex-column">
                      <Form.Label>
                        {t("popUp.quantityPerHour")} :{" "}
                        <span className="fw-bold">
                          {parseFloat(data?.quantityPerHour).toFixed(2) || 0}
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.05"
                        min="0.00"
                        placeholder="Quantity Per Hour"
                        value={data?.quantityPerHour || ""}
                        onChange={(e) => {
                          const value =
                            parseFloat(e.target.value).toFixed(2) || 0;
                          setData({
                            ...data,
                            quantityPerHour: value,
                            hours: data?.quantity / value || 1
                          });
                        }}
                        isInvalid={!!validationSchema.errors?.materialCost}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.hours}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-3 col-md-4 col-sm-4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.laborCost")}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Labor Cost"
                    min="0.00"
                    step={0.05}
                    value={data?.laborCost || ""}
                    onClick={handleShowHourlyLabourRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setData({
                        ...data,
                        laborCost: value,
                        hourlyLabourRate: value / (data?.hours || 1)
                      });
                    }}
                    isInvalid={!!validationSchema.errors?.laborCost}
                  />
                  {showHourlyLabourRate ? (
                    <div className="mt-2 flex-column">
                      <Form.Label>
                        {t("itemsForm.hourlyLaborCost")} :{" "}
                        <span className="fw-bold">
                          {parseFloat(data?.hourlyLabourRate).toFixed(2) || 0}
                        </span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0.00"
                        step={0.05}
                        onChange={(e) =>
                          setData({
                            ...data,
                            hourlyLabourRate: e.target.value,
                            laborCost: e.target.value * data?.hours || 1,
                            quantityPerHour:
                              data?.quantity / e.target.value || 1,
                            itemCost:
                              data?.quantity *
                              data?.materialCost *
                              (1 + data?.tax / 100 || 1)
                          })
                        }
                        placeholder="Hourly Labour Rate"
                        value={data?.hourlyLabourRate || ""}
                        isInvalid={!!validationSchema.errors?.materialCost}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.laborCost}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-2 col-md-4 col-sm-4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.materialCost")}</Form.Label>
                  <Form.Control
                    type="number"
                    min="0.00"
                    step={0.05}
                    placeholder="Material Cost"
                    value={data?.materialCost || ""}
                    onClick={resetShowBoth}
                    onChange={(e) => {
                      setData({
                        ...data,
                        materialCost: e.target.value,
                        itemCost:
                          data?.quantity *
                          e.target.value *
                          (1 + data?.tax / 100 || 0)
                      });
                    }}
                    isInvalid={!!validationSchema.errors?.materialCost}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.materialCost}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-xl-2 col-md-4 col-sm-4">
                <Form.Group className="mb-3">
                  <Form.Label>{t("itemsForm.tax")} (%)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Tax"
                    value={data?.tax}
                    onClick={resetShowBoth}
                    onChange={(e) => {
                      const newTax = parseFloat(e.target.value) || 0;
                      const newItemCost = calculateItemCost(
                        parseFloat(data?.quantity) || 0,
                        parseFloat(data?.materialCost) || 0,
                        newTax,
                        data?.laborCost
                      );
                      setData({
                        ...data,
                        tax: newTax,
                        itemCost: newItemCost
                      });
                    }}
                    isInvalid={!!validationSchema.errors?.tax}
                  />
                  <div className="mt-2 flex-column fs-1">
                    <Form.Label className=" fs-6">
                      {t("popUp.totalCost")} : $
                      <Form.Control
                        value={parseFloat(data?.itemCost) || 0}
                        readOnly
                        className="fw-bold"
                        disabled
                      />
                    </Form.Label>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {validationSchema.errors?.tax}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="col-xl-12 fw-bold col-md-12 col-sm-12">
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="addToItems"
                      label={t("popUp.addToMyItems")}
                      onChange={(e) =>
                        setData({ ...data, addToItems: e.target.checked })
                      }
                    />
                  </Form.Group>
                </div>
              </div>

              {/* <div className="col-6 popup-boxcolor">
              <div className="d-flex">
                <span className="fs-11">
                  Recalculate Automatically Based On List Quantity
                </span>
                <div
                  className={`toggle ${primary1}`}
                  onClick={() => setPrimary1(primary1 === "on" ? "off" : "on")}
                >
                  <span></span>
                </div>
              </div>
              <Form.Group className="d-flex gap-2 align-items-center">
                <span className="fs-11">Item-To-List Quantity Ratio :</span>
                <Form.Control
                  type="number"
                  placeholder="Quantity Ratio"
                  className="w-25"
                  value={data?.quantityRatio}
                  onChange={(e) =>
                    setData({ ...data, quantityRatio: e.target.value })
                  }
                  isInvalid={!!validationSchema.errors?.quantityRatio}
                />
                <Form.Control.Feedback type="invalid">
                  {validationSchema.errors?.quantityRatio}
                </Form.Control.Feedback>
                <i className="icon-color bi bi-question-circle"></i>
              </Form.Group>
            </div> */}
            </div>

            <div className="d-flex justify-content-end mt-3">
              <Button
                className="btn btn-danger p-2 me-2 btn-sm"
                type="button"
                onClick={handleCloses}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                className="btn btn-primary btn-sm"
                type="submit"
                onClick={handleSubmit}
              >
                {t("buttons.save")}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default PopupInput;
