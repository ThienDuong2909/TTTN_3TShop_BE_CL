const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const PDFReportService = require("./PDFReportService");

// Helper function để format tiền VND không thập phân
const formatVNDInteger = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN').format(Math.trunc(num)) + 'đ';
};

/**
 * Helper function để mapping data từ stored procedure báo cáo tồn kho
 */
const mapSPDataToFormat = (item) => {
  // Danh sách các tên cột có thể có từ SP
  const columnMappings = {
    loaiSanPham: [
      'Loại sản phẩm', 'loaiSanPham', 'LoaiSanPham', 'category', 'Category'
    ],
    maSanPham: [
      'Mã sản phẩm', 'maSanPham', 'MaSanPham', 'productCode', 'ProductCode'
    ],
    tenSanPham: [
      'Tên sản phẩm', 'tenSanPham', 'TenSanPham', 'productName', 'ProductName'
    ],
    soLuongTon: [
      'Số lượng tồn', 'soLuongTon', 'SoLuongTon', 'quantity', 'Quantity'
    ],
    giaNhap: [
      'Giá nhập (trung bình)', 'Giá nhập', 'giaNhap', 'GiaNhap', 'price', 'Price', 'importPrice'
    ]
  };

  const result = {};
  
  for (const [key, possibleNames] of Object.entries(columnMappings)) {
    result[key] = '';
    for (const name of possibleNames) {
      if (item[name] !== undefined && item[name] !== null) {
        result[key] = item[name];
        break;
      }
    }
  }

  return result;
};

/**
 * Helper function để mapping data từ stored procedure báo cáo lợi nhuận
 */
const mapLoiNhuanDataToFormat = (item) => {
  // Danh sách các tên cột có thể có từ SP báo cáo lợi nhuận
  const columnMappings = {
    loaiSanPham: [
      'LoaiSP', 'Loại sản phẩm', 'loaiSanPham', 'LoaiSanPham', 'category', 'Category'
    ],
    maSanPham: [
      'MaSP', 'Mã sản phẩm', 'maSanPham', 'MaSanPham', 'productCode', 'ProductCode'
    ],
    tenSanPham: [
      'TenSP', 'Tên sản phẩm', 'tenSanPham', 'TenSanPham', 'productName', 'ProductName'
    ],
    tongTriGiaNhap: [
      'TongTriGiaNhap', 'Tổng trị giá nhập', 'tongTriGiaNhap', 'totalImportValue'
    ],
    tongTriGiaXuat: [
      'TongTriGiaXuat', 'Tổng trị giá xuất', 'tongTriGiaXuat', 'totalExportValue'
    ],
    loiNhuan: [
      'LoiNhuan', 'Lợi nhuận', 'loiNhuan', 'profit'
    ],
    phanTramLoiNhuan: [
      'PhanTramLoiNhuan', 'Phần trăm lợi nhuận', 'phanTramLoiNhuan', 'profitPercent'
    ]
  };

  const result = {};
  
  for (const [key, possibleNames] of Object.entries(columnMappings)) {
    result[key] = '';
    for (const name of possibleNames) {
      if (item[name] !== undefined && item[name] !== null) {
        result[key] = item[name];
        break;
      }
    }
  }

  return result;
};

