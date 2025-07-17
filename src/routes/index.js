const express = require('express');
const mauRoutes = require('./mau');
const phieuDatHangNCCRoutes = require('./phieuDatHangNCC');
const phieuNhapRoutes = require('./phieuNhap');
const nhanVienRoutes = require('./nhanvien');
const nhaCungCapRoutes = require('./nhacungcap');
const sanPhamRoutes = require('./sanpham');
const kichThuocRoutes = require('./kichthuoc');
const trangThaiDatHangRoutes = require('./trangthaidathang');
const authRoutes = require('./auth');

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
router.use('/auth', authRoutes);

module.exports = router; 