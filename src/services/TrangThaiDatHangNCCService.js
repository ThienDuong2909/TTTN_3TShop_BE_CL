const { TrangThaiDatHangNCC } = require('../models');

const TrangThaiDatHangNCCService = {
  getAll: async () => {
    return await TrangThaiDatHangNCC.findAll();
  },
  
  getById: async (id) => {
    return await TrangThaiDatHangNCC.findByPk(id);
  },
  
  create: async (data) => {
    return await TrangThaiDatHangNCC.create(data);
  },
  
  update: async (id, data) => {
    const trangThai = await TrangThaiDatHangNCC.findByPk(id);
    if (!trangThai) return null;
    await trangThai.update(data);
    return trangThai;
  },
  
  delete: async (id) => {
    const trangThai = await TrangThaiDatHangNCC.findByPk(id);
    if (!trangThai) return null;
    await trangThai.destroy();
    return trangThai;
  },
};

module.exports = TrangThaiDatHangNCCService; 