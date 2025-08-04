const express = require("express");
const DonDatHangController = require("../controllers/DonDatHangController");
const authenticateJWT = require("../middlewares/jwt");
const {
  authorize,
  checkPermission,
  checkOwnership,
} = require("../middlewares/authorize");

const router = express.Router();

// Lấy thống kê đơn hàng theo trạng thái (chỉ Admin và Nhân viên)
router.get('/statistics', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DonDatHangController.getStatistics
);


// Lấy danh sách đơn hàng theo trạng thái
// Query params: status (required), page (optional), limit (optional)
// Example: /don-dat-hang/by-status?status=1&page=1&limit=10

router.get('/by-status', 
  authenticateJWT, 
  DonDatHangController.getByStatus
);

// Lấy tất cả đơn hàng
// Query params: page (optional), limit (optional)
router.get('/', 
  authenticateJWT, 
  DonDatHangController.getAll
);

// Lấy đơn hàng theo khách hàng
// Query params: page (optional), limit (optional)
router.get('/customer/:customerId', 
  authenticateJWT, 
  DonDatHangController.getByCustomer
);

// Lấy thông tin chi tiết đầy đủ của đơn hàng theo ID
router.get('/:id/detail', 
  authenticateJWT, 
  DonDatHangController.getDetailById
);

// Lấy chi tiết đơn hàng theo ID (basic)
router.get('/:id', 
  authenticateJWT, 
  DonDatHangController.getById
);


// === ROUTES CHO NHÂN VIÊN GIAO HÀNG ===
// Lấy đơn hàng được phân công cho nhân viên giao hàng
router.get(
  "/delivery/assigned",
  authenticateJWT,
  authorize("NhanVienGiaoHang"),
  DonDatHangController.getAssignedOrders
);

// Xác nhận đã giao hàng xong
router.put(
  "/delivery/:id/confirm",
  authenticateJWT,
  authorize("NhanVienGiaoHang"),
  DonDatHangController.confirmDelivery
);

// Cập nhật trạng thái nhiều đơn hàng cùng lúc
// Body: { orders: [{ id: number, maTTDH: number, maNVDuyet?: number, maNVGiao?: number }] }
router.put(
  "/batch/status",
  authenticateJWT,
  authorize("Admin", "NhanVienCuaHang"),
  DonDatHangController.updateBatchStatus
);

// Cập nhật nhân viên giao hàng cho đơn hàng
// Body: { maNVGiao: number }
router.put(
  "/:id/delivery-staff",
  authenticateJWT,
  authorize("Admin", "NhanVienCuaHang"),
  DonDatHangController.updateDeliveryStaff
);

// Cập nhật trạng thái đơn hàng
// Body: { maTTDH: number, maNVDuyet?: number, maNVGiao?: number }
router.put(
  "/:id/status",
  authenticateJWT,
  authorize("Admin", "NhanVienCuaHang", "NhanVienGiaoHang"),
  DonDatHangController.updateStatus
);

router.post("/revenue-report", DonDatHangController.getRevenueReport);
router.post("/cancel", DonDatHangController.cancelOrder);

module.exports = router;
