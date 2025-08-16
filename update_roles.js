const { sequelize, VaiTro, TaiKhoan, NhanVien } = require("./src/models");

async function updateRoles() {
  try {
    console.log("🔄 Bắt đầu cập nhật hệ thống phân quyền...");

    // Sync database
    await sequelize.sync();

    // Xóa dữ liệu cũ trong bảng VaiTro
    console.log("🗑️  Xóa dữ liệu vai trò cũ...");
    await VaiTro.destroy({ where: {} });

    // Thêm vai trò mới
    console.log("➕ Thêm vai trò mới...");
    const roles = [
      { MaVaiTro: 1, TenVaiTro: "Admin" },
      { MaVaiTro: 2, TenVaiTro: "NhanVienCuaHang" },
      { MaVaiTro: 3, TenVaiTro: "NhanVienGiaoHang" },
      { MaVaiTro: 4, TenVaiTro: "KhachHang" },
    ];

    for (const role of roles) {
      await VaiTro.findOrCreate({
        where: { MaVaiTro: role.MaVaiTro },
        defaults: role,
      });
    }

    console.log("✅ Đã tạo 4 vai trò mới");

    // Cập nhật tài khoản hiện có
    console.log("🔄 Cập nhật tài khoản hiện có...");

    // Cập nhật tài khoản admin (nếu có)
    const adminCount = await TaiKhoan.update(
      { MaVaiTro: 1 },
      { where: { Email: { [sequelize.Op.like]: "%admin%" } } }
    );
    console.log(`👑 Cập nhật ${adminCount[0]} tài khoản admin`);

    // Cập nhật tài khoản khách hàng (từ MaVaiTro = 3 cũ)
    const customerCount = await TaiKhoan.update(
      { MaVaiTro: 4 },
      { where: { MaVaiTro: 3 } }
    );
    console.log(`👤 Cập nhật ${customerCount[0]} tài khoản khách hàng`);

    // Cập nhật tài khoản nhân viên
    // Nhân viên có KhuVuc → NhanVienGiaoHang (MaVaiTro = 3)
    const deliveryStaffCount = await TaiKhoan.update(
      { MaVaiTro: 3 },
      {
        where: {
          MaVaiTro: 2,
          MaTK: {
            [sequelize.Op.in]: sequelize.literal(`
              SELECT MaTK FROM NhanVien WHERE KhuVuc IS NOT NULL
            `),
          },
        },
      }
    );
    console.log(
      `🚚 Cập nhật ${deliveryStaffCount[0]} tài khoản nhân viên giao hàng`
    );

    // Nhân viên không có KhuVuc → NhanVienCuaHang (MaVaiTro = 2)
    const storeStaffCount = await TaiKhoan.update(
      { MaVaiTro: 2 },
      {
        where: {
          MaVaiTro: 2,
          MaTK: {
            [sequelize.Op.in]: sequelize.literal(`
              SELECT MaTK FROM NhanVien WHERE KhuVuc IS NULL
            `),
          },
        },
      }
    );
    console.log(
      `🏪 Cập nhật ${storeStaffCount[0]} tài khoản nhân viên cửa hàng`
    );

    // Hiển thị thống kê
    console.log("\n📊 THỐNG KÊ VAI TRÒ:");
    const roleStats = await TaiKhoan.findAll({
      attributes: [
        "MaVaiTro",
        [sequelize.fn("COUNT", sequelize.col("MaTK")), "count"],
      ],
      include: [
        {
          model: VaiTro,
          attributes: ["TenVaiTro"],
        },
      ],
      group: ["MaVaiTro", "VaiTro.TenVaiTro"],
    });

    roleStats.forEach((stat) => {
      console.log(
        `- ${stat.VaiTro.TenVaiTro}: ${stat.dataValues.count} tài khoản`
      );
    });

    console.log("\n✅ Cập nhật hệ thống phân quyền thành công!");
    console.log(
      "📝 Xem file PHAN_QUYEN_SYSTEM.md để biết chi tiết về hệ thống phân quyền mới"
    );
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật hệ thống phân quyền:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateRoles();

// getNewProducts: async () => {
//   const today = new Date(), before30Days = new Date(today);
//   before30Days.setDate(today.getDate() - 30);
//   const todayStr = today.toISOString().split("T")[0], before30DaysStr = before30Days.toISOString().split("T")[0];

//   return await SanPham.findAll({
//     where: { NgayTao: { [Op.gte]: before30DaysStr, [Op.lte]: todayStr } },
//     include: [
//       { model: NhaCungCap },
//       { model: LoaiSP },
//       { model: AnhSanPham },
//       { model: ThayDoiGia },
//       { model: ChiTietSanPham, as: "ChiTietSanPhams", include: [
//         { model: KichThuoc, attributes: ["TenKichThuoc"] },
//         { model: Mau, attributes: ["TenMau", "MaHex"] },
//       ], attributes: ["MaCTSP", "MaKichThuoc", "MaMau", "SoLuongTon"] },
//       { model: ThayDoiGia, where: { NgayApDung: { [Op.lte]: todayStr } }, separate: true, limit: 1, order: [["NgayApDung", "DESC"]], attributes: ["Gia", "NgayApDung"] },
//       { model: CT_DotGiamGia, include: [
//         { model: DotGiamGia, where: { NgayBatDau: { [Op.lte]: todayStr }, NgayKetThuc: { [Op.gte]: todayStr } }, required: true, attributes: ["NgayBatDau", "NgayKetThuc", "MoTa"] }
//       ], attributes: ["PhanTramGiam"] },
//     ],
//   });
// },

