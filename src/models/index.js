const { Sequelize } = require("sequelize");
const dbConfig = require("../configs/database");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  }
);

// Import models

const BoPhan = require("./BoPhan");
const NhaCungCap = require("./NhaCungCap");
const LoaiSP = require("./LoaiSP");
const KichThuoc = require("./KichThuoc");
const Mau = require("./Mau");
const SanPham = require("./SanPham");
const ThayDoiGia = require("./ThayDoiGia");
const ChiTietSanPham = require("./ChiTietSanPham");
const VaiTro = require("./VaiTro");
const TaiKhoan = require("./TaiKhoan");
const NhanVien = require("./NhanVien");
const NhanVien_BoPhan = require("./NhanVien_BoPhan");
const KhachHang = require("./KhachHang");
const TrangThaiDatHangNCC = require("./TrangThaiDatHangNCC");
const PhieuDatHangNCC = require("./PhieuDatHangNCC");
const CT_PhieuDatHangNCC = require("./CT_PhieuDatHangNCC");
const PhieuNhap = require("./PhieuNhap");
const CT_PhieuNhap = require("./CT_PhieuNhap");
const TrangThaiDH = require("./TrangThaiDH");
const DonDatHang = require("./DonDatHang");
const HoaDon = require("./HoaDon");
const PhieuTraHang = require("./PhieuTraHang");
const CT_DonDatHang = require("./CT_DonDatHang");
const BinhLuan = require("./BinhLuan");
const DotGiamGia = require("./DotGiamGia");
const CT_DotGiamGia = require("./CT_DotGiamGia");
const AnhSanPham = require("./AnhSanPham");
const PhanQuyen = require("./PhanQuyen");
const PhanQuyen_VaiTro = require("./PhanQuyen_VaiTro");

// Associations
// SanPham
LoaiSP.hasMany(SanPham, { foreignKey: "MaLoaiSP" });
SanPham.belongsTo(LoaiSP, { foreignKey: "MaLoaiSP" });
SanPham.belongsTo(NhaCungCap, { foreignKey: "MaNCC" });
SanPham.hasMany(ThayDoiGia, { foreignKey: "MaSP" });
SanPham.hasMany(ChiTietSanPham, { foreignKey: "MaSP" });
SanPham.hasMany(AnhSanPham, { foreignKey: "MaSP" });

// ThayDoiGia
ThayDoiGia.belongsTo(SanPham, { foreignKey: "MaSP" });

// ChiTietSanPham
ChiTietSanPham.belongsTo(SanPham, { foreignKey: "MaSP" });
ChiTietSanPham.belongsTo(KichThuoc, { foreignKey: "MaKichThuoc" });
ChiTietSanPham.belongsTo(Mau, { foreignKey: "MaMau" });
SanPham.hasMany(ChiTietSanPham, { foreignKey: "MaSP" });
KichThuoc.hasMany(ChiTietSanPham, { foreignKey: "MaKichThuoc" });
Mau.hasMany(ChiTietSanPham, { foreignKey: "MaMau" });

// TaiKhoan
TaiKhoan.belongsTo(VaiTro, { foreignKey: "MaVaiTro" });
VaiTro.hasMany(TaiKhoan, { foreignKey: "MaVaiTro" });
NhanVien.belongsTo(TaiKhoan, { foreignKey: "MaTK" });
TaiKhoan.hasOne(NhanVien, { foreignKey: "MaTK" });
KhachHang.belongsTo(TaiKhoan, { foreignKey: "MaTK" });
TaiKhoan.hasOne(KhachHang, { foreignKey: "MaTK" });

// NhanVien_BoPhan
NhanVien_BoPhan.belongsTo(NhanVien, { foreignKey: "MaNV" });
NhanVien_BoPhan.belongsTo(BoPhan, { foreignKey: "MaBoPhan" });
NhanVien.hasMany(NhanVien_BoPhan, { foreignKey: "MaNV" });
BoPhan.hasMany(NhanVien_BoPhan, { foreignKey: "MaBoPhan" });

// PhieuDatHangNCC
PhieuDatHangNCC.belongsTo(NhanVien, { foreignKey: "MaNV" });
PhieuDatHangNCC.belongsTo(NhaCungCap, { foreignKey: "MaNCC" });
PhieuDatHangNCC.belongsTo(TrangThaiDatHangNCC, { foreignKey: "MaTrangThai" });
NhanVien.hasMany(PhieuDatHangNCC, { foreignKey: "MaNV" });
NhaCungCap.hasMany(PhieuDatHangNCC, { foreignKey: "MaNCC" });
TrangThaiDatHangNCC.hasMany(PhieuDatHangNCC, { foreignKey: "MaTrangThai" });

// CT_PhieuDatHangNCC
CT_PhieuDatHangNCC.belongsTo(PhieuDatHangNCC, { foreignKey: "MaPDH" });
CT_PhieuDatHangNCC.belongsTo(ChiTietSanPham, { foreignKey: "MaCTSP" });
PhieuDatHangNCC.hasMany(CT_PhieuDatHangNCC, { foreignKey: "MaPDH" });
ChiTietSanPham.hasMany(CT_PhieuDatHangNCC, { foreignKey: "MaCTSP" });

