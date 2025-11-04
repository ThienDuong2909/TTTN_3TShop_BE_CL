const express = require("express");
const FpGrowthController = require("../controllers/FpGrowthController");
const authenticateJWT = require("../middlewares/jwt");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

// === PUBLIC ROUTES (Chỉ xem thông tin) ===
// Lấy cấu hình hiện tại của FP-Growth (MIN_SUP, MIN_CONF)
// GET /api/fpgrowth/config
router.get("/config", FpGrowthController.getConfig);

// Kiểm tra trạng thái Python API
// GET /api/fpgrowth/health
router.get("/health", FpGrowthController.checkHealth);

// === PROTECTED ROUTES (Chỉ Admin/Manager) ===
// Cập nhật cấu hình FP-Growth
// POST /api/fpgrowth/config
// Body: { min_sup?: number, min_conf?: number }
// Yêu cầu: đăng nhập + quyền admin
router.post(
  "/config",
  //   authenticateJWT,
  //   authorize(["admin"]), // Chỉ admin mới được cập nhật config
  FpGrowthController.updateConfig
);

// Làm mới model FP-Growth
// POST /api/fpgrowth/refresh
// Yêu cầu: đăng nhập + quyền admin
router.post(
  "/refresh",
  //   authenticateJWT,
  //   authorize(["admin"]), // Chỉ admin mới được refresh model
  FpGrowthController.refreshModel
);

module.exports = router;
