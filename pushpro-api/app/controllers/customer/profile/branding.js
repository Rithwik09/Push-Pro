const BrandingServices = require("../../../services/contractor/brandingServices");
const catchAsyncError = require("../../../helpers/catch-async-error");
const {
  ServerError,
  NotFoundError,
  ValidationError
} = require("../../../errors/CustomError");
const UserServices = require("../../../services/user");
const validator = require("validator");

const getCompanyBrandings = catchAsyncError(async (req, res) => {
  try {
    const user_uuid = req.params.id;
    if (!validator.isUUID(user_uuid) || !user_uuid) {
      throw new ValidationError("Invalid User UUID");
    }
    const user = await UserServices.getUser({
      user_uuid: user_uuid,
      is_contractor: true
    });
    if (!user) {
      throw new NotFoundError("User Not found");
    }
    let data = {};
    const branding = await BrandingServices.getBranding(user.id);
    if (branding) {
      data = {
        main_logo: branding.main_logo,
        toggle_logo: branding.toggle_logo,
        main_logo_dark: branding.main_logo_dark,
        toggle_logo_dark: branding.toggle_logo_dark,
        theme_data: branding.theme_data
      };
      res.status(200).json({
        success: true,
        data: data,
        message: "Company Brandings Fetched Successfully",
        errors: []
      });
    } else {
      data = {
        main_logo: "",
        toggle_logo: "",
        main_logo_dark: "",
        toggle_logo_dark: "",
        theme_data: {}
      };
      res.status(200).json({
        success: true,
        data: data,
        message: "Company Brandings Fetched Successfully",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Contractor Brandings: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getCompanyBrandings
};
