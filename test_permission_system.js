const PhanQuyenService = require('./src/services/PhanQuyenService');
const { sequelize } = require('./src/models');

async function testPermissionSystem() {
  try {
    console.log('🧪 Bắt đầu test hệ thống phân quyền...\n');

    // Test 1: Lấy tất cả quyền
    console.log('📋 Test 1: Lấy tất cả quyền');
    const allPermissions = await PhanQuyenService.getAllPermissions();
    console.log(`✅ Tìm thấy ${allPermissions.length} quyền\n`);

    // Test 2: Lấy quyền theo vai trò
    console.log('👥 Test 2: Lấy quyền theo vai trò');
    
    // Admin (MaVaiTro: 1)
    const adminPermissions = await PhanQuyenService.getPermissionsByRole(1);
    console.log(`✅ Admin có ${adminPermissions.length} quyền: ${adminPermissions.map(p => p.Ten).join(', ')}\n`);

    // Nhân viên cửa hàng (MaVaiTro: 2)
    const staffPermissions = await PhanQuyenService.getPermissionsByRole(2);
    console.log(`✅ Nhân viên cửa hàng có ${staffPermissions.length} quyền\n`);

    // Nhân viên giao hàng (MaVaiTro: 3)
    const deliveryPermissions = await PhanQuyenService.getPermissionsByRole(3);
    console.log(`✅ Nhân viên giao hàng có ${deliveryPermissions.length} quyền\n`);

    // Khách hàng (MaVaiTro: 4)
    const customerPermissions = await PhanQuyenService.getPermissionsByRole(4);
    console.log(`✅ Khách hàng có ${customerPermissions.length} quyền\n`);

    // Test 3: Kiểm tra quyền cụ thể
    console.log('🔍 Test 3: Kiểm tra quyền cụ thể');
    
    // Giả sử có user với MaTK = 1 (Admin)
    const adminUserId = 1;
    const hasAdminPermission = await PhanQuyenService.checkPermission(adminUserId, 'toanquyen');
    console.log(`✅ Admin có quyền toàn quyền: ${hasAdminPermission}`);

    const hasProductViewPermission = await PhanQuyenService.checkPermission(adminUserId, 'sanpham.xem');
    console.log(`✅ Admin có quyền xem sản phẩm: ${hasProductViewPermission}`);

    // Test 4: Kiểm tra quyền với context
    console.log('\n🔍 Test 4: Kiểm tra quyền với context');
    
    const contextTest = await PhanQuyenService.checkPermissionWithContext(
      adminUserId,
      'donhang.xem_cua_minh',
      { userId: adminUserId }
    );
    console.log(`✅ Admin có thể xem đơn hàng của mình: ${contextTest}`);

    // Test 5: Kiểm tra nhiều quyền cùng lúc
    console.log('\n🔍 Test 5: Kiểm tra nhiều quyền cùng lúc');
    
    const multiplePermissions = await PhanQuyenService.checkPermission(
      adminUserId, 
      ['sanpham.xem', 'sanpham.tao', 'sanpham.sua', 'sanpham.xoa']
    );
    console.log(`✅ Admin có tất cả quyền sản phẩm: ${multiplePermissions}`);

    // Test 6: Lấy quyền của user
    console.log('\n👤 Test 6: Lấy quyền của user');
    
    const userPermissions = await PhanQuyenService.getUserPermissions(adminUserId);
    console.log(`✅ User ${adminUserId} có ${userPermissions.length} quyền: ${userPermissions.join(', ')}`);

    console.log('\n🎉 Tất cả test đã hoàn thành thành công!');
    console.log('\n📊 Tóm tắt:');
    console.log(`- Tổng số quyền trong hệ thống: ${allPermissions.length}`);
    console.log(`- Admin có: ${adminPermissions.length} quyền`);
    console.log(`- Nhân viên cửa hàng có: ${staffPermissions.length} quyền`);
    console.log(`- Nhân viên giao hàng có: ${deliveryPermissions.length} quyền`);
    console.log(`- Khách hàng có: ${customerPermissions.length} quyền`);

  } catch (error) {
    console.error('❌ Lỗi trong quá trình test:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Đã đóng kết nối database');
  }
}

// Chạy test
testPermissionSystem(); 