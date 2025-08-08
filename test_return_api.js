const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api'; // Sửa từ 3000 thành 8080

// Test data
const testData = {
  customerToken: '', // Cần token của khách hàng
  employeeToken: '', // Cần token của nhân viên
  orderId: 1, // ID đơn hàng đã hoàn tất
  returnReason: 'Sản phẩm không đúng như mô tả'
};

// Helper function để set authorization header
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Test API trả hàng
const testReturnAPI = async () => {
  console.log('=== TESTING RETURN API ===\n');

  try {
    // 1. Test khách hàng yêu cầu trả hàng
    console.log('1. Testing customer return request...');
    const returnRequest = await axios.post(`${BASE_URL}/tra-hang/request`, {
      maDDH: testData.orderId,
      lyDo: testData.returnReason
    }, {
      headers: getAuthHeaders(testData.customerToken)
    });
    console.log('✅ Return request successful:', returnRequest.data);
    console.log('');

    // 2. Test lấy danh sách yêu cầu trả hàng (nhân viên)
    console.log('2. Testing get return requests...');
    const returnRequests = await axios.get(`${BASE_URL}/tra-hang/requests?page=1&limit=10`, {
      headers: getAuthHeaders(testData.employeeToken)
    });
    console.log('✅ Get return requests successful:', returnRequests.data);
    console.log('');

    // 3. Test tạo phiếu trả hàng
    console.log('3. Testing create return slip...');
    const returnSlip = await axios.post(`${BASE_URL}/tra-hang/slip`, {
      maDDH: testData.orderId,
      danhSachSanPham: [
        {
          maCTDDH: 1,
          soLuongTra: 1
        }
      ],
      lyDo: testData.returnReason
    }, {
      headers: getAuthHeaders(testData.employeeToken)
    });
    console.log('✅ Create return slip successful:', returnSlip.data);
    const returnSlipId = returnSlip.data.data.MaPhieuTra;
    console.log('');

    // 4. Test tạo phiếu chi
    console.log('4. Testing create payment slip...');
    const paymentSlip = await axios.post(`${BASE_URL}/tra-hang/payment`, {
      maPhieuTra: returnSlipId,
      soTien: 100000,
      phuongThucChi: 'Tiền mặt',
      ghiChu: 'Hoàn tiền trả hàng'
    }, {
      headers: getAuthHeaders(testData.employeeToken)
    });
    console.log('✅ Create payment slip successful:', paymentSlip.data);
    console.log('');

    // 5. Test lấy chi tiết phiếu trả hàng
    console.log('5. Testing get return slip detail...');
    const returnSlipDetail = await axios.get(`${BASE_URL}/tra-hang/slip/${returnSlipId}`, {
      headers: getAuthHeaders(testData.employeeToken)
    });
    console.log('✅ Get return slip detail successful:', returnSlipDetail.data);
    console.log('');

    // 6. Test lấy lịch sử trả hàng của khách hàng
    console.log('6. Testing get customer return history...');
    const customerHistory = await axios.get(`${BASE_URL}/tra-hang/history?page=1&limit=10`, {
      headers: getAuthHeaders(testData.customerToken)
    });
    console.log('✅ Get customer return history successful:', customerHistory.data);
    console.log('');

    // 7. Test lấy danh sách phiếu trả hàng
    console.log('7. Testing get return slips...');
    const returnSlips = await axios.get(`${BASE_URL}/tra-hang/slips?page=1&limit=10`, {
      headers: getAuthHeaders(testData.employeeToken)
    });
    console.log('✅ Get return slips successful:', returnSlips.data);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Test các trường hợp lỗi
const testErrorCases = async () => {
  console.log('\n=== TESTING ERROR CASES ===\n');

  try {
    // Test không có token
    console.log('1. Testing without token...');
    await axios.post(`${BASE_URL}/tra-hang/request`, {
      maDDH: testData.orderId,
      lyDo: testData.returnReason
    });
  } catch (error) {
    console.log('✅ No token error:', error.response?.status, error.response?.data?.message);
  }

  try {
    // Test đơn hàng không tồn tại
    console.log('2. Testing non-existent order...');
    await axios.post(`${BASE_URL}/tra-hang/request`, {
      maDDH: 99999,
      lyDo: testData.returnReason
    }, {
      headers: getAuthHeaders(testData.customerToken)
    });
  } catch (error) {
    console.log('✅ Non-existent order error:', error.response?.status, error.response?.data?.message);
  }

  try {
    // Test thiếu thông tin
    console.log('3. Testing missing required fields...');
    await axios.post(`${BASE_URL}/tra-hang/request`, {
      maDDH: testData.orderId
      // Thiếu lyDo
    }, {
      headers: getAuthHeaders(testData.customerToken)
    });
  } catch (error) {
    console.log('✅ Missing fields error:', error.response?.status, error.response?.data?.message);
  }
};

// Chạy test
const runTests = async () => {
  console.log('🚀 Starting Return API Tests...\n');

  // Cần cập nhật token trước khi chạy test
  if (!testData.customerToken || !testData.employeeToken) {
    console.log('⚠️  Please update customerToken and employeeToken in testData before running tests');
    return;
  }

  await testReturnAPI();
  await testErrorCases();

  console.log('\n✅ All tests completed!');
};

// Export cho việc sử dụng trong các file test khác
module.exports = {
  testReturnAPI,
  testErrorCases,
  runTests
};

// Chạy test nếu file được gọi trực tiếp
if (require.main === module) {
  runTests();
}
