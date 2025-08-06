-- =============================================
-- HỆ THỐNG PHÂN QUYỀN ĐỚN GIẢN CHO WEB BÁN QUẦN ÁO
-- =============================================
USE 3tshop_tttn;

-- 1. Bảng Quyền
CREATE TABLE IF NOT EXISTS PhanQuyen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Ten VARCHAR(100) NOT NULL UNIQUE,
    TenHienThi VARCHAR(150) NOT NULL,
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng phân quyền cho vai trò
CREATE TABLE IF NOT EXISTS PhanQuyen_VaiTro (
    VaiTroId INT NOT NULL,
    PhanQuyenId INT NOT NULL,
    PRIMARY KEY (VaiTroId, PhanQuyenId),
    FOREIGN KEY (VaiTroId) REFERENCES VaiTro(MaVaiTro) ON DELETE CASCADE,
    FOREIGN KEY (PhanQuyenId) REFERENCES PhanQuyen(id) ON DELETE CASCADE
);

-- =============================================
-- THÊM DỮ LIỆU MẪU
-- =============================================

-- Thêm các quyền
INSERT IGNORE INTO PhanQuyen (Ten, TenHienThi) VALUES 
-- Quyền admin
('toanquyen', 'Toàn quyền'),

-- Quyền sản phẩm
('sanpham.xem', 'Xem sản phẩm'),
('sanpham.tao', 'Tạo sản phẩm'),
('sanpham.sua', 'Cập nhật sản phẩm'),
('sanpham.xoa', 'Xóa sản phẩm'),

-- Quyền nhập hàng
('nhaphang.xem', 'Xem phiếu nhập'),
('nhaphang.tao', 'Tạo phiếu nhập'),
('nhaphang.sua', 'Cập nhật phiếu nhập'),
('nhaphang.xoa', 'Xóa phiếu nhập'),

-- Quyền đặt hàng NCC
('dathang.xem', 'Xem đơn đặt hàng'),
('dathang.tao', 'Tạo đơn đặt hàng'),
('dathang.sua', 'Cập nhật đơn đặt hàng'),
('dathang.xoa', 'Xóa đơn đặt hàng'),

-- Quyền nhà cung cấp
('nhacungcap.xem', 'Xem nhà cung cấp'),
('nhacungcap.tao', 'Tạo nhà cung cấp'),
('nhacungcap.sua', 'Cập nhật nhà cung cấp'),
('nhacungcap.xoa', 'Xóa nhà cung cấp'),

-- Quyền danh mục
('danhmuc.xem', 'Xem danh mục'),
('danhmuc.tao', 'Tạo danh mục'),
('danhmuc.sua', 'Cập nhật danh mục'),
('danhmuc.xoa', 'Xóa danh mục'),

-- Quyền màu sắc
('mausac.xem', 'Xem màu sắc'),
('mausac.tao', 'Tạo màu sắc'),
('mausac.sua', 'Cập nhật màu sắc'),
('mausac.xoa', 'Xóa màu sắc'),

-- Quyền kích thước
('kichthuoc.xem', 'Xem kích thước'),
('kichthuoc.tao', 'Tạo kích thước'),
('kichthuoc.sua', 'Cập nhật kích thước'),
('kichthuoc.xoa', 'Xóa kích thước'),

-- Quyền đơn hàng
('donhang.xem', 'Xem tất cả đơn hàng'),
('donhang.xem_cua_minh', 'Xem đơn hàng của mình'),
('donhang.xem_duoc_giao', 'Xem đơn hàng được phân công'),
('donhang.tao', 'Tạo đơn hàng'),
('donhang.capnhat_trangthai', 'Cập nhật trạng thái đơn hàng'),
('donhang.capnhat_trangthai_duocgiao', 'Cập nhật trạng thái đơn được phân công'),
('donhang.phancong_giaohang', 'Phân công giao hàng'),
('donhang.xacnhan_giaohang', 'Xác nhận giao hàng'),

-- Quyền hóa đơn
('hoadon.xem', 'Xem hóa đơn'),
('hoadon.tao', 'Tạo hóa đơn'),
('hoadon.sua', 'Cập nhật hóa đơn'),
('hoadon.xoa', 'Xóa hóa đơn'),

-- Quyền nhân viên
('nhanvien.xem', 'Xem thông tin nhân viên'),
('nhanvien.phancong', 'Phân công nhân viên'),

-- Quyền bộ phận
('bophan.xem', 'Xem thông tin bộ phận'),

-- Quyền giao hàng
('giaohang.quanly', 'Quản lý giao hàng'),
('giaohang.xem_cua_minh', 'Xem đơn giao của mình'),

-- Quyền bình luận
('binhluan.tao', 'Tạo bình luận'),
('binhluan.sua_cua_minh', 'Sửa bình luận của mình'),
('binhluan.xoa_cua_minh', 'Xóa bình luận của mình'),
('binhluan.kiemduyet', 'Quản lý bình luận'),

-- Quyền giỏ hàng
('giohang.xem', 'Xem giỏ hàng'),
('giohang.them', 'Thêm vào giỏ hàng'),
('giohang.sua', 'Cập nhật giỏ hàng'),
('giohang.xoa', 'Xóa khỏi giỏ hàng'),

-- Quyền profile
('thongtin.xem', 'Xem thông tin cá nhân'),
('thongtin.sua', 'Cập nhật thông tin cá nhân');

-- =============================================
-- PHÂN QUYỀN CHO CÁC VAI TRÒ
-- =============================================

-- Xóa phân quyền cũ nếu có
DELETE FROM PhanQuyen_VaiTro;

-- Admin - Toàn quyền
INSERT INTO PhanQuyen_VaiTro (VaiTroId, PhanQuyenId) 
SELECT 1, id FROM PhanQuyen WHERE Ten = 'toanquyen';

-- Nhân viên cửa hàng
INSERT INTO PhanQuyen_VaiTro (VaiTroId, PhanQuyenId) 
SELECT 2, id FROM PhanQuyen WHERE Ten IN (
    'sanpham.xem', 'sanpham.tao', 'sanpham.sua', 'sanpham.xoa',
    'nhaphang.xem', 'nhaphang.tao', 'nhaphang.sua', 'nhaphang.xoa',
    'dathang.xem', 'dathang.tao', 'dathang.sua', 'dathang.xoa',
    'nhacungcap.xem', 'nhacungcap.tao', 'nhacungcap.sua', 'nhacungcap.xoa',
    'danhmuc.xem', 'danhmuc.tao', 'danhmuc.sua', 'danhmuc.xoa',
    'mausac.xem', 'mausac.tao', 'mausac.sua', 'mausac.xoa',
    'kichthuoc.xem', 'kichthuoc.tao', 'kichthuoc.sua', 'kichthuoc.xoa',
    'donhang.xem', 'donhang.capnhat_trangthai', 'donhang.phancong_giaohang',
    'hoadon.xem', 'hoadon.tao', 'hoadon.sua', 'hoadon.xoa',
    'nhanvien.xem', 'nhanvien.phancong',
    'bophan.xem',
    'giaohang.quanly',
    'binhluan.kiemduyet'
);

-- Nhân viên giao hàng
INSERT INTO PhanQuyen_VaiTro (VaiTroId, PhanQuyenId) 
SELECT 3, id FROM PhanQuyen WHERE Ten IN (
    'donhang.xem_duoc_giao', 'donhang.xacnhan_giaohang', 'donhang.capnhat_trangthai_duocgiao',
    'thongtin.xem', 'thongtin.sua',
    'giaohang.xem_cua_minh'
);

-- Khách hàng
INSERT INTO PhanQuyen_VaiTro (VaiTroId, PhanQuyenId) 
SELECT 4, id FROM PhanQuyen WHERE Ten IN (
    'sanpham.xem',
    'donhang.tao', 'donhang.xem_cua_minh',
    'giohang.xem', 'giohang.them', 'giohang.sua', 'giohang.xoa',
    'thongtin.xem', 'thongtin.sua',
    'binhluan.tao', 'binhluan.sua_cua_minh', 'binhluan.xoa_cua_minh'
);

-- =============================================
-- HOÀN THÀNH
-- =============================================
SELECT 'Hệ thống phân quyền đã được thiết lập thành công!' as Message; 