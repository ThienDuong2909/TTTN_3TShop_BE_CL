const express = require("express");
const SanPhamController = require("../controllers/SanPhamController");
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy danh sách sản phẩm
router.get("/", SanPhamController.getAll);

// Lấy sản phẩm theo nhà cung cấp
router.get("/supplier/:supplierId", SanPhamController.getBySupplier);

// Lấy chi tiết sản phẩm
router.get("/details", SanPhamController.getProductDetails);
router.get("/details/:id", SanPhamController.getProductDetailById);

// Lấy danh sách màu và size của sản phẩm (chi tiết đầy đủ)
router.get("/:productId/colors-sizes", SanPhamController.getColorsSizesByProductId);

// Lấy danh sách size và màu có sẵn của sản phẩm (tổng hợp)
router.get("/:productId/available-options", SanPhamController.getAvailableSizesAndColors);

// Lấy sản phẩm theo ID (phải đặt sau các route cụ thể)
router.get("/:id", SanPhamController.getById);

// CRUD operations
router.post("/", SanPhamController.create);
router.put("/:id", SanPhamController.update);
router.delete("/:id", SanPhamController.delete);

module.exports = router;
