const express = require("express");
const upload = require('../middlewares/upload');
const SanPhamController = require("../controllers/SanPhamController");
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get("/", SanPhamController.getAll);
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
router.post(
  "/",
  SanPhamController.createProduct
);
// Sửa sản phẩm
router.put(
  "/:id",
  /*authenticateJWT, authorize('Admin'),*/ SanPhamController.update
);
// Xóa sản phẩm
router.delete(
  "/:id",
  /*authenticateJWT, authorize('Admin'),*/ SanPhamController.delete
);
router.post("/kiem-tra-ton-kho", SanPhamController.checkStockAvailability);
router.put('/detail/:maCTSP/stock', SanPhamController.updateProductDetailStock);
router.put('/:id/update', SanPhamController.updateProduct);
router.post('/update-stock', SanPhamController.updateMultipleProductDetailStocks);
module.exports = router;
