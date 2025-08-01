const { sequelize } = require('./src/models');

async function addNgayKienNghiGiaoColumn() {
  try {
    console.log('🔄 Bắt đầu thêm cột NgayKienNghiGiao vào bảng PhieuDatHangNCC...');
    
    // Thêm cột NgayKienNghiGiao
    await sequelize.query(`
      ALTER TABLE PhieuDatHangNCC 
      ADD COLUMN NgayKienNghiGiao DATE NULL 
      COMMENT 'Ngày kiến nghị giao hàng từ nhà cung cấp'
    `);
    
    console.log('✅ Đã thêm cột NgayKienNghiGiao thành công!');
    console.log('📋 Thông tin cột:');
    console.log('   - Tên cột: NgayKienNghiGiao');
    console.log('   - Kiểu dữ liệu: DATE');
    console.log('   - Cho phép NULL: Có');
    console.log('   - Mô tả: Ngày kiến nghị giao hàng từ nhà cung cấp');
    
  } catch (error) {
    console.error('❌ Lỗi khi thêm cột NgayKienNghiGiao:', error.message);
    
    // Kiểm tra xem cột đã tồn tại chưa
    if (error.message.includes('Duplicate column name')) {
      console.log('ℹ️  Cột NgayKienNghiGiao đã tồn tại trong bảng.');
    } else {
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

// Chạy migration
addNgayKienNghiGiaoColumn()
  .then(() => {
    console.log('🎉 Migration hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration thất bại:', error);
    process.exit(1);
  }); 