const { TrangThaiDH } = require('../models');

const TrangThaiDHService = {
  // Lấy tất cả trạng thái đơn hàng
  getAll: async () => {
    return await TrangThaiDH.findAll({
      order: [['MaTTDH', 'ASC']]
    });
  },

  // Lấy trạng thái đơn hàng theo ID
  getById: async (id) => {
    return await TrangThaiDH.findByPk(id);
  },

  // Tạo trạng thái đơn hàng mới
  create: async (data) => {
    const { TrangThai, Note } = data;
    
    if (!TrangThai) {
      throw new Error('Tên trạng thái không được để trống');
    }

    return await TrangThaiDH.create({
      TrangThai,
      Note,
      ThoiGianCapNhat: new Date()
    });
  },

  // Cập nhật trạng thái đơn hàng
  update: async (id, data) => {
    const trangThai = await TrangThaiDH.findByPk(id);
    if (!trangThai) return null;

    const { TrangThai, Note } = data;
    
    const updateData = {
      ThoiGianCapNhat: new Date()
    };
    
    if (TrangThai) updateData.TrangThai = TrangThai;
    if (Note !== undefined) updateData.Note = Note;

    await trangThai.update(updateData);
    return trangThai;
  },

  // Xóa trạng thái đơn hàng
  delete: async (id) => {
    const trangThai = await TrangThaiDH.findByPk(id);
    if (!trangThai) return null;

    await trangThai.destroy();
    return trangThai;
  }
};

module.exports = TrangThaiDHService;
