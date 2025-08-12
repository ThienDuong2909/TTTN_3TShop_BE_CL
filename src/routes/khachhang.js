const express = require("express");
const router = express.Router();
const KhachHangController = require("../controllers/KhachHangController");
const authenticateJWT = require("../middlewares/jwt");
const { authorize } = require("../middlewares/authorize");

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy tất cả khách hàng
// router.get("/", authorize("toanquyen"), KhachHangController.getAll);

router.put("/profile/:maKH", KhachHangController.updateProfile);
router.put("/upload-avatar", KhachHangController.updateAvatar);
module.exports = router;
