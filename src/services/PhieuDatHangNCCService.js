const { 
  PhieuDatHangNCC, 
  CT_PhieuDatHangNCC, 
  NhanVien, 
  NhaCungCap, 
  TrangThaiDatHangNCC,
  ChiTietSanPham,
  SanPham,
  KichThuoc,
  Mau
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models/sequelize');


const PhieuDatHangNCCService = {
  create: async (data) => {
    // data: { NgayDat, MaTK, MaNCC, MaTrangThai, chiTiet: [{ MaCTSP, SoLuong, DonGia }] }
    // Lấy MaNV từ MaTK
    const nhanVien = await NhanVien.findOne({ where: { MaTK: data.MaTK } });
    if (!nhanVien) throw new Error('Không xác định được nhân viên lập phiếu');
    const MaNV = nhanVien.MaNV;
    if (!data.NgayDat || !MaNV || !data.MaNCC || !Array.isArray(data.chiTiet) || data.chiTiet.length === 0) {
      throw new Error('Thiếu thông tin phiếu đặt hàng hoặc chi tiết phiếu');
    }

    // Use transaction to ensure atomicity
    const transaction = await sequelize.transaction();
    
    try {
      // Generate unique MaPDH with format PO + auto-increment number
      const allPhieuPO = await PhieuDatHangNCC.findAll({
        where: {
          MaPDH: {
            [Op.like]: 'PO%'
          }
        },
        attributes: ['MaPDH'],
        transaction
      });

      let nextNumber = 1;
      if (allPhieuPO.length > 0) {
        const numbers = allPhieuPO.map(p => {
          const num = parseInt(p.MaPDH.replace('PO', ''));
          return isNaN(num) ? 0 : num;
        });
        nextNumber = Math.max(...numbers) + 1;
      }

      const MaPDH = `PO${nextNumber.toString().padStart(6, '0')}`;
      
      const phieu = await PhieuDatHangNCC.create({
        MaPDH: MaPDH,
        NgayDat: data.NgayDat,
        MaNV: MaNV,
        MaNCC: data.MaNCC,
        MaTrangThai: data.MaTrangThai,
      }, { transaction });

      for (const ct of data.chiTiet) {
        console.log('Chi tiết nhận được:', ct);
        
        let MaCTSP = ct.MaCTSP;
        
        // Nếu không có MaCTSP, tìm dựa trên MaSP, MaMau, MaKichThuoc
        if (!MaCTSP && ct.MaSP && ct.MaMau && ct.MaKichThuoc) {
          const chiTietSanPham = await ChiTietSanPham.findOne({
            where: {
              MaSP: ct.MaSP,
              MaMau: ct.MaMau,
              MaKichThuoc: ct.MaKichThuoc
            },
            transaction
          });
          
          if (!chiTietSanPham) {
            throw new Error(`Không tìm thấy chi tiết sản phẩm với MaSP: ${ct.MaSP}, MaMau: ${ct.MaMau}, MaKichThuoc: ${ct.MaKichThuoc}`);
          }
          
          MaCTSP = chiTietSanPham.MaCTSP;
        }
        
        if (!MaCTSP || !ct.SoLuong || !ct.DonGia) {
          throw new Error('Chi tiết phiếu đặt hàng thiếu trường bắt buộc');
        }
        if (ct.SoLuong <= 0) throw new Error('Số lượng phải lớn hơn 0');
        if (ct.DonGia <= 0) throw new Error('Đơn giá phải lớn hơn 0');
        
        await CT_PhieuDatHangNCC.create({
          MaPDH: MaPDH,
          MaCTSP: MaCTSP,
          SoLuong: ct.SoLuong,
          DonGia: ct.DonGia,
        }, { transaction });
      }

      await transaction.commit();
      return phieu;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  getAll: async () => {
    return await PhieuDatHangNCC.findAll({ 
      include: [
        { 
          model: CT_PhieuDatHangNCC,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                { model: SanPham },
                { model: KichThuoc },
                { model: Mau }
              ]
            }
          ]
        },
        { model: NhanVien },
        { model: NhaCungCap },
        { model: TrangThaiDatHangNCC }
      ]
    });
  },
  
  getById: async (id) => {
    return await PhieuDatHangNCC.findByPk(id, { 
      include: [
        { 
          model: CT_PhieuDatHangNCC,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                { model: SanPham },
                { model: KichThuoc },
                { model: Mau }
              ]
            }
          ]
        },
        { model: NhanVien },
        { model: NhaCungCap },
        { model: TrangThaiDatHangNCC }
      ]
    });
  },
  
  updateStatus: async (id, statusId) => {
    const phieu = await PhieuDatHangNCC.findByPk(id);
    if (!phieu) return null;
    await phieu.update({ MaTrangThai: statusId });
    return phieu;
  },
  
  getAvailableForReceipt: async () => {
    // Get purchase orders that are approved but not yet fully received
    return await PhieuDatHangNCC.findAll({
      where: {
        MaTrangThai: {
          [Op.in]: [3, 4] // 3: APPROVED, 4: PARTIALLY_RECEIVED
        }  
      },
      include: [
        { 
          model: CT_PhieuDatHangNCC,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                { model: SanPham },
                { model: KichThuoc },
                { model: Mau }
              ]
            }
          ]
        },
        { model: NhanVien },
        { model: NhaCungCap },
        { model: TrangThaiDatHangNCC }
      ]
    });
  },
  
  getForReceipt: async (id) => {
    const phieu = await PhieuDatHangNCC.findByPk(id, {
      include: [
        { 
          model: CT_PhieuDatHangNCC,
          include: [
            {
              model: ChiTietSanPham,
              include: [
                { model: SanPham },
                { model: KichThuoc },
                { model: Mau }
              ]
            }
          ]
        },
        { model: NhanVien },
        { model: NhaCungCap },
        { model: TrangThaiDatHangNCC }
      ]
    });
    
    if (!phieu) return null;
    
    // Check if this purchase order is approved
    if (phieu.MaTrangThai !== 3 && phieu.MaTrangThai !== 4) {
      throw new Error('Phiếu đặt hàng chưa được duyệt');
    }
    
    return phieu;
  },
};

module.exports = PhieuDatHangNCCService; 