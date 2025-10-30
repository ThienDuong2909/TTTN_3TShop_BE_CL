const express = require("express");
const DonDatHangController = require("../controllers/DonDatHangController");
const authenticateJWT = require("../middlewares/jwt");
const { authorize } = require("../middlewares/authorize");
const { user } = require("../configs/database");

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy thống kê đơn hàng theo trạng thái
router.get(
  "/statistics",
  authorize("donhang.xem", "dathang.xem"),
  DonDatHangController.getStatistics
);

// Lấy danh sách đơn hàng theo trạng thái
router.get(
  "/by-status",
  authorize("donhang.xem", "dathang.xem"),
  DonDatHangController.getByStatus
);

// Lấy tất cả đơn hàng
router.get("/", authorize("donhang.xem", "dathang.xem"), DonDatHangController.getAll);

// GET /don-dat-hang/current-month
router.get(
  "/current-month",
  authorize("donhang.xem"),
  DonDatHangController.getCurrentMonthOrders
);

// Lấy đơn hàng theo khách hàng
router.get(
  "/customer/:customerId",
  authorize("donhang.xem"),
  DonDatHangController.getByCustomer
);

// Lấy thông tin chi tiết đầy đủ của đơn hàng theo ID
router.get(
  "/:id/detail",
  authorize(["donhang.xem_duoc_giao", "donhang.xem", "donhang.xem_cua_minh" ]), 
  DonDatHangController.getDetailById
);

// Lấy chi tiết đơn hàng theo ID (basic)
router.get("/:id", authorize("donhang.xem"), DonDatHangController.getById);

// === ROUTES CHO NHÂN VIÊN GIAO HÀNG ===
// Lấy đơn hàng được phân công cho nhân viên giao hàng
router.get(
  "/delivery/assigned",
  authorize("donhang.xem_duoc_giao", "donhang.xem"),
  DonDatHangController.getAssignedOrders
);

// Xác nhận đã giao hàng xong
router.put(
  "/delivery/:id/confirm",
  authorize("donhang.xacnhan_giaohang", "donhang.xem"),
  DonDatHangController.confirmDelivery
);

router.put(
  "/delivery/confirm/image",
  authorize("donhang.xacnhan_giaohang", "donhang.xem"),
  DonDatHangController.confirmDeliveryWithImage
);

// Cập nhật trạng thái nhiều đơn hàng cùng lúc
router.put(
  "/batch/status",
  authorize("donhang.capnhat_trangthai"),
  DonDatHangController.updateBatchStatus
);

// Cập nhật nhân viên giao hàng cho đơn hàng
router.put(
  "/:id/delivery-staff",
  authorize("donhang.phancong_giaohang"),
  DonDatHangController.updateDeliveryStaff
);

// Cập nhật trạng thái đơn hàng
router.put(
  "/:id/status",
  authorize("donhang.capnhat_trangthai"),
  DonDatHangController.updateStatus
);

// === CUSTOMER ROUTES ===
// Hủy đơn hàng
router.post(
  "/cancel",
  authorize("donhang.xem_cua_minh"),
  DonDatHangController.cancelOrder
);

// Báo cáo doanh thu
router.post(
  "/revenue-report",
  authorize("donhang.xem"),
  DonDatHangController.getRevenueReport
);

module.exports = router;
