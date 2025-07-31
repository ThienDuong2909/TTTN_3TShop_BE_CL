const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
let customerToken = '';
let adminToken = '';

// Test data
const testData = {
  customer: {
    email: 'customer@example.com',
    password: 'customer123'
  },
  admin: {
    email: 'admin@3tshop.com',
    password: 'admin123'
  },
  comment: {
    maCTDonDatHang: 1,
    moTa: 'Sản phẩm rất tốt, giao hàng nhanh!',
    soSao: 5
  }
};

// Helper function để log kết quả
const logResult = (testName, success, data = null, error = null) => {
  console.log(`\n${success ? '✅' : '❌'} ${testName}`);
  if (data) {
    console.log('📊 Data:', JSON.stringify(data, null, 2));
  }
  if (error) {
    console.log('🚨 Error:', error);
  }
};

// Test đăng nhập
const testLogin = async () => {
  console.log('\n🔐 TESTING LOGIN...');
  
  try {
    // Test đăng nhập khách hàng
    const customerResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testData.customer.email,
      password: testData.customer.password
    });
    
    if (customerResponse.data.success) {
      customerToken = customerResponse.data.data.token;
      logResult('Customer Login', true, { role: customerResponse.data.data.role });
    } else {
      logResult('Customer Login', false, null, customerResponse.data.message);
    }
  } catch (error) {
    logResult('Customer Login', false, null, error.response?.data?.message || error.message);
  }

  try {
    // Test đăng nhập admin
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testData.admin.email,
      password: testData.admin.password
    });
    
    if (adminResponse.data.success) {
      adminToken = adminResponse.data.data.token;
      logResult('Admin Login', true, { role: adminResponse.data.data.role });
    } else {
      logResult('Admin Login', false, null, adminResponse.data.message);
    }
  } catch (error) {
    logResult('Admin Login', false, null, error.response?.data?.message || error.message);
  }
};

// Test lấy bình luận sản phẩm (public)
const testGetProductComments = async () => {
  console.log('\n📝 TESTING GET PRODUCT COMMENTS (PUBLIC)...');
  
  try {
    const response = await axios.get(`${BASE_URL}/binh-luan/product/1?page=1&limit=5`);
    logResult('Get Product Comments', true, {
      totalComments: response.data.data.comments?.length || 0,
      pagination: response.data.data.pagination
    });
  } catch (error) {
    logResult('Get Product Comments', false, null, error.response?.data?.message || error.message);
  }
};

// Test lấy thống kê bình luận (public)
const testGetProductStats = async () => {
  console.log('\n📊 TESTING GET PRODUCT STATS (PUBLIC)...');
  
  try {
    const response = await axios.get(`${BASE_URL}/binh-luan/product/1/stats`);
    logResult('Get Product Stats', true, response.data.data);
  } catch (error) {
    logResult('Get Product Stats', false, null, error.response?.data?.message || error.message);
  }
};

// Test lấy sản phẩm có thể bình luận (customer)
const testGetCommentableProducts = async () => {
  console.log('\n🛍️ TESTING GET COMMENTABLE PRODUCTS (CUSTOMER)...');
  
  if (!customerToken) {
    logResult('Get Commentable Products', false, null, 'No customer token');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/binh-luan/commentable?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logResult('Get Commentable Products', true, {
      totalProducts: response.data.data.products?.length || 0,
      pagination: response.data.data.pagination
    });
  } catch (error) {
    logResult('Get Commentable Products', false, null, error.response?.data?.message || error.message);
  }
};

