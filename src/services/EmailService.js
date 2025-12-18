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
    // Cấu hình transporter cho email nhà cung cấp (Gmail)
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: process.env.MAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER || 'thanhanhynh@gmail.com',
        pass: process.env.MAIL_PASS || 'xphh kgxp blww txky'
      }
    });

    // Cấu hình transporter cho email khách hàng (cPanel Hosting)
    this.customerTransporter = nodemailer.createTransport({
      host: process.env.CUSTOMER_MAIL_HOST || 'mail.thienduong.info',
      port: process.env.CUSTOMER_MAIL_PORT || 465,
      secure: true, // true cho port 465, false cho các port khác
      auth: {
        user: process.env.CUSTOMER_MAIL_USER || '3tshop@thienduong.info',
        pass: process.env.CUSTOMER_MAIL_PASS
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
    worksheet.addRow(['Mã nhân viên:', phieuDatHang.NhanVien?.MaNV || '']);
    worksheet.addRow(['Ngày kiến nghị giao:', phieuDatHang.NgayKienNghiGiao ? new Date(phieuDatHang.NgayKienNghiGiao).toLocaleDateString('vi-VN') : '']);

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
        from: 'thanhanhynh@gmail.com',
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

  // Gửi email xác nhận đơn hàng cho khách hàng
  async sendOrderConfirmationEmail(order, customerEmail, customerName) {
    try {
      // Tính tổng tiền
      let tongTien = 0;
      const sanPhamList = order.CT_DonDatHangs.map((ct, index) => {
        const thanhTien = ct.SoLuong * ct.DonGia;
        tongTien += thanhTien;

        return `
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 12px; text-align: center;">${index + 1}</td>
            <td style="padding: 12px;">${ct.ChiTietSanPham?.SanPham?.TenSP || 'Sản phẩm'}</td>
            <td style="padding: 12px; text-align: center;">${ct.ChiTietSanPham?.KichThuoc?.TenKichThuoc || ''} - ${ct.ChiTietSanPham?.Mau?.TenMau || ''}</td>
            <td style="padding: 12px; text-align: center;">${ct.SoLuong}</td>
            <td style="padding: 12px; text-align: right;">${formatCurrency(ct.DonGia)} ₫</td>
            <td style="padding: 12px; text-align: right; font-weight: 600;">${formatCurrency(thanhTien)} ₫</td>
          </tr>
        `;
      }).join('');

      const mailOptions = {
        from: {
          name: '3TShop - Thời Trang Nam Nữ',
          address: process.env.CUSTOMER_MAIL_USER || '3tshop@thienduong.info'
        },
        to: customerEmail,
        subject: `Xác nhận đơn hàng #${order.MaDDH} - 3TShop`,
        html: `
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận đơn hàng</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" width="800" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header với logo -->
                    <tr>
                      <td style="background-color: #4F46E5; padding: 40px 30px; text-align: center;">
                        <img src="cid:logo" alt="3TSHOP" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />
                      </td>
                    </tr>

                    <!-- Success Icon -->
                    <tr>
                      <td style="padding: 30px 30px 20px 30px; text-align: center;">
                        <div style="width: 80px; height: 80px; background-color: #4CAF50; border-radius: 50%; margin: 0 auto; text-align: center; line-height: 80px;">
                          <span style="color: white; font-size: 48px; display: inline-block; vertical-align: middle; line-height: normal;">✓</span>
                        </div>
                        <h2 style="margin: 20px 0 10px 0; color: #333333; font-size: 24px;">
                          Đặt hàng thành công!
                        </h2>
                        <p style="margin: 0; color: #666666; font-size: 16px;">
                          Cảm ơn bạn đã tin tưởng mua hàng tại 3TShop
                        </p>
                      </td>
                    </tr>

                    <!-- Thông tin đơn hàng -->
                    <tr>
                      <td style="padding: 0 30px 20px 30px;">
                        <div style="background-color: #f8f9fa; border-left: 4px solid #4F46E5; padding: 20px; border-radius: 4px;">
                          <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">
                            Thông tin đơn hàng
                          </h3>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding: 5px 0; color: #666666; width: 40%;">Mã đơn hàng:</td>
                              <td style="padding: 5px 0; color: #333333; font-weight: 600;">#${order.MaDDH}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #666666;">Người nhận:</td>
                              <td style="padding: 5px 0; color: #333333; font-weight: 600;">${order.NguoiNhan}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #666666;">Số điện thoại:</td>
                              <td style="padding: 5px 0; color: #333333; font-weight: 600;">${order.SDT}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #666666;">Địa chỉ giao hàng:</td>
                              <td style="padding: 5px 0; color: #333333; font-weight: 600;">${order.DiaChiGiao}</td>
                            </tr>
                            <tr>
                              <td style="padding: 5px 0; color: #666666;">Thời gian giao:</td>
                              <td style="padding: 5px 0; color: #333333; font-weight: 600;">${order.ThoiGianGiao ? new Date(order.ThoiGianGiao).toLocaleDateString('vi-VN') : 'Sớm nhất có thể'}</td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>

                    <!-- Chi tiết sản phẩm -->
                    <tr>
                      <td style="padding: 0 30px 20px 30px;">
                        <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">
                          Chi tiết sản phẩm
                        </h3>
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #eeeeee; border-radius: 4px; overflow: hidden;">
                          <thead>
                            <tr style="background-color: #f8f9fa;">
                              <th style="padding: 12px; text-align: center; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee;">STT</th>
                              <th style="padding: 12px; text-align: left; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee;">Sản phẩm</th>
                              <th style="padding: 12px; text-align: center; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee;">Phân loại</th>
                              <th style="padding: 12px; text-align: center; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee;">SL</th>
                              <th style="padding: 12px; text-align: right; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee;">Đơn giá</th>
                              <th style="padding: 12px; text-align: right; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee;">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${sanPhamList}
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    <!-- Tổng tiền -->
                    <tr>
                      <td style="padding: 0 30px 30px 30px;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; text-align: right;">
                          <p style="margin: 0; color: #666666; font-size: 16px;">
                            Tạm tính: <span style="color: #333333; font-weight: 600;">${formatCurrency(tongTien)} ₫</span>
                          </p>
                          <p style="margin: 10px 0 0 0; color: #333333; font-size: 20px; font-weight: bold;">
                            Tổng cộng: <span style="color: #4F46E5;">${formatCurrency(tongTien)} ₫</span>
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- Lưu ý và cảm ơn -->
                    <tr>
                      <td style="padding: 0 30px 30px 30px; border-top: 2px solid #eeeeee;">
                        <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                          <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">
                            📝 Lưu ý quan trọng:
                          </h4>
                          <ul style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.6;">
                            <li>Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn</li>
                            <li>Vui lòng kiểm tra kỹ sản phẩm khi nhận hàng</li>
                            <li>Liên hệ hotline <strong>0123456789</strong> nếu cần hỗ trợ</li>
                          </ul>
                        </div>

                        <p style="margin-top: 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                          Cảm ơn bạn đã tin tưởng và lựa chọn sản phẩm của <strong>3TShop</strong>. 
                          Chúng tôi cam kết mang đến cho bạn những sản phẩm chất lượng và dịch vụ tốt nhất.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #333333; padding: 30px; text-align: center; color: #ffffff;">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px;">3TSHOP - Thời Trang Cao Cấp</h3>
                        <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">
                          📍 22/7 Đường số 8, Quận 9, TP.HCM
                        </p>
                        <p style="margin: 0 0 5px 0; font-size: 14px; opacity: 0.9;">
                          📞 Hotline: 0342143498 | 📧 Email: 3tshop@thienduong.info
                        </p>
                        <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">
                          © 2025 3TShop. All rights reserved.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      };

      // Gửi email sử dụng customerTransporter
      const result = await this.customerTransporter.sendMail(mailOptions);
      console.log('✅ Email xác nhận đơn hàng đã được gửi đến:', customerEmail);

      return result;
    } catch (error) {
      console.error('❌ Lỗi khi gửi email xác nhận đơn hàng:', error);
      // Không throw error để không ảnh hưởng đến quá trình đặt hàng
      return null;
    }
  }
}

module.exports = new EmailService(); 