// PhieuNhap
PhieuNhap.belongsTo(PhieuDatHangNCC, { foreignKey: "MaPDH" });
PhieuNhap.belongsTo(NhanVien, { foreignKey: "MaNV" });
PhieuDatHangNCC.hasMany(PhieuNhap, { foreignKey: "MaPDH" });
NhanVien.hasMany(PhieuNhap, { foreignKey: "MaNV" });

// CT_PhieuNhap
CT_PhieuNhap.belongsTo(PhieuNhap, { foreignKey: "SoPN" });
CT_PhieuNhap.belongsTo(ChiTietSanPham, { foreignKey: "MaCTSP" });
PhieuNhap.hasMany(CT_PhieuNhap, { foreignKey: "SoPN" });
ChiTietSanPham.hasMany(CT_PhieuNhap, { foreignKey: "MaCTSP" });

// DonDatHang
DonDatHang.belongsTo(KhachHang, { foreignKey: "MaKH" });
DonDatHang.belongsTo(NhanVien, { as: "NguoiDuyet", foreignKey: "MaNV_Duyet" });
DonDatHang.belongsTo(NhanVien, { as: "NguoiGiao", foreignKey: "MaNV_Giao" });
DonDatHang.belongsTo(TrangThaiDH, { foreignKey: "MaTTDH" });
KhachHang.hasMany(DonDatHang, { foreignKey: "MaKH" });
NhanVien.hasMany(DonDatHang, { foreignKey: "MaNV_Duyet", as: "DonDuyet" });
NhanVien.hasMany(DonDatHang, { foreignKey: "MaNV_Giao", as: "DonGiao" });
TrangThaiDH.hasMany(DonDatHang, { foreignKey: "MaTTDH" });

// HoaDon
HoaDon.belongsTo(DonDatHang, { foreignKey: "MaDDH" });
HoaDon.belongsTo(NhanVien, { as: "NguoiLap", foreignKey: "MaNVLap" });
DonDatHang.hasOne(HoaDon, { foreignKey: "MaDDH" });
NhanVien.hasMany(HoaDon, { as: "HoaDonLap", foreignKey: "MaNVLap" });

// PhieuTraHang
PhieuTraHang.belongsTo(HoaDon, { foreignKey: "SoHD" });
PhieuTraHang.belongsTo(NhanVien, { foreignKey: "NVLap" });
HoaDon.hasOne(PhieuTraHang, { foreignKey: "SoHD" });
NhanVien.hasMany(PhieuTraHang, { foreignKey: "NVLap" });

// CT_DonDatHang
CT_DonDatHang.belongsTo(DonDatHang, { foreignKey: "MaDDH" });
CT_DonDatHang.belongsTo(ChiTietSanPham, { foreignKey: "MaCTSP" });
CT_DonDatHang.belongsTo(PhieuTraHang, { foreignKey: "MaPhieuTra" });
DonDatHang.hasMany(CT_DonDatHang, { foreignKey: "MaDDH" });
ChiTietSanPham.hasMany(CT_DonDatHang, { foreignKey: "MaCTSP" });
PhieuTraHang.hasMany(CT_DonDatHang, { foreignKey: "MaPhieuTra" });

// BinhLuan
BinhLuan.belongsTo(KhachHang, { foreignKey: "MaKH" });
BinhLuan.belongsTo(CT_DonDatHang, { foreignKey: "MaCTDonDatHang" });
KhachHang.hasMany(BinhLuan, { foreignKey: "MaKH" });
CT_DonDatHang.hasMany(BinhLuan, { foreignKey: "MaCTDonDatHang" });

// DotGiamGia
DotGiamGia.hasMany(CT_DotGiamGia, { foreignKey: "MaDot" });
CT_DotGiamGia.belongsTo(DotGiamGia, { foreignKey: "MaDot" });
SanPham.hasMany(CT_DotGiamGia, { foreignKey: "MaSP" });
CT_DotGiamGia.belongsTo(SanPham, { foreignKey: "MaSP" });

// AnhSanPham
AnhSanPham.belongsTo(SanPham, { foreignKey: "MaSP" });

// Permission associations
VaiTro.belongsToMany(PhanQuyen, { 
  through: PhanQuyen_VaiTro, 
  foreignKey: 'VaiTroId',
  otherKey: 'PhanQuyenId'
});
PhanQuyen.belongsToMany(VaiTro, { 
  through: PhanQuyen_VaiTro, 
  foreignKey: 'PhanQuyenId',
  otherKey: 'VaiTroId'
});

module.exports = {
  sequelize,
  Sequelize,
  BoPhan,
  NhaCungCap,
  LoaiSP,
  KichThuoc,
  Mau,
  SanPham,
  ThayDoiGia,
  ChiTietSanPham,
  VaiTro,
  TaiKhoan,
  NhanVien,
  NhanVien_BoPhan,
  KhachHang,
  TrangThaiDatHangNCC,
  PhieuDatHangNCC,
  CT_PhieuDatHangNCC,
  PhieuNhap,
  CT_PhieuNhap,
  TrangThaiDH,
  DonDatHang,
  HoaDon,
  PhieuTraHang,
  CT_DonDatHang,
  BinhLuan,
  DotGiamGia,
  CT_DotGiamGia,
  AnhSanPham,
  PhanQuyen,
  PhanQuyen_VaiTro,
};
