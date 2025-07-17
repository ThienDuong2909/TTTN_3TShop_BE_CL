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
const { v4: uuidv4 } = require('uuid');

const PhieuDatHangNCCService = {
  create: async (data) => {
    // data: { NgayDat, MaNV, MaNCC, MaTrangThai, chiTiet: [{ MaCTSP, SoLuong, DonGia }] }
    if (!data.NgayDat || !data.MaNV || !data.MaNCC || !Array.isArray(data.chiTiet) || data.chiTiet.length === 0) {
      throw new Error('Thiếu thông tin phiếu đặt hàng hoặc chi tiết phiếu');
    }
    const MaPDH = uuidv4();
    const phieu = await PhieuDatHangNCC.create({
      MaPDH,
      NgayDat: data.NgayDat,
      MaNV: data.MaNV,
      MaNCC: data.MaNCC,
      MaTrangThai: data.MaTrangThai,
    });
    for (const ct of data.chiTiet) {
      if (!ct.MaCTSP || !ct.SoLuong || !ct.DonGia) {
        throw new Error('Chi tiết phiếu đặt hàng thiếu trường bắt buộc');
      }
      if (ct.SoLuong <= 0) throw new Error('Số lượng phải lớn hơn 0');
      if (ct.DonGia <= 0) throw new Error('Đơn giá phải lớn hơn 0');
      await CT_PhieuDatHangNCC.create({
        MaPDH,
        MaCTSP: ct.MaCTSP,
        SoLuong: ct.SoLuong,
        DonGia: ct.DonGia,
      });
    }
    return phieu;
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
        MaTrangThai: 2 // Assuming 2 is "Approved" status
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
    if (phieu.MaTrangThai !== 2) {
      throw new Error('Phiếu đặt hàng chưa được duyệt');
    }
    
    return phieu;
  },
};

module.exports = PhieuDatHangNCCService; 