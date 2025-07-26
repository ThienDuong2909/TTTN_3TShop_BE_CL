require('dotenv').config();
const EmailService = require('./src/services/EmailService');

// Dữ liệu mẫu phiếu đặt hàng để test
const mockPhieuDatHang = {
  MaPDH: 'PO000001',
  NgayDat: new Date(),
  NhanVien: {
    TenNV: 'Nguyễn Văn Thanh'
  },
  NhaCungCap: {
    TenNCC: 'CÔNG TY TNHH MAY MẶC THỜI ĐẠI',
    DiaChi: '456 Đường CMT8, Quận 3, TP.HCM',
    Email: 'supplier@example.com'
  },
  CT_PhieuDatHangNCCs: [
    {
      SoLuong: 20,
      DonGia: 1800000,
      ChiTietSanPham: {
        SanPham: { TenSP: 'Áo sơ mi nam' },
        Mau: { TenMau: 'Trắng' },
        KichThuoc: { TenKichThuoc: 'M' }
      }
    },
    {
      SoLuong: 15,
      DonGia: 2500000,
      ChiTietSanPham: {
        SanPham: { TenSP: 'Quần jean nữ' },
        Mau: { TenMau: 'Xanh' },
        KichThuoc: { TenKichThuoc: 'S' }
      }
    },
    {
      SoLuong: 10,
      DonGia: 3500000,
      ChiTietSanPham: {
        SanPham: { TenSP: 'Áo khoác nam' },
        Mau: { TenMau: 'Đen' },
        KichThuoc: { TenKichThuoc: 'L' }
      }
    }
  ]
};

async function testEmail() {
  try {
    console.log('Bắt đầu test gửi email...');
    
    // Log các biến môi trường
    console.log('\n📋 Kiểm tra biến môi trường:');
    console.log('MAIL_HOST:', process.env.MAIL_HOST || '❌ Chưa cấu hình');
    console.log('MAIL_PORT:', process.env.MAIL_PORT || '❌ Chưa cấu hình');
    console.log('MAIL_USER:', process.env.MAIL_USER || '❌ Chưa cấu hình');
    console.log('MAIL_PASS:', process.env.MAIL_PASS ? '✅ Đã cấu hình' : '❌ Chưa cấu hình');
    console.log('NODE_ENV:', process.env.NODE_ENV || '❌ Chưa cấu hình');
    console.log('');
    
    // Test tạo file Excel
    console.log('1. Test tạo file Excel...');
    const { fileName, filePath } = EmailService.createPurchaseOrderExcel(mockPhieuDatHang);
    console.log(`✅ File Excel đã được tạo: ${fileName}`);
    console.log(`📁 Đường dẫn: ${filePath}`);
    
    // Test gửi email
    console.log('\n2. Test gửi email...');
    const result = await EmailService.sendPurchaseOrderEmail(mockPhieuDatHang, 'test@example.com');
    console.log('✅ Email đã được gửi thành công!');
    console.log('📧 Message ID:', result.emailResult.messageId);
    console.log('📄 File Excel:', result.excelFile.fileName);
    console.log('🔗 Download URL:', result.excelFile.downloadUrl);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.log('\n💡 Hướng dẫn khắc phục:');
    console.log('1. Kiểm tra file .env đã được tạo chưa');
    console.log('2. Kiểm tra EMAIL_USER và EMAIL_PASSWORD trong .env');
    console.log('3. Đảm bảo đã bật xác thực 2 yếu tố cho Gmail');
    console.log('4. Kiểm tra App Password đã được tạo đúng chưa');
  }
}

// Chạy test
testEmail(); 