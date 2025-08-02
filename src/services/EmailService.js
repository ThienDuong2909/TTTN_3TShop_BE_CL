const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Function format số tiền với dấu chấm ngăn cách phần nghìn
function formatCurrency(amount) {
  // Chuyển thành string và loại bỏ .00 nếu có
  let amountStr = amount.toString();
  
  // Loại bỏ .00 ở cuối nếu có
  if (amountStr.endsWith('.00')) {
    amountStr = amountStr.replace('.00', '');
  }
  
  // Chuyển thành số nguyên
  const numAmount = parseInt(amountStr);
  
  // Format với dấu chấm ngăn cách phần nghìn
  return numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

class EmailService {
  constructor() {
    // Cấu hình transporter cho email
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: process.env.MAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER || 'your-email@gmail.com',
        pass: process.env.MAIL_PASS || 'your-app-password'
      }
    });
  }

  // Tạo file Excel từ dữ liệu phiếu đặt hàng
  async createPurchaseOrderExcel(phieuDatHang) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Phiếu đặt hàng');

    // Thiết lập cột
    worksheet.columns = [
      { key: 'A', width: 8 },   // STT
      { key: 'B', width: 25 },  // Tên sản phẩm
      { key: 'C', width: 15 },  // Màu sắc
      { key: 'D', width: 10 },  // Size
      { key: 'E', width: 12 },  // Đơn vị tính
      { key: 'F', width: 12 },  // Số lượng
      { key: 'G', width: 18 },  // Đơn giá
      { key: 'H', width: 18 }   // Thành tiền
    ];

    // Header công ty (dòng 1)
    const companyRow = worksheet.addRow(['CÔNG TY TNHH THỜI TRANG 3TSHOP']);
    companyRow.height = 30;
    worksheet.mergeCells('A1:H1');
    companyRow.getCell(1).font = { bold: true, size: 16 };
    companyRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Dòng trống (dòng 2)
    worksheet.addRow(['']);

    // Tiêu đề phiếu đặt hàng (dòng 3)
    const titleRow = worksheet.addRow(['PHIẾU ĐẶT HÀNG']);
    titleRow.height = 25;
    worksheet.mergeCells('A3:H3');
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Dòng trống (dòng 4)
    worksheet.addRow(['']);

    // Thông tin khách hàng và nhà cung cấp (dòng 5)
    const infoHeaderRow = worksheet.addRow(['Thông tin khách hàng:', '', '', '', 'Thông tin nhà cung cấp:']);
    infoHeaderRow.getCell(1).font = { bold: true };
    infoHeaderRow.getCell(5).font = { bold: true };

                    // Thông tin chi tiết (dòng 6-10)
       worksheet.addRow(['Địa chỉ:', '123 Đường Lê Lợi, Quận 1, TP.HCM', '', '', `Tên NCC: ${phieuDatHang.NhaCungCap?.TenNCC || ''}`]);
       worksheet.addRow(['Mã số thuế:', '0301234567', '', '', `Địa chỉ: ${phieuDatHang.NhaCungCap?.DiaChi || ''}`]);
       worksheet.addRow(['Người lập đơn:', phieuDatHang.NhanVien?.TenNV || '', '', '', `Ngày lập đơn: ${new Date(phieuDatHang.NgayDat).toLocaleDateString('vi-VN')}`]);
       worksheet.addRow(['Email:', phieuDatHang.NhanVien?.Email || '']);
       worksheet.addRow(['Ngày kiến nghị giao:', '', '', '', phieuDatHang.NgayKienNghiGiao ? new Date(phieuDatHang.NgayKienNghiGiao).toLocaleDateString('vi-VN') : '']);

    // Dòng trống (dòng 11)
    worksheet.addRow(['']);

    // Header bảng sản phẩm (dòng 12)
    const tableHeaderRow = worksheet.addRow(['STT', 'Tên sản phẩm', 'Màu sắc', 'Size', 'Đơn vị tính', 'Số lượng', 'Đơn giá (VNĐ)', 'Thành tiền (VNĐ)']);
    tableHeaderRow.height = 25;
    tableHeaderRow.font = { bold: true, color: { argb: 'FF000000' } };
    tableHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Chỉ tô màu vàng cho các cột có header thực tế (8 cột đầu)
    for (let i = 1; i <= 8; i++) {
      const cell = tableHeaderRow.getCell(i);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Màu vàng
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    }

    // Thêm dữ liệu sản phẩm
    let stt = 1;
    let tongTien = 0;
    
    phieuDatHang.CT_PhieuDatHangNCCs?.forEach((ct, index) => {
      const thanhTien = ct.SoLuong * ct.DonGia;
      tongTien += thanhTien;
      
      const dataRow = worksheet.addRow([
        stt++,
        ct.ChiTietSanPham?.SanPham?.TenSP || '',
        ct.ChiTietSanPham?.Mau?.TenMau || '',
        ct.ChiTietSanPham?.KichThuoc?.TenKichThuoc || '',
        'Cái',
        ct.SoLuong,
        formatCurrency(ct.DonGia),
        formatCurrency(thanhTien)
      ]);

      // Chỉ áp dụng border và căn chỉnh cho các cột có dữ liệu (8 cột đầu)
      for (let colNumber = 1; colNumber <= 8; colNumber++) {
        const cell = dataRow.getCell(colNumber);
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Căn giữa cho STT, Size, Đơn vị tính
        if (colNumber === 1 || colNumber === 4 || colNumber === 5) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Căn phải cho số lượng, đơn giá, thành tiền
        else if (colNumber === 6 || colNumber === 7 || colNumber === 8) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
        // Căn trái cho tên sản phẩm, màu sắc
        else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      }
    });

    // Dòng trống
    worksheet.addRow(['']);

    // Tổng tiền
    const totalRow = worksheet.addRow(['Tổng tiền hàng:', '', '', '', '', '', '', `${formatCurrency(tongTien)} VNĐ`]);
    worksheet.mergeCells(`A${totalRow.number}:G${totalRow.number}`);
    
    // Căn phải cho ô "Tổng tiền hàng"
    totalRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
    
    // Format cho ô số tiền
    totalRow.getCell(8).font = { bold: true };
    totalRow.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(8).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

    // Dòng trống
    worksheet.addRow(['']);

    // Thông tin thanh toán
    worksheet.addRow(['Phương thức thanh toán:', 'Chuyển khoản']);
    worksheet.addRow(['Tài khoản ngân hàng:', '123456789 - Ngân hàng ACB - CN TP.HCM']);

    // Dòng trống
    worksheet.addRow(['']);

    // Chữ ký
    const signatureRow = worksheet.addRow(['Người lập đơn:', '', '', '', '', '', '', 'Xác nhận của nhà cung cấp:']);
    signatureRow.getCell(1).font = { bold: true };
    signatureRow.getCell(8).font = { bold: true };

    // Tạo tên file
    const fileName = `PhieuDatHang_${phieuDatHang.MaPDH}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filePath = path.join(__dirname, '../../uploads', fileName);

    // Đảm bảo thư mục uploads tồn tại
    const uploadsDir = path.dirname(filePath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Ghi file Excel
    await workbook.xlsx.writeFile(filePath);

    return { fileName, filePath };
  }

  // Gửi email với file Excel đính kèm
  async sendPurchaseOrderEmail(phieuDatHang, supplierEmail) {
    try {
      // Tạo file Excel
      const { fileName, filePath } = await this.createPurchaseOrderExcel(phieuDatHang);

      // Nội dung email
      const mailOptions = {
        from: process.env.MAIL_USER || 'your-email@gmail.com',
        to: supplierEmail,
        subject: `Phiếu đặt hàng ${phieuDatHang.MaPDH} - 3TSHOP`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Phiếu đặt hàng ${phieuDatHang.MaPDH}</h2>
            <p>Kính gửi <strong>${phieuDatHang.NhaCungCap?.TenNCC || 'Nhà cung cấp'}</strong>,</p>
            <p>Công ty TNHH Thời trang 3TSHOP xin gửi phiếu đặt hàng với các thông tin sau:</p>
            <ul>
              <li><strong>Mã phiếu đặt hàng:</strong> ${phieuDatHang.MaPDH}</li>
              <li><strong>Ngày đặt hàng:</strong> ${new Date(phieuDatHang.NgayDat).toLocaleDateString('vi-VN')}</li>
              <li><strong>Người lập phiếu:</strong> ${phieuDatHang.NhanVien?.TenNV || ''}</li>
            </ul>
            <p>Chi tiết đơn hàng được đính kèm trong file Excel.</p>
            <p>Vui lòng xem xét và phản hồi trong thời gian sớm nhất.</p>
            <p>Trân trọng,<br>
            <strong>Công ty TNHH Thời trang 3TSHOP</strong></p>
          </div>
        `,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      };

      // Gửi email
      const result = await this.transporter.sendMail(mailOptions);
      
      // Trả về thông tin file Excel để Frontend có thể tải xuống
      return {
        emailResult: result,
        excelFile: {
          fileName: fileName,
          filePath: filePath,
          downloadUrl: `/uploads/${fileName}`
        }
      };
    } catch (error) {
      console.error('Lỗi gửi email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 