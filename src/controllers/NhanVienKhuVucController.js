const NhanVienKhuVucService = require('../services/NhanVienKhuVucService');

const NhanVienKhuVucController = {
  // GET /api/nhan-vien/:id/khu-vuc - Lấy danh sách khu vực phụ trách
  getKhuVucPhuTrach: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhân viên không được để trống'
        });
      }

      const result = await NhanVienKhuVucService.getKhuVucPhuTrach(parseInt(id));
      
      res.json({
        success: true,
        message: 'Lấy danh sách khu vực phụ trách thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khu vực phụ trách:', error);
      res.status(error.code === 'NOT_FOUND' ? 404 : 500).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy danh sách khu vực phụ trách'
      });
    }
  },

  // GET /api/nhan-vien/:id/khu-vuc-chua-phu-trach - Lấy danh sách khu vực chưa phụ trách
  getKhuVucChuaPhuTrach: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhân viên không được để trống'
        });
      }

      const result = await NhanVienKhuVucService.getKhuVucChuaPhuTrach(parseInt(id));
      
      res.json({
        success: true,
        message: 'Lấy danh sách khu vực chưa phụ trách thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khu vực chưa phụ trách:', error);
      res.status(error.code === 'NOT_FOUND' ? 404 : 500).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy danh sách khu vực chưa phụ trách'
      });
    }
  },

  // PUT /api/nhan-vien/:id/khu-vuc - Cập nhật toàn bộ khu vực phụ trách
  updateKhuVucPhuTrach: async (req, res) => {
    try {
      const { id } = req.params;
      const { danhSachKhuVuc } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhân viên không được để trống'
        });
      }

      if (!danhSachKhuVuc || !Array.isArray(danhSachKhuVuc)) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách khu vực phải là một mảng'
        });
      }

      // Validate từng phần tử trong danh sách
      for (const item of danhSachKhuVuc) {
        if (!item.MaKhuVuc) {
          return res.status(400).json({
            success: false,
            message: 'Mã khu vực không được để trống'
          });
        }
      }

      const result = await NhanVienKhuVucService.updateKhuVucPhuTrach(parseInt(id), danhSachKhuVuc);
      
      res.json({
        success: true,
        message: 'Cập nhật khu vực phụ trách thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật khu vực phụ trách:', error);
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 
                        error.code === 'AREA_NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi cập nhật khu vực phụ trách'
      });
    }
  },

  // POST /api/nhan-vien/:id/khu-vuc - Thêm khu vực phụ trách mới
  themKhuVucPhuTrach: async (req, res) => {
    try {
      const { id } = req.params;
      const { danhSachKhuVuc } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Mã nhân viên không được để trống'
        });
      }

      if (!danhSachKhuVuc || !Array.isArray(danhSachKhuVuc)) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách khu vực phải là một mảng'
        });
      }

      // Validate từng phần tử trong danh sách
      for (const item of danhSachKhuVuc) {
        if (!item.MaKhuVuc) {
          return res.status(400).json({
            success: false,
            message: 'Mã khu vực không được để trống'
          });
        }
      }

      const result = await NhanVienKhuVucService.themKhuVucPhuTrach(parseInt(id), danhSachKhuVuc);
      
      res.status(201).json({
        success: true,
        message: 'Thêm khu vực phụ trách thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi thêm khu vực phụ trách:', error);
      const statusCode = error.code === 'NOT_FOUND' ? 404 : 
                        error.code === 'AREA_NOT_FOUND' ? 404 :
                        error.code === 'AREA_ALREADY_ASSIGNED' ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi thêm khu vực phụ trách'
      });
    }
  },

  // DELETE /api/nhan-vien/khu-vuc - Xóa khu vực phụ trách
  xoaKhuVucPhuTrach: async (req, res) => {
    try {
      const { danhSachMaNVKV } = req.body;
      
      if (!danhSachMaNVKV || !Array.isArray(danhSachMaNVKV)) {
        return res.status(400).json({
          success: false,
          message: 'Danh sách mã ID phải là một mảng'
        });
      }

      // Validate từng phần tử trong danh sách
      for (const MaNVKV of danhSachMaNVKV) {
        if (!MaNVKV || typeof MaNVKV !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Mã ID phải là số nguyên'
          });
        }
      }

      const result = await NhanVienKhuVucService.xoaKhuVucPhuTrach(danhSachMaNVKV);
      
      res.json({
        success: true,
        message: 'Xóa khu vực phụ trách thành công',
        data: result
      });
    } catch (error) {
      console.error('Lỗi khi xóa khu vực phụ trách:', error);
      const statusCode = error.code === 'RECORD_NOT_FOUND' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi xóa khu vực phụ trách'
      });
    }
  }
};

module.exports = NhanVienKhuVucController;
