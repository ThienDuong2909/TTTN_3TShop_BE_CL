const express = require("express");
const mauRoutes = require("./mau");
const phieuDatHangNCCRoutes = require("./phieuDatHangNCC");
const phieuNhapRoutes = require("./phieuNhap");
const sanPhamRoutes = require("./sanPham");
const gioHangRoutes = require("./gioHang");

const router = express.Router();

router.use("/mau", mauRoutes);
router.use("/phieu-dat-hang-ncc", phieuDatHangNCCRoutes);
router.use("/phieu-nhap", phieuNhapRoutes);
router.use("/san-pham", sanPhamRoutes);
router.use("/gio-hang", gioHangRoutes);

module.exports = router;
