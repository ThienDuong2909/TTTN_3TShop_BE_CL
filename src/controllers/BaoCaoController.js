const BaoCaoService = require("../services/BaoCaoService");
const response = require("../utils/response");

const BaoCaoController = {
  /**
   * API lấy báo cáo tồn kho theo ngày
   * GET /api/bao-cao-ton-kho/:ngaybaocao
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBaoCaoTonKho: async (req, res) => {
    try {
      const { ngaybaocao } = req.params;
      
      // Validate ngày báo cáo
      if (!ngaybaocao) {
        return response.error(res, "Vui lòng cung cấp ngày báo cáo", 400);
      }

      // Validate định dạng ngày (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngaybaocao)) {
        return response.error(
          res, 
          "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      // Validate ngày có hợp lệ không
      const date = new Date(ngaybaocao);
      if (isNaN(date.getTime())) {
        return response.error(res, "Ngày báo cáo không hợp lệ", 400);
      }

      // Validate ngày không được lớn hơn ngày hiện tại
      const today = new Date();
      if (date > today) {
        return response.error(res, "Ngày báo cáo không được lớn hơn ngày hiện tại", 400);
      }

      console.log(`API getBaoCaoTonKho được gọi với ngày: ${ngaybaocao}`);

      // Gọi service để lấy báo cáo
      const result = await BaoCaoService.getFormattedBaoCaoTonKho(ngaybaocao);

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      return response.success(
        res,
        {
          ngayBaoCao: result.ngayBaoCao,
          data: result.data,
          summary: result.summary,
        },
        result.message
      );

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.getBaoCaoTonKho:", error);
      return response.error(
        res,
        "Lỗi hệ thống khi lấy báo cáo tồn kho: " + error.message,
        500
      );
    }
  },

  /**
   * API lấy báo cáo tồn kho ngày hiện tại
   * GET /api/bao-cao-ton-kho/hom-nay
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBaoCaoTonKhoHomNay: async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`API getBaoCaoTonKhoHomNay được gọi với ngày hôm nay: ${today}`);

      // Gọi service để lấy báo cáo
      const result = await BaoCaoService.getFormattedBaoCaoTonKho(today);

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      return response.success(
        res,
        {
          ngayBaoCao: result.ngayBaoCao,
          data: result.data,
          summary: result.summary,
        },
        result.message
      );

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.getBaoCaoTonKhoHomNay:", error);
      return response.error(
        res,
        "Lỗi hệ thống khi lấy báo cáo tồn kho hôm nay: " + error.message,
        500
      );
    }
  },

  /**
   * API lấy báo cáo tồn kho dạng raw data (không format)
   * GET /api/bao-cao-ton-kho/:ngaybaocao/raw
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBaoCaoTonKhoRaw: async (req, res) => {
    try {
      const { ngaybaocao } = req.params;
      
      // Validate ngày báo cáo
      if (!ngaybaocao) {
        return response.error(res, "Vui lòng cung cấp ngày báo cáo", 400);
      }

      // Validate định dạng ngày (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngaybaocao)) {
        return response.error(
          res, 
          "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      console.log(`API getBaoCaoTonKhoRaw được gọi với ngày: ${ngaybaocao}`);

      // Gọi service để lấy báo cáo raw
      const result = await BaoCaoService.getBaoCaoTonKho(ngaybaocao);

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      return response.success(
        res,
        {
          ngayBaoCao: result.ngayBaoCao,
          data: result.data,
        },
        result.message
      );

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.getBaoCaoTonKhoRaw:", error);
      return response.error(
        res,
        "Lỗi hệ thống khi lấy báo cáo tồn kho raw: " + error.message,
        500
      );
    }
  },

  /**
   * API xuất báo cáo tồn kho thành PDF
   * GET /api/bao-cao-ton-kho/:ngaybaocao/pdf
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  exportBaoCaoTonKhoPDF: async (req, res) => {
    try {
      const { ngaybaocao } = req.params;
      const { nguoilap } = req.query; // Lấy tên người lập từ query parameter
      
      // Validate ngày báo cáo
      if (!ngaybaocao) {
        return response.error(res, "Vui lòng cung cấp ngày báo cáo", 400);
      }

      // Validate định dạng ngày (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngaybaocao)) {
        return response.error(
          res, 
          "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      console.log(`API exportBaoCaoTonKhoPDF được gọi với ngày: ${ngaybaocao}, người lập: ${nguoilap || 'Không xác định'}`);

      // Xuất PDF
      const result = await BaoCaoService.exportBaoCaoTonKhoPDF(ngaybaocao, nguoilap || '');

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      // Kiểm tra buffer có hợp lệ không
      if (!Buffer.isBuffer(result.buffer)) {
        return response.error(res, "Dữ liệu PDF không hợp lệ", 500);
      }

      console.log(`PDF buffer size: ${result.buffer.length} bytes`);

      // Set headers để download file PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.buffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      // Gửi file PDF buffer và kết thúc response
      res.write(result.buffer);
      res.end();

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.exportBaoCaoTonKhoPDF:", error);
      
      // Đảm bảo response chưa được gửi trước khi gửi error
      if (!res.headersSent) {
        return response.error(
          res,
          "Lỗi hệ thống khi xuất báo cáo PDF: " + error.message,
          500
        );
      }
    }
  },

  /**
   * API lưu báo cáo tồn kho PDF vào server
   * POST /api/bao-cao-ton-kho/:ngaybaocao/save-pdf
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  saveBaoCaoTonKhoPDF: async (req, res) => {
    try {
      const { ngaybaocao } = req.params;
      const { nguoilap } = req.body; // Lấy tên người lập từ body
      
      // Validate ngày báo cáo
      if (!ngaybaocao) {
        return response.error(res, "Vui lòng cung cấp ngày báo cáo", 400);
      }

      // Validate định dạng ngày (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngaybaocao)) {
        return response.error(
          res, 
          "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      console.log(`API saveBaoCaoTonKhoPDF được gọi với ngày: ${ngaybaocao}, người lập: ${nguoilap || 'Không xác định'}`);

      // Lưu PDF vào server
      const result = await BaoCaoService.saveBaoCaoTonKhoPDF(ngaybaocao, nguoilap || '');

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      return response.success(
        res,
        {
          filePath: result.filePath,
          filename: result.filename,
          data: result.data,
        },
        result.message
      );

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.saveBaoCaoTonKhoPDF:", error);
      return response.error(
        res,
        "Lỗi hệ thống khi lưu báo cáo PDF: " + error.message,
        500
      );
    }
  },

  // ===== BÁOCÁO LỢI NHUẬN SẢN PHẨM =====

  /**
   * API lấy báo cáo lợi nhuận sản phẩm theo khoảng thời gian
   * POST /api/bao-cao-loi-nhuan-san-pham
   * Body: { ngayBatDau: 'YYYY-MM-DD', ngayKetThuc: 'YYYY-MM-DD' (optional) }
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getBaoCaoLoiNhuanSanPham: async (req, res) => {
    try {
      const { ngayBatDau, ngayKetThuc } = req.body;
      
      // Validate ngày bắt đầu
      if (!ngayBatDau) {
        return response.error(res, "Vui lòng cung cấp ngày bắt đầu", 400);
      }

      // Validate định dạng ngày
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngayBatDau)) {
        return response.error(
          res, 
          "Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      if (ngayKetThuc && !dateRegex.test(ngayKetThuc)) {
        return response.error(
          res, 
          "Định dạng ngày kết thúc không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      // Validate ngày có hợp lệ không
      const startDate = new Date(ngayBatDau);
      if (isNaN(startDate.getTime())) {
        return response.error(res, "Ngày bắt đầu không hợp lệ", 400);
      }

      let endDate = ngayKetThuc ? new Date(ngayKetThuc) : new Date();
      if (ngayKetThuc && isNaN(endDate.getTime())) {
        return response.error(res, "Ngày kết thúc không hợp lệ", 400);
      }

      // Validate ngày bắt đầu không được lớn hơn ngày kết thúc
      if (startDate > endDate) {
        return response.error(res, "Ngày bắt đầu không được lớn hơn ngày kết thúc", 400);
      }

      // Validate ngày kết thúc không được lớn hơn ngày hiện tại
      const today = new Date();
      if (endDate > today) {
        endDate = today;
      }

      const finalEndDate = ngayKetThuc || endDate.toISOString().split('T')[0];

      console.log(`API getBaoCaoLoiNhuanSanPham được gọi từ ${ngayBatDau} đến ${finalEndDate}`);

      // Gọi service để lấy báo cáo
      const result = await BaoCaoService.getFormattedBaoCaoLoiNhuanSanPham(ngayBatDau, finalEndDate);

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      return response.success(
        res,
        {
          data: result.data,
          summary: result.summary,
          ngayBatDau: result.ngayBatDau,
          ngayKetThuc: result.ngayKetThuc,
        },
        result.message
      );

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.getBaoCaoLoiNhuanSanPham:", error);
      return response.error(
        res,
        "Lỗi hệ thống khi lấy báo cáo lợi nhuận: " + error.message,
        500
      );
    }
  },

  /**
   * API xuất báo cáo lợi nhuận sản phẩm thành file PDF để tải xuống
   * POST /api/bao-cao-loi-nhuan-san-pham/pdf
   * Body: { ngayBatDau: 'YYYY-MM-DD', ngayKetThuc: 'YYYY-MM-DD' (optional), nguoiLap: 'string' (optional) }
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  exportBaoCaoLoiNhuanSanPhamPDF: async (req, res) => {
    try {
      const { ngayBatDau, ngayKetThuc, nguoiLap } = req.body;
      
      // Validate ngày bắt đầu
      if (!ngayBatDau) {
        return response.error(res, "Vui lòng cung cấp ngày bắt đầu", 400);
      }

      // Validate định dạng ngày
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngayBatDau)) {
        return response.error(
          res, 
          "Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      if (ngayKetThuc && !dateRegex.test(ngayKetThuc)) {
        return response.error(
          res, 
          "Định dạng ngày kết thúc không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      // Validate ngày có hợp lệ không
      const startDate = new Date(ngayBatDau);
      if (isNaN(startDate.getTime())) {
        return response.error(res, "Ngày bắt đầu không hợp lệ", 400);
      }

      let endDate = ngayKetThuc ? new Date(ngayKetThuc) : new Date();
      if (ngayKetThuc && isNaN(endDate.getTime())) {
        return response.error(res, "Ngày kết thúc không hợp lệ", 400);
      }

      // Validate ngày bắt đầu không được lớn hơn ngày kết thúc
      if (startDate > endDate) {
        return response.error(res, "Ngày bắt đầu không được lớn hơn ngày kết thúc", 400);
      }

      const finalEndDate = ngayKetThuc || endDate.toISOString().split('T')[0];

      console.log(`API exportBaoCaoLoiNhuanSanPhamPDF được gọi từ ${ngayBatDau} đến ${finalEndDate}, người lập: ${nguoiLap || 'Không xác định'}`);

      // Xuất PDF
      const result = await BaoCaoService.exportBaoCaoLoiNhuanSanPhamPDF(ngayBatDau, finalEndDate, nguoiLap || '');

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      // Kiểm tra buffer có hợp lệ không
      if (!Buffer.isBuffer(result.buffer)) {
        return response.error(res, "Dữ liệu PDF không hợp lệ", 500);
      }

      console.log(`PDF buffer size: ${result.buffer.length} bytes`);

      // Set headers để download file PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.buffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      // Gửi file PDF buffer và kết thúc response
      res.write(result.buffer);
      res.end();

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.exportBaoCaoLoiNhuanSanPhamPDF:", error);
      
      // Đảm bảo response chưa được gửi trước khi gửi error
      if (!res.headersSent) {
        return response.error(
          res,
          "Lỗi hệ thống khi xuất báo cáo lợi nhuận PDF: " + error.message,
          500
        );
      }
    }
  },

  /**
   * API lưu báo cáo lợi nhuận sản phẩm PDF vào server
   * POST /api/bao-cao-loi-nhuan-san-pham/save-pdf
   * Body: { ngayBatDau: 'YYYY-MM-DD', ngayKetThuc: 'YYYY-MM-DD' (optional), nguoiLap: 'string' (optional) }
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  saveBaoCaoLoiNhuanSanPhamPDF: async (req, res) => {
    try {
      const { ngayBatDau, ngayKetThuc, nguoiLap } = req.body;
      
      // Validate ngày bắt đầu
      if (!ngayBatDau) {
        return response.error(res, "Vui lòng cung cấp ngày bắt đầu", 400);
      }

      // Validate định dạng ngày
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(ngayBatDau)) {
        return response.error(
          res, 
          "Định dạng ngày bắt đầu không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      if (ngayKetThuc && !dateRegex.test(ngayKetThuc)) {
        return response.error(
          res, 
          "Định dạng ngày kết thúc không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD", 
          400
        );
      }

      const finalEndDate = ngayKetThuc || new Date().toISOString().split('T')[0];

      console.log(`API saveBaoCaoLoiNhuanSanPhamPDF được gọi từ ${ngayBatDau} đến ${finalEndDate}, người lập: ${nguoiLap || 'Không xác định'}`);

      // Lưu PDF vào server
      const result = await BaoCaoService.saveBaoCaoLoiNhuanSanPhamPDF(ngayBatDau, finalEndDate, nguoiLap || '');

      if (!result.success) {
        return response.error(res, result.message, 500);
      }

      return response.success(
        res,
        {
          filePath: result.filePath,
          filename: result.filename,
          data: result.data,
        },
        result.message
      );

    } catch (error) {
      console.error("Lỗi trong BaoCaoController.saveBaoCaoLoiNhuanSanPhamPDF:", error);
      return response.error(
        res,
        "Lỗi hệ thống khi lưu báo cáo lợi nhuận PDF: " + error.message,
        500
      );
    }
  },
};

module.exports = BaoCaoController;
