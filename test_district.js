const NhanVienService = require('./src/services/NhanVienService');

// Test function
async function testDistrictExtraction() {
  console.log('=== TEST DISTRICT EXTRACTION ===\n');
  
  const testAddresses = [
    "123, Phan Chu Trinh, Thủ Đức, TP. HCM",
    "456 Nguyễn Huệ, Phường Bến Nghé, Quận 1",
    "789 Lê Lợi, Bến Thành, Q1",
    "321 Võ Văn Tần, Phường 6, Quận 3",
    "Số 15, Đường ABC, Phường Tân Định, Quận 1",
    "Chung cư XYZ, Phường Linh Trung, Thủ Đức"
  ];
  
  for (const address of testAddresses) {
    console.log(`\nĐịa chỉ: ${address}`);
    try {
      const district = NhanVienService.extractPhuongXa(address);
      console.log(`Kết quả: "${district}"`);
      
      // Test get delivery staff
      const staff = await NhanVienService.getAvailableDeliveryStaff(address);
      console.log(`Số nhân viên tìm được: ${staff.length}`);
      if (staff.length > 0) {
        console.log(`Nhân viên ưu tiên: ${staff[0].TenNV} (${staff[0].LoaiPhuTrach})`);
      }
    } catch (error) {
      console.error(`Lỗi: ${error.message}`);
    }
    console.log('-'.repeat(50));
  }
}

// Chạy test
testDistrictExtraction()
  .then(() => {
    console.log('\n=== TEST COMPLETED ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
