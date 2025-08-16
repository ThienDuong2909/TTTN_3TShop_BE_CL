const express = require("express");
const GioHangController = require("../controllers/GioHangController");
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Thêm sản phẩm vào giỏ hàng - chỉ khách hàng
router.post("/them", authorize('giohang.them'), GioHangController.addToCart);

// Xóa sản phẩm khỏi giỏ hàng - chỉ khách hàng
router.delete("/xoa", authorize('giohang.xoa'), GioHangController.removeFromCart);

// Đặt hàng - chỉ khách hàng
router.post("/dat-hang", authorize('donhang.tao'), GioHangController.placeOrder);

// Lấy giỏ hàng theo khách hàng - chỉ khách hàng
router.get("/:maKH", authorize('giohang.xem'), GioHangController.getCartByCustomer);

// Xóa tất cả sản phẩm trong giỏ hàng - chỉ khách hàng
router.post("/xoa-tat-ca", authorize('giohang.xoa'), GioHangController.clearCart);

// Lấy chi tiết đơn hàng - chỉ khách hàng
router.post("/don-hang/chi-tiet", authorize('donhang.xem_cua_minh'), GioHangController.getOrderById);

// Lấy tất cả đơn hàng của khách hàng - chỉ khách hàng
router.post("/don-hang", authorize('donhang.xem_cua_minh'), GioHangController.getAllOrdersByCustomer);

module.exports = router;
