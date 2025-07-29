const NhanVienService = require('../services/NhanVienService');
const response = require('../utils/response');

const NhanVienController = {
  getAll: async (req, res) => {
    try {
      const data = await NhanVienService.getAll();
      return response.success(res, data, 'Lấy danh sách nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getById: async (req, res) => {
    try {
      const data = await NhanVienService.getById(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy nhân viên');
      return response.success(res, data, 'Lấy nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  getProfile: async (req, res) => {
    try {
      // Assuming we have user info from JWT middleware
      const taiKhoanId = req.user?.id || req.user?.MaTK;
      if (!taiKhoanId) {
        return response.error(res, null, 'Chưa đăng nhập', 401);
      }
      
      const data = await NhanVienService.getByTaiKhoanId(taiKhoanId);
      if (!data) return response.notFound(res, 'Không tìm thấy thông tin nhân viên');
      return response.success(res, data, 'Lấy thông tin nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
  
  create: async (req, res) => {
    try {
      const data = await NhanVienService.create(req.body);
      return response.success(res, data, 'Tạo nhân viên thành công', 201);
    } catch (err) {
      if (err && err.code === 'EMAIL_EXISTS') {
        return response.error(res, null, 'Email đã tồn tại', 409);
      }
      return response.error(res, err);
    }
  },
  
  update: async (req, res) => {
    try {
      // Nếu có Email, kiểm tra và cập nhật vào TaiKhoan
      const data = await NhanVienService.update(req.params.id, req.body);
      if (!data) return response.notFound(res, 'Không tìm thấy nhân viên');
      return response.success(res, data, 'Cập nhật nhân viên thành công');
    } catch (err) {
      if (err && err.code === 'EMAIL_EXISTS') {
        return response.error(res, null, 'Email đã tồn tại', 409);
      }
      return response.error(res, err);
    }
  },
  
  delete: async (req, res) => {
    try {
      const data = await NhanVienService.delete(req.params.id);
      if (!data) return response.notFound(res, 'Không tìm thấy nhân viên');
      return response.success(res, data, 'Xóa nhân viên thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  chuyenBoPhan: async (req, res) => {
    try {
      const MaNV = req.body.MaNV;
      const data = await NhanVienService.chuyenBoPhan(MaNV, req.body);
      return response.success(res, data, 'Chuyển bộ phận thành công');
    } catch (err) {
      if (err && err.code === 'NO_ACTIVE_DEPARTMENT') {
        return response.error(res, null, 'Nhân viên chưa thuộc bộ phận nào đang làm việc', 400);
      }
      return response.error(res, err);
    }
  },

  getLichSuBoPhan: async (req, res) => {
    try {
      const MaNV = req.params.id;
      const data = await NhanVienService.getLichSuBoPhan(MaNV);
      return response.success(res, data, 'Lấy lịch sử bộ phận thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  // Tìm nhân viên giao hàng tối ưu cho đơn hàng
  findOptimalDeliveryStaff: async (req, res) => {
    try {
      const { diaChi } = req.body;
      if (!diaChi) {
        return response.error(res, null, 'Địa chỉ giao hàng là bắt buộc', 400);
      }
      
      const data = await NhanVienService.findOptimalDeliveryStaff(diaChi);
      return response.success(res, data, 'Tìm nhân viên giao hàng tối ưu thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  // Lấy danh sách nhân viên giao hàng khả dụng
  getAvailableDeliveryStaff: async (req, res) => {
    try {
      const { diaChi } = req.body;
      if (!diaChi) {
        return response.error(res, null, 'Địa chỉ giao hàng là bắt buộc', 400);
      }
      
      const data = await NhanVienService.getAvailableDeliveryStaff(diaChi);
      return response.success(res, data, 'Lấy danh sách nhân viên giao hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  // Lấy thống kê công việc nhân viên giao hàng
  getDeliveryStaffWorkload: async (req, res) => {
    try {
      const MaNV = req.params.id || null;
      const data = await NhanVienService.getDeliveryStaffWorkload(MaNV);
      return response.success(res, data, 'Lấy thống kê công việc thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  // Phân công đơn hàng cho nhân viên giao hàng
  assignOrderToDeliveryStaff: async (req, res) => {
    try {
      const { MaDDH, MaNV, GhiChu } = req.body;
      
      if (!MaDDH || !MaNV) {
        return response.error(res, null, 'Mã đơn hàng và mã nhân viên là bắt buộc', 400);
      }
      
      const data = await NhanVienService.assignOrderToDeliveryStaff(MaDDH, MaNV, GhiChu);
      return response.success(res, data, 'Phân công đơn hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  getByBoPhan: async (req, res) => {
    try {
      const maBoPhan = req.params.maBoPhan;
      const data = await NhanVienService.getByBoPhan(maBoPhan);
      return response.success(res, data, 'Lấy danh sách nhân viên theo bộ phận thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },

  getNhanVienGiaoHang: async (req, res) => {
    try {
      // Mã bộ phận Giao hàng là 11
      const data = await NhanVienService.getByBoPhan(11);
      return response.success(res, data, 'Lấy danh sách nhân viên giao hàng thành công');
    } catch (err) {
      return response.error(res, err);
    }
  },
};

module.exports = NhanVienController;