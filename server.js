const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to 3tshop!");
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "3tshop server is running" });
});

const apiRoutes = require("./src/routes");
app.use("/api", apiRoutes);

const { sequelize } = require("./src/models");
const dbConfig = require("./src/configs/database");

console.log("DB config:", dbConfig);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Kết nối database thành công!");
  })
  .catch((err) => {
    console.error("❌ Kết nối database thất bại:", err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 3tshop server is running on port ${PORT}`);
  console.log(`📱 Visit http://localhost:${PORT} to view the application`);
});

module.exports = app;
