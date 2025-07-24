const express = require("express");
const LoaiSPController = require("../controllers/LoaiSPController");
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả loại sản phẩm
router.get("/", LoaiSPController.getAll);
// Lấy loại sản phẩm theo id
router.get("/:id", LoaiSPController.getById);
router.post("/products", LoaiSPController.getProductsById);
// Thêm loại sản phẩm
router.post(
  "/",
  /*authenticateJWT, authorize('Admin'),*/ LoaiSPController.create
);
// Sửa loại sản phẩm
router.put(
  "/:id",
  /*authenticateJWT, authorize('Admin'),*/ LoaiSPController.update
);
// Xóa loại sản phẩm
router.delete(
  "/:id",
  /*authenticateJWT, authorize('Admin'),*/ LoaiSPController.delete
);

module.exports = router;
