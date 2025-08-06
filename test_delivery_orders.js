const { DonDatHang, NhanVien, KhachHang, TrangThaiDH, NhanVien_BoPhan } = require('./src/models');
const sequelize = require('./src/models/sequelize');
const { Op } = require('sequelize');

async function testDeliveryOrders() {
  try {
    console.log('🔍 Kiểm tra dữ liệu đơn hàng giao hàng...\n');

    // 1. Kiểm tra nhân viên giao hàng
    console.log('📋 1. Kiểm tra nhân viên giao hàng:');
    const deliveryStaff = await NhanVien.findAll({
      include: [{
        model: NhanVien_BoPhan,
        where: {
          MaBoPhan: 11, // Bộ phận giao hàng
          TrangThai: 'DANGLAMVIEC'
        }
      }]
    });

    console.log(`✅ Tìm thấy ${deliveryStaff.length} nhân viên giao hàng:`);
    deliveryStaff.forEach(staff => {
      console.log(`   - MaNV: ${staff.MaNV}, TenNV: ${staff.TenNV}`);
    });

    // 2. Kiểm tra đơn hàng có MaNV_Giao
    console.log('\n📦 2. Kiểm tra đơn hàng được phân công:');
    const assignedOrders = await DonDatHang.findAll({
      where: {
        MaNV_Giao: { [Op.ne]: null }
      },
      include: [
        { model: KhachHang, attributes: ['MaKH', 'TenKH'] },
        { model: TrangThaiDH, attributes: ['MaTTDH', 'TrangThai'] },
        { model: NhanVien, as: 'NguoiGiao', attributes: ['MaNV', 'TenNV'] }
      ]
    });

    console.log(`✅ Tìm thấy ${assignedOrders.length} đơn hàng được phân công:`);
    assignedOrders.forEach(order => {
      console.log(`   - MaDDH: ${order.MaDDH}, Khách hàng: ${order.KhachHang?.TenKH}, Trạng thái: ${order.TrangThaiDH?.TrangThai}, NV giao: ${order.NguoiGiao?.TenNV}`);
    });

    // 3. Kiểm tra đơn hàng của nhân viên MaTK: 21
    console.log('\n👤 3. Kiểm tra đơn hàng của nhân viên MaTK: 21:');
    const ordersForStaff21 = await DonDatHang.findAll({
      where: {
        MaNV_Giao: 21
      },
      include: [
        { model: KhachHang, attributes: ['MaKH', 'TenKH'] },
        { model: TrangThaiDH, attributes: ['MaTTDH', 'TrangThai'] }
      ]
    });

    console.log(`✅ Nhân viên MaTK: 21 có ${ordersForStaff21.length} đơn hàng được phân công:`);
    ordersForStaff21.forEach(order => {
      console.log(`   - MaDDH: ${order.MaDDH}, Khách hàng: ${order.KhachHang?.TenKH}, Trạng thái: ${order.TrangThaiDH?.TrangThai}`);
    });

    // 4. Kiểm tra đơn hàng có thể phân công (trạng thái đã duyệt)
    console.log('\n📋 4. Kiểm tra đơn hàng có thể phân công (trạng thái đã duyệt):');
    const availableOrders = await DonDatHang.findAll({
      where: {
        MaTTDH: 2, // Đã duyệt
        MaNV_Giao: null // Chưa phân công
      },
      include: [
        { model: KhachHang, attributes: ['MaKH', 'TenKH'] },
        { model: TrangThaiDH, attributes: ['MaTTDH', 'TrangThai'] }
      ],
      limit: 5
    });

    console.log(`✅ Tìm thấy ${availableOrders.length} đơn hàng có thể phân công:`);
    availableOrders.forEach(order => {
      console.log(`   - MaDDH: ${order.MaDDH}, Khách hàng: ${order.KhachHang?.TenKH}, Trạng thái: ${order.TrangThaiDH?.TrangThai}`);
    });

    // 5. Kiểm tra đơn hàng đang giao (status = 3)
    console.log('\n🚚 5. Kiểm tra đơn hàng đang giao (status = 3):');
    const deliveringOrders = await DonDatHang.findAll({
      where: {
        MaTTDH: 3 // Đang giao hàng
      },
      include: [
        { model: KhachHang, attributes: ['MaKH', 'TenKH', 'SDT', 'DiaChi'] },
        { model: TrangThaiDH, attributes: ['MaTTDH', 'TrangThai'] },
        { model: NhanVien, as: 'NguoiGiao', attributes: ['MaNV', 'TenNV'] },
        { model: NhanVien, as: 'NguoiDuyet', attributes: ['MaNV', 'TenNV'] }
      ]
    });

    console.log(`✅ Tìm thấy ${deliveringOrders.length} đơn hàng đang giao:`);
    deliveringOrders.forEach(order => {
      console.log(`   - MaDDH: ${order.MaDDH}`);
      console.log(`     Khách hàng: ${order.KhachHang?.TenKH} (${order.KhachHang?.SDT})`);
      console.log(`     Địa chỉ: ${order.DiaChiGiao || order.KhachHang?.DiaChi}`);
      console.log(`     Trạng thái: ${order.TrangThaiDH?.TrangThai}`);
      console.log(`     NV giao: ${order.NguoiGiao?.TenNV} (MaNV: ${order.NguoiGiao?.MaNV})`);
      console.log(`     NV duyệt: ${order.NguoiDuyet?.TenNV}`);
      console.log(`     Thời gian giao: ${order.ThoiGianGiao}`);
      console.log('');
    });

    // 6. Tạo dữ liệu mẫu nếu cần
    if (ordersForStaff21.length === 0 && availableOrders.length > 0 && deliveryStaff.length > 0) {
      console.log('\n🔄 6. Tạo dữ liệu mẫu...');
      
      // Phân công đơn hàng đầu tiên cho nhân viên MaTK: 21
      const orderToAssign = availableOrders[0];
      const staff21 = deliveryStaff.find(staff => staff.MaNV === 21);
      
      if (orderToAssign && staff21) {
        await orderToAssign.update({
          MaNV_Giao: 21,
          MaTTDH: 3, // Đang giao hàng
          ThoiGianGiao: new Date()
        });
        
        console.log(`✅ Đã phân công đơn hàng ${orderToAssign.MaDDH} cho nhân viên ${staff21.TenNV}`);
        
        // Kiểm tra lại
        const newOrdersForStaff21 = await DonDatHang.findAll({
          where: { MaNV_Giao: 21 },
          include: [
            { model: KhachHang, attributes: ['MaKH', 'TenKH'] },
            { model: TrangThaiDH, attributes: ['MaTTDH', 'TrangThai'] }
          ]
        });
        
        console.log(`✅ Bây giờ nhân viên MaTK: 21 có ${newOrdersForStaff21.length} đơn hàng được phân công`);
      }
    }

    console.log('\n✅ Hoàn thành kiểm tra!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await sequelize.close();
  }
}

testDeliveryOrders(); 