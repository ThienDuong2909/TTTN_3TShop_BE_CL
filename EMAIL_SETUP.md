# Hướng dẫn cấu hình Email cho chức năng gửi phiếu đặt hàng

## Tổng quan
Khi trạng thái phiếu đặt hàng NCC thay đổi từ 1 (PENDING) sang 2 (APPROVED), hệ thống sẽ tự động gửi email với file Excel đính kèm đến nhà cung cấp.

## Cấu hình Email

### 1. Tạo file .env
Tạo file `.env` trong thư mục gốc của dự án với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=3tshop
DB_PORT=3306

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
DEFAULT_SUPPLIER_EMAIL=supplier@example.com

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 2. Cấu hình Gmail
Để sử dụng Gmail để gửi email:

1. **Bật xác thực 2 yếu tố** cho tài khoản Gmail
2. **Tạo App Password**:
   - Vào Google Account Settings
   - Chọn Security
   - Chọn 2-Step Verification
   - Chọn App passwords
   - Tạo password mới cho ứng dụng
3. **Cập nhật .env**:
   - `EMAIL_USER`: Email Gmail của bạn
   - `EMAIL_PASSWORD`: App password vừa tạo

### 3. Cấu hình Email nhà cung cấp
Có 2 cách để cấu hình email nhà cung cấp:

#### Cách 1: Thêm email vào database
Cập nhật trường `Email` trong bảng `NhaCungCap` cho từng nhà cung cấp.

#### Cách 2: Sử dụng email mặc định
Cập nhật `DEFAULT_SUPPLIER_EMAIL` trong file `.env`.

## Chức năng

### 1. Tạo file Excel
- File Excel được tạo tự động với format giống như mẫu trong hình
- Bao gồm thông tin công ty, nhà cung cấp, danh sách sản phẩm
- Tính toán tổng tiền và các thông tin thanh toán

### 2. Gửi Email
- Email được gửi tự động khi trạng thái thay đổi từ 1 sang 2
- Nội dung email bao gồm thông tin phiếu đặt hàng
- File Excel được đính kèm trong email
- File Excel sẽ được xóa sau 5 giây để tiết kiệm dung lượng

### 3. API Endpoint
```
PUT /api/phieu-dat-hang-ncc/:id/status
Body: { "MaTrangThai": 2 }
```

## Xử lý lỗi
- Nếu gửi email thất bại, hệ thống vẫn cập nhật trạng thái thành công
- Lỗi email sẽ được log trong console
- Không ảnh hưởng đến chức năng chính của hệ thống

## Lưu ý
- Đảm bảo thư mục `uploads/` có quyền ghi
- Kiểm tra cấu hình email trước khi sử dụng
- Có thể thay đổi service email trong `EmailService.js` nếu cần 