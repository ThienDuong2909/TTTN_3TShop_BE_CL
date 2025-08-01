const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test data
const testData = {
  login: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  phieuDatHang: {
    NgayDat: '2024-01-15',
    NgayKienNghiGiao: '2024-01-25',
    MaNCC: 1,
    MaTrangThai: 1,
    chiTiet: [
      {
        MaCTSP: 1,
        SoLuong: 10,
        DonGia: 100000
      }
    ]
  }
};

async function login() {
  try {
    console.log('🔐 Đăng nhập...');
    const response = await axios.post(`${BASE_URL}/auth/login`, testData.login);
    authToken = response.data.data.token;
    console.log('✅ Đăng nhập thành công');
    return true;
  } catch (error) {
    console.error('❌ Đăng nhập thất bại:', error.response?.data || error.message);
    return false;
  }
}

async function createPhieuDatHang() {
  try {
    console.log('📝 Tạo phiếu đặt hàng với ngày kiến nghị giao...');
    const response = await axios.post(`${BASE_URL}/phieu-dat-hang-ncc`, testData.phieuDatHang, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Tạo phiếu đặt hàng thành công:', response.data.data.MaPDH);
    return response.data.data.MaPDH;
  } catch (error) {
    console.error('❌ Tạo phiếu đặt hàng thất bại:', error.response?.data || error.message);
    return null;
  }
}

async function getPhieuDatHang(maPDH) {
  try {
    console.log(`📋 Lấy thông tin phiếu đặt hàng ${maPDH}...`);
    const response = await axios.get(`${BASE_URL}/phieu-dat-hang-ncc/${maPDH}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Lấy thông tin phiếu đặt hàng thành công');
    console.log('📅 Ngày kiến nghị giao:', response.data.data.NgayKienNghiGiao);
    return response.data.data;
  } catch (error) {
    console.error('❌ Lấy thông tin phiếu đặt hàng thất bại:', error.response?.data || error.message);
    return null;
  }
}

async function updateNgayKienNghiGiao(maPDH, newDate) {
  try {
    console.log(`🔄 Cập nhật ngày kiến nghị giao cho ${maPDH} thành ${newDate}...`);
    const response = await axios.put(`${BASE_URL}/phieu-dat-hang-ncc/${maPDH}/ngay-kien-nghi-giao`, {
      NgayKienNghiGiao: newDate
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Cập nhật ngày kiến nghị giao thành công');
    return response.data.data;
  } catch (error) {
    console.error('❌ Cập nhật ngày kiến nghị giao thất bại:', error.response?.data || error.message);
    return null;
  }
}

async function testInvalidDate(maPDH) {
  try {
    console.log('🧪 Test với ngày kiến nghị giao không hợp lệ (trước ngày đặt hàng)...');
    const response = await axios.put(`${BASE_URL}/phieu-dat-hang-ncc/${maPDH}/ngay-kien-nghi-giao`, {
      NgayKienNghiGiao: '2024-01-10' // Trước ngày đặt hàng (2024-01-15)
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('❌ Test thất bại - không bắt được lỗi validation');
  } catch (error) {
    console.log('✅ Test thành công - bắt được lỗi validation:', error.response?.data?.message);
  }
}

async function runTests() {
  console.log('🚀 Bắt đầu test chức năng NgayKienNghiGiao...\n');
  
  // Đăng nhập
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Không thể tiếp tục test do đăng nhập thất bại');
    return;
  }
  
  // Tạo phiếu đặt hàng
  const maPDH = await createPhieuDatHang();
  if (!maPDH) {
    console.log('❌ Không thể tiếp tục test do tạo phiếu đặt hàng thất bại');
    return;
  }
  
  // Lấy thông tin phiếu đặt hàng
  await getPhieuDatHang(maPDH);
  
  // Cập nhật ngày kiến nghị giao
  await updateNgayKienNghiGiao(maPDH, '2024-01-30');
  
  // Kiểm tra lại sau khi cập nhật
  await getPhieuDatHang(maPDH);
  
  // Test validation
  await testInvalidDate(maPDH);
  
  console.log('\n🎉 Hoàn thành test chức năng NgayKienNghiGiao!');
}

// Chạy test
runTests().catch(console.error); 