// Test tạo bình luận (customer)
const testCreateComment = async () => {
  console.log('\n✍️ TESTING CREATE COMMENT (CUSTOMER)...');
  
  if (!customerToken) {
    logResult('Create Comment', false, null, 'No customer token');
    return;
  }
  
  try {
    const response = await axios.post(`${BASE_URL}/binh-luan`, testData.comment, {
      headers: { 
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    logResult('Create Comment', true, {
      commentId: response.data.data.MaBL,
      message: response.data.message
    });
    return response.data.data.MaBL; // Trả về ID bình luận để test update/delete
  } catch (error) {
    logResult('Create Comment', false, null, error.response?.data?.message || error.message);
    return null;
  }
};

// Test lấy bình luận của khách hàng (customer)
const testGetCustomerComments = async () => {
  console.log('\n👤 TESTING GET CUSTOMER COMMENTS (CUSTOMER)...');
  
  if (!customerToken) {
    logResult('Get Customer Comments', false, null, 'No customer token');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/binh-luan/customer?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logResult('Get Customer Comments', true, {
      totalComments: response.data.data.comments?.length || 0,
      pagination: response.data.data.pagination
    });
  } catch (error) {
    logResult('Get Customer Comments', false, null, error.response?.data?.message || error.message);
  }
};

// Test cập nhật bình luận (customer)
const testUpdateComment = async (commentId) => {
  console.log('\n✏️ TESTING UPDATE COMMENT (CUSTOMER)...');
  
  if (!customerToken || !commentId) {
    logResult('Update Comment', false, null, 'No customer token or comment ID');
    return;
  }
  
  try {
    const updateData = {
      moTa: 'Sản phẩm rất tốt, giao hàng nhanh! (Đã cập nhật)',
      soSao: 4
    };
    
    const response = await axios.put(`${BASE_URL}/binh-luan/${commentId}`, updateData, {
      headers: { 
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    logResult('Update Comment', true, {
      commentId: response.data.data.MaBL,
      message: response.data.message
    });
  } catch (error) {
    logResult('Update Comment', false, null, error.response?.data?.message || error.message);
  }
};

// Test xóa bình luận (customer)
const testDeleteComment = async (commentId) => {
  console.log('\n🗑️ TESTING DELETE COMMENT (CUSTOMER)...');
  
  if (!customerToken || !commentId) {
    logResult('Delete Comment', false, null, 'No customer token or comment ID');
    return;
  }
  
  try {
    const response = await axios.delete(`${BASE_URL}/binh-luan/${commentId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    logResult('Delete Comment', true, {
      message: response.data.message
    });
  } catch (error) {
    logResult('Delete Comment', false, null, error.response?.data?.message || error.message);
  }
};

// Test lấy tất cả bình luận (admin)
const testGetAllComments = async () => {
  console.log('\n👑 TESTING GET ALL COMMENTS (ADMIN)...');
  
  if (!adminToken) {
    logResult('Get All Comments', false, null, 'No admin token');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/binh-luan?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    logResult('Get All Comments', true, {
      totalComments: response.data.data.comments?.length || 0,
      pagination: response.data.data.pagination
    });
  } catch (error) {
    logResult('Get All Comments', false, null, error.response?.data?.message || error.message);
  }
};

// Test lấy bình luận theo ID (public)
const testGetCommentById = async (commentId) => {
  console.log('\n🔍 TESTING GET COMMENT BY ID (PUBLIC)...');
  
  if (!commentId) {
    logResult('Get Comment By ID', false, null, 'No comment ID');
    return;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/binh-luan/${commentId}`);
    logResult('Get Comment By ID', true, {
      commentId: response.data.data.MaBL,
      customerName: response.data.data.KhachHang?.TenKH
    });
  } catch (error) {
    logResult('Get Comment By ID', false, null, error.response?.data?.message || error.message);
  }
};

// Test validation errors
const testValidationErrors = async () => {
  console.log('\n⚠️ TESTING VALIDATION ERRORS...');
  
  if (!customerToken) {
    logResult('Validation Tests', false, null, 'No customer token');
    return;
  }
  
  // Test thiếu thông tin
  try {
    await axios.post(`${BASE_URL}/binh-luan`, {}, {
      headers: { 
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    logResult('Missing Data Validation', false, null, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 400) {
      logResult('Missing Data Validation', true, { message: error.response.data.message });
    } else {
      logResult('Missing Data Validation', false, null, error.response?.data?.message || error.message);
    }
  }
  
  // Test số sao không hợp lệ
  try {
    await axios.post(`${BASE_URL}/binh-luan`, {
      maCTDonDatHang: 1,
      moTa: 'Test comment',
      soSao: 6 // Số sao > 5
    }, {
      headers: { 
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    logResult('Invalid Rating Validation', false, null, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 400) {
      logResult('Invalid Rating Validation', true, { message: error.response.data.message });
    } else {
      logResult('Invalid Rating Validation', false, null, error.response?.data?.message || error.message);
    }
  }
};

// Test unauthorized access
const testUnauthorizedAccess = async () => {
  console.log('\n🚫 TESTING UNAUTHORIZED ACCESS...');
  
  // Test tạo bình luận không có token
  try {
    await axios.post(`${BASE_URL}/binh-luan`, testData.comment);
    logResult('Unauthorized Create Comment', false, null, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 401) {
      logResult('Unauthorized Create Comment', true, { message: 'Properly blocked' });
    } else {
      logResult('Unauthorized Create Comment', false, null, error.response?.data?.message || error.message);
    }
  }
  
  // Test lấy sản phẩm có thể bình luận không có token
  try {
    await axios.get(`${BASE_URL}/binh-luan/commentable`);
    logResult('Unauthorized Get Commentable Products', false, null, 'Should have failed');
  } catch (error) {
    if (error.response?.status === 401) {
      logResult('Unauthorized Get Commentable Products', true, { message: 'Properly blocked' });
    } else {
      logResult('Unauthorized Get Commentable Products', false, null, error.response?.data?.message || error.message);
    }
  }
};

// Chạy tất cả tests
const runAllTests = async () => {
  console.log('🚀 STARTING COMMENT API TESTS...');
  
  // Test đăng nhập trước
  await testLogin();
  
  // Test public endpoints
  await testGetProductComments();
  await testGetProductStats();
  
  // Test customer endpoints
  await testGetCommentableProducts();
  await testGetCustomerComments();
  
  // Test tạo bình luận và lưu ID
  const commentId = await testCreateComment();
  
  // Test lấy bình luận theo ID
  await testGetCommentById(commentId);
  
  // Test cập nhật và xóa bình luận
  if (commentId) {
    await testUpdateComment(commentId);
    await testDeleteComment(commentId);
  }
  
  // Test admin endpoints
  await testGetAllComments();
  
  // Test validation và unauthorized access
  await testValidationErrors();
  await testUnauthorizedAccess();
  
  console.log('\n🎉 ALL TESTS COMPLETED!');
};

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testLogin,
  testGetProductComments,
  testGetProductStats,
  testGetCommentableProducts,
  testCreateComment,
  testGetCustomerComments,
  testUpdateComment,
  testDeleteComment,
  testGetAllComments,
  testGetCommentById,
  testValidationErrors,
  testUnauthorizedAccess,
  runAllTests
}; 