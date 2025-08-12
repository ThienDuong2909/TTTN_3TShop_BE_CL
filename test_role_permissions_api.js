const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Thay thế bằng token thực tế

async function testUpdateRolePermissions() {
  try {
    console.log('🧪 Testing PUT /api/roles/1/permissions...');
    
    const response = await axios.put(`${BASE_URL}/roles/1/permissions`, {
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

async function testUpdateRolePermissionsWithIds() {
  try {
    console.log('🧪 Testing PUT /api/roles/2/permissions with permissionIds...');
    
    const response = await axios.put(`${BASE_URL}/roles/2/permissions`, {
      permissionIds: [1, 2, 3, 4] // Sử dụng IDs thay vì strings
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ PUT Role Permissions with IDs Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Permissions with IDs Error:', error.response?.data || error.message);
  }
}

async function testUpdateRolePermissionsInvalidRole() {
  try {
    console.log('🧪 Testing PUT /api/roles/999/permissions (invalid role)...');
    
    const response = await axios.put(`${BASE_URL}/roles/999/permissions`, {
      permissions: ["sanpham.xem"]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ PUT Role Permissions Invalid Role Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Permissions Invalid Role Error:', error.response?.data || error.message);
  }
}

async function testUpdateRolePermissionsInvalidPermissions() {
  try {
    console.log('🧪 Testing PUT /api/roles/1/permissions with invalid permissions...');
    
    const response = await axios.put(`${BASE_URL}/roles/1/permissions`, {
      permissions: ["invalid.permission", "another.invalid"]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ PUT Role Permissions Invalid Permissions Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Permissions Invalid Permissions Error:', error.response?.data || error.message);
  }
}

async function testUpdateRolePermissionsEmptyArray() {
  try {
    console.log('🧪 Testing PUT /api/roles/1/permissions with empty permissions...');
    
    const response = await axios.put(`${BASE_URL}/roles/1/permissions`, {
      permissions: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    console.log('✅ PUT Role Permissions Empty Array Success:', response.data);
  } catch (error) {
    console.error('❌ PUT Role Permissions Empty Array Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Role Permissions API Tests...\n');
  
  await testUpdateRolePermissions();
  console.log('');
  
  await testUpdateRolePermissionsWithIds();
  console.log('');
  
  await testUpdateRolePermissionsInvalidRole();
  console.log('');
  
  await testUpdateRolePermissionsInvalidPermissions();
  console.log('');
  
  await testUpdateRolePermissionsEmptyArray();
  console.log('\n✨ Tests completed!');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testUpdateRolePermissions,
  testUpdateRolePermissionsWithIds,
  testUpdateRolePermissionsInvalidRole,
  testUpdateRolePermissionsInvalidPermissions,
  testUpdateRolePermissionsEmptyArray
};
