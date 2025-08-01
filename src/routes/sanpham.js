const express = require("express");
const upload = require("../middlewares/upload");
const SanPhamController = require("../controllers/SanPhamController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize, checkPermission } = require('../middlewares/authorize');

const router = express.Router();

router.get("/", SanPhamController.getAll);

// Lấy sản phẩm mới
router.get("/new-product", SanPhamController.getNewProducts);
router.get("/best-sellers", SanPhamController.getBestSellers);
router.get("/discount", SanPhamController.getAllDiscountProducts);
router.get("/search", SanPhamController.searchProducts);

router.get("/get-all-products", SanPhamController.getAllProducts);

// Lấy chi tiết sản phẩm
router.get("/details", SanPhamController.getProductDetails);
// Lấy chi tiết sản phẩm theo ID
router.get("/details/:id", SanPhamController.getProductDetailById);
// Lấy sản phẩm theo nhà cung cấp
router.get("/supplier/:supplierId", SanPhamController.getBySupplier);
// Lấy màu và size của sản phẩm
router.get(
  "/:productId/colors-sizes",
  SanPhamController.getColorsSizesByProductId
);
// Lấy sản phẩm theo id
router.get("/:id", SanPhamController.getById);
// Thêm sản phẩm
router.post("/", authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.createProduct);
// Sửa sản phẩm
router.put(
  "/:id",
  authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.update
);
// Xóa sản phẩm
router.delete(
  "/:id",
  authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.delete
);
router.post("/kiem-tra-ton-kho", SanPhamController.checkStockAvailability);

router.put('/detail/:maCTSP/stock', authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.updateProductDetailStock);
router.put('/:id/update', authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.updateProduct);
router.post('/update-stock', authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.updateMultipleProductDetailStocks);
router.post('/add-detail', authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), SanPhamController.addProductDetail);

module.exports = router;
