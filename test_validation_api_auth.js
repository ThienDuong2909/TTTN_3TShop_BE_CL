const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testValidationAPIWithAuth() {
  try {
    console.log('=== Testing Discount Period Validation API with Authentication ===\n');

    // First, login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      TenDangNhap: 'admin',
      MatKhau: 'admin123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('Login successful, token obtained\n');

    // Set up headers with authentication
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Valid non-overlapping period
    console.log('Test 1: Valid non-overlapping period');
    const test1 = {
      ngayBatDau: '2024-05-01',
      ngayKetThuc: '2024-05-15'
    };
    
    const response1 = await axios.post(`${BASE_URL}/promotions/validate-period`, test1, { headers });
    console.log('Response 1:', response1.data);
    console.log('');

    // Test 2: Overlapping period - should find conflicts
    console.log('Test 2: Overlapping period (should find conflicts)');
    const test2 = {
      ngayBatDau: '2024-01-01',
      ngayKetThuc: '2024-03-31'
    };
    
    try {
      const response2 = await axios.post(`${BASE_URL}/promotions/validate-period`, test2, { headers });
      console.log('Response 2:', response2.data);
    } catch (error) {
      console.log('Response 2 (Expected conflict):', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Invalid date format
    console.log('Test 3: Invalid date format');
    const test3 = {
      ngayBatDau: 'invalid-date',
      ngayKetThuc: '2024-05-15'
    };
    
    try {
      const response3 = await axios.post(`${BASE_URL}/promotions/validate-period`, test3, { headers });
      console.log('Response 3:', response3.data);
    } catch (error) {
      console.log('Response 3 (Expected error):', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Start date after end date
    console.log('Test 4: Start date after end date');
    const test4 = {
      ngayBatDau: '2024-05-15',
      ngayKetThuc: '2024-05-01'
    };
    
    try {
      const response4 = await axios.post(`${BASE_URL}/promotions/validate-period`, test4, { headers });
      console.log('Response 4:', response4.data);
    } catch (error) {
      console.log('Response 4 (Expected error):', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Test with PascalCase field names
    console.log('Test 5: Test with PascalCase field names');
    const test5 = {
      NgayBatDau: '2024-06-01',
      NgayKetThuc: '2024-06-15'
    };
    
    const response5 = await axios.post(`${BASE_URL}/promotions/validate-period`, test5, { headers });
    console.log('Response 5:', response5.data);
    console.log('');

    // Test 6: Exclude current period (for editing)
    console.log('Test 6: Exclude current period (for editing scenario)');
    const test6 = {
      ngayBatDau: '2024-01-01',
      ngayKetThuc: '2024-02-28',
      maDot: 'DOT001' // Assuming this period exists, it should be excluded from validation
    };
    
    try {
      const response6 = await axios.post(`${BASE_URL}/promotions/validate-period`, test6, { headers });
      console.log('Response 6:', response6.data);
    } catch (error) {
      console.log('Response 6:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the test
testValidationAPIWithAuth();
