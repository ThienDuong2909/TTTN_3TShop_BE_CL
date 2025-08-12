const KhachHang = require("../models/KhachHang");
const { Op } = require("sequelize");

const KhachHangService = {
  updateProfile: async (maKH, profileData) => {
    const { TenKH, DiaChi, SDT, CCCD, NgaySinh, GioiTinh } = profileData;

    // Validate required fields
    if (!TenKH || !TenKH.trim()) {
      throw new Error("Tên khách hàng không được để trống");
    }

    if (!SDT || !SDT.trim()) {
      throw new Error("Số điện thoại không được để trống");
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(SDT.trim())) {
      throw new Error("Số điện thoại không hợp lệ (phải có 10-11 chữ số)");
    }

    // Validate CCCD format if provided
    if (CCCD && CCCD.trim() && !/^[0-9]{12}$/.test(CCCD.trim())) {
      throw new Error("CCCD phải có đúng 12 chữ số");
    }

    // Validate GioiTinh if provided
    if (
      GioiTinh !== null &&
      GioiTinh !== undefined &&
      ![0, 1, 2].includes(Number(GioiTinh))
    ) {
      throw new Error("Giới tính không hợp lệ (0: Nữ, 1: Nam)");
    }

    // Validate NgaySinh if provided
    if (NgaySinh && new Date(NgaySinh) > new Date()) {
      throw new Error("Ngày sinh không thể là ngày tương lai");
    }

    // Check if customer exists
    const existingCustomer = await KhachHang.findByPk(maKH);
    if (!existingCustomer) {
      throw new Error("Không tìm thấy khách hàng");
    }

    // Update customer profile
    const [affected] = await KhachHang.update(
      {
        TenKH: TenKH.trim(),
        DiaChi: DiaChi ? DiaChi.trim() : DiaChi,
        SDT: SDT.trim(),
        CCCD: CCCD && CCCD.trim() ? CCCD.trim() : null,
        NgaySinh: NgaySinh || null,
        GioiTinh:
          GioiTinh !== null && GioiTinh !== undefined ? Number(GioiTinh) : null,
      },
      { where: { MaKH: maKH } }
    );

    return affected;
  },
  updateAvatar: async (maKH, anhDaiDien) => {
    // Validate URL format
    if (!anhDaiDien || !anhDaiDien.trim()) {
      throw new Error("Đường dẫn ảnh không được để trống");
    }

    // Check if it's a valid URL
    try {
      new URL(anhDaiDien);
    } catch (error) {
      throw new Error("Đường dẫn ảnh không hợp lệ");
    }

    // Check if customer exists
    const existingCustomer = await KhachHang.findByPk(maKH);
    if (!existingCustomer) {
      throw new Error("Không tìm thấy khách hàng");
    }

    // Update avatar
    const [affected] = await KhachHang.update(
      { AnhDaiDien: anhDaiDien.trim() },
      { where: { MaKH: maKH } }
    );

    return affected;
  },
};

module.exports = KhachHangService;
