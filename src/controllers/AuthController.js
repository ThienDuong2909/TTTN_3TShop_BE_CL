const AuthService = require("../services/AuthService");
const NhanVienService = require("../services/NhanVienService");
const response = require("../utils/response");

const AuthController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return response.validationError(res, null, "Thiếu email hoặc mật khẩu");
      }
      const result = await AuthService.login(email, password);
      return response.success(res, result, "Đăng nhập thành công");
    } catch (err) {
      console.log(err.status);
      const status = err.status || 401;
      return response.error(
        res,
        { code: err.code || "AUTH_ERROR", detail: err.message },
        "Đăng nhập thất bại",
        status
      );
    }
  },
  loginGoogle: async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return response.validationError(res, null, "Thiếu idToken");
      }
      const result = await AuthService.loginGoogle(idToken);
      return response.success(res, result, "Đăng nhập Google thành công");
    } catch (err) {
      return response.error(
        res,
        { code: "AUTH_ERROR", detail: err.message },
        "Đăng nhập Google thất bại",
        401
      );
    }
  },
  register: async (req, res) => {
    try {
      const result = await AuthService.register(req.body);
      return response.success(res, result, "Đăng ký thành công", 201);
    } catch (err) {
      if (err.message === "Chỉ admin mới được phép tạo tài khoản nhân viên") {
        return response.error(res, err.message, "Không được phép", 403);
      }
      return response.error(res, err.message, "Đăng ký thất bại", 400);
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const result = await AuthService.logout(token);
      return response.success(res, result, "Đăng xuất thành công");
    } catch (err) {
      console.log("err", err.message);
      return response.error(res, err.message, "Đăng xuất thất bại");
    }
  },
  profile: async (req, res) => {
    try {
      // Get user info from JWT middleware
      const taiKhoanId = req.user?.id || req.user?.MaTK;
      if (!taiKhoanId) {
        return response.error(res, null, "Chưa đăng nhập", 401);
      }
      // Lấy profile cho cả nhân viên và khách hàng
      const nhanVien = await NhanVienService.getByTaiKhoanId(taiKhoanId);
      if (nhanVien)
        return response.success(
          res,
          nhanVien,
          "Lấy thông tin nhân viên thành công"
        );
      // Nếu không phải nhân viên, trả về thông tin khách hàng
      const { KhachHang } = require("../models");
      const khachHang = await KhachHang.findOne({
        where: { MaTK: taiKhoanId },
      });
      if (khachHang)
        return response.success(
          res,
          khachHang,
          "Lấy thông tin khách hàng thành công"
        );
      return response.notFound(res, "Không tìm thấy thông tin tài khoản");
    } catch (err) {
      return response.error(res, err);
    }
  },
  getAccountDetails: async (req, res) => {
    try {
      const taiKhoanId = req.user?.id || req.user?.MaTK;

      if (!taiKhoanId) {
        return response.error(res, null, "Chưa đăng nhập", 401);
      }

      const accountDetails = await AuthService.getAccountDetails(taiKhoanId);

      if (!accountDetails) {
        return response.notFound(res, "Không tìm thấy tài khoản");
      }

      return response.success(
        res,
        accountDetails,
        "Lấy thông tin tài khoản thành công"
      );
    } catch (err) {
      return response.error(
        res,
        null,
        err.message || "Lỗi khi lấy thông tin tài khoản"
      );
    }
  },

  changePassword: async (req, res) => {
    try {
      const taiKhoanId = req.user?.id || req.user?.MaTK;
      const { matKhauCu, matKhauMoi } = req.body;
      console.log("TaiKhoanId:", taiKhoanId);

      if (!taiKhoanId) {
        return response.error(res, null, "Chưa đăng nhập", 401);
      }

      // Validate input
      if (!matKhauCu || !matKhauMoi) {
        return response.error(
          res,
          null,
          "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới",
          400
        );
      }

      // Change password
      const affected = await AuthService.changePassword(
        taiKhoanId,
        matKhauCu,
        matKhauMoi
      );

      if (!affected) {
        return response.error(res, null, "Không thể đổi mật khẩu", 400);
      }

      return response.success(res, null, "Đổi mật khẩu thành công");
    } catch (err) {
      return response.error(
        res,
        null,
        err.message || "Lỗi khi đổi mật khẩu",
        400
      );
    }
  },
};

module.exports = AuthController;
