const express = require("express");
const GioHangController = require("../controllers/GioHangController");

const router = express.Router();

router.post("/them", GioHangController.addToCart);
router.delete("/xoa", GioHangController.removeFromCart);
router.post("/dat-hang", GioHangController.placeOrder);
router.get("/:maKH", GioHangController.getCartByCustomer);

module.exports = router;
