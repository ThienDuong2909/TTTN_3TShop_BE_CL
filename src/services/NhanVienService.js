const { NhanVien, TaiKhoan, VaiTro, BoPhan, NhanVien_BoPhan, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

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
    const t = await sequelize.transaction();
    try {
      const { Email, Password, TenNV, NgaySinh, DiaChi, Luong, departments } = data;
      // Kiểm tra trùng email
      const existed = await TaiKhoan.findOne({ where: { Email } });
      if (existed) {
        throw { message: 'Email đã tồn tại', code: 'EMAIL_EXISTS' };
      }
      // Tạo tài khoản
      const hashedPassword = await bcrypt.hash(Password, 10);
      const taiKhoan = await TaiKhoan.create({
        Email,
        Password: hashedPassword,
        MaVaiTro: 2, // Staff
      }, { transaction: t });
      // Tạo nhân viên
      const nhanVien = await NhanVien.create({
        TenNV,
        NgaySinh,
        DiaChi,
        Luong,
        MaTK: taiKhoan.MaTK,
      }, { transaction: t });
      // Nếu có danh sách bộ phận, tạo bản ghi trung gian
      if (departments && Array.isArray(departments)) {
        for (const dep of departments) {
          await NhanVien_BoPhan.create({
            MaNV: nhanVien.MaNV,
            MaBoPhan: dep.MaBoPhan,
            NgayBatDau: dep.NgayBatDau,
            NgayKetThuc: dep.NgayKetThuc || null,
            ChucVu: dep.ChucVu || null,
            TrangThai: dep.TrangThai || 'DANGLAMVIEC',
            GhiChu: dep.GhiChu || null
          }, { transaction: t });
        }
      }
      await t.commit();
      // Trả về nhân viên vừa tạo kèm tài khoản và bộ phận
      return await NhanVien.findByPk(nhanVien.MaNV, {
        include: [
          { model: TaiKhoan, include: [{ model: VaiTro }] },
          { model: NhanVien_BoPhan, include: [{ model: BoPhan }] }
        ]
      });
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },
  
  update: async (id, data) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;

    // Nếu có Email mới, cập nhật vào TaiKhoan
    if (data.Email) {
      // Kiểm tra trùng email với tài khoản khác
      const existed = await TaiKhoan.findOne({ where: { Email: data.Email, MaTK: { [Op.ne]: nhanVien.MaTK } } });
      if (existed) {
        throw { message: 'Email đã tồn tại', code: 'EMAIL_EXISTS' };
      }
      await TaiKhoan.update(
        { Email: data.Email },
        { where: { MaTK: nhanVien.MaTK } }
      );
    }

    // Cập nhật các trường khác của nhân viên
    const updateData = { ...data };
    delete updateData.Email; // Không update Email vào bảng NhanVien
    await nhanVien.update(updateData);

    // Trả về nhân viên đã cập nhật (kèm tài khoản)
    return await NhanVien.findByPk(id, {
      include: [
        { model: TaiKhoan, include: [{ model: VaiTro }] },
        { model: NhanVien_BoPhan, include: [{ model: BoPhan }] }
      ]
    });
  },
  
  delete: async (id) => {
    const nhanVien = await NhanVien.findByPk(id);
    if (!nhanVien) return null;
    await nhanVien.destroy();
    return nhanVien;
  },

  chuyenBoPhan: async (MaNV, { MaBoPhanMoi, NgayChuyen, ChucVu, GhiChu }) => {
    const t = await sequelize.transaction();
    try {
      // 1. Tìm bản ghi bộ phận hiện tại
      const current = await NhanVien_BoPhan.findOne({
        where: { MaNV, TrangThai: 'DANGLAMVIEC' },
        order: [['NgayBatDau', 'DESC']],
        transaction: t
      });
      if (!current) throw { message: 'Nhân viên chưa thuộc bộ phận nào đang làm việc', code: 'NO_ACTIVE_DEPARTMENT' };
      // 2. Cập nhật kết thúc bộ phận cũ
      await current.update({
        NgayKetThuc: NgayChuyen,
        TrangThai: 'DAKETTHUC'
      }, { transaction: t });
      // 3. Tạo bản ghi bộ phận mới
      const newDep = await NhanVien_BoPhan.create({
        MaNV,
        MaBoPhan: MaBoPhanMoi,
        NgayBatDau: NgayChuyen,
        ChucVu: ChucVu || null,
        TrangThai: 'DANGLAMVIEC',
        GhiChu: GhiChu || null
      }, { transaction: t });
      await t.commit();
      return newDep;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  getLichSuBoPhan: async (MaNV) => {
    return await NhanVien_BoPhan.findAll({
      where: { MaNV },
      include: [{ model: BoPhan }],
      order: [['NgayBatDau', 'ASC']]
    });
  },
};

module.exports = NhanVienService; 