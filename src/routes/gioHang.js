const express = require("express");
const GioHangController = require("../controllers/GioHangController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === KHÁCH HÀNG ROUTES ===
// Thêm sản phẩm vào giỏ hàng - chỉ khách hàng
router.post("/them", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng - chỉ khách hàng
router.delete("/xoa", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.removeFromCart);

// Đặt hàng - chỉ khách hàng
router.post("/dat-hang", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.placeOrder);

// Lấy giỏ hàng theo khách hàng - chỉ khách hàng
router.get("/:maKH", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.getCartByCustomer);

// Xóa tất cả sản phẩm trong giỏ hàng - chỉ khách hàng
router.post("/xoa-tat-ca", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.clearCart);

// Lấy chi tiết đơn hàng - chỉ khách hàng
router.post("/don-hang/chi-tiet", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.getOrderById);

// Lấy tất cả đơn hàng của khách hàng - chỉ khách hàng
router.post("/don-hang", 
  authenticateJWT, 
  authorize('KhachHang'), 
  GioHangController.getAllOrdersByCustomer);

module.exports = router;
