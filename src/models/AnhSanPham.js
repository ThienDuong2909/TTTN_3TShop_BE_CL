const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const AnhSanPham = sequelize.define('AnhSanPham', {
  MaAnh: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  MaSP: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'SanPham', key: 'MaSP' },
  },
  TenFile: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  DuongDan: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  AnhChinh: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Đánh dấu ảnh chính của sản phẩm'
  },
  ThuTu: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Thứ tự hiển thị ảnh'
  },
  MoTa: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Mô tả ngắn gọn về ảnh'
  }
});

module.exports = AnhSanPham; 