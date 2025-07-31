const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Đọc file cấu hình database
const dbConfig = require('./src/configs/database');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔗 Kết nối database...');
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true
    });
    
    console.log('✅ Kết nối database thành công');
    
    // Đọc file migration
    const migrationPath = path.join(__dirname, 'src/migrations/add_ngay_kien_nghi_giao.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Thực thi migration...');
    console.log('Migration SQL:');
    console.log(migrationSQL);
    
    // Thực thi migration
    await connection.execute(migrationSQL);
    
    console.log('✅ Migration thành công! Đã thêm trường NgayKienNghiGiao vào bảng PhieuDatHangNCC');
    
    // Kiểm tra kết quả
    const [rows] = await connection.execute('DESCRIBE PhieuDatHangNCC');
    console.log('\n📋 Cấu trúc bảng PhieuDatHangNCC sau migration:');
    rows.forEach(row => {
      console.log(`${row.Field} | ${row.Type} | ${row.Null} | ${row.Key} | ${row.Default} | ${row.Extra}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi thực thi migration:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Trường NgayKienNghiGiao đã tồn tại trong bảng');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database');
    }
  }
}

// Chạy migration
runMigration(); 