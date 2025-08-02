# TÓM TẮT PHÂN QUYỀN API - 3TShop

## Nguyên tắc phân quyền

### 1. API chỉ cần đăng nhập (cả Admin, Nhân viên, Khách hàng)
- Xem thông tin cơ bản: sản phẩm, danh mục, màu sắc, kích thước, nhà cung cấp, nhân viên, bộ phận
- Xem trạng thái đơn hàng, trạng thái đặt hàng NCC, tỷ giá
- Xem bình luận sản phẩm (public)
- Lấy thông tin profile cá nhân

### 2. API chỉ Admin
- Quản lý nhân viên (thêm, sửa, xóa, chuyển bộ phận)
- Quản lý bộ phận
- Quản lý trạng thái đơn hàng
- Quản lý tỷ giá
- Tạo tài khoản

### 3. API Admin + Nhân viên cửa hàng
- Quản lý sản phẩm (thêm, sửa, xóa, cập nhật tồn kho)
- Quản lý danh mục, màu sắc, kích thước, nhà cung cấp
- Quản lý phiếu đặt hàng NCC, phiếu nhập
- Quản lý trạng thái đặt hàng NCC
- Quản lý hóa đơn
- Phân công giao hàng
- Thống kê đơn hàng

### 4. API Admin + Nhân viên cửa hàng + Nhân viên giao hàng
- Cập nhật trạng thái đơn hàng
- Xác nhận giao hàng

### 5. API chỉ Khách hàng
- Quản lý giỏ hàng
- Đặt hàng
- Xem đơn hàng cá nhân
- Quản lý bình luận (tạo, sửa, xóa bình luận của mình)

## Chi tiết phân quyền theo từng route

### 1. `/auth` - Xác thực
- `POST /login` - Đăng nhập (public)
- `POST /register` - Đăng ký (public)
- `POST /logout` - Đăng xuất (public)
- `GET /profile` - Thông tin cá nhân (authenticated)

### 2. `/taikhoan` - Tài khoản
- `POST /` - Tạo tài khoản (Admin)

### 3. `/nhanvien` - Nhân viên
- `GET /` - Lấy tất cả nhân viên (authenticated)
- `GET /:id` - Lấy nhân viên theo ID (authenticated)
- `GET /department/:maBoPhan` - Lấy nhân viên theo bộ phận (authenticated)
- `GET /:id/department-history` - Lịch sử bộ phận (authenticated)
- `GET /delivery/list` - Nhân viên giao hàng (authenticated)
- `POST /` - Thêm nhân viên (Admin)
- `PUT /:id` - Sửa nhân viên (Admin)
- `DELETE /:id` - Xóa nhân viên (Admin)
- `POST /transfer` - Chuyển bộ phận (Admin)
- `POST /delivery/find-optimal` - Tìm nhân viên giao hàng tối ưu (Admin, NhanVienCuaHang)
- `POST /delivery/available` - Nhân viên giao hàng khả dụng (Admin, NhanVienCuaHang)
- `GET /delivery/workload` - Thống kê công việc (Admin, NhanVienCuaHang)
- `GET /delivery/workload/:id` - Thống kê công việc theo ID (Admin, NhanVienCuaHang)
- `POST /delivery/assign-order` - Phân công đơn hàng (Admin, NhanVienCuaHang)

### 4. `/sanpham` - Sản phẩm
- `GET /` - Lấy tất cả sản phẩm (authenticated)
- `GET /:id` - Lấy sản phẩm theo ID (authenticated)
- `GET /details` - Chi tiết sản phẩm (authenticated)
- `GET /details/:id` - Chi tiết sản phẩm theo ID (authenticated)
- `GET /new-product` - Sản phẩm mới (authenticated)
- `GET /best-sellers` - Sản phẩm bán chạy (authenticated)
- `GET /discount` - Sản phẩm giảm giá (authenticated)
- `GET /search` - Tìm kiếm sản phẩm (authenticated)
- `GET /supplier/:supplierId` - Sản phẩm theo nhà cung cấp (authenticated)
- `GET /:productId/colors-sizes` - Màu và size sản phẩm (authenticated)
- `POST /kiem-tra-ton-kho` - Kiểm tra tồn kho (authenticated)
- `POST /` - Thêm sản phẩm (Admin, NhanVienCuaHang)
- `PUT /:id` - Sửa sản phẩm (Admin, NhanVienCuaHang)
- `DELETE /:id` - Xóa sản phẩm (Admin, NhanVienCuaHang)
- `PUT /detail/:maCTSP/stock` - Cập nhật tồn kho (Admin, NhanVienCuaHang)
- `PUT /:id/update` - Cập nhật sản phẩm (Admin, NhanVienCuaHang)
- `POST /update-stock` - Cập nhật tồn kho nhiều sản phẩm (Admin, NhanVienCuaHang)
- `POST /add-detail` - Thêm chi tiết sản phẩm (Admin, NhanVienCuaHang)

### 5. `/gio-hang` - Giỏ hàng (chỉ Khách hàng)
- `POST /them` - Thêm vào giỏ hàng (KhachHang)
- `DELETE /xoa` - Xóa khỏi giỏ hàng (KhachHang)
- `POST /dat-hang` - Đặt hàng (KhachHang)
- `GET /:maKH` - Giỏ hàng theo khách hàng (KhachHang)
- `POST /xoa-tat-ca` - Xóa tất cả (KhachHang)
- `POST /don-hang/chi-tiet` - Chi tiết đơn hàng (KhachHang)
- `POST /don-hang` - Tất cả đơn hàng khách hàng (KhachHang)

### 6. `/don-dat-hang` - Đơn hàng
- `GET /` - Lấy tất cả đơn hàng (authenticated)
- `GET /:id` - Lấy đơn hàng theo ID (authenticated)
- `GET /:id/detail` - Chi tiết đơn hàng (authenticated)
- `GET /by-status` - Đơn hàng theo trạng thái (authenticated)
- `GET /customer/:customerId` - Đơn hàng theo khách hàng (authenticated)
- `GET /statistics` - Thống kê đơn hàng (Admin, NhanVienCuaHang)
- `GET /delivery/assigned` - Đơn hàng được phân công (NhanVienGiaoHang)
- `PUT /:id/status` - Cập nhật trạng thái (Admin, NhanVienCuaHang, NhanVienGiaoHang)
- `PUT /batch/status` - Cập nhật trạng thái hàng loạt (Admin, NhanVienCuaHang)
- `PUT /:id/delivery-staff` - Cập nhật nhân viên giao hàng (Admin, NhanVienCuaHang)
- `PUT /delivery/:id/confirm` - Xác nhận giao hàng (NhanVienGiaoHang)

### 7. `/binh-luan` - Bình luận
- `GET /product/:maSP` - Bình luận theo sản phẩm (public)
- `GET /product/:maSP/stats` - Thống kê bình luận (public)
- `GET /:id` - Bình luận theo ID (public)
- `GET /` - Tất cả bình luận (Admin)
- `GET /commentable` - Sản phẩm có thể bình luận (KhachHang)
- `GET /customer` - Bình luận của khách hàng (KhachHang)
- `POST /` - Tạo bình luận (KhachHang)
- `PUT /:id` - Sửa bình luận (KhachHang)
- `DELETE /:id` - Xóa bình luận (KhachHang)

### 8. `/hoadon` - Hóa đơn (Admin, NhanVienCuaHang)
- `GET /` - Tất cả hóa đơn
- `POST /` - Tạo hóa đơn
- `GET /detail/:soHD` - Chi tiết hóa đơn
- `GET /order/:maDDH` - Hóa đơn theo đơn hàng

### 9. `/phieu-dat-hang-ncc` - Phiếu đặt hàng NCC (Admin, NhanVienCuaHang)
- `GET /` - Tất cả phiếu đặt hàng
- `POST /` - Tạo phiếu đặt hàng
- `GET /:id` - Phiếu đặt hàng theo ID
- `PUT /:id/status` - Cập nhật trạng thái
- `PUT /:id/ngay-kien-nghi-giao` - Cập nhật ngày kiến nghị giao
- `GET /available-for-receipt` - Phiếu sẵn sàng nhập
- `GET /:id/for-receipt` - Phiếu để nhập hàng
- `GET /:id/received-status` - Trạng thái đã nhận
- `GET /:id/download-excel` - Tải Excel
- `GET /:id/excel-info` - Thông tin Excel

