const { 
  PhieuNhap, 
  CT_PhieuNhap, 
  ChiTietSanPham, 
  PhieuDatHangNCC,
  CT_PhieuDatHangNCC,
  NhanVien,
  SanPham,
  KichThuoc,
  NhaCungCap,
  Mau 
} = require('../models');
const { v4: uuidv4 } = require('uuid');
const xlsx = require('xlsx');
const fs = require('fs');

const PhieuNhapService = {
  create: async (data) => {
    const nhanVien = await NhanVien.findOne({ where: { MaTK: data.MaTK } });
    if (!nhanVien) throw new Error('Không xác định được nhân viên lập phiếu');
    const MaNV = nhanVien.MaNV;
    if (!data.NgayNhap || !MaNV || !data.MaPDH || !Array.isArray(data.chiTiet) || data.chiTiet.length === 0) {
      console.log("Ngay nhập",data.NgayNhap, "mã nhân viên",MaNV, "mã phiếu đặt hàng",data.MaPDH, "chi tiết phiếu nhập", data.chiTiet);
      throw new Error('Thiếu thông tin phiếu nhập hoặc chi tiết phiếu nhập');
    }

    const transaction = await PhieuNhap.sequelize.transaction();
    const errors = []; // Mảng lưu lỗi cho từng record
    
    try {
      // Sinh mã SoPN tự động: PN + số tự tăng 6 số
      const allPhieuPN = await PhieuNhap.findAll({
        where: {
          SoPN: {
            [require('sequelize').Op.like]: 'PN%'
          }
        },
        attributes: ['SoPN'],
        transaction
      });
      let nextNumber = 1;
      if (allPhieuPN.length > 0) {
        const numbers = allPhieuPN.map(p => {
          const num = parseInt(p.SoPN.replace('PN', ''));
          return isNaN(num) ? 0 : num;
        });
        nextNumber = Math.max(...numbers) + 1;
      }
      const SoPN = `PN${nextNumber.toString().padStart(6, '0')}`;

      // === Kiểm tra nhập đủ hay chưa (tối ưu lại, kiểm tra trước khi tạo phiếu nhập) ===
      // Lấy chi tiết phiếu đặt hàng
      const chiTietDatHang = await CT_PhieuDatHangNCC.findAll({
        where: { MaPDH: data.MaPDH },
        transaction
      });
      // Lấy tất cả phiếu nhập liên quan đến MaPDH này
      const allPhieuNhap = await PhieuNhap.findAll({
        where: { MaPDH: data.MaPDH },
        attributes: ['SoPN'],
        transaction
      });
      const allSoPN = allPhieuNhap.map(pn => pn.SoPN);
      // Lấy tất cả chi tiết nhập của các phiếu nhập này
      const allNhap = await CT_PhieuNhap.findAll({
        where: { SoPN: allSoPN },
        transaction
      });
      const tongNhapTheoCTSP = {};
      for (const ct of allNhap) {
        tongNhapTheoCTSP[ct.MaCTSP] = (tongNhapTheoCTSP[ct.MaCTSP] || 0) + ct.SoLuong;
      }
      // Validate chỉ các MaCTSP gửi lên
      for (let i = 0; i < data.chiTiet.length; i++) {
        const ct = data.chiTiet[i];
        const recordIndex = i + 1; // Index bắt đầu từ 1
        
        const ctdh = chiTietDatHang.find(x => x.MaCTSP === ct.MaCTSP);
        if (!ctdh) {
          errors.push({
            record: recordIndex,
            data: { MaCTSP: ct.MaCTSP },
            error: `MaCTSP ${ct.MaCTSP} không thuộc phiếu đặt hàng`
          });
          continue;
        }
        const soLuongDat = ctdh.SoLuong;
        const soLuongDaNhap = tongNhapTheoCTSP[ct.MaCTSP] || 0;
        const soLuongNhapThem = ct.SoLuong;
        const soLuongConLai = soLuongDat - soLuongDaNhap;
        if (soLuongNhapThem <= 0) {
          errors.push({
            record: recordIndex,
            data: { MaCTSP: ct.MaCTSP, SoLuong: soLuongNhapThem },
            error: `Số lượng nhập cho MaCTSP ${ct.MaCTSP} phải lớn hơn 0 (hiện tại: ${soLuongNhapThem})`
          });
        }
        if (soLuongNhapThem > soLuongConLai) {
          errors.push({
            record: recordIndex,
            data: { MaCTSP: ct.MaCTSP, SoLuongNhap: soLuongNhapThem, SoLuongConLai: soLuongConLai, SoLuongDat: soLuongDat, SoLuongDaNhap: soLuongDaNhap },
            error: `Số lượng nhập cho MaCTSP ${ct.MaCTSP} (${soLuongNhapThem}) vượt quá số lượng còn lại cần nhập (${soLuongConLai}). Đã đặt: ${soLuongDat}, đã nhập: ${soLuongDaNhap}`
          });
        }
      }
      // Nếu có lỗi validation, rollback và trả về lỗi
      if (errors.length > 0) {
        await transaction.rollback();
        
        // Tạo message chi tiết từ các lỗi
        const errorMessages = errors.map(err => {
          if (err.record === 1 && data.chiTiet.length === 1) {
            return err.error; // Nếu chỉ có 1 record thì hiển thị lỗi trực tiếp
          }
          return `Record ${err.record}: ${err.error}`;
        }).join('; ');
        
        return {
          success: false,
          errors: errors,
          message: errorMessages
        };
      }
      // Xác định lại trạng thái đã nhập đủ chưa
      let nhapDu = true;
      for (const ctdh of chiTietDatHang) {
        const soLuongDat = ctdh.SoLuong;
        const soLuongDaNhap = tongNhapTheoCTSP[ctdh.MaCTSP] || 0;
        // Nếu có nhập mới cho MaCTSP này thì cộng thêm
        const nhapMoi = data.chiTiet.find(x => x.MaCTSP === ctdh.MaCTSP);
        const soLuongNhapThem = nhapMoi ? nhapMoi.SoLuong : 0;
        const tongSoLuongNhap = soLuongDaNhap + soLuongNhapThem;
        if (tongSoLuongNhap < soLuongDat) {
          nhapDu = false;
          break;
        }
      }
      // Cập nhật trạng thái phiếu đặt hàng NCC
      await PhieuDatHangNCC.update(
        { MaTrangThai: nhapDu ? 5 : 4 },
        { where: { MaPDH: data.MaPDH }, transaction }
      );
      
      console.log(`Cập nhật trạng thái phiếu đặt hàng ${data.MaPDH} thành ${nhapDu ? 5 : 4}`);

      // Sau khi kiểm tra hợp lệ, mới tạo phiếu nhập và chi tiết phiếu nhập
      const phieu = await PhieuNhap.create({
        SoPN,
        NgayNhap: data.NgayNhap,
        MaPDH: data.MaPDH,
        MaNV: MaNV,
      }, { transaction });

      // Kiểm tra và tạo chi tiết phiếu nhập với thông tin lỗi chi tiết
      for (let i = 0; i < data.chiTiet.length; i++) {
        const ct = data.chiTiet[i];
        const recordIndex = i + 1; // Index bắt đầu từ 1
        
        try {
          // Kiểm tra dữ liệu bắt buộc
          if (!ct.MaCTSP || !ct.SoLuong || !ct.DonGia) {
            errors.push({
              record: recordIndex,
              data: ct,
              error: 'Chi tiết phiếu nhập thiếu trường bắt buộc (MaCTSP, SoLuong, DonGia)'
            });
            continue;
          }

          // Kiểm tra mã chi tiết sản phẩm tồn tại
          const ctsp = await ChiTietSanPham.findByPk(ct.MaCTSP);
          if (!ctsp) {
            errors.push({
              record: recordIndex,
              data: ct,
              error: `Mã chi tiết sản phẩm không tồn tại: ${ct.MaCTSP}`
            });
            continue;
          }

          // Kiểm tra số lượng
          if (ct.SoLuong <= 0) {
            errors.push({
              record: recordIndex,
              data: ct,
              error: 'Số lượng phải lớn hơn 0'
            });
            continue;
          }

          // Kiểm tra đơn giá
          if (ct.DonGia <= 0) {
            errors.push({
              record: recordIndex,
              data: ct,
              error: 'Đơn giá phải lớn hơn 0'
            });
            continue;
          }

          // Tạo chi tiết phiếu nhập
          await CT_PhieuNhap.create({
            SoPN,
            MaCTSP: ct.MaCTSP,
            SoLuong: ct.SoLuong,
            DonGia: ct.DonGia,
          }, { transaction });

          // Cập nhật tồn kho
          await ChiTietSanPham.increment(
            { SoLuongTon: ct.SoLuong },
            { where: { MaCTSP: ct.MaCTSP }, transaction }
          );

        } catch (error) {
          errors.push({
            record: recordIndex,
            data: ct,
            error: error.message
          });
        }
      }

      // Nếu có lỗi ở bất kỳ record nào, rollback và trả về lỗi
      if (errors.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          errors: errors,
          message: `Có ${errors.length} record bị lỗi trong tổng số ${data.chiTiet.length} record`
        };
      }

      await transaction.commit();
      return phieu;
    } catch (err) {
      console.log(err);
      await transaction.rollback();
      throw err;
    }
  },  
  getAll: async () => {
    return await PhieuNhap.findAll({ 
      include: [
        {
          model: CT_PhieuNhap,
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
        { model: PhieuDatHangNCC ,
          include: [
            { model: NhaCungCap }
          ]
        },
        { model: NhanVien }
      ]
    });
  },
  
  getById: async (id) => {
    return await PhieuNhap.findByPk(id, { 
      include: [
        {
          model: CT_PhieuNhap,
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
        { model: PhieuDatHangNCC ,
          include: [
            { model: NhaCungCap }
          ]
        },
        { model: NhanVien }
      ]
    });
  },
  
  updateInventory: async (receiptId) => {
    const phieuNhap = await PhieuNhap.findByPk(receiptId, {
      include: [CT_PhieuNhap]
    });
    
    if (!phieuNhap) {
      throw new Error('Không tìm thấy phiếu nhập');
    }
    
    // Update inventory for each item in the receipt
    for (const ct of phieuNhap.CT_PhieuNhaps) {
      await ChiTietSanPham.increment(
        { SoLuongTon: ct.SoLuong },
        { where: { MaCTSP: ct.MaCTSP } }
      );
    }
    
    return { message: 'Cập nhật tồn kho thành công' };
  },
  importExcel: async (file, MaNV) => {
    if (!file) throw new Error('Không có file được upload');
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    if (!rows.length) throw new Error('File Excel không có dữ liệu');
    const SoPN = uuidv4();
    const firstRow = rows[0];
    if (!firstRow.NgayNhap) {
      throw new Error('File Excel thiếu trường NgayNhap ở dòng đầu');
    }
    // Validate từng dòng
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.MaCTSP || !row.SoLuong || !row.DonGia) {
        errors.push({ row: i + 2, error: 'Thiếu trường MaCTSP, SoLuong hoặc DonGia' });
        continue;
      }
      const ctsp = await ChiTietSanPham.findByPk(row.MaCTSP);
      if (!ctsp) {
        errors.push({ row: i + 2, error: `Mã chi tiết sản phẩm không tồn tại: ${row.MaCTSP}` });
      }
      if (row.SoLuong <= 0) {
        errors.push({ row: i + 2, error: 'Số lượng phải lớn hơn 0' });
      }
      if (row.DonGia <= 0) {
        errors.push({ row: i + 2, error: 'Đơn giá phải lớn hơn 0' });
      }
    }
    if (errors.length) {
      fs.unlinkSync(file.path);
      return { success: false, errors };
    }
    // Nếu không có lỗi, tạo phiếu nhập và chi tiết
    const phieu = await PhieuNhap.create({
      SoPN,
      NgayNhap: firstRow.NgayNhap,
      MaPDH: firstRow.MaPDH || null,
      MaNV,
    });
    for (const row of rows) {
      await CT_PhieuNhap.create({
        SoPN,
        MaCTSP: row.MaCTSP,
        SoLuong: row.SoLuong,
        DonGia: row.DonGia,
      });
    }
    fs.unlinkSync(file.path);
    return { success: true, phieu };
  },
};

module.exports = PhieuNhapService; 