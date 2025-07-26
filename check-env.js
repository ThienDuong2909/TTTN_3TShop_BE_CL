require('dotenv').config();

console.log('🔍 Kiểm tra biến môi trường:');
console.log('================================');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Chưa cấu hình');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Đã cấu hình' : '❌ Chưa cấu hình');
console.log('DEFAULT_SUPPLIER_EMAIL:', process.env.DEFAULT_SUPPLIER_EMAIL || '❌ Chưa cấu hình');
console.log('NODE_ENV:', process.env.NODE_ENV || '❌ Chưa cấu hình');
console.log('DB_HOST:', process.env.DB_HOST || '❌ Chưa cấu hình');
console.log('DB_NAME:', process.env.DB_NAME || '❌ Chưa cấu hình');
console.log('================================');

// Kiểm tra file .env có tồn tại không
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ File .env tồn tại');
  console.log('📁 Đường dẫn:', envPath);
} else {
  console.log('❌ File .env không tồn tại');
  console.log('💡 Hãy tạo file .env trong thư mục gốc của dự án');
} 