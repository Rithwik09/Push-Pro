const validator = require("validator");
const {
  ValidationError,
  ServerError,
  NotFoundError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const CertificateServices = require("../../../services/contractor/certificateServices");
const { uploadToS3, deleteFromS3 } = require("../../../helpers/s3Helper");

const getCertificates = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    const certificates = await CertificateServices.getUserCertificates(userId);
    if (!certificates || certificates.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "Certificates Not Found",
        errors: []
      });
    } else {
      res.status(200).json({
        success: true,
        data: certificates,
        message: "Certificates Fetched Successfully",
        errors: []
      });
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.status).json(error.serializeError());
    }
    const serverError = new ServerError(
      `Cannot Get Licenses: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const addCertificate = catchAsyncError(async (req, res) => {
  const { title, visibility } = req.body;
  try {
    const userId = req.user.id;
    const files = req.files;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    if (!title) throw new ValidationError("Title Required");
    if (!files || !files.certificate_url)
      throw new ValidationError("Certificate Required");
    if (typeof visibility === "undefined")
      throw new ValidationError("Visible On Profile Required");
    const visibilityBoolean =
      visibility.toLowerCase() === "true" ? true : false;
    if (!validator.isBoolean(visibility.toString()))
      throw new ValidationError("Invalid Input for Visible On Profile");
    let certificate = undefined;
    const uploadPromises = [];
    let certificateKey;
    if (files.certificate_url) {
      const certificateFile = files.certificate_url[0];
      certificateKey = `certificates/${Date.now()}_${
        certificateFile.originalname
      }`;
      const existingKey = certificate ? certificate.certificate_url : null;
      uploadPromises.push(
        uploadToS3(certificateKey, certificateFile, existingKey)
      );
      if (!certificateKey)
        throw new ValidationError("Certificate Key Generation Failed");
    }
    await Promise.all(uploadPromises);
    certificate = await CertificateServices.createCertificate({
      user_id: userId,
      title,
      certificate_url: certificateKey,
      visible_on_profile: visibilityBoolean
    });
    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate Added Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Add Certificate: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const editCertificate = catchAsyncError(async (req, res) => {
  const { title, visibility } = req.body;
  const id = req.params.id;
  try {
    const userId = req.user.id;
    const files = req.files;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    const visibilityBoolean =
      visibility.toLowerCase() === "true" ? true : false;
    if (!title) throw new ValidationError("Title Required");
    if (!validator.isBoolean(visibility.toString()))
      throw new ValidationError("Invalid Input for Visible On Profile");
    let certificate = await CertificateServices.getCertificate(id, userId);
    if (certificate.user_id !== userId)
      throw new NotFoundError("Invalid Contractor-Certificate ID");
    const uploadPromises = [];
    let certificateKey = certificate.certificate_url;
    if (files.certificate_url) {
      const certificateFile = files.certificate_url[0];
      certificateKey = `certificates/${Date.now()}_${
        certificateFile.originalname
      }`;
      const existingKey = certificate ? certificate.certificate_url : null;
      uploadPromises.push(
        uploadToS3(certificateKey, certificateFile, existingKey)
      );
      if (!certificateKey)
        throw new ValidationError("Certificate Key Generation Failed");
    }
    await Promise.all(uploadPromises);
    certificate = await CertificateServices.updateCertificate(id, {
      title: title,
      certificate_url: certificateKey,
      visible_on_profile: visibilityBoolean,
      updatedAt: new Date()
    });
    certificate = await CertificateServices.getCertificate(id, userId);
    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate updated successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Certificate: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const removeCertificate = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    if (!userId) throw new NotFoundError("Invalid Token. Please Login Again");
    let certificate = await CertificateServices.getCertificate(id, userId);
    if (certificate.certificate_url) {
      await deleteFromS3(certificate.certificate_url);
    }
    certificate = await CertificateServices.deleteCertificate(id);
    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate removed successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Remove Certificate: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getCertificates,
  addCertificate,
  editCertificate,
  removeCertificate
};
