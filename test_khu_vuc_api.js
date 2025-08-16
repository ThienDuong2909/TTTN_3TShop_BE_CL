const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testKhuVucAPI() {
  try {
    console.log('=== Testing KhuVuc (Areas) API ===\n');

    // Test 1: Get all areas
    console.log('1. Testing GET /api/areas (Lấy tất cả khu vực)');
    try {
      const response1 = await axios.get(`${BASE_URL}/areas`);
      console.log('✅ Success:', response1.data);
      console.log('Total areas:', response1.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 2: Get areas with staff info
    console.log('2. Testing GET /api/areas?includeStaff=true (Lấy khu vực kèm thông tin nhân viên)');
    try {
      const response2 = await axios.get(`${BASE_URL}/areas?includeStaff=true`);
      console.log('✅ Success:', response2.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Get available areas
    console.log('3. Testing GET /api/areas/available (Lấy khu vực có sẵn)');
    try {
      // First login to get token
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        TenDangNhap: 'admin',
        MatKhau: 'admin123'
      });
      const token = loginResponse.data.data.accessToken;

      const response3 = await axios.get(`${BASE_URL}/areas/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Success:', response3.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Test Vietnamese route alias
    console.log('4. Testing GET /api/khu-vuc (Vietnamese alias)');
    try {
      const response4 = await axios.get(`${BASE_URL}/khu-vuc`);
      console.log('✅ Success:', response4.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Get specific area by ID (if any exist)
    console.log('5. Testing GET /api/areas/:id (Lấy khu vực theo mã)');
    try {
      const response5 = await axios.get(`${BASE_URL}/areas/Q1`);
      console.log('✅ Success:', response5.data);
    } catch (error) {
      console.log('❌ Error (Expected if Q1 not found):', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testKhuVucAPI();
