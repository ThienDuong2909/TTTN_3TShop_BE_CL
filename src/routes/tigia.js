const express = require("express");
const router = express.Router();
const TiGiaController = require("../controllers/TiGiaController");
const authenticateJWT = require("../middlewares/jwt");
const { authorize } = require("../middlewares/authorize");

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy tất cả tỷ giá
router.get("/", authorize("toanquyen"), TiGiaController.getAll);

// Lấy tỷ giá có hiệu lực
router.get("/co-hieu-luc", TiGiaController.getHieuLuc);

// Tạo tỷ giá mới
router.post("/", authorize("toanquyen"), TiGiaController.create);

// Cập nhật tỷ giá
router.put("/:MaTiGia", authorize("toanquyen"), TiGiaController.update);

// Xóa tỷ giá
router.delete("/:MaTiGia", authorize("toanquyen"), TiGiaController.delete);

module.exports = router;
