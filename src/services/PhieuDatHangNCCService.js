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
const EmailService = require('./EmailService');


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
    
    // Validate NgayKienNghiGiao if provided
    if (data.NgayKienNghiGiao) {
      const ngayDat = new Date(data.NgayDat);
      const ngayKienNghiGiao = new Date(data.NgayKienNghiGiao);
      
      if (ngayKienNghiGiao < ngayDat) {
        throw new Error('Ngày kiến nghị giao không thể trước ngày đặt hàng');
      }
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
        NgayKienNghiGiao: data.NgayKienNghiGiao,
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
    
    // Lưu trạng thái cũ để kiểm tra
    const oldStatus = phieu.MaTrangThai;
    
    // Cập nhật trạng thái mới
    await phieu.update({ MaTrangThai: statusId });
    
    // Nếu trạng thái thay đổi từ 1 (PENDING) sang 2 (APPROVED), gửi email
    let emailResult = null;
    if (oldStatus === 1 && statusId === 2) {
      try {
        // Lấy email nhà cung cấp từ database hoặc sử dụng email mặc định
        const supplierEmail = phieu.NhaCungCap.Email;
        
        // Gửi email với file Excel đính kèm
        emailResult = await EmailService.sendPurchaseOrderEmail(phieu, supplierEmail);
        
        console.log(`Đã gửi email phiếu đặt hàng ${phieu.MaPDH} đến ${supplierEmail}`);
      } catch (emailError) {
        console.error('Lỗi gửi email:', emailError);
        // Không throw error để không ảnh hưởng đến việc cập nhật trạng thái
      }
    }
    
    // Trả về kết quả bao gồm thông tin email và file Excel
    return {
      phieu: phieu,
      emailResult: emailResult
    };
    
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
  // Lấy trạng thái nhập hàng của từng sản phẩm trong phiếu đặt hàng NCC
  getReceivedStatusByPDH: async (maPDH) => {
    const { CT_PhieuDatHangNCC, ChiTietSanPham, SanPham, KichThuoc, Mau, PhieuNhap, CT_PhieuNhap } = require('../models');
    // Lấy chi tiết đặt hàng
    const chiTietDat = await CT_PhieuDatHangNCC.findAll({
      where: { MaPDH: maPDH },
      include: [
        {
          model: ChiTietSanPham,
          include: [
            { model: SanPham, attributes: ['MaSP', 'TenSP'] },
            { model: KichThuoc, attributes: ['TenKichThuoc'] },
            { model: Mau, attributes: ['TenMau', 'MaHex'] },
          ]
        }
      ]
    });
    // Lấy tất cả phiếu nhập liên quan đến phiếu đặt này
    const phieuNhapList = await PhieuNhap.findAll({
      where: { MaPDH: maPDH },
      attributes: ['SoPN']
    });
    const soPNs = phieuNhapList.map(pn => pn.SoPN);
    // Lấy tổng số lượng đã nhập cho từng MaCTSP
    let nhapMap = {};
    if (soPNs.length > 0) {
      const nhapList = await CT_PhieuNhap.findAll({
        where: { SoPN: soPNs },
        attributes: ['MaCTSP', [require('sequelize').fn('SUM', require('sequelize').col('SoLuong')), 'SoLuongNhap']],
        group: ['MaCTSP']
      });
      nhapList.forEach(item => {
        nhapMap[item.MaCTSP] = Number(item.get('SoLuongNhap')) || 0;
      });
    }
    // Gộp kết quả
    const result = chiTietDat.map(ct => {
      const ctsp = ct.ChiTietSanPham;
      return {
        MaCTSP: ct.MaCTSP,
        MaSP: ctsp?.SanPham?.MaSP,
        TenSP: ctsp?.SanPham?.TenSP,
        MaKichThuoc: ctsp?.MaKichThuoc,
        TenKichThuoc: ctsp?.KichThuoc?.TenKichThuoc,
        MaMau: ctsp?.MaMau,
        TenMau: ctsp?.Mau?.TenMau,
        MaHex: ctsp?.Mau?.MaHex,
        SoLuongDat: ct.SoLuong,
        SoLuongNhap: nhapMap[ct.MaCTSP] || 0,
        SoLuongConLai: Math.max(0, ct.SoLuong - (nhapMap[ct.MaCTSP] || 0))
      };
    });
    return result;
  },
  
  // Cập nhật phiếu đặt hàng NCC
  update: async (id, data) => {
    // Validate input data
    if (!data.NgayDat || !data.MaNCC || !Array.isArray(data.chiTiet) || data.chiTiet.length === 0) {
      throw new Error('Thiếu thông tin phiếu đặt hàng hoặc chi tiết phiếu');
    }
    
    // Validate NgayKienNghiGiao if provided
    if (data.NgayKienNghiGiao) {
      const ngayDat = new Date(data.NgayDat);
      const ngayKienNghiGiao = new Date(data.NgayKienNghiGiao);
      
      if (ngayKienNghiGiao < ngayDat) {
        throw new Error('Ngày kiến nghị giao không thể trước ngày đặt hàng');
      }
    }

    // Use transaction to ensure atomicity
    const transaction = await sequelize.transaction();
    
    try {
      // Find existing purchase order
      const phieu = await PhieuDatHangNCC.findByPk(id, { transaction });
      if (!phieu) {
        await transaction.rollback();
        return null;
      }

      // Check if purchase order can be updated (not in certain statuses)
      if (phieu.MaTrangThai === 3 || phieu.MaTrangThai === 4) {
        await transaction.rollback();
        throw new Error('Không thể cập nhật phiếu đặt hàng đã được duyệt');
      }

      // Update main purchase order
      await phieu.update({
        NgayDat: data.NgayDat,
        NgayKienNghiGiao: data.NgayKienNghiGiao,
        MaNCC: data.MaNCC,
        MaTrangThai: data.MaTrangThai || phieu.MaTrangThai,
        GhiChu: data.GhiChu || phieu.GhiChu
      }, { transaction });

      // Delete existing details
      await CT_PhieuDatHangNCC.destroy({
        where: { MaPDH: id },
        transaction
      });

      // Create new details
      for (const ct of data.chiTiet) {
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
          MaPDH: id,
          MaCTSP: MaCTSP,
          SoLuong: ct.SoLuong,
          DonGia: ct.DonGia,
          ThanhTien: ct.SoLuong * ct.DonGia
        }, { transaction });
      }

      await transaction.commit();

      // Return updated purchase order with details
      return await PhieuDatHangNCCService.getById(id);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  
  updateNgayKienNghiGiao: async (id, ngayKienNghiGiao) => {
    const phieu = await PhieuDatHangNCC.findByPk(id);
    
    if (!phieu) return null;
    
    // Validate ngày kiến nghị giao
    if (ngayKienNghiGiao) {
      const ngayDat = new Date(phieu.NgayDat);
      const ngayKienNghiGiaoDate = new Date(ngayKienNghiGiao);
      
      if (ngayKienNghiGiaoDate < ngayDat) {
        throw new Error('Ngày kiến nghị giao không thể trước ngày đặt hàng');
      }
    }
    
    // Cập nhật ngày kiến nghị giao
    await phieu.update({ NgayKienNghiGiao: ngayKienNghiGiao });
    
    return phieu;
  },
};

module.exports = PhieuDatHangNCCService; 