const { success, error, notFound } = require('../utils/response');
const PhieuDatHangNCCService = require('../services/PhieuDatHangNCCService');
const EmailService = require('../services/EmailService');
const path = require('path');
const fs = require('fs');

const PhieuDatHangNCCController = {
  create: async (req, res) => {
    try {
      const MaTK = req.user?.MaTK || req.user?.id;
      if (!MaTK) return error(res, null, 'Không xác định được tài khoản đăng nhập', 401);
      // Map frontend "details" to backend "chiTiet"
      const data = {
        ...req.body,
        MaTK,
        chiTiet: req.body.details || req.body.chiTiet
      };
      const result = await PhieuDatHangNCCService.create(data);
      return success(res, result, 'Tạo phiếu đặt hàng NCC thành công', 201);
    } catch (err) {
      console.log(err);
      return error(res, err);
    }
  },
  getAll: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getAll();
      return success(res, data, 'Lấy danh sách phiếu đặt hàng NCC thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  getById: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getById(req.params.id);
      if (!data) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      return success(res, data, 'Lấy chi tiết phiếu đặt hàng NCC thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  
  updateStatus: async (req, res) => {
    try {
      const { MaTrangThai } = req.body;
      const result = await PhieuDatHangNCCService.updateStatus(req.params.id, MaTrangThai);
      if (!result || !result.phieu) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      
      let message = 'Cập nhật trạng thái phiếu đặt hàng NCC thành công';
      let responseData = result.phieu;
      
      // Nếu trạng thái thay đổi từ 1 sang 2, thông báo đã gửi email và trả về file Excel
      if (result.phieu.MaTrangThai === 2 && result.emailResult) {
        const supplierEmail = result.phieu.NhaCungCap?.Email || 'lvthanh.work@gmail.com';
        message += `. Đã gửi email phiếu đặt hàng đến ${supplierEmail}`;
        
        // Thêm thông tin file Excel vào response
        responseData = {
          ...result.phieu.toJSON(),
          excelFile: result.emailResult.excelFile
        };
      }
      
      return success(res, responseData, message);
    } catch (err) {
      return error(res, err);
    }
  },
  
  // API tải xuống file Excel
  downloadExcel: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Lấy thông tin phiếu đặt hàng
      const phieu = await PhieuDatHangNCCService.getById(id);
      if (!phieu) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      
      // Tạo file Excel
      const { fileName, filePath } = await EmailService.createPurchaseOrderExcel(phieu);
      
      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(filePath)) {
        return error(res, null, 'Không thể tạo file Excel', 500);
      }
      
      // Set headers để download file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Gửi file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Lỗi gửi file:', err);
          return error(res, null, 'Lỗi khi tải xuống file', 500);
        }
        
        // Xóa file sau khi gửi xong
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 1000);
      });
      
    } catch (err) {
      console.error('Lỗi tải xuống Excel:', err);
      return error(res, err);
    }
  },

  // API lấy thông tin file Excel (không tải xuống)
  getExcelInfo: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Lấy thông tin phiếu đặt hàng
      const phieu = await PhieuDatHangNCCService.getById(id);
      if (!phieu) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      
      // Tạo file Excel
      const { fileName, filePath } = await EmailService.createPurchaseOrderExcel(phieu);
      
      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(filePath)) {
        return error(res, null, 'Không thể tạo file Excel', 500);
      }
      
      // Trả về thông tin file Excel
      const excelInfo = {
        fileName: fileName,
        filePath: filePath,
        downloadUrl: `/uploads/${fileName}`,
        fullDownloadUrl: `${req.protocol}://${req.get('host')}/uploads/${fileName}`,
        apiDownloadUrl: `${req.protocol}://${req.get('host')}/api/phieu-dat-hang-ncc/${id}/download-excel`,
        fileSize: fs.statSync(filePath).size,
        createdAt: new Date().toISOString()
      };
      
      return success(res, excelInfo, 'Lấy thông tin file Excel thành công');
      
    } catch (err) {
      console.error('Lỗi lấy thông tin Excel:', err);
      return error(res, err);
    }
  },
  
  getAvailableForReceipt: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getAvailableForReceipt();
      return success(res, data, 'Lấy danh sách phiếu đặt hàng có thể tạo phiếu nhập thành công');
    } catch (err) {
      console.log(err);
      return error(res, err);
    }
  },
  
  getForReceipt: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getForReceipt(req.params.id);
      if (!data) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      return success(res, data, 'Lấy phiếu đặt hàng để tạo phiếu nhập thành công');
    } catch (err) {
      return error(res, err);
    }
  },
  // API: Trạng thái nhập hàng của từng sản phẩm trong phiếu đặt hàng NCC
  getReceivedStatusByPDH: async (req, res) => {
    try {
      const data = await PhieuDatHangNCCService.getReceivedStatusByPDH(req.params.id);
      return success(res, data, 'Trạng thái nhập hàng của từng sản phẩm trong phiếu đặt hàng NCC');
    } catch (err) {
      return error(res, err);
    }
  },
  
  updateNgayKienNghiGiao: async (req, res) => {
    try {
      const { NgayKienNghiGiao } = req.body;
      const result = await PhieuDatHangNCCService.updateNgayKienNghiGiao(req.params.id, NgayKienNghiGiao);
      if (!result) return notFound(res, 'Không tìm thấy phiếu đặt hàng NCC');
      return success(res, result, 'Cập nhật ngày kiến nghị giao thành công');
    } catch (err) {
      return error(res, err);
    }
  },
};

module.exports = PhieuDatHangNCCController; 