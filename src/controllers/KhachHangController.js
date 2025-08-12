const KhachHangService = require("../services/KhachHangService");
const response = require("../utils/response");

const KhachHangController = {
  updateProfile: async (req, res) => {
    try {
      const { maKH } = req.params;
      const { TenKH, DiaChi, SDT, CCCD, NgaySinh, GioiTinh } = req.body;

      if (!TenKH) {
        return response.error(
          res,
          null,
          "Tên khách hàng không được để trống",
          400
        );
      }

      const affected = await KhachHangService.updateProfile(maKH, {
        TenKH,
        DiaChi,
        SDT,
        CCCD,
        NgaySinh,
        GioiTinh,
      });

      if (!affected) {
        return response.error(res, null, "Không tìm thấy khách hàng", 404);
      }

      return response.success(res, null, "Cập nhật thông tin thành công");
    } catch (err) {
      return response.error(
        res,
        null,
        err.message || "Lỗi khi cập nhật thông tin"
      );
    }
  },

  updateAvatar: async (req, res) => {
    try {
      const { maKH, AnhDaiDien } = req.body;

      if (!maKH) {
        return response.error(
          res,
          null,
          "Mã khách hàng không được để trống",
          400
        );
      }

      const affected = await KhachHangService.updateAvatar(maKH, AnhDaiDien);

      if (!affected) {
        return response.error(
          res,
          null,
          "Không thể cập nhật ảnh đại diện",
          400
        );
      }

      return response.success(
        res,
        { AnhDaiDien },
        "Cập nhật ảnh đại diện thành công"
      );
    } catch (err) {
      return response.error(
        res,
        null,
        err.message || "Lỗi khi cập nhật ảnh đại diện",
        400
      );
    }
  },
};

module.exports = KhachHangController;
