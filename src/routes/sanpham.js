const express = require("express");
const upload = require("../middlewares/upload");
const SanPhamController = require("../controllers/SanPhamController");
const authenticateJWT = require("../middlewares/jwt");
const { authorize } = require("../middlewares/authorize");

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===
router.get("/", SanPhamController.getAll);
router.get("/new-product", SanPhamController.getNewProducts);
router.get("/best-sellers", SanPhamController.getBestSellers);
router.get("/discount", SanPhamController.getAllDiscountProducts);
router.get("/search", SanPhamController.searchProducts);
router.get("/get-all-products", SanPhamController.getAllProducts);
router.get("/details", SanPhamController.getProductDetails);
router.get("/details/:id", SanPhamController.getProductDetailById);
router.get(
  "/:productId/colors-sizes",
  SanPhamController.getColorsSizesByProductId
);
router.get("/:id", SanPhamController.getById);
router.post("/kiem-tra-ton-kho", SanPhamController.checkStockAvailability);

// === AUTHENTICATED ROUTES ===
//router.use(authenticateJWT);

// Lấy sản phẩm theo nhà cung cấp
router.get(
  "/supplier/:supplierId",
  authenticateJWT,
  authorize("sanpham.xem","toanquyen"),
  SanPhamController.getBySupplier
);

// === AUTHORIZED ROUTES ===
router.post("/",authenticateJWT, authorize("sanpham.tao","toanquyen"), SanPhamController.createProduct);

router.put("/:id", authenticateJWT, authorize("sanpham.sua","toanquyen"), SanPhamController.update);

router.delete("/:id",authenticateJWT, authorize("sanpham.xoa","toanquyen"), SanPhamController.delete);
// Cập nhật chi tiết sản phẩm
router.put(
  "/detail/:maCTSP/stock",
  authenticateJWT,
  authorize("sanpham.sua","toanquyen"),
  SanPhamController.updateProductDetailStock
);
router.put(
  "/:id/update",
  authenticateJWT,
  authorize("sanpham.sua","toanquyen"),
  SanPhamController.updateProduct
);
router.post(
  "/update-stock",
  authenticateJWT,
  authorize("sanpham.sua","toanquyen"),
  SanPhamController.updateMultipleProductDetailStocks
);
router.post(
  "/add-detail",
  authenticateJWT,
  authorize("sanpham.tao","toanquyen"),
  SanPhamController.addProductDetail
);

// Lấy gợi ý sản phẩm (POST vì cần body)
router.post("/recommendations", SanPhamController.getRecommendations);

module.exports = router;