### 10. `/phieu-nhap` - Phiếu nhập (Admin, NhanVienCuaHang)
- `GET /` - Tất cả phiếu nhập
- `POST /` - Tạo phiếu nhập
- `GET /:id` - Phiếu nhập theo ID
- `PUT /:id/update-inventory` - Cập nhật tồn kho
- `POST /excel` - Import Excel

### 11. `/mau` - Màu sắc
- `GET /` - Tất cả màu (authenticated)
- `GET /:id` - Màu theo ID (authenticated)
- `POST /` - Thêm màu (Admin, NhanVienCuaHang)
- `PUT /:id` - Sửa màu (Admin, NhanVienCuaHang)
- `DELETE /:id` - Xóa màu (Admin, NhanVienCuaHang)

### 12. `/kichthuoc` - Kích thước
- `GET /` - Tất cả kích thước (authenticated)
- `GET /:id` - Kích thước theo ID (authenticated)
- `POST /` - Thêm kích thước (Admin, NhanVienCuaHang)
- `PUT /:id` - Sửa kích thước (Admin, NhanVienCuaHang)
- `DELETE /:id` - Xóa kích thước (Admin, NhanVienCuaHang)

### 13. `/loaiSP` - Loại sản phẩm
- `GET /` - Tất cả loại sản phẩm (authenticated)
- `GET /:id` - Loại sản phẩm theo ID (authenticated)
- `POST /products` - Sản phẩm theo loại (authenticated)
- `POST /` - Thêm loại sản phẩm (Admin, NhanVienCuaHang)
- `PUT /:id` - Sửa loại sản phẩm (Admin, NhanVienCuaHang)
- `DELETE /:id` - Xóa loại sản phẩm (Admin, NhanVienCuaHang)

### 14. `/nhacungcap` - Nhà cung cấp
- `GET /` - Tất cả nhà cung cấp (authenticated)
- `GET /:id` - Nhà cung cấp theo ID (authenticated)
- `POST /` - Thêm nhà cung cấp (Admin, NhanVienCuaHang)
- `PUT /:id` - Sửa nhà cung cấp (Admin, NhanVienCuaHang)
- `DELETE /:id` - Xóa nhà cung cấp (Admin, NhanVienCuaHang)

### 15. `/bophan` - Bộ phận
- `GET /` - Tất cả bộ phận (authenticated)
- `GET /:id` - Bộ phận theo ID (authenticated)
- `POST /` - Thêm bộ phận (Admin)
- `PUT /:id` - Sửa bộ phận (Admin)
- `DELETE /:id` - Xóa bộ phận (Admin)

### 16. `/trangthaidathang` - Trạng thái đặt hàng NCC
- `GET /` - Tất cả trạng thái (authenticated)
- `GET /:id` - Trạng thái theo ID (authenticated)
- `POST /` - Thêm trạng thái (Admin, NhanVienCuaHang)
- `PUT /:id` - Sửa trạng thái (Admin, NhanVienCuaHang)
- `DELETE /:id` - Xóa trạng thái (Admin, NhanVienCuaHang)

### 17. `/trangThaiDH` - Trạng thái đơn hàng
- `GET /` - Tất cả trạng thái (authenticated)
- `GET /:id` - Trạng thái theo ID (authenticated)
- `POST /` - Thêm trạng thái (Admin)
- `PUT /:id` - Sửa trạng thái (Admin)
- `DELETE /:id` - Xóa trạng thái (Admin)

### 18. `/tigia` - Tỷ giá
- `GET /` - Tất cả tỷ giá (authenticated)
- `GET /co-hieu-luc` - Tỷ giá có hiệu lực (authenticated)
- `POST /` - Thêm tỷ giá (Admin)
- `PUT /:MaTiGia` - Sửa tỷ giá (Admin)
- `DELETE /:MaTiGia` - Xóa tỷ giá (Admin)

## Lưu ý quan trọng

1. **Không tạo API mới**: Chỉ phân quyền lại các API hiện có
2. **API dùng chung**: Các API mà cả nhân viên, admin, khách hàng đều dùng thì chỉ cần đăng nhập
3. **Bảo mật**: Tất cả API đều yêu cầu xác thực JWT (trừ đăng nhập/đăng ký)
4. **Phân quyền chi tiết**: Sử dụng middleware `authorize()` để kiểm tra vai trò cụ thể
5. **Kiểm tra sở hữu**: Khách hàng chỉ có thể truy cập dữ liệu của mình 