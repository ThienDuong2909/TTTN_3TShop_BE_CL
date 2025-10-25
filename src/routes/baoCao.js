const express = require("express");
const BaoCaoController = require("../controllers/BaoCaoController");
const authenticateJWT = require("../middlewares/jwt");
const {authorize} = require("../middlewares/authorize");

const router = express.Router();

/**
 * @route GET /api/bao-cao-ton-kho/hom-nay
 * @description Lấy báo cáo tồn kho của ngày hôm nay
 * @access Private (yêu cầu JWT token)
 */
router.get("/hom-nay", authenticateJWT, authorize('taobaocao'), BaoCaoController.getBaoCaoTonKhoHomNay);

/**
 * @route GET /api/bao-cao-ton-kho/:ngaybaocao
 * @description Lấy báo cáo tồn kho theo ngày cụ thể
 * @param {string} ngaybaocao - Ngày báo cáo (format: YYYY-MM-DD)
 * @access Private (yêu cầu JWT token)
 * @example GET /api/bao-cao-ton-kho/2025-09-25
 */
router.get("/:ngaybaocao", authorize('taobaocao'), BaoCaoController.getBaoCaoTonKho);

/**
 * @route GET /api/bao-cao-ton-kho/:ngaybaocao/raw
 * @description Lấy báo cáo tồn kho dạng raw data (không format)
 * @param {string} ngaybaocao - Ngày báo cáo (format: YYYY-MM-DD)
 * @access Private (yêu cầu JWT token)
 * @example GET /api/bao-cao-ton-kho/2025-09-25/raw
 */
router.get("/:ngaybaocao/raw", authenticateJWT, authorize('taobaocao'), BaoCaoController.getBaoCaoTonKhoRaw);

/**
 * @route GET /api/bao-cao-ton-kho/:ngaybaocao/pdf
 * @description Xuất báo cáo tồn kho thành file PDF
 * @param {string} ngaybaocao - Ngày báo cáo (format: YYYY-MM-DD)
 * @query {string} nguoilap - Tên người lập báo cáo (optional)
 * @access Private (yêu cầu JWT token)
 * @example GET /api/bao-cao-ton-kho/2025-09-25/pdf?nguoilap=Nguyen Van A
 */
router.get("/:ngaybaocao/pdf", authenticateJWT, authorize('taobaocao'), BaoCaoController.exportBaoCaoTonKhoPDF);

/**
 * @route POST /api/bao-cao-ton-kho/:ngaybaocao/save-pdf
 * @description Lưu báo cáo tồn kho PDF vào server
 * @param {string} ngaybaocao - Ngày báo cáo (format: YYYY-MM-DD)
 * @body {string} nguoilap - Tên người lập báo cáo (optional)
 * @access Private (yêu cầu JWT token)
 * @example POST /api/bao-cao-ton-kho/2025-09-25/save-pdf
 */
router.post("/:ngaybaocao/save-pdf", authenticateJWT, authorize('taobaocao'), BaoCaoController.saveBaoCaoTonKhoPDF);

module.exports = router;
