const { TrangThaiDH } = require('./models');

const seedOrderStatuses = async () => {
  try {
    console.log('Seeding order statuses...');

    const statuses = [
      {
        MaTTDH: 1,
        TrangThai: 'CHỜ XÁC NHẬN',
        Note: 'Đơn hàng đang chờ xác nhận từ nhân viên'
      },
      {
        MaTTDH: 2,
        TrangThai: 'ĐANG CHUẨN BỊ',
        Note: 'Đơn hàng đã được xác nhận và đang chuẩn bị hàng'
      },
      {
        MaTTDH: 3,
        TrangThai: 'ĐANG GIAO',
        Note: 'Đơn hàng đang được giao đến khách hàng'
      },
      {
        MaTTDH: 4,
        TrangThai: 'HOÀN THÀNH',
        Note: 'Đơn hàng đã được giao thành công'
      },
      {
        MaTTDH: 5,
        TrangThai: 'HỦY',
        Note: 'Đơn hàng đã bị hủy'
      },
      {
        MaTTDH: 6,
        TrangThai: 'GIỎ HÀNG',
        Note: 'Đơn hàng đang ở trong giỏ hàng, chưa được đặt'
      }
    ];

    for (const status of statuses) {
      const existingStatus = await TrangThaiDH.findByPk(status.MaTTDH);
      if (!existingStatus) {
        await TrangThaiDH.create(status);
        console.log(`Created status: ${status.TrangThai}`);
      } else {
        console.log(`Status already exists: ${status.TrangThai}`);
      }
    }

    console.log('Order statuses seeding completed!');
  } catch (error) {
    console.error('Error seeding order statuses:', error);
  }
};

// Chạy seed nếu file được gọi trực tiếp
if (require.main === module) {
  seedOrderStatuses().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seedOrderStatuses;
