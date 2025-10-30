const { TaiKhoan, VaiTro, NhanVien, KhachHang } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const AuthService = {
  login: async (email, password) => {
    // Find user by email
    const taiKhoan = await TaiKhoan.findOne({
      where: { Email: email },
      include: [{ model: VaiTro }],
    });
    if (!taiKhoan) {
      const error = new Error("Email không tồn tại");
      error.code = "EMAIL_NOT_FOUND";
      error.status = 401;
      throw error;
    }
    // Check password
    const isValidPassword = await bcrypt.compare(password, taiKhoan.Password);
    if (!isValidPassword) {
      const error = new Error("Mật khẩu không chính xác");
      error.code = "INVALID_PASSWORD";
      error.status = 401;
      throw error;
    }
    // Get user info based on role
    let userInfo = null;
    if (
      taiKhoan.VaiTro.TenVaiTro === "Admin" ||
      taiKhoan.VaiTro.TenVaiTro === "NhanVienCuaHang" ||
      taiKhoan.VaiTro.TenVaiTro === "NhanVienGiaoHang"
    ) {
      userInfo = await NhanVien.findOne({
        where: { MaTK: taiKhoan.MaTK },
        include: [{ model: TaiKhoan, include: [{ model: VaiTro }] }],
      });
    } else {
      userInfo = await KhachHang.findOne({
        where: { MaTK: taiKhoan.MaTK },
        include: [{ model: TaiKhoan, include: [{ model: VaiTro }] }],
      });
    }
    // Generate JWT token
    const token = jwt.sign(
      {
        MaTK: taiKhoan.MaTK,
        Email: taiKhoan.Email,
        VaiTro: taiKhoan.VaiTro.TenVaiTro,
        id: taiKhoan.MaTK,
      },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "24h" }
    );

    const isEmployee =
      taiKhoan.VaiTro.TenVaiTro === "Admin" ||
      taiKhoan.VaiTro.TenVaiTro === "NhanVienCuaHang" ||
      taiKhoan.VaiTro.TenVaiTro === "NhanVienGiaoHang";

    return {
      token,
      user: userInfo,
      role: taiKhoan.VaiTro.TenVaiTro,
      id: userInfo.MaTK || userInfo.MaKH,
      employeeId: isEmployee ? userInfo.MaNV : null,
    };
  },

  register: async (userData) => {
    // Không cho phép đăng ký nhân viên qua API này
    if (
      userData.MaVaiTro === 2 ||
      userData.MaVaiTro === 3 ||
      userData.TenNV ||
      userData.NgaySinh ||
      userData.Luong
    ) {
      throw new Error("Chỉ admin mới được phép tạo tài khoản nhân viên");
    }
    // Check if email already exists
    const existingUser = await TaiKhoan.findOne({
      where: { Email: userData.Email },
    });
    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.Password, 10);
    // Create account
    const taiKhoan = await TaiKhoan.create({
      Email: userData.Email,
      Password: hashedPassword,
      MaVaiTro: 4, // Luôn là khách hàng
    });
    // Create KhachHang
    const userRecord = await KhachHang.create({
      TenKH: userData.TenKH,
      DiaChi: userData.DiaChi,
      SDT: userData.SDT,
      CCCD: userData.CCCD,
      MaTK: taiKhoan.MaTK,
    });
    return { taiKhoan, userRecord };
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    } catch (error) {
      throw new Error("Token không hợp lệ");
    }
  },

  logout: async (token) => {
    // In a real app, you might want to maintain a blacklist of tokens
    // For now, we'll just return success
    return { message: "Đăng xuất thành công" };
  },
  getAccountDetails: async (taiKhoanId) => {
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId, {
      include: [
        {
          model: VaiTro,
          attributes: ["MaVaiTro", "TenVaiTro"],
        },
      ],
      attributes: ["MaTK", "Email"],
    });

    if (!taiKhoan) {
      throw new Error("Không tìm thấy tài khoản");
    }

    return {
      MaTK: taiKhoan.MaTK,
      Email: taiKhoan.Email,
      VaiTro: taiKhoan.VaiTro,
    };
  },
  changePassword: async (taiKhoanId, matKhauCu, matKhauMoi) => {
    // Validate input
    if (!matKhauCu || !matKhauMoi) {
      throw new Error("Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới");
    }

    if (matKhauMoi.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    if (matKhauCu === matKhauMoi) {
      throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    }

    // Get current account
    const taiKhoan = await TaiKhoan.findByPk(taiKhoanId);
    if (!taiKhoan) {
      throw new Error("Không tìm thấy tài khoản");
    }

    console.log("TaiKhoan:", taiKhoan);

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      matKhauCu,
      taiKhoan.Password
    );
    if (!isOldPasswordValid) {
      throw new Error("Mật khẩu cũ không chính xác");
    }

    console.log("Mật khẩu cũ hợp lệ");
    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(matKhauMoi, saltRounds);

    // Update password
    const [affected] = await TaiKhoan.update(
      { Password: hashedNewPassword },
      { where: { MaTK: taiKhoanId } }
    );

    return affected;
  },
};

module.exports = AuthService;
