const express = require('express');
const mauRoutes = require('./mau');
const phieuDatHangNCCRoutes = require('./phieuDatHangNCC');
const phieuNhapRoutes = require('./phieuNhap');

const router = express.Router();

router.use('/mau', mauRoutes);
router.use('/phieu-dat-hang-ncc', phieuDatHangNCCRoutes);
router.use('/phieu-nhap', phieuNhapRoutes);

module.exports = router; 