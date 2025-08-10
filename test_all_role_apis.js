const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Thay thế bằng token thực tế

async function testGetAllRoles() {
  try {
    console.log('🧪 Testing GET /api/roles...');
    
    const response = await axios.get(`${BASE_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ GET All Roles Success:', response.data);
  } catch (error) {
    console.error('❌ GET All Roles Error:', error.response?.data || error.message);
  }
}

async function testGetAllPermissions() {
  try {
    console.log('🧪 Testing GET /api/permissions...');
    
    const response = await axios.get(`${BASE_URL}/permissions`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ GET All Permissions Success:', response.data);
  } catch (error) {
    console.error('❌ GET All Permissions Error:', error.response?.data || error.message);
  }
}

async function testGetAllPermissionsAlternative() {
  try {
    console.log('🧪 Testing GET /api/permissions/all...');
    
    const response = await axios.get(`${BASE_URL}/permissions/all`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ GET All Permissions Alternative Success:', response.data);
  } catch (error) {
    console.error('❌ GET All Permissions Alternative Error:', error.response?.data || error.message);
  }
}

async function testUpdateRolePermissions() {
  try {
    console.log('🧪 Testing PUT /api/roles/2/permissions...');
    
    const response = await axios.put(`${BASE_URL}/roles/2/permissions`, {
      permissions: ["sanpham.xem", "sanpham.them", "donhang.xem", "binhluan.xem"]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ PUT Role Permissions Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Permissions Error:', error.response?.data || error.message);
  }
}

async function testGetPermissionsByRole() {
  try {
    console.log('🧪 Testing GET /api/permissions/role/2...');
    
    const response = await axios.get(`${BASE_URL}/permissions/role/2`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ GET Permissions By Role Success:', response.data);
  } catch (error) {
    console.error('❌ GET Permissions By Role Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting All Role & Permission APIs Tests...\n');
  
  await testGetAllRoles();
  console.log('');
  
  await testGetAllPermissions();
  console.log('');
  
  await testGetAllPermissionsAlternative();
  console.log('');
  
  await testUpdateRolePermissions();
  console.log('');
  
  await testGetPermissionsByRole();
  console.log('\n✨ All tests completed!');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testGetAllRoles,
  testGetAllPermissions,
  testGetAllPermissionsAlternative,
  testUpdateRolePermissions,
  testGetPermissionsByRole
};
