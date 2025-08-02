const express = require("express");
const router = express.Router();
const TiGiaController = require("../controllers/TiGiaController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// === PUBLIC ROUTES (Chỉ cần đăng nhập) ===
// Lấy tất cả tỷ giá - chỉ cần đăng nhập
router.get("/", authenticateJWT, TiGiaController.getAll);

// Lấy tỷ giá có hiệu lực - chỉ cần đăng nhập
router.get("/co-hieu-luc", authenticateJWT, TiGiaController.getHieuLuc);

// === ADMIN ROUTES ===
// Tạo tỷ giá mới - chỉ Admin
router.post("/", 
  authenticateJWT, 
  authorize('Admin'), 
  TiGiaController.create);

// Cập nhật tỷ giá - chỉ Admin
router.put("/:MaTiGia", 
  authenticateJWT, 
  authorize('Admin'), 
  TiGiaController.update);

// Xóa tỷ giá - chỉ Admin
router.delete("/:MaTiGia", 
  authenticateJWT, 
  authorize('Admin'), 
  TiGiaController.delete);

module.exports = router;
