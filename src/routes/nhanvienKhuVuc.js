const express = require('express');
const router = express.Router();
const NhanVienKhuVucController = require('../controllers/NhanVienKhuVucController');
const { authorize } = require('../middlewares/authorize');

// Routes cho quản lý khu vực phụ trách của nhân viên

// GET /api/nhan-vien/:id/khu-vuc - Lấy danh sách khu vực phụ trách của nhân viên
router.get('/:id/khu-vuc', authorize('toanquyen'), NhanVienKhuVucController.getKhuVucPhuTrach);

// GET /api/nhan-vien/:id/khu-vuc-chua-phu-trach - Lấy danh sách khu vực chưa phụ trách
router.get('/:id/khu-vuc-chua-phu-trach', authorize('toanquyen'), NhanVienKhuVucController.getKhuVucChuaPhuTrach);

// PUT /api/nhan-vien/:id/khu-vuc - Cập nhật toàn bộ khu vực phụ trách của nhân viên
router.put('/:id/khu-vuc', authorize('toanquyen'), NhanVienKhuVucController.updateKhuVucPhuTrach);

// POST /api/nhan-vien/:id/khu-vuc - Thêm khu vực phụ trách mới cho nhân viên
router.post('/:id/khu-vuc', authorize('toanquyen'), NhanVienKhuVucController.themKhuVucPhuTrach);

// DELETE /api/nhan-vien/khu-vuc - Xóa khu vực phụ trách (batch delete)
router.delete('/khu-vuc', authorize('toanquyen'), NhanVienKhuVucController.xoaKhuVucPhuTrach);

module.exports = router;
