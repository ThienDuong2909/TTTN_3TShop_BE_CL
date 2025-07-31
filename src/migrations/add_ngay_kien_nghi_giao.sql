-- Migration script để thêm trường NgayKienNghiGiao vào bảng PhieuDatHangNCC
-- Chạy script này để cập nhật cấu trúc bảng

-- Thêm cột NgayKienNghiGiao vào bảng PhieuDatHangNCC
ALTER TABLE PhieuDatHangNCC 
ADD COLUMN NgayKienNghiGiao DATE NULL 
COMMENT 'Ngày kiến nghị giao hàng từ nhà cung cấp';

-- Tạo index để tối ưu hiệu suất truy vấn theo ngày kiến nghị giao
CREATE INDEX IF NOT EXISTS idx_phieudathangncc_ngaykiennghigiao ON PhieuDatHangNCC(NgayKienNghiGiao);

-- Thêm comment cho bảng (nếu chưa có)
ALTER TABLE PhieuDatHangNCC 
COMMENT = 'Bảng phiếu đặt hàng nhà cung cấp'; 