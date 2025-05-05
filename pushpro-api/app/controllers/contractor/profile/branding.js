const BrandingServices = require("../../../services/contractor/brandingServices");
const catchAsyncError = require("../../../helpers/catch-async-error");
const {
  ServerError,
  NotFoundError,
  ValidationError
} = require("../../../errors/CustomError");
const UserServices = require("../../../services/user");
const validator = require("validator");
const { uploadToS3 } = require("../../../helpers/s3Helper");

const getCompanyBrandings = catchAsyncError(async (req, res) => {
  try {
    const user_uuid = req.params.id;
    if (!validator.isUUID(user_uuid) || !user_uuid) {
      throw new ValidationError("Invalid User UUID");
    }
    const user = await UserServices.getUser({ user_uuid });
    if (!user) {
      throw new NotFoundError("User not found");
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
        theme_data: {
          primaryRGB: "152, 172, 54",
          dynamiccolor: "152, 172, 54",
          primaryRGB1: "0,0,0"
        }
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

const updateCompanyBrandings = catchAsyncError(async (req, res) => {
  const { contractor_tagline, contractor_description, theme_data } = req.body;
  try {
    const userId = req.user.id;
    const branding = await BrandingServices.getBranding(userId);
    const files = req.files;
    const uploadPromises = [];
    let mainLogoKey,
      toggleLogoKey,
      mainLogoDarkKey,
      toggleLogoDarkKey,
      rightSectionImageKey;
    if (files.main_logo) {
      const mainLogoFile = files.main_logo[0];
      mainLogoKey = `logos/main_logo/${Date.now()}_${
        mainLogoFile.originalname
      }`;
      const existingKey = branding ? branding.main_logo : null;
      uploadPromises.push(uploadToS3(mainLogoKey, mainLogoFile, existingKey));
      if (!mainLogoKey)
        throw new ValidationError("Main Logo Key Generation Failed");
    }
    if (files.toggle_logo) {
      const toggleLogoFile = files.toggle_logo[0];
      toggleLogoKey = `logos/toggle_logo/${Date.now()}_${
        toggleLogoFile.originalname
      }`;
      const existingKey = branding ? branding.toggle_logo : null;
      uploadPromises.push(
        uploadToS3(toggleLogoKey, toggleLogoFile, existingKey)
      );
    }

    if (files.main_logo_dark) {
      const mainLogoDarkFile = files.main_logo_dark[0];
      mainLogoDarkKey = `logos/main_logo_dark/${Date.now()}_${
        mainLogoDarkFile.originalname
      }`;
      const existingKey = branding ? branding.main_logo_dark : null;
      uploadPromises.push(
        uploadToS3(mainLogoDarkKey, mainLogoDarkFile, existingKey)
      );
    }

    if (files.toggle_logo_dark) {
      const toggleLogoDarkFile = files.toggle_logo_dark[0];
      toggleLogoDarkKey = `logos/toggle_logo_dark/${Date.now()}_${
        toggleLogoDarkFile.originalname
      }`;
      const existingKey = branding ? branding.toggle_logo_dark : null;
      uploadPromises.push(
        uploadToS3(toggleLogoDarkKey, toggleLogoDarkFile, existingKey)
      );
    }

    if (files.right_section_image) {
      const rightSectionImageFile = files.right_section_image[0];
      rightSectionImageKey = `logos/right_section_image/${Date.now()}_${
        rightSectionImageFile.originalname
      }`;
      const existingKey = branding ? branding.right_section_image : null;
      uploadPromises.push(
        uploadToS3(rightSectionImageKey, rightSectionImageFile, existingKey)
      );
    }
    await Promise.all(uploadPromises);
    let parsedThemeData = {};
    if (theme_data) {
      try {
        parsedThemeData = JSON.parse(theme_data);
      } catch (error) {
        throw new ValidationError("Invalid theme_data format");
      }
    }
    if (mainLogoKey) parsedThemeData.mainLogo = mainLogoKey;
    if (rightSectionImageKey)
      parsedThemeData.rightSectionImage = rightSectionImageKey;
    if (contractor_tagline)
      parsedThemeData.contractorTagline = contractor_tagline;
    if (contractor_description)
      parsedThemeData.contractorDescription = contractor_description;
    if (!branding) {
      const createBranding = await BrandingServices.createBrandings({
        user_id: userId,
        main_logo: mainLogoKey,
        toggle_logo: toggleLogoKey,
        main_logo_dark: mainLogoDarkKey,
        toggle_logo_dark: toggleLogoDarkKey,
        theme_data: parsedThemeData,
        updatedAt: new Date()
      });
      res.status(200).json({
        success: true,
        data: { createBranding, updatedAt: createBranding.updatedAt },
        message: "Company Brandings Created Successfully",
        errors: []
      });
    } else {
      const updateRowCount = await BrandingServices.updateBrandings(userId, {
        main_logo: mainLogoKey,
        toggle_logo: toggleLogoKey,
        main_logo_dark: mainLogoDarkKey,
        toggle_logo_dark: toggleLogoDarkKey,
        theme_data: parsedThemeData,
        updatedAt: new Date()
      });
      const updatedBranding = await BrandingServices.getBranding(userId);
      res.status(200).json({
        success: true,
        data: {
          updateRowCount,
          updatedBranding,
          updatedAt: updatedBranding.updatedAt
        },
        message: "Company Brandings Updated Successfully",
        errors: []
      });
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot update Company brandings: ${error.message}`
    );
    res.status(serverError.status || 500).json(serverError.serializeError());
  }
});

module.exports = {
  getCompanyBrandings,
  updateCompanyBrandings
};
