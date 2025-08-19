const express = require("express");
const upload = require("../middlewares/upload");
const SanPhamController = require("../controllers/SanPhamController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

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
router.get("/:productId/colors-sizes", SanPhamController.getColorsSizesByProductId);
router.get("/:id", SanPhamController.getById);
router.post("/kiem-tra-ton-kho", SanPhamController.checkStockAvailability);

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy sản phẩm theo nhà cung cấp
router.get("/supplier/:supplierId", authorize('sanpham.xem'), SanPhamController.getBySupplier);

// === AUTHORIZED ROUTES ===
router.post("/", authorize('sanpham.tao'), SanPhamController.createProduct);

router.put("/:id", authorize('sanpham.sua'), SanPhamController.update);

router.delete("/:id", authorize('sanpham.xoa'), SanPhamController.delete);

// Cập nhật chi tiết sản phẩm
router.put('/detail/:maCTSP/stock', authorize('sanpham.sua'), SanPhamController.updateProductDetailStock);
router.put('/:id/update', authorize('sanpham.sua'), SanPhamController.updateProduct);
router.post('/update-stock', authorize('sanpham.sua'), SanPhamController.updateMultipleProductDetailStocks);
router.post('/add-detail', authorize('sanpham.tao'), SanPhamController.addProductDetail);

module.exports = router;
