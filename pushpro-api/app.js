require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const bodyParser = require("body-parser");
const sequelize = require("./config/database");
const apiRoutes = require("./routes");
const app = express();
const {
  notFound,
  errorHandler
} = require("./app/middlewares/errorHandlerMiddelware");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
// app.use(notFound); // Do not Use this it causes not found errors for all API-Calls
app.use(errorHandler);
app.use("/", apiRoutes);

sequelize
  .sync()
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((err) => {
    console.error("Database Connection Failed : ", err);
  });

module.exports = app;
