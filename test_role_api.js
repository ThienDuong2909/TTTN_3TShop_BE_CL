const axios = require('axios');

// Cấu hình
const BASE_URL = 'http://localhost:8080/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Thay thế bằng token thực tế

// Test GET /api/employees/:maNV/role
async function testGetRole() {
  try {
    console.log('🧪 Testing GET /api/employees/1/role...');
    
    const response = await axios.get(`${BASE_URL}/employees/1/role`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ GET Role Success:', response.data);
  } catch (error) {
    console.error('❌ GET Role Error:', error.response?.data || error.message);
  }
}

// Test PUT /api/employees/:maNV/role
async function testUpdateRole() {
  try {
    console.log('🧪 Testing PUT /api/employees/1/role...');
    
    const response = await axios.put(`${BASE_URL}/employees/1/role`, {
      roleId: 2 // NhanVienCuaHang (sử dụng số thay vì string)
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PUT Role Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Error:', error.response?.data || error.message);
  }
}

// Test với roleId khác
async function testUpdateRoleAdmin() {
  try {
    console.log('🧪 Testing PUT /api/employees/1/role with Admin role...');
    
    const response = await axios.put(`${BASE_URL}/employees/1/role`, {
      roleId: 1 // Admin
    }, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PUT Role Admin Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Admin Error:', error.response?.data || error.message);
  }
}

// Chạy test
async function runTests() {
  console.log('🚀 Starting Role API Tests...\n');
  
  await testGetRole();
  console.log('');
  await testUpdateRole();
  console.log('');
  await testUpdateRoleAdmin();
  
  console.log('\n✨ Tests completed!');
}

// Chạy nếu file được thực thi trực tiếp
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testGetRole,
  testUpdateRole,
  testUpdateRoleAdmin
};
