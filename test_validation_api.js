const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/promotions';

async function testValidationAPI() {
  try {
    console.log('=== Testing Discount Period Validation API ===\n');

    // Test 1: Valid non-overlapping period
    console.log('Test 1: Valid non-overlapping period');
    const test1 = {
      ngayBatDau: '2024-05-01',
      ngayKetThuc: '2024-05-15'
    };
    
    const response1 = await axios.post(`${BASE_URL}/validate-period`, test1);
    console.log('Response 1:', response1.data);
    console.log('');

    // Test 2: Overlapping period - should find conflicts
    console.log('Test 2: Overlapping period (should find conflicts)');
    const test2 = {
      ngayBatDau: '2024-01-01',
      ngayKetThuc: '2024-03-31'
    };
    
    try {
      const response2 = await axios.post(`${BASE_URL}/validate-period`, test2);
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
      const response3 = await axios.post(`${BASE_URL}/validate-period`, test3);
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
      const response4 = await axios.post(`${BASE_URL}/validate-period`, test4);
      console.log('Response 4:', response4.data);
    } catch (error) {
      console.log('Response 4 (Expected error):', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Missing required fields
    console.log('Test 5: Missing required fields');
    const test5 = {
      ngayBatDau: '2024-05-01'
      // Missing ngayKetThuc
    };
    
    try {
      const response5 = await axios.post(`${BASE_URL}/validate-period`, test5);
      console.log('Response 5:', response5.data);
    } catch (error) {
      console.log('Response 5 (Expected error):', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the test
testValidationAPI();