const BaoCaoService = {
  /**
   * Gọi stored procedure SP_BaoCaoTonKho_6 để lấy báo cáo tồn kho
   * @param {string} ngayBaoCao - Ngày báo cáo (YYYY-MM-DD format)
   * @returns {Promise<Array>} Danh sách báo cáo tồn kho bao gồm:
   * - loại sản phẩm
   * - mã sản phẩm  
   * - tên sản phẩm
   * - số lượng tồn
   * - giá nhập
   */
  getBaoCaoTonKho: async (ngayBaoCao = null) => {
    try {
      const reportDate = ngayBaoCao || new Date().toISOString().split('T')[0];
      console.log(`Đang gọi stored procedure SP_BaoCaoTonKho_6 với ngày: ${reportDate}`);
      
      // Gọi stored procedure với tham số ngày
      const results = await sequelize.query("CALL SP_BaoCaoTonKho_6(?)", {
        type: QueryTypes.SELECT,
        replacements: [reportDate],
      });

      // Xử lý dữ liệu từ stored procedure
      // SP trả về array với [data_object, metadata_object]
      let processedData = [];
      
      if (results && results.length > 0 && results[0]) {
        // Lấy phần tử đầu tiên (chứa data)
        const dataObject = results[0];
        
        // Chuyển object thành array
        if (typeof dataObject === 'object' && !Array.isArray(dataObject)) {
          processedData = Object.values(dataObject).filter(item => 
            typeof item === 'object' && 
            item.hasOwnProperty('Loại sản phẩm') // Kiểm tra có phải là data record
          );
        }
      }
      
      console.log(`Đã lấy được ${processedData.length} bản ghi từ SP_BaoCaoTonKho_6`);
      
      // Debug: Log ra cấu trúc dữ liệu để xem tên cột chính xác
      if (processedData.length > 0) {
        console.log('Cấu trúc dữ liệu từ SP:', Object.keys(processedData[0]));
        console.log('Dữ liệu mẫu (3 record đầu):', processedData.slice(0, 3));
      }
      
      return {
        success: true,
        data: processedData,
        message: "Lấy báo cáo tồn kho thành công",
        ngayBaoCao: reportDate,
      };
    } catch (error) {
      console.error("Lỗi khi gọi SP_BaoCaoTonKho_6:", error);
      
      return {
        success: false,
        data: [],
        message: "Lỗi khi lấy báo cáo tồn kho: " + error.message,
        ngayBaoCao: ngayBaoCao,
      };
    }
  },

  /**
   * Gọi stored procedure SP_BaoCaoTonKho_6 với tham số tùy chỉnh (nếu cần)
   * @param {Object} params - Các tham số cho stored procedure (nếu có)
   * @returns {Promise<Array>} Danh sách báo cáo tồn kho
   */
  getBaoCaoTonKhoWithParams: async (params = {}) => {
    try {
      console.log("Đang gọi stored procedure SP_BaoCaoTonKho_6 với tham số:", params);
      
      // Nếu stored procedure cần tham số, có thể thêm vào đây
      // Ví dụ: CALL SP_BaoCaoTonKho_6(:param1, :param2)
      const results = await sequelize.query("CALL SP_BaoCaoTonKho_6()", {
        type: QueryTypes.SELECT,
        replacements: params, // Sử dụng khi có tham số
      });

      console.log(`Đã lấy được ${results.length} bản ghi từ SP_BaoCaoTonKho_6`);
      
      return {
        success: true,
        data: results,
        message: "Lấy báo cáo tồn kho thành công",
        params: params,
      };
    } catch (error) {
      console.error("Lỗi khi gọi SP_BaoCaoTonKho_6 với tham số:", error);
      
      return {
        success: false,
        data: [],
        message: "Lỗi khi lấy báo cáo tồn kho: " + error.message,
        params: params,
      };
    }
  },

  /**
   * Lấy báo cáo tồn kho với định dạng dữ liệu đã được xử lý
   * @param {string} ngayBaoCao - Ngày báo cáo (YYYY-MM-DD format)
   * @returns {Promise<Object>} Báo cáo tồn kho đã được format
   */
  getFormattedBaoCaoTonKho: async (ngayBaoCao = null) => {
    try {
      const result = await BaoCaoService.getBaoCaoTonKho(ngayBaoCao);
      
      if (!result.success) {
        return result;
      }

      // Xử lý và format dữ liệu từ stored procedure
      const formattedData = result.data.map((item, index) => {
        // Map dữ liệu từ SP
        const mappedItem = mapSPDataToFormat(item);
        
        const soLuongTon = parseInt(mappedItem.soLuongTon) || 0;
        const giaNhap = parseFloat(mappedItem.giaNhap) || 0;
        
        return {
          stt: index + 1,
          loaiSanPham: mappedItem.loaiSanPham || 'Không xác định',
          maSanPham: mappedItem.maSanPham || '',
          tenSanPham: mappedItem.tenSanPham || '',
          soLuongTon: soLuongTon,
          giaNhap: giaNhap,
          // Format giá tiền
          giaNhapFormatted: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(giaNhap),
          // Tính tổng giá trị tồn kho
          giaTriTonKho: soLuongTon * giaNhap,
        };
      });

      // Tính tổng kết
      const tongSoLuongTon = formattedData.reduce((sum, item) => sum + (item.soLuongTon || 0), 0);
      const tongGiaTriTonKho = formattedData.reduce((sum, item) => sum + (item.giaTriTonKho || 0), 0);

      return {
        success: true,
        data: formattedData,
        summary: {
          tongSoLuongTon,
          tongGiaTriTonKho,
          tongGiaTriTonKhoFormatted: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(tongGiaTriTonKho),
          soLuongSanPham: formattedData.length,
        },
        ngayBaoCao: result.ngayBaoCao,
        message: "Lấy báo cáo tồn kho thành công",
      };
    } catch (error) {
      console.error("Lỗi khi format báo cáo tồn kho:", error);
      
      return {
        success: false,
        data: [],
        message: "Lỗi khi xử lý báo cáo tồn kho: " + error.message,
      };
    }
  },

  /**
   * Xuất báo cáo tồn kho thành file PDF
   * @param {string} ngayBaoCao - Ngày báo cáo (YYYY-MM-DD format)
   * @param {string} nguoiLap - Tên người lập báo cáo
   * @returns {Promise<Object>} Buffer PDF và thông tin file
   */
  exportBaoCaoTonKhoPDF: async (ngayBaoCao = null, nguoiLap = '') => {
    try {
      console.log(`Đang xuất báo cáo PDF tồn kho cho ngày: ${ngayBaoCao}`);
      
      // Lấy dữ liệu báo cáo
      const result = await BaoCaoService.getFormattedBaoCaoTonKho(ngayBaoCao);
      
      if (!result.success) {
        return {
          success: false,
          message: result.message,
          buffer: null,
          filename: null,
        };
      }

      // Tạo PDF service
      const pdfService = new PDFReportService();
      
      // Tạo PDF buffer
      const pdfBuffer = await pdfService.createInventoryReportPDF(
        result.data,
        result.ngayBaoCao,
        nguoiLap
      );

      // Tạo tên file
      const filename = `BaoCaoTonKho_${result.ngayBaoCao.replace(/-/g, '')}.pdf`;

      console.log(`Đã tạo thành công file PDF: ${filename}`);

      return {
        success: true,
        message: "Xuất báo cáo PDF thành công",
        buffer: pdfBuffer,
        filename: filename,
        data: {
          ngayBaoCao: result.ngayBaoCao,
          soLuongSanPham: result.summary.soLuongSanPham,
          tongGiaTriTonKho: result.summary.tongGiaTriTonKhoFormatted,
          nguoiLap: nguoiLap,
        },
      };

    } catch (error) {
      console.error("Lỗi khi xuất báo cáo PDF:", error);
      
      return {
        success: false,
        message: "Lỗi khi xuất báo cáo PDF: " + error.message,
        buffer: null,
        filename: null,
      };
    }
  },

  /**
   * Lưu báo cáo PDF vào thư mục uploads
   * @param {string} ngayBaoCao - Ngày báo cáo
   * @param {string} nguoiLap - Tên người lập báo cáo
   * @returns {Promise<Object>} Đường dẫn file đã lưu
   */
  saveBaoCaoTonKhoPDF: async (ngayBaoCao = null, nguoiLap = '') => {
    try {
      const fs = require('fs-extra');
      const path = require('path');

      // Xuất PDF
      const pdfResult = await BaoCaoService.exportBaoCaoTonKhoPDF(ngayBaoCao, nguoiLap);
      
      if (!pdfResult.success) {
        return pdfResult;
      }

      // Đảm bảo thư mục uploads tồn tại
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.ensureDir(uploadsDir);

      // Đường dẫn file
      const filePath = path.join(uploadsDir, pdfResult.filename);

      // Lưu file
      await fs.writeFile(filePath, pdfResult.buffer);

      console.log(`Đã lưu file PDF tại: ${filePath}`);

      return {
        success: true,
        message: "Lưu báo cáo PDF thành công",
        filePath: filePath,
        filename: pdfResult.filename,
        data: pdfResult.data,
      };

    } catch (error) {
      console.error("Lỗi khi lưu báo cáo PDF:", error);
      
      return {
        success: false,
        message: "Lỗi khi lưu báo cáo PDF: " + error.message,
        filePath: null,
        filename: null,
      };
    }
  },

  // ===== BÁOCÁO LỢI NHUẬN SẢN PHẨM =====

  /**
   * Gọi stored procedure sp_baocao_loinhuan_sanpham_3 để lấy báo cáo lợi nhuận sản phẩm
   * @param {string} ngayBatDau - Ngày bắt đầu (YYYY-MM-DD format)
   * @param {string} ngayKetThuc - Ngày kết thúc (YYYY-MM-DD format), nếu null thì lấy ngày hiện tại
   * @returns {Promise<Object>} Danh sách báo cáo lợi nhuận sản phẩm
   */
  getBaoCaoLoiNhuanSanPham: async (ngayBatDau, ngayKetThuc = null) => {
    try {
      const startDate = ngayBatDau || new Date().toISOString().split('T')[0];
      const endDate = ngayKetThuc || new Date().toISOString().split('T')[0];
      
      console.log(`Đang gọi stored procedure sp_baocao_loinhuan_sanpham_3 từ ${startDate} đến ${endDate}`);
      
      // Gọi stored procedure với tham số ngày bắt đầu và ngày kết thúc
      const results = await sequelize.query("CALL sp_baocao_loinhuan_sanpham_3(?, ?)", {
        type: QueryTypes.SELECT,
        replacements: [startDate, endDate],
      });

      // Xử lý dữ liệu từ stored procedure
      let processedData = [];
      
      if (results && results.length > 0 && results[0]) {
        const dataObject = results[0];
        
        if (typeof dataObject === 'object' && !Array.isArray(dataObject)) {
          processedData = Object.values(dataObject).filter(item => 
            typeof item === 'object' && 
            (item.hasOwnProperty('LoaiSP') || item.hasOwnProperty('MaSP')) // Kiểm tra có phải là data record
          );
        }
      }
      
      console.log(`Đã lấy được ${processedData.length} bản ghi từ sp_baocao_loinhuan_sanpham_3`);
      
      // Debug: Log ra cấu trúc dữ liệu
      if (processedData.length > 0) {
        console.log('Cấu trúc dữ liệu lợi nhuận từ SP:', Object.keys(processedData[0]));
        console.log('Dữ liệu mẫu lợi nhuận (3 record đầu):', processedData.slice(0, 3));
      }
      
      return {
        success: true,
        data: processedData,
        message: "Lấy báo cáo lợi nhuận sản phẩm thành công",
        ngayBatDau: startDate,
        ngayKetThuc: endDate,
      };
    } catch (error) {
      console.error("Lỗi khi gọi sp_baocao_loinhuan_sanpham_3:", error);
      
      return {
        success: false,
        data: [],
        message: "Lỗi khi lấy báo cáo lợi nhuận sản phẩm: " + error.message,
        ngayBatDau: ngayBatDau,
        ngayKetThuc: ngayKetThuc,
      };
    }
  },

  /**
   * Lấy báo cáo lợi nhuận sản phẩm với định dạng dữ liệu đã được xử lý
   * @param {string} ngayBatDau - Ngày bắt đầu (YYYY-MM-DD format)
   * @param {string} ngayKetThuc - Ngày kết thúc (YYYY-MM-DD format)
   * @returns {Promise<Object>} Báo cáo lợi nhuận đã được format
   */
  getFormattedBaoCaoLoiNhuanSanPham: async (ngayBatDau, ngayKetThuc = null) => {
    try {
      const result = await BaoCaoService.getBaoCaoLoiNhuanSanPham(ngayBatDau, ngayKetThuc);
      
      if (!result.success) {
        return result;
      }

      // Xử lý và format dữ liệu từ stored procedure
      const formattedData = result.data.map((item, index) => {
        // Map dữ liệu từ SP
        const mappedItem = mapLoiNhuanDataToFormat(item);
        
        const tongTriGiaNhap = parseFloat(mappedItem.tongTriGiaNhap) || 0;
        const tongTriGiaXuat = parseFloat(mappedItem.tongTriGiaXuat) || 0;
        const loiNhuan = parseFloat(mappedItem.loiNhuan) || 0;
        const phanTramLoiNhuan = parseFloat(mappedItem.phanTramLoiNhuan) || 0;
        
        return {
          stt: index + 1,
          loaiSanPham: mappedItem.loaiSanPham || 'Không xác định',
          maSanPham: mappedItem.maSanPham || '',
          tenSanPham: mappedItem.tenSanPham || '',
          tongTriGiaNhap: tongTriGiaNhap,
          tongTriGiaXuat: tongTriGiaXuat,
          loiNhuan: loiNhuan,
          phanTramLoiNhuan: phanTramLoiNhuan,
          // Format giá tiền
          tongTriGiaNhapFormatted: formatVNDInteger(tongTriGiaNhap),
          tongTriGiaXuatFormatted: formatVNDInteger(tongTriGiaXuat),
          loiNhuanFormatted: formatVNDInteger(loiNhuan),
          phanTramLoiNhuanFormatted: phanTramLoiNhuan.toFixed(2) + '%',
        };
      });

      // Tính tổng kết
      const tongTriGiaNhapTotal = formattedData.reduce((sum, item) => sum + (item.tongTriGiaNhap || 0), 0);
      const tongTriGiaXuatTotal = formattedData.reduce((sum, item) => sum + (item.tongTriGiaXuat || 0), 0);
      const tongLoiNhuan = formattedData.reduce((sum, item) => sum + (item.loiNhuan || 0), 0);
      const phanTramLoiNhuanTrungBinh = tongTriGiaNhapTotal > 0 ? (tongLoiNhuan / tongTriGiaNhapTotal) * 100 : 0;

      return {
        success: true,
        data: formattedData,
        summary: {
          tongTriGiaNhapTotal,
          tongTriGiaXuatTotal,
          tongLoiNhuan,
          phanTramLoiNhuanTrungBinh,
          tongTriGiaNhapTotalFormatted: formatVNDInteger(tongTriGiaNhapTotal),
          tongTriGiaXuatTotalFormatted: formatVNDInteger(tongTriGiaXuatTotal),
          tongLoiNhuanFormatted: formatVNDInteger(tongLoiNhuan),
          phanTramLoiNhuanTrungBinhFormatted: phanTramLoiNhuanTrungBinh.toFixed(2) + '%',
          soLuongSanPham: formattedData.length,
        },
        ngayBatDau: result.ngayBatDau,
        ngayKetThuc: result.ngayKetThuc,
        message: "Lấy báo cáo lợi nhuận sản phẩm thành công",
      };
    } catch (error) {
      console.error("Lỗi khi format báo cáo lợi nhuận sản phẩm:", error);
      
      return {
        success: false,
        data: [],
        message: "Lỗi khi xử lý báo cáo lợi nhuận sản phẩm: " + error.message,
      };
    }
  },

  /**
   * Xuất báo cáo lợi nhuận sản phẩm thành file PDF
   * @param {string} ngayBatDau - Ngày bắt đầu (YYYY-MM-DD format)
   * @param {string} ngayKetThuc - Ngày kết thúc (YYYY-MM-DD format)
   * @param {string} nguoiLap - Tên người lập báo cáo
   * @returns {Promise<Object>} Buffer PDF và thông tin file
   */
  exportBaoCaoLoiNhuanSanPhamPDF: async (ngayBatDau, ngayKetThuc = null, nguoiLap = '') => {
    try {
      console.log(`Đang xuất báo cáo PDF lợi nhuận sản phẩm từ ${ngayBatDau} đến ${ngayKetThuc}`);
      
      // Lấy dữ liệu báo cáo
      const result = await BaoCaoService.getFormattedBaoCaoLoiNhuanSanPham(ngayBatDau, ngayKetThuc);
      
      if (!result.success) {
        return {
          success: false,
          message: result.message,
          buffer: null,
          filename: null,
        };
      }

      // Tạo PDF service
      const pdfService = new PDFReportService();
      
      // Tạo PDF buffer cho báo cáo lợi nhuận
      const pdfBuffer = await pdfService.createProfitReportPDF(
        result.data,
        result.ngayBatDau,
        result.ngayKetThuc,
        nguoiLap
      );

      // Tạo tên file
      const startDateStr = result.ngayBatDau.replace(/-/g, '');
      const endDateStr = result.ngayKetThuc.replace(/-/g, '');
      const filename = `BaoCaoLoiNhuanSanPham_${startDateStr}_${endDateStr}.pdf`;

      console.log(`Đã tạo thành công file PDF lợi nhuận: ${filename}`);

      return {
        success: true,
        message: "Xuất báo cáo lợi nhuận PDF thành công",
        buffer: pdfBuffer,
        filename: filename,
        data: {
          ngayBatDau: result.ngayBatDau,
          ngayKetThuc: result.ngayKetThuc,
          soLuongSanPham: result.summary.soLuongSanPham,
          tongLoiNhuan: result.summary.tongLoiNhuanFormatted,
          phanTramLoiNhuanTrungBinh: result.summary.phanTramLoiNhuanTrungBinhFormatted,
          nguoiLap: nguoiLap,
        },
      };

    } catch (error) {
      console.error("Lỗi khi xuất báo cáo lợi nhuận PDF:", error);
      
      return {
        success: false,
        message: "Lỗi khi xuất báo cáo lợi nhuận PDF: " + error.message,
        buffer: null,
        filename: null,
      };
    }
  },

  /**
   * Lưu báo cáo lợi nhuận PDF vào thư mục uploads
   * @param {string} ngayBatDau - Ngày bắt đầu
   * @param {string} ngayKetThuc - Ngày kết thúc
   * @param {string} nguoiLap - Tên người lập báo cáo
   * @returns {Promise<Object>} Đường dẫn file đã lưu
   */
  saveBaoCaoLoiNhuanSanPhamPDF: async (ngayBatDau, ngayKetThuc = null, nguoiLap = '') => {
    try {
      const fs = require('fs-extra');
      const path = require('path');

      // Xuất PDF
      const pdfResult = await BaoCaoService.exportBaoCaoLoiNhuanSanPhamPDF(ngayBatDau, ngayKetThuc, nguoiLap);
      
      if (!pdfResult.success) {
        return pdfResult;
      }

      // Đảm bảo thư mục uploads tồn tại
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.ensureDir(uploadsDir);

      // Đường dẫn file
      const filePath = path.join(uploadsDir, pdfResult.filename);

      // Lưu file
      await fs.writeFile(filePath, pdfResult.buffer);

      console.log(`Đã lưu file PDF lợi nhuận tại: ${filePath}`);

      return {
        success: true,
        message: "Lưu báo cáo lợi nhuận PDF thành công",
        filePath: filePath,
        filename: pdfResult.filename,
        data: pdfResult.data,
      };

    } catch (error) {
      console.error("Lỗi khi lưu báo cáo lợi nhuận PDF:", error);
      
      return {
        success: false,
        message: "Lỗi khi lưu báo cáo lợi nhuận PDF: " + error.message,
        filePath: null,
        filename: null,
      };
    }
  },
};

module.exports = BaoCaoService;