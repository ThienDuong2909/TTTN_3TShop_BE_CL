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

// Lấy thông tin model metadata mới nhất
// GET /api/fpgrowth/model
router.get("/model", FpGrowthController.getModelMetadata);

// Lấy danh sách rules với thông tin chi tiết sản phẩm
// GET /api/fpgrowth/rules
// Query params: modelId?, limit?, offset?, minConfidence?, minLift?
router.get("/rules", FpGrowthController.getRulesWithDetails);

// Lấy tất cả rules gần đây trực tiếp từ Python API (không qua DB)
// GET /api/fpgrowth/all-rule-recent
router.get("/all-rule-recent", FpGrowthController.getAllRuleRecent);

// Tìm kiếm rules theo MaSP cụ thể
// GET /api/fpgrowth/rules/search
// Query params: maSP (required), modelId?, searchIn? (antecedent|consequent|both)
router.get("/rules/search", FpGrowthController.searchRulesByProduct);

// Lấy top sản phẩm được recommend nhiều nhất
// GET /api/fpgrowth/rules/top-products
// Query params: modelId?, limit?
router.get("/rules/top-products", FpGrowthController.getTopRecommendedProducts);

// Làm mới model từ cache (load từ DB cache nếu có)
// GET /api/fpgrowth/refresh-cache
// Query params: force? (true/false, mặc định: false)
// force=false: Load từ cache DB nếu có
// force=true: Luôn rebuild model mới
router.get("/refresh-cache", FpGrowthController.refreshModelFromCache);

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
