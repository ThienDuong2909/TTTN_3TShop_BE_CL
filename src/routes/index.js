const express = require('express');
const mauRoutes = require('./mau');
const loaiSPRoutes = require('./loaiSP');
const phieuDatHangNCCRoutes = require('./phieuDatHangNCC');
const phieuNhapRoutes = require('./phieuNhap');
const nhanVienRoutes = require('./nhanvien');
const nhaCungCapRoutes = require('./nhacungcap');
const sanPhamRoutes = require('./sanpham');
const gioHangRoutes = require("./gioHang");
const kichThuocRoutes = require('./kichthuoc');
const trangThaiDatHangRoutes = require('./trangthaidathang');
const authRoutes = require('./auth');
const boPhanRoutes = require('./bophan');
const donDatHangRoutes = require('./donDatHang');
const trangThaiDHRoutes = require('./trangThaiDH');
const hoaDonRoutes = require('./hoadon');

const router = express.Router();

// Existing routes
router.use('/mau', mauRoutes);
router.use('/phieu-dat-hang-ncc', phieuDatHangNCCRoutes);
router.use('/phieu-nhap', phieuNhapRoutes);

// New routes for frontend API
router.use('/employees', nhanVienRoutes);
router.use('/suppliers', nhaCungCapRoutes);
router.use('/products', sanPhamRoutes);
router.use('/product-details', sanPhamRoutes); // Same controller handles both
router.use('/colors', mauRoutes);
router.use('/sizes', kichThuocRoutes);
router.use('/purchase-order-statuses', trangThaiDatHangRoutes);
router.use('/purchase-orders', phieuDatHangNCCRoutes);
router.use('/goods-receipts', phieuNhapRoutes);

router.use("/san-pham", sanPhamRoutes);
router.use("/gio-hang", gioHangRoutes);

// Route cho loại sản phẩm (category)
router.use('/category', loaiSPRoutes);
router.use('/department', boPhanRoutes);
router.use('/auth', authRoutes);

// Routes cho đơn hàng khách hàng
router.use("/don-dat-hang", donDatHangRoutes);
router.use("/trang-thai-dh", trangThaiDHRoutes);

// Routes cho API frontend (English naming)
router.use("/orders", donDatHangRoutes);
router.use("/order-statuses", trangThaiDHRoutes);
router.use("/invoices", hoaDonRoutes);

module.exports = router;
