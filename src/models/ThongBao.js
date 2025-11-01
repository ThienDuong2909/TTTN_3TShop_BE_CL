const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize"); // Giả định file kết nối sequelize của bạn tên là 'sequelize.js'

const ThongBao = sequelize.define(
  "ThongBao",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaNhanVien: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "NhanVien", // Tên bảng mà nó tham chiếu đến
        key: "MaNV", // Khóa chính của bảng NhanVien
      },
    },
    MaThietBi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    NhaCungCap: {
      type: DataTypes.STRING(10),
      allowNull: true, // 'null' trong SQL tương ứng với 'allowNull: true'
    },
    NenTang: {
      type: DataTypes.STRING(10),
      allowNull: true, // 'null' trong SQL tương ứng với 'allowNull: true'
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    // Thêm các tùy chọn này nếu bạn không muốn Sequelize tự động thêm
    // các cột 'createdAt' và 'updatedAt'
    timestamps: false,

    // Thêm tùy chọn này để đảm bảo tên bảng không bị Sequelize tự động
    // chuyển thành số nhiều (ví dụ: 'ThongBaos')
    freezeTableName: true,

    // Chỉ định rõ tên bảng (mặc dù 'ThongBao' đã trùng)
    tableName: "ThongBao",
  }
);

module.exports = ThongBao;
