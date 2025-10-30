const express = require("express");
const BaoCaoController = require("../controllers/BaoCaoController");
const authenticateJWT = require("../middlewares/jwt");
const {authorize} = require("../middlewares/authorize");

const router = express.Router();

/**
 * @route POST /api/bao-cao-loi-nhuan
 * @description Lấy báo cáo lợi nhuận sản phẩm theo khoảng thời gian
 * @body {string} ngayBatDau - Ngày bắt đầu (format: YYYY-MM-DD)
 * @body {string} ngayKetThuc - Ngày kết thúc (format: YYYY-MM-DD, optional - mặc định là ngày hiện tại)
 * @access Private (yêu cầu JWT token)
 * @example POST /api/bao-cao-loi-nhuan
 * Body: { "ngayBatDau": "2025-09-01", "ngayKetThuc": "2025-09-25" }
 */
router.post("/", authenticateJWT, authorize('taobaocao'), BaoCaoController.getBaoCaoLoiNhuanSanPham);

/**
 * @route POST /api/bao-cao-loi-nhuan/pdf
 * @description Xuất báo cáo lợi nhuận sản phẩm thành file PDF để tải xuống
 * @body {string} ngayBatDau - Ngày bắt đầu (format: YYYY-MM-DD)
 * @body {string} ngayKetThuc - Ngày kết thúc (format: YYYY-MM-DD, optional)
 * @body {string} nguoiLap - Tên người lập báo cáo (optional)
 * @access Private (yêu cầu JWT token)
 * @example POST /api/bao-cao-loi-nhuan/pdf
 * Body: { "ngayBatDau": "2025-09-01", "ngayKetThuc": "2025-09-25", "nguoiLap": "Nguyen Van A" }
 */
router.post("/pdf", authenticateJWT, authorize('taobaocao'), BaoCaoController.exportBaoCaoLoiNhuanSanPhamPDF);

/**
 * @route POST /api/bao-cao-loi-nhuan/save-pdf
 * @description Lưu báo cáo lợi nhuận sản phẩm PDF vào server
 * @body {string} ngayBatDau - Ngày bắt đầu (format: YYYY-MM-DD)
 * @body {string} ngayKetThuc - Ngày kết thúc (format: YYYY-MM-DD, optional)
 * @body {string} nguoiLap - Tên người lập báo cáo (optional)
 * @access Private (yêu cầu JWT token)
 * @example POST /api/bao-cao-loi-nhuan/save-pdf
 * Body: { "ngayBatDau": "2025-09-01", "ngayKetThuc": "2025-09-25", "nguoiLap": "Nguyen Van A" }
 */
router.post("/save-pdf", authenticateJWT, authorize('taobaocao'), BaoCaoController.saveBaoCaoLoiNhuanSanPhamPDF);

module.exports = router;
