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
    // Tách bộ phận ra khỏi data
    const { departments, ...nhanVienData } = data;
    // Tạo nhân viên
    const nhanVien = await NhanVien.create(nhanVienData);
    // Nếu có danh sách bộ phận, tạo bản ghi trung gian với đầy đủ trường
    if (departments && Array.isArray(departments)) {
      for (const dep of departments) {
        // dep: { MaBoPhan, NgayBatDau, NgayKetThuc, ChucVu, TrangThai, GhiChu }
        await NhanVien_BoPhan.create({
          MaNV: nhanVien.MaNV,
          MaBoPhan: dep.MaBoPhan,
          NgayBatDau: dep.NgayBatDau,
          NgayKetThuc: dep.NgayKetThuc || null,
          ChucVu: dep.ChucVu || null,
          TrangThai: dep.TrangThai || 'DANGLAMVIEC',
          GhiChu: dep.GhiChu || null
        });
      }
    }
    // Trả về nhân viên vừa tạo kèm các bộ phận
    return await NhanVien.findByPk(nhanVien.MaNV, {
      include: [
        { model: TaiKhoan, include: [{ model: VaiTro }] },
        { model: NhanVien_BoPhan, include: [{ model: BoPhan }] }
      ]
    });
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