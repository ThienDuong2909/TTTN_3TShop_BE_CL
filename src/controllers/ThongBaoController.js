const ThongBaoService = require("../services/ThongBaoService");

class ThongBaoController {
  // Đăng ký thiết bị
  async registerDevice(req, res) {
    try {
      const { maNhanVien, maThietBi, nhaCungCap, nenTang, token } = req.body;

      // Validate dữ liệu đầu vào
      if (!maNhanVien || !maThietBi || !nhaCungCap || !nenTang || !token) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin bắt buộc",
        });
      }

      // Validate nhà cung cấp
      const validProviders = ["fcm", "expo", "apns"];
      if (!validProviders.includes(nhaCungCap)) {
        return res.status(400).json({
          success: false,
          message: "Nhà cung cấp không hợp lệ. Chỉ chấp nhận: fcm, expo, apns",
        });
      }

      const result = await ThongBaoService.registerDevice({
        maNhanVien,
        maThietBi,
        nhaCungCap,
        nenTang,
        token,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in registerDevice:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đăng ký thiết bị",
        error: error.message,
      });
    }
  }

  // Lấy danh sách thiết bị theo mã nhân viên
  async getDevicesByEmployee(req, res) {
    try {
      const { maNhanVien } = req.params;

      if (!maNhanVien) {
        return res.status(400).json({
          success: false,
          message: "Thiếu mã nhân viên",
        });
      }

      const result = await ThongBaoService.getDevicesByEmployee(maNhanVien);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getDevicesByEmployee:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách thiết bị",
        error: error.message,
      });
    }
  }

  // Xóa thiết bị
  async deleteDevice(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Thiếu ID thiết bị",
        });
      }

      const result = await ThongBaoService.deleteDevice(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in deleteDevice:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xóa thiết bị",
        error: error.message,
      });
    }
  }
}

module.exports = new ThongBaoController();
