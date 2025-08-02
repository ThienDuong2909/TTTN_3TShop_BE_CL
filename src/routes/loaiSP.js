const express = require("express");
const LoaiSPController = require("../controllers/LoaiSPController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
router.get("/", LoaiSPController.getAll);

// Lấy loại sản phẩm theo id - chỉ cần đăng nhập
router.get("/:id", LoaiSPController.getById);

// Lấy sản phẩm theo loại - chỉ cần đăng nhập
router.post("/products", LoaiSPController.getProductsById);

// === ADMIN & NHÂN VIÊN CỬA HÀNG ROUTES ===
// Thêm loại sản phẩm - chỉ Admin và Nhân viên cửa hàng
router.post(
  "/",
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  LoaiSPController.create
);

// Sửa loại sản phẩm - chỉ Admin và Nhân viên cửa hàng
router.put(
  "/:id",
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  LoaiSPController.update
);

// Xóa loại sản phẩm - chỉ Admin và Nhân viên cửa hàng
router.delete(
  "/:id",
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  LoaiSPController.delete
);

module.exports = router;
