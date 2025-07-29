-- Migration script để tạo bảng đơn hàng và trạng thái đơn hàng
-- Chạy script này nếu các bảng chưa tồn tại

-- Tạo bảng TrangThaiDH (Trạng thái đơn hàng)
CREATE TABLE IF NOT EXISTS TrangThaiDH (
    MaTTDH INT PRIMARY KEY AUTO_INCREMENT,
    Note TEXT,
    ThoiGianCapNhat DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    TrangThai VARCHAR(20) NOT NULL
);

-- Tạo bảng DonDatHang (Đơn đặt hàng)
CREATE TABLE IF NOT EXISTS DonDatHang (
    MaDDH INT PRIMARY KEY AUTO_INCREMENT,
    MaKH INT,
    MaNV_Duyet INT,
    MaNV_Giao INT,
    NgayTao DATE,
    DiaChiGiao VARCHAR(255),
    ThoiGianGiao DATETIME,
    NguoiNhan VARCHAR(100),
    MaTTDH INT,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH),
    FOREIGN KEY (MaNV_Duyet) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (MaNV_Giao) REFERENCES NhanVien(MaNV),
    FOREIGN KEY (MaTTDH) REFERENCES TrangThaiDH(MaTTDH)
);

-- Tạo bảng CT_DonDatHang (Chi tiết đơn đặt hàng)
CREATE TABLE IF NOT EXISTS CT_DonDatHang (
    MaCTDDH INT PRIMARY KEY AUTO_INCREMENT,
    MaDDH INT,
    MaCTSP INT,
    SoLuong INT,
    DonGia DECIMAL(18,2),
    MaPhieuTra INT,
    SoLuongTra INT DEFAULT 0,
    FOREIGN KEY (MaDDH) REFERENCES DonDatHang(MaDDH),
    FOREIGN KEY (MaCTSP) REFERENCES ChiTietSanPham(MaCTSP),
    FOREIGN KEY (MaPhieuTra) REFERENCES PhieuTraHang(MaPhieuTra)
);

-- Tạo bảng HoaDon
CREATE TABLE IF NOT EXISTS HoaDon (
    SoHD VARCHAR(100) PRIMARY KEY,
    MaDDH INT UNIQUE,
    NgayLap DATE NOT NULL,
    FOREIGN KEY (MaDDH) REFERENCES DonDatHang(MaDDH)
);

-- Thêm dữ liệu mẫu cho trạng thái đơn hàng
INSERT IGNORE INTO TrangThaiDH (MaTTDH, TrangThai, Note) VALUES
(1, 'CHỜ XÁC NHẬN', 'Đơn hàng đang chờ xác nhận từ nhân viên'),
(2, 'ĐANG CHUẨN BỊ', 'Đơn hàng đã được xác nhận và đang chuẩn bị hàng'),
(3, 'ĐANG GIAO', 'Đơn hàng đang được giao đến khách hàng'),
(4, 'HOÀN THÀNH', 'Đơn hàng đã được giao thành công'),
(5, 'HỦY', 'Đơn hàng đã bị hủy'),
(6, 'GIỎ HÀNG', 'Đơn hàng đang ở trong giỏ hàng, chưa được đặt');

-- Tạo index để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_dondathang_makh ON DonDatHang(MaKH);
CREATE INDEX IF NOT EXISTS idx_dondathang_mattdh ON DonDatHang(MaTTDH);
CREATE INDEX IF NOT EXISTS idx_dondathang_ngaytao ON DonDatHang(NgayTao);
CREATE INDEX IF NOT EXISTS idx_ctdondathang_maddh ON CT_DonDatHang(MaDDH);
CREATE INDEX IF NOT EXISTS idx_ctdondathang_mactsp ON CT_DonDatHang(MaCTSP);
