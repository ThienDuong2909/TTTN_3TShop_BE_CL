const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '3tshop_tttn',
  port: process.env.DB_PORT || 3306
};

async function setupPermissionSystem() {
  let connection;
  
  try {
    console.log('🔗 Đang kết nối đến database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Kết nối database thành công!');
    
    // Đọc file SQL
    const sqlFile = path.join(__dirname, 'src/migrations/setup_permission_system.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Tách các câu lệnh SQL
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('📝 Đang thực thi migration...');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Thực thi câu lệnh ${i + 1}/${statements.length} thành công`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Câu lệnh ${i + 1} đã tồn tại, bỏ qua...`);
          } else {
            console.error(`❌ Lỗi ở câu lệnh ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('🎉 Hệ thống phân quyền đã được thiết lập thành công!');
    
    // Kiểm tra kết quả
    console.log('\n📊 Kiểm tra kết quả:');
    
    const [permissions] = await connection.execute('SELECT COUNT(*) as count FROM PhanQuyen');
    console.log(`- Tổng số quyền: ${permissions[0].count}`);
    
    const [rolePermissions] = await connection.execute('SELECT COUNT(*) as count FROM PhanQuyen_VaiTro');
    console.log(`- Tổng số phân quyền: ${rolePermissions[0].count}`);
    
    const [roles] = await connection.execute('SELECT MaVaiTro, TenVaiTro FROM VaiTro');
    console.log('\n📋 Danh sách vai trò:');
    roles.forEach(role => {
      console.log(`  - ${role.MaVaiTro}: ${role.TenVaiTro}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi thiết lập hệ thống phân quyền:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Đã đóng kết nối database');
    }
  }
}

// Chạy migration
setupPermissionSystem(); 