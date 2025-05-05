const db = require("../../../../models");
const { ValidationError, ServerError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");

// get notification for popup Limit : 5

const getNotificationType = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationType = await db.NotificationType.findAll();
    res.status(200).json({
      success: true,
      data: notificationType,
      message: "NotificationType fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Notification Types: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getNotificationType
};
