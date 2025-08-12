const express = require("express");
const mauRoutes = require("./mau");
const loaiSPRoutes = require("./loaiSP");
const phieuDatHangNCCRoutes = require("./phieuDatHangNCC");
const phieuNhapRoutes = require("./phieuNhap");
const nhanVienRoutes = require("./nhanvien");
const khachHangRoutes = require("./khachhang");
const nhaCungCapRoutes = require("./nhacungcap");
const sanPhamRoutes = require("./sanpham");
const gioHangRoutes = require("./gioHang");
const kichThuocRoutes = require("./kichthuoc");
const trangThaiDatHangRoutes = require("./trangthaidathang");
const authRoutes = require("./auth");
const boPhanRoutes = require("./bophan");
const tiGiaRoutes = require("./tigia");
const donDatHangRoutes = require("./donDatHang");
const trangThaiDHRoutes = require("./trangThaiDH");
const hoaDonRoutes = require("./hoadon");
const binhLuanRoutes = require("./binhLuan");
const traHangRoutes = require("./traHang"); // Thêm route TraHang
const phanQuyenRoutes = require("./phanQuyen"); // Thêm route PhanQuyen
const rolesRoutes = require("./roles"); // Thêm route Roles
const authenticateJWT = require("../middlewares/jwt");
const authorize = require("../middlewares/authorize");

// const kichThuocRoutes = require("./kichthuoc");
// const trangThaiDatHangRoutes = require("./trangthaidathang");
// const authRoutes = require("./auth");
// const boPhanRoutes = require("./bophan"); // Import BoPhan routes

const router = express.Router();

router.use("/mau", mauRoutes);
router.use("/phieu-dat-hang-ncc", phieuDatHangNCCRoutes);
router.use("/phieu-nhap", phieuNhapRoutes);

// New routes for frontend API
router.use("/employees", nhanVienRoutes);
router.use("/suppliers", nhaCungCapRoutes);
router.use("/products", sanPhamRoutes);
router.use("/product-details", sanPhamRoutes); // Same controller handles both
router.use("/colors", mauRoutes);
router.use("/sizes", kichThuocRoutes);
router.use("/purchase-order-statuses", trangThaiDatHangRoutes);
router.use("/purchase-orders", phieuDatHangNCCRoutes);
router.use("/goods-receipts", phieuNhapRoutes);

router.use("/customers", khachHangRoutes);

router.use("/san-pham", sanPhamRoutes);
router.use("/gio-hang", gioHangRoutes);

// Route cho loại sản phẩm (category)
router.use("/category", loaiSPRoutes);
router.use("/department", boPhanRoutes);
router.use("/auth", authRoutes);

router.use("/tigia", tiGiaRoutes);

// Routes cho đơn hàng khách hàng
router.use("/don-dat-hang", donDatHangRoutes);
router.use("/trang-thai-dh", trangThaiDHRoutes);

// Routes cho API frontend (English naming)
router.use("/orders", donDatHangRoutes);
router.use("/order-statuses", trangThaiDHRoutes);
router.use("/invoices", hoaDonRoutes);

// Routes cho bình luận sản phẩm
router.use("/binh-luan", binhLuanRoutes);
router.use("/comments", binhLuanRoutes); // English alias

// Routes cho trả hàng
router.use("/return", traHangRoutes); // Đăng ký route TraHang

// Routes cho phân quyền
router.use("/phan-quyen", phanQuyenRoutes);
router.use("/permissions", phanQuyenRoutes); // English alias

// Routes cho vai trò
router.use("/roles", rolesRoutes);

module.exports = router;
