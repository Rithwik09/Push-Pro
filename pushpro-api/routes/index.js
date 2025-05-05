const express = require("express");
const router = express.Router();

// Routes
const customerRoutes = require("./customer");
const contractorRoutes = require("./contractor");
const adminRoutes = require("./admin");

// Root route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Push Pro Application"
  });
});

// Mount specific routes
router.use("/customer", customerRoutes);
router.use("/contractor", contractorRoutes);
router.use("/admin", adminRoutes);

// 404 Handler - placed before error handler
router.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Invalid Route Requested"
  });
});

// Error Handling Middleware
router.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err
  });
});

module.exports = router;
