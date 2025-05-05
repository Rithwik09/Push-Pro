const multer = require("multer");

const storage = (dest) => {
  return multer.diskStorage({
    destination: dest,
    filename: (req, file, cb) => {
      req.Allfiles = req.Allfiles || {};
      req.Allfiles[file.fieldname] = [
        ...(req.Allfiles[file.fieldname] || []),
        `${file.fieldname}-${file.originalname}`
      ];
      cb(
        null,
        `${file.fieldname}-${new Date().getTime()}-${file.originalname}`
      );
    }
  });
};
const getStorage = (dest) => {
  return multer({ storage: storage(dest) });
};

exports.uploadMultiImage = (fields = [], path) => {
  return getStorage(path).fields(fields);
};

exports.singleUploadImage = (fieldname, path) => {
  return getStorage(path).single(fieldname);
};
