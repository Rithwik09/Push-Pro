const validator = require("validator");
const {
  UnauthorizedError,
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const ItemServices = require("../../../services/contractor/itemServices");
const UserServices = require("../../../services/user");

const checkAccess = async (userID) => {
  if (!userID) throw new UnauthorizedError("Invalid Token. Please Login Again");
  const contractor = await UserServices.getContractor({ id: userID });
  if (!contractor) throw new UnauthorizedError("Contractor Not Found");
};

const checkIsFloat = (value) => {
  if (!validator.isFloat(value.toString(), { min: 0 })) {
    throw new ValidationError("Invalid Float Value");
  }
};

const formatItemsByCategory = (items, categories) => {
  const formattedItems = {};

  categories.forEach((category) => {
    formattedItems[category.category_title] = [];
  });

  items.forEach((item) => {
    const categoryTitle = categories.find(
      (cat) => cat.id === item.category_id
    )?.category_title;
    if (categoryTitle) {
      formattedItems[categoryTitle].push({
        name: item.title,
        category: categoryTitle,
        itemId: item.id,
        categoryId: item.category_id,
        description: item.description,
        quantity: parseFloat(item.quantity),
        hours: parseFloat(item.hours),
        laborCost: parseFloat(item.labour_cost),
        quantityRatio: parseFloat(item.quantity_per_hour),
        hourlyRate: parseFloat(item.hourly_labour_rate),
        materialCost: parseFloat(item.material_cost)
      });
    }
  });

  return formattedItems;
};

const getItemById = catchAsyncError(async (req, res) => {
  try {
    const userID = req.user.id;
    await checkAccess(userID);
    const item_id = req.params.id;
    const item = await ItemServices.getById(item_id);
    if (!item) throw new NotFoundError("Item Not Found");
    res.status(200).json({
      success: true,
      data: item,
      message: "Item fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Item BY ID : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getContractorItems = catchAsyncError(async (req, res) => {
  try {
    const userID = req.user.id;
    await checkAccess(userID);
    const { pageNo, limit, search, condition } = req.body;
    const { items, totalPage, categories, totalItems } =
      await ItemServices.getAll({
        pageNo: pageNo || 1,
        limit: limit || 100,
        search: search || "",
        condition: { ...condition, user_id: userID }
      });
    const formattedItems = formatItemsByCategory(items, categories);
    res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        totalPages: totalPage,
        totalItems: totalItems
      },
      message: "Items fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Contractor Items!: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getLibraryItems = catchAsyncError(async (req, res) => {
  try {
    const userID = req.user.id;
    await checkAccess(userID);
    const { pageNo, limit, search, condition } = req.body;
    const { items, totalPage, categories } = await ItemServices.getAll({
      pageNo: pageNo || 1,
      limit: limit || 100,
      search: search || "",
      condition: { ...condition, user_id: null }
    });
    const formattedItems = formatItemsByCategory(items, categories);
    res.status(200).json({
      success: true,
      data: { items: formattedItems, totalPages: totalPage },
      message: "Items fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Library Items: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getAllCategories = catchAsyncError(async (req, res) => {
  try {
    const userID = req.user.id;
    await checkAccess(userID);
    const categories = await ItemServices.getAllCategories();
    if (!categories || categories.length === 0) {
      throw new NotFoundError("Categories Not Found");
    }
    res.status(200).json({
      success: true,
      data: categories,
      message: "Categories fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Item Categories: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const addItem = catchAsyncError(async (req, res) => {
  const {
    category_id,
    title,
    description,
    quantity,
    hours,
    labour_cost,
    material_cost
  } = req.body;
  try {
    const userID = req.user.id;
    checkAccess(userID);
    checkIsFloat(quantity);
    checkIsFloat(hours);
    checkIsFloat(labour_cost);
    checkIsFloat(material_cost);
    const quantity_per_hour = quantity / hours;
    const hourly_labour_rate = labour_cost / hours;
    const payload = {
      title: title,
      description: description,
      quantity: quantity,
      quantity_per_hour: quantity_per_hour,
      hours: hours,
      labour_cost: labour_cost,
      hourly_labour_rate: hourly_labour_rate,
      material_cost: material_cost
    };
    const item = await ItemServices.createItem(userID, category_id, payload);
    res.status(200).json({
      success: true,
      data: item,
      message: "Item added successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Add Item: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const editItem = catchAsyncError(async (req, res) => {
  const {
    category_id,
    title,
    description,
    quantity,
    hours,
    labour_cost,
    material_cost
  } = req.body;
  const itemID = req.params.id;
  try {
    const userID = req.user.id;
    checkAccess(userID);
    checkIsFloat(quantity);
    checkIsFloat(hours);
    checkIsFloat(labour_cost);
    checkIsFloat(material_cost);
    const quantity_per_hour = quantity / hours;
    const hourly_labour_rate = labour_cost / hours;
    const payload = {
      category_id: category_id,
      title: title,
      description: description || "",
      quantity: quantity || 0,
      hours: hours || 0,
      quantity_per_hour: quantity_per_hour || 0,
      labour_cost: labour_cost || 0,
      hourly_labour_rate: hourly_labour_rate || 0,
      material_cost: material_cost || 0
    };
    const updatedItem = await ItemServices.updateItem(itemID, payload);
    res.status(200).json({
      success: true,
      data: updatedItem,
      message: "Item updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Update Item: ${error.message}`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const removeItem = catchAsyncError(async (req, res) => {
  const itemID = req.params.id;
  try {
    const userID = req.user.id;
    checkAccess(userID);
    const deletedItem = await ItemServices.deleteItem(itemID);
    res.status(200).json({
      success: true,
      data: deletedItem,
      message: "Item Deleted successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(`Cannot Delete Item`);
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getItemById,
  getLibraryItems,
  getContractorItems,
  getAllCategories,
  addItem,
  editItem,
  removeItem
};
