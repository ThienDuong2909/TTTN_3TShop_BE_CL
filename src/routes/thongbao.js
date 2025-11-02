const express = require("express");
const router = express.Router();
const ThongBaoController = require("../controllers/ThongBaoController");

// Route đăng ký thiết bị nhận thông báo
router.post("/register", ThongBaoController.registerDevice);

// Route lấy danh sách thiết bị theo mã nhân viên
router.get("/devices/:maNhanVien", ThongBaoController.getDevicesByEmployee);

// Route xóa thiết bị
router.delete("/:id", ThongBaoController.deleteDevice);

module.exports = router;
