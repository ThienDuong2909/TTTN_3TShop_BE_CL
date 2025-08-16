const { KhuVuc, NhanVien_KhuVuc, NhanVien } = require('../models');
const { Op } = require('sequelize');

const KhuVucService = {
  // Lấy tất cả khu vực
  getAll: async () => {
    try {
      const khuVucs = await KhuVuc.findAll({
        order: [['MaKhuVuc', 'ASC']]
      });
      return khuVucs;
    } catch (error) {
      throw error;
    }
  },

  // Lấy khu vực theo mã
  getById: async (maKhuVuc) => {
    try {
      const khuVuc = await KhuVuc.findByPk(maKhuVuc);
      return khuVuc;
    } catch (error) {
      throw error;
    }
  },

  // Lấy khu vực với thông tin nhân viên phụ trách
  getAllWithStaff: async () => {
    try {
      const khuVucs = await KhuVuc.findAll({
        include: [{
          model: NhanVien,
          as: 'NhanVienPhuTrach',
          attributes: ['MaNV', 'TenNV'],
          through: { 
            attributes: ['NgayTao'],
            as: 'ThongTinPhanCong'
          }
        }],
        order: [['MaKhuVuc', 'ASC']]
      });

      return khuVucs.map(kv => ({
        MaKhuVuc: kv.MaKhuVuc,
        TenKhuVuc: kv.TenKhuVuc,
        SoNhanVienPhuTrach: kv.NhanVienPhuTrach?.length || 0,
        DanhSachNhanVien: kv.NhanVienPhuTrach?.map(nv => ({
          MaNV: nv.MaNV,
          TenNV: nv.TenNV,
          NgayPhanCong: nv.ThongTinPhanCong?.NgayTao
        })) || []
      }));
    } catch (error) {
      throw error;
    }
  },

  // Tạo khu vực mới
  create: async (data) => {
    try {
      const { MaKhuVuc, TenKhuVuc } = data;
      
      // Kiểm tra mã khu vực đã tồn tại chưa
      const existingKhuVuc = await KhuVuc.findByPk(MaKhuVuc);
      if (existingKhuVuc) {
        throw new Error('Mã khu vực đã tồn tại');
      }

      const newKhuVuc = await KhuVuc.create({
        MaKhuVuc,
        TenKhuVuc
      });

      return newKhuVuc;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật khu vực
  update: async (maKhuVuc, data) => {
    try {
      const { TenKhuVuc } = data;
      
      const khuVuc = await KhuVuc.findByPk(maKhuVuc);
      if (!khuVuc) {
        return null;
      }

      await khuVuc.update({ TenKhuVuc });
      return khuVuc;
    } catch (error) {
      throw error;
    }
  },

  // Xóa khu vực
  delete: async (maKhuVuc) => {
    try {
      const khuVuc = await KhuVuc.findByPk(maKhuVuc);
      if (!khuVuc) {
        return null;
      }

      // Kiểm tra xem có nhân viên nào đang phụ trách khu vực này không
      const assignedStaff = await NhanVien_KhuVuc.findOne({
        where: { MaKhuVuc: maKhuVuc }
      });

      if (assignedStaff) {
        throw new Error('Không thể xóa khu vực đang có nhân viên phụ trách');
      }

      await khuVuc.destroy();
      return { MaKhuVuc: maKhuVuc, TenKhuVuc: khuVuc.TenKhuVuc };
    } catch (error) {
      throw error;
    }
  },

  // Lấy khu vực có sẵn (chưa có nhân viên phụ trách)
  getAvailableAreas: async () => {
    try {
      const assignedAreas = await NhanVien_KhuVuc.findAll({
        attributes: ['MaKhuVuc'],
        group: ['MaKhuVuc']
      });

      const assignedAreaIds = assignedAreas.map(area => area.MaKhuVuc);

      const availableAreas = await KhuVuc.findAll({
        where: assignedAreaIds.length > 0 ? {
          MaKhuVuc: { [Op.notIn]: assignedAreaIds }
        } : {},
        order: [['MaKhuVuc', 'ASC']]
      });

      return availableAreas;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = KhuVucService;
