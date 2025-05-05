const validator = require("validator");
const {
  ValidationError,
  ServerError,
  UnauthorizedError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const EstimationServices = require("../../../services/contractor/estimation");
const EstimationItemServices = require("../../../services/contractor/estimation/items");
const UserServices = require("../../../services/user");
// const ItemServices = require("../../../services/contractor/itemServices");

const checkAccess = async (userId, contractorId) => {
  const user = await UserServices.getContractor({ id: userId });
  if (!user) throw new ValidationError("Invalid User ID");
  if (userId !== contractorId) {
    throw new UnauthorizedError("Not Authorized. Not your Estimate");
  }
};

const checkEstimationId = (id) => {
  if (!id) {
    throw new ValidationError("Invalid Estimation ID");
  }
};

const checkIsFloat = (value) => {
  if (!validator.isFloat(value, { min: 0 })) {
    throw new ValidationError("Invalid Float Value");
  }
};

const getEstimationItemById = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    let estimation = await EstimationServices.getById(id);
    checkAccess(userId, estimation.contractor_id);
    res.status(200).json({
      success: true,
      data: estimation,
      message: "Estimation Items Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Estimation Item By ID : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getAllEstimationItemsByEstimationId = catchAsyncError(
  async (req, res) => {
    try {
      const userId = req.user.id;
      const eid = req.params.eid;
      checkEstimationId(eid);
      const estimation = await EstimationServices.getById(eid);
      checkAccess(userId, estimation.contractor_id);
      const result = await EstimationItemServices.getAll({
        limit: req.body.limit || 1000,
        condition: {
          estimation_id: eid
        }
      });
      const { estimations, totalPage } = result;
      if (!estimations)
        throw new ValidationError("Estimations Items Not Found");
      const sortedEstimationItems = estimations.sort(
        (a, b) => a.position - b.position
      );
      res.status(200).json({
        success: true,
        data: {
          estimationsItems: sortedEstimationItems,
          totalPage: totalPage || 1
        },
        message: "Estimation Items Fetched Successfully",
        errors: []
      });
    } catch (error) {
      const serverError = new ServerError(
        `Cannot Get Estimation Items By Estimation ID: ${error.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
);

const createEstimationItem = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const est_id = req.params.eid;
    checkEstimationId(est_id);
    const {
      item_id,
      category_id,
      title,
      description,
      quantity,
      hours,
      labour_cost,
      material_cost,
      tax
    } = req.body;
    let estimation = await EstimationServices.getById(est_id);
    checkAccess(userId, estimation.contractor_id);
    let estimationItem = await EstimationItemServices.getAll({
      limit: req.body.limit || 1000,
      condition: {
        estimation_id: est_id
      }
    });
    const quantityPerHour = quantity / hours;
    const hourlyLabourRate = labour_cost / hours;
    const estimationItemData = {
      item_id: item_id || 1,
      category_id: category_id || 1,
      title: title,
      description: description,
      quantity: quantity || 0,
      hours: hours || 0,
      quantity_per_hour: quantityPerHour || 0,
      labour_cost: labour_cost || 0,
      hourly_labour_rate: hourlyLabourRate || 0,
      material_cost: material_cost || 0,
      tax: tax || 0,
      position: estimationItem.length || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    estimationItem = await EstimationItemServices.createEstimationItem(
      est_id,
      estimationItemData
    );
    res.status(200).json({
      success: true,
      data: estimationItem,
      message: "Estimation Item Created Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create Estimation Item : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateEstimationItemPosition = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const est_id = req.params.eid;
    checkEstimationId(est_id);
    const { position } = req.body;
    let estimationItem = await EstimationItemServices.getById(est_id);
    const estimation = await EstimationServices.getById(
      estimationItem.estimation_id
    );
    checkAccess(userId, estimation.contractor_id);
    if (position < 0)
      throw new ValidationError("Position cannot be less than 0");
    estimationItem = await EstimationItemServices.updateEstimationItem(est_id, {
      position: position
    });
    res.status(200).json({
      success: true,
      data: estimationItem,
      message: "Estimation Items Position Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Estimation Items Position : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateEstimationItem = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const est_item_id = req.params.eid;
    const payload = req.body;
    let estimationItem = await EstimationItemServices.getById(est_item_id);
    const estimation = await EstimationServices.getById(
      estimationItem.estimation_id
    );
    checkAccess(userId, estimation.contractor_id);
    estimationItem = await EstimationItemServices.updateEstimationItem(
      est_item_id,
      payload
    );
    res.status(200).json({
      success: true,
      data: estimationItem,
      message: "Estimation Item Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Estimation Item : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteEstimationItem = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const est_item_id = req.params.id;
    let estimationItem = await EstimationItemServices.getById(est_item_id);
    const estimation = await EstimationServices.getById(
      estimationItem.estimation_id
    );
    checkAccess(userId, estimation.contractor_id);
    estimationItem = await EstimationItemServices.deleteEstimationItem(
      est_item_id
    );
    res.status(200).json({
      success: true,
      data: estimationItem,
      message: "Estimation Item Deleted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Estimation Item: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getAllEstimationItemsByEstimationId,
  getEstimationItemById,
  createEstimationItem,
  updateEstimationItemPosition,
  updateEstimationItem,
  deleteEstimationItem
};
