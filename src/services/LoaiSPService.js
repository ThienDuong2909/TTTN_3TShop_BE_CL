const { LoaiSP } = require('../models');

const LoaiSPService = {
  // Lấy tất cả loại sản phẩm
  async getAll() {
    return await LoaiSP.findAll();
  },

  // Lấy loại sản phẩm theo id
  async getById(id) {
    return await LoaiSP.findByPk(id);
  },

  // Thêm loại sản phẩm mới
  async create(data) {
    return await LoaiSP.create(data);
  },

  // Cập nhật loại sản phẩm
  async update(id, data) {
    const loaiSP = await LoaiSP.findByPk(id);
    if (!loaiSP) return null;
    await loaiSP.update(data);
    return loaiSP;
  },

  // Xóa loại sản phẩm
  async delete(id) {
    const loaiSP = await LoaiSP.findByPk(id);
    if (!loaiSP) return null;
    await loaiSP.destroy();
    return true;
  },
};

module.exports = LoaiSPService;
