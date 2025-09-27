const { NhanVien, KhuVuc, NhanVien_KhuVuc, sequelize } = require('../models');
const { Op } = require('sequelize');

const NhanVienKhuVucService = {
  // Lấy danh sách khu vực phụ trách của nhân viên
  getKhuVucPhuTrach: async (MaNV) => {
    try {
      const nhanVien = await NhanVien.findByPk(MaNV, {
        attributes: ['MaNV', 'TenNV'],
        include: [
          {
            model: KhuVuc,
            as: 'KhuVucPhuTrach',
            attributes: ['MaKhuVuc', 'TenKhuVuc'],
            through: { 
              attributes: ['MaNVKV','NgayBatDau', 'NgayTao']
            },
            required: false
          }
        ]
      });

      if (!nhanVien) {
        throw { message: 'Không tìm thấy nhân viên', code: 'NOT_FOUND' };
      }

      return {
        MaNV: nhanVien.MaNV,
        TenNV: nhanVien.TenNV,
        KhuVucPhuTrach: nhanVien.KhuVucPhuTrach.map(kv => ({
          MaNVKV: kv.NhanVien_KhuVuc.MaNVKV,
          MaKhuVuc: kv.MaKhuVuc,
          TenKhuVuc: kv.TenKhuVuc,
          NgayBatDau: kv.NhanVien_KhuVuc.NgayBatDau,
          NgayTao: kv.NhanVien_KhuVuc.NgayTao
        }))
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khu vực phụ trách:', error);
      throw error;
    }
  },

  // Lấy danh sách khu vực mà nhân viên chưa phụ trách
  getKhuVucChuaPhuTrach: async (MaNV) => {
    try {
      // Kiểm tra nhân viên có tồn tại không
      const nhanVien = await NhanVien.findByPk(MaNV, {
        attributes: ['MaNV', 'TenNV']
      });

      if (!nhanVien) {
        throw { message: 'Không tìm thấy nhân viên', code: 'NOT_FOUND' };
      }

      // Lấy danh sách ID khu vực mà nhân viên đang phụ trách
      const khuVucDangPhuTrach = await NhanVien_KhuVuc.findAll({
        where: { 
          MaNV,
          [Op.or]: [
            { NgayBatDau: null }, 
            { NgayBatDau: { [Op.lte]: new Date() } }
          ]
        },
        attributes: ['MaKhuVuc']
      });

      const danhSachMaKhuVucDangPhuTrach = khuVucDangPhuTrach.map(item => item.MaKhuVuc);

      // Lấy tất cả khu vực mà nhân viên chưa phụ trách
      const khuVucChuaPhuTrach = await KhuVuc.findAll({
        where: {
          MaKhuVuc: {
            [Op.notIn]: danhSachMaKhuVucDangPhuTrach
          }
        },
        attributes: ['MaKhuVuc', 'TenKhuVuc'],
        order: [['TenKhuVuc', 'ASC']]
      });

      return {
        MaNV: nhanVien.MaNV,
        TenNV: nhanVien.TenNV,
        KhuVucChuaPhuTrach: khuVucChuaPhuTrach.map(kv => ({
          MaKhuVuc: kv.MaKhuVuc,
          TenKhuVuc: kv.TenKhuVuc
        })),
        TongSoKhuVucChuaPhuTrach: khuVucChuaPhuTrach.length
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khu vực chưa phụ trách:', error);
      throw error;
    }
  },

  // Cập nhật khu vực phụ trách của nhân viên
  updateKhuVucPhuTrach: async (MaNV, danhSachKhuVuc) => {
    const t = await sequelize.transaction();
    try {
      // Kiểm tra nhân viên có tồn tại không
      const nhanVien = await NhanVien.findByPk(MaNV);
      if (!nhanVien) {
        throw { message: 'Không tìm thấy nhân viên', code: 'NOT_FOUND' };
      }

      // Xóa tất cả khu vực phụ trách hiện tại
      await NhanVien_KhuVuc.destroy({
        where: { MaNV },
        transaction: t
      });

      // Thêm lại các khu vực mới
      if (danhSachKhuVuc && Array.isArray(danhSachKhuVuc)) {
        for (const item of danhSachKhuVuc) {
          const { MaKhuVuc, NgayBatDau } = item;
          
          // Kiểm tra khu vực có tồn tại không
          const khuVuc = await KhuVuc.findByPk(MaKhuVuc);
          if (!khuVuc) {
            throw { message: `Không tìm thấy khu vực với mã: ${MaKhuVuc}`, code: 'AREA_NOT_FOUND' };
          }

          // Tạo bản ghi mới
          await NhanVien_KhuVuc.create({
            MaNV,
            MaKhuVuc,
            NgayBatDau: NgayBatDau ? new Date(NgayBatDau) : new Date(),
            NgayTao: new Date()
          }, { transaction: t });
        }
      }

      await t.commit();

      // Trả về danh sách khu vực đã cập nhật
      return await NhanVienKhuVucService.getKhuVucPhuTrach(MaNV);
    } catch (error) {
      await t.rollback();
      console.error('Lỗi khi cập nhật khu vực phụ trách:', error);
      throw error;
    }
  },

  // Thêm khu vực phụ trách mới cho nhân viên
  themKhuVucPhuTrach: async (MaNV, danhSachKhuVuc) => {
    const t = await sequelize.transaction();
    try {
      // Kiểm tra nhân viên có tồn tại không
      const nhanVien = await NhanVien.findByPk(MaNV);
      if (!nhanVien) {
        throw { message: 'Không tìm thấy nhân viên', code: 'NOT_FOUND' };
      }

      const results = [];

      if (danhSachKhuVuc && Array.isArray(danhSachKhuVuc)) {
        for (const item of danhSachKhuVuc) {
          const { MaKhuVuc, NgayBatDau } = item;
          
          // Kiểm tra khu vực có tồn tại không
          const khuVuc = await KhuVuc.findByPk(MaKhuVuc);
          if (!khuVuc) {
            throw { message: `Không tìm thấy khu vực với mã: ${MaKhuVuc}`, code: 'AREA_NOT_FOUND' };
          }

          // Kiểm tra xem nhân viên đã phụ trách khu vực này chưa
          const existing = await NhanVien_KhuVuc.findOne({
            where: { MaNV, MaKhuVuc },
            transaction: t
          });

          if (existing) {
            throw { message: `Nhân viên đã phụ trách khu vực ${khuVuc.TenKhuVuc}`, code: 'AREA_ALREADY_ASSIGNED' };
          }

          // Tạo bản ghi mới
          const newRecord = await NhanVien_KhuVuc.create({
            MaNV,
            MaKhuVuc,
            NgayBatDau: NgayBatDau ? new Date(NgayBatDau) : new Date(),
            NgayTao: new Date()
          }, { transaction: t });

          results.push({
            MaKhuVuc,
            TenKhuVuc: khuVuc.TenKhuVuc,
            NgayBatDau: newRecord.NgayBatDau,
            NgayTao: newRecord.NgayTao
          });
        }
      }

      await t.commit();
      return results;
    } catch (error) {
      await t.rollback();
      console.error('Lỗi khi thêm khu vực phụ trách:', error);
      throw error;
    }
  },

  // Xóa khu vực phụ trách của nhân viên
  xoaKhuVucPhuTrach: async (danhSachMaNVKV) => {
    const t = await sequelize.transaction();
    try {
      const results = [];

      if (danhSachMaNVKV && Array.isArray(danhSachMaNVKV)) {
        for (const MaNVKV of danhSachMaNVKV) {
          
          // Tìm bản ghi cần xóa
          const record = await NhanVien_KhuVuc.findOne({
            where: { MaNVKV },
            include: [
              { model: NhanVien, attributes: ['TenNV'] },
              { model: KhuVuc, attributes: ['TenKhuVuc'] }
            ],
            transaction: t
          });

          if (!record) {
            throw { 
              message: `Không tìm thấy bản ghi phụ trách với ID: ${MaNVKV}`, 
              code: 'RECORD_NOT_FOUND' 
            };
          }

          // Xóa bản ghi
          await record.destroy({ transaction: t });

          results.push({
            MaNVKV,
            MaNV: record.MaNV,
            MaKhuVuc: record.MaKhuVuc,
            TenNV: record.NhanVien?.TenNV,
            TenKhuVuc: record.KhuVuc?.TenKhuVuc,
            message: 'Đã xóa thành công'
          });
        }
      }

      await t.commit();
      return results;
    } catch (error) {
      await t.rollback();
      console.error('Lỗi khi xóa khu vực phụ trách:', error);
      throw error;
    }
  }
};

module.exports = NhanVienKhuVucService;
