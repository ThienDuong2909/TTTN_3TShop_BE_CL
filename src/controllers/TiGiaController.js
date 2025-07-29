const TiGiaService = require("../services/TiGiaService");
const response = require("../utils/response");

const TiGiaController = {
  create: async (req, res) => {
    try {
      const { GiaTri, NgayApDung } = req.body;
      if (!GiaTri || !NgayApDung)
        return response.error(res, null, "Thiếu thông tin");
      const data = await TiGiaService.create(GiaTri, NgayApDung);
      return response.success(res, data, "Thêm tỉ giá thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },

  update: async (req, res) => {
    try {
      const { MaTiGia } = req.params;
      const { GiaTri, NgayApDung } = req.body;
      if (!GiaTri || !NgayApDung)
        return response.error(res, null, "Thiếu thông tin");
      const affected = await TiGiaService.update(MaTiGia, GiaTri, NgayApDung);
      if (!affected) return response.error(res, null, "Không tìm thấy tỉ giá");
      return response.success(res, null, "Cập nhật tỉ giá thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },

  delete: async (req, res) => {
    try {
      const { MaTiGia } = req.params;
      const affected = await TiGiaService.delete(MaTiGia);
      if (!affected) return response.error(res, null, "Không tìm thấy tỉ giá");
      return response.success(res, null, "Xoá tỉ giá thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },

  getAll: async (req, res) => {
    try {
      const data = await TiGiaService.getAll();
      return response.success(res, data, "Lấy danh sách tỉ giá thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },

  getHieuLuc: async (req, res) => {
    try {
      const data = await TiGiaService.getHieuLuc();
      if (!data) return response.error(res, null, "Không có tỉ giá hiệu lực");
      return response.success(res, data, "Lấy tỉ giá hiệu lực thành công");
    } catch (err) {
      return response.error(res, err.message);
    }
  },
};

module.exports = TiGiaController;
