const { NhanVien, TaiKhoan, VaiTro, BoPhan, NhanVien_BoPhan } = require('../models');

const NhanVienService = {
  getAll: async () => {
    return await NhanVien.findAll({
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          include: [{ model: BoPhan }]
        }
      ]
    });
  },
  
  getById: async (id) => {
    return await NhanVien.findByPk(id, {
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          include: [{ model: BoPhan }]
        }
      ]
    });
  },
  
  getByTaiKhoanId: async (taiKhoanId) => {
    return await NhanVien.findOne({
      where: { MaTK: taiKhoanId },
      include: [
        {
          model: TaiKhoan,
          include: [{ model: VaiTro }]
        },
        {
          model: NhanVien_BoPhan,
          include: [{ model: BoPhan }]
        }
      ]
    });
  },
  
  create: async (data) => {
    return await NhanVien.create(data);
  },
  
  update: async (id, data) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;
    await nhanVien.update(data);
    return nhanVien;
  },
  
  delete: async (id) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;
    await nhanVien.destroy();
    return nhanVien;
  },
};

module.exports = NhanVienService; 