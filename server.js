const express = require("express");
const path = require("path");
const cors = require("cors");
const logger = require("./src/middlewares/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://api.3tshop.thienduong.info",
      "https://3tshop.thienduong.info",
      "https://www.3tshop.thienduong.info",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Logger Middleware - Log all API calls (sau khi đã parse body)
app.use("/api", logger);

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to 3tshop!");
});

// ví dụ cho Express
app.get("/health", (_, res) => res.status(200).send("OK"));

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
  console.log(`📝 API Logging is enabled - All API calls will be logged`);
  console.log(`🔍 Watch the console for API request/response details`);
});

module.exports = app;
