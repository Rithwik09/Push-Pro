const multer = require("multer");
const mstorage = multer.memoryStorage();

exports.uploadS3 = multer({
  storage: mstorage,
  limits: {
    fileSize: 100 * 1024 * 1024
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "application/pdf"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, JPEG, SVG, WEBP, PNG, MP4, and PDF are allowed."
        )
      );
    }
  }
});
