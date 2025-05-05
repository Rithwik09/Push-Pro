require("dotenv").config();
const jwt = require("jsonwebtoken");
const { ErrorHandler } = require("../errors/CustomError");
const UserServices = require("../services/user");

exports.getToken = async (payload, config = {}) => {
  config = {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRE,
    ...config
  };
  return jwt.sign(payload, process.env.JWT_SECRET, config);
};

exports.generateToken = async (user_id, email, role_id = null) => {
  const payload = {
    id: user_id,
    email_address: email,
  };
  if (role_id) {
    payload.role_id = role_id;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
exports.verifyJwtToken = async (token, next, error) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(error);
    }
  }
};

// const destroyToken = (token) => {
//   const decoded = jwt.decode(token);
//   if (decoded) {
//     const ttl = decoded.exp - Math.floor(Date.now() / 1000);
//     client.set(token, "invalid", 'EX', ttl);
//   }
// };

// const isTokenBlacklisted = (token, callback) => {
//   client.get(token, (err, result) => {
//     if (err) return callback(err, false);
//     return callback(null, result === "invalid");
//   });
// };

// const getTokenData = (token, jwt_secret) => {
//   try {
//     const decoded = jwt.verify(token, jwt_secret);
//     const { id, email_address } = decoded;
//     return { id, email_address };
//   } catch (err) {
//     console.error("Error decoding token:", err);
//     return null;
//   }
// }
