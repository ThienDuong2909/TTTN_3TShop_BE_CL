const express = require("express");
const LoaiSPController = require("../controllers/LoaiSPController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===
router.get("/", LoaiSPController.getAll);
router.get("/:id", LoaiSPController.getById);
router.post("/products", LoaiSPController.getProductsById);

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Thêm loại sản phẩm
router.post("/", authorize('danhmuc.tao'), LoaiSPController.create);

// Sửa loại sản phẩm
router.put("/:id", authorize('danhmuc.sua'), LoaiSPController.update);

// Xóa loại sản phẩm
router.delete("/:id", authorize('danhmuc.xoa'), LoaiSPController.delete);

module.exports = router;
