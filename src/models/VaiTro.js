// Các vai trò mặc định:
// 1: Admin - Toàn quyền
// 2: NhanVienCuaHang - Nhân viên cửa hàng (quản lý sản phẩm, nhập hàng, đặt hàng)
// 3: NhanVienGiaoHang - Nhân viên giao hàng (xem đơn hàng được phân công, xác nhận giao hàng)
// 4: KhachHang - Khách hàng (đặt hàng, xem đơn hàng của mình)
const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const VaiTro = sequelize.define('VaiTro', {
  MaVaiTro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TenVaiTro: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
});

module.exports = VaiTro; 