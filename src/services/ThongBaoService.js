const ThongBao = require("../models/ThongBao");
const { Op } = require("sequelize");

class ThongBaoService {
  // Đăng ký hoặc cập nhật thiết bị
  async registerDevice(deviceData) {
    try {
      const { maNhanVien, maThietBi, nhaCungCap, nenTang, token } = deviceData;
      console.log("Registering device with data:", deviceData);

      // Kiểm tra xem thiết bị đã tồn tại chưa
      const existingDevice = await ThongBao.findOne({
        where: {
          MaNhanVien: maNhanVien,
          MaThietBi: maThietBi,
        },
      });

      if (existingDevice) {
        // Cập nhật token và thông tin thiết bị nếu đã tồn tại
        await existingDevice.update({
          NhaCungCap: nhaCungCap,
          NenTang: nenTang,
          token: token,
        });

        return {
          success: true,
          message: "Cập nhật thiết bị thành công",
          data: existingDevice,
        };
      } else {
        // Tạo mới nếu chưa tồn tại
        const newDevice = await ThongBao.create({
          MaNhanVien: maNhanVien,
          MaThietBi: maThietBi,
          NhaCungCap: nhaCungCap,
          NenTang: nenTang,
          token: token,
        });

        return {
          success: true,
          message: "Đăng ký thiết bị thành công",
          data: newDevice,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách thiết bị theo mã nhân viên
  async getDevicesByEmployee(maNhanVien) {
    try {
      const devices = await ThongBao.findAll({
        where: {
          MaNhanVien: maNhanVien,
        },
      });

      return {
        success: true,
        data: devices,
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả token của một nhân viên (để gửi thông báo)
  async getTokensByEmployee(maNhanVien) {
    try {
      const devices = await ThongBao.findAll({
        where: {
          MaNhanVien: maNhanVien,
        },
        attributes: ["token", "NhaCungCap", "NenTang"],
      });

      return devices.map((device) => ({
        token: device.token,
        provider: device.NhaCungCap,
        platform: device.NenTang,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Xóa thiết bị
  async deleteDevice(id) {
    try {
      const device = await ThongBao.findByPk(id);

      if (!device) {
        return {
          success: false,
          message: "Không tìm thấy thiết bị",
        };
      }

      await device.destroy();

      return {
        success: true,
        message: "Xóa thiết bị thành công",
      };
    } catch (error) {
      throw error;
    }
  }

  // Xóa thiết bị theo mã thiết bị và mã nhân viên
  async deleteDeviceByMaThietBi(maNhanVien, maThietBi) {
    try {
      const result = await ThongBao.destroy({
        where: {
          MaNhanVien: maNhanVien,
          MaThietBi: maThietBi,
        },
      });

      if (result === 0) {
        return {
          success: false,
          message: "Không tìm thấy thiết bị",
        };
      }

      return {
        success: true,
        message: "Xóa thiết bị thành công",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ThongBaoService();
