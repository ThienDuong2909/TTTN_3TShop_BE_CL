# Hướng dẫn cấu hình Email cho chức năng gửi xác nhận đơn hàng

## Tổng quan
Sau khi khách hàng đặt hàng thành công, hệ thống sẽ tự động gửi email xác nhận đơn hàng đến địa chỉ email của khách hàng với thông tin chi tiết về đơn hàng.

## Cấu hình Email

### 1. Thêm cấu hình vào file .env

Bạn cần thêm các biến môi trường sau vào file `.env`:

```env
# Email Configuration cho khách hàng (cPanel Hosting)
CUSTOMER_MAIL_HOST=mail.thienduong.info
CUSTOMER_MAIL_PORT=465
CUSTOMER_MAIL_USER=3tshop@thienduong.info
CUSTOMER_MAIL_PASS=your-email-password-here

# Email Configuration cho nhà cung cấp (Gmail - đã có sẵn)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-gmail-app-password
```

### 2. Thông tin cấu hình Email cPanel Hosting

Dựa trên thông tin bạn cung cấp:

- **Host**: `mail.thienduong.info`
- **Port**: `465` (SMTP với SSL/TLS)
- **Username**: `3tshop@thienduong.info`
- **Password**: Sử dụng password của tài khoản email (bạn cần điền vào `.env`)

### 3. Lưu ý về Password

- **CUSTOMER_MAIL_PASS**: Đây là password của tài khoản email `3tshop@thienduong.info` trên cPanel hosting
- Không commit file `.env` lên Git (đã có trong `.gitignore`)

## Chức năng

### 1. Tự động gửi email sau khi đặt hàng

- Email được gửi tự động sau khi khách hàng đặt hàng thành công
- Email được gửi bất đồng bộ (không chờ kết quả) để không ảnh hưởng đến tốc độ đặt hàng
- Nếu gửi email thất bại, đơn hàng vẫn được tạo thành công

### 2. Nội dung email bao gồm:

✅ **Logo và header đẹp mắt** với gradient màu tím
✅ **Icon thành công** để thể hiện đặt hàng thành công
✅ **Thông tin đơn hàng**:
   - Mã đơn hàng
   - Người nhận
   - Số điện thoại
   - Địa chỉ giao hàng
   - Thời gian giao hàng

✅ **Chi tiết sản phẩm** trong bảng:
   - STT
   - Tên sản phẩm
   - Phân loại (kích thước - màu sắc)
   - Số lượng
   - Đơn giá
   - Thành tiền

✅ **Tổng tiền** đơn hàng
✅ **Lưu ý quan trọng** trong hộp cảnh báo màu vàng
✅ **Lời cảm ơn** khách hàng
✅ **Footer** với thông tin liên hệ

### 3. Thiết kế email

- Responsive, hiển thị tốt trên mọi thiết bị
- Sử dụng inline CSS để đảm bảo tương thích với mọi email client
- Màu sắc chuyên nghiệp với gradient tím (#667eea → #764ba2)
- Layout rõ ràng, dễ đọc

## Cấu trúc Code

### 1. EmailService.js

File `src/services/EmailService.js` đã được cập nhật với:

- **customerTransporter**: Nodemailer transporter riêng cho email khách hàng
- **sendOrderConfirmationEmail()**: Hàm gửi email xác nhận đơn hàng

### 2. GioHangService.js

File `src/services/GioHangService.js` đã được cập nhật:

- Import `EmailService` và `TaiKhoan`
- Sau khi commit transaction thành công, tự động:
  1. Lấy thông tin đầy đủ đơn hàng (bao gồm sản phẩm, màu sắc, kích thước)
  2. Lấy thông tin khách hàng và email từ TaiKhoan
  3. Gửi email xác nhận (bất đồng bộ, không chờ kết quả)

## Kiểm tra và Test

### 1. Kiểm tra cấu hình

Bạn có thể tạo file test để kiểm tra cấu hình email:

```javascript
// test-customer-email.js
require('dotenv').config();
const EmailService = require('./src/services/EmailService');

async function testEmail() {
  console.log('Kiểm tra cấu hình email khách hàng:');
  console.log('Host:', process.env.CUSTOMER_MAIL_HOST);
  console.log('Port:', process.env.CUSTOMER_MAIL_PORT);
  console.log('User:', process.env.CUSTOMER_MAIL_USER);
  console.log('Pass:', process.env.CUSTOMER_MAIL_PASS ? '✅ Đã cấu hình' : '❌ Chưa cấu hình');
  
  // Test gửi email (cần có dữ liệu đơn hàng thực)
  // const result = await EmailService.sendOrderConfirmationEmail(order, email, name);
}

testEmail();
```

Chạy test:
```bash
node test-customer-email.js
```

### 2. Test thực tế

1. Đảm bảo đã cấu hình đúng trong file `.env`
2. Tạo tài khoản khách hàng với email thật
3. Đặt hàng qua API hoặc giao diện
4. Kiểm tra email trong hộp thư đến

## Xử lý lỗi

### Các trường hợp lỗi có thể xảy ra:

1. **Sai thông tin đăng nhập SMTP**
   - Kiểm tra lại username/password trong `.env`
   - Đảm bảo password chính xác

2. **Không kết nối được tới mail server**
   - Kiểm tra host và port
   - Kiểm tra firewall/network

3. **Email không gửi được**
   - Email vẫn được log lỗi trong console
   - Đơn hàng vẫn được tạo thành công
   - Không ảnh hưởng đến trải nghiệm người dùng

### Logs

Khi gửi email thành công:
```
✅ Email xác nhận đơn hàng đã được gửi đến: customer@example.com
```

Khi gửi email thất bại:
```
❌ Lỗi khi gửi email xác nhận đơn hàng: [Chi tiết lỗi]
```

## Tùy chỉnh

### 1. Thay đổi nội dung email

Chỉnh sửa hàm `sendOrderConfirmationEmail()` trong `src/services/EmailService.js`

### 2. Thay đổi thiết kế

Cập nhật HTML template trong hàm `sendOrderConfirmationEmail()`

### 3. Thêm logo hình ảnh

Bạn có thể thêm logo bằng cách:
1. Upload logo vào thư mục `uploads/`
2. Thêm thẻ `<img>` vào template email
3. Sử dụng URL đầy đủ cho hình ảnh

Ví dụ:
```html
<img src="https://yourdomain.com/uploads/logo.png" alt="3TShop Logo" style="width: 150px;">
```

## Bảo mật

⚠️ **Quan trọng**:
1. Không commit file `.env` lên Git
2. Sử dụng password mạnh cho email
3. Định kỳ thay đổi password
4. Chỉ cấp quyền gửi email, không lưu password ở nhiều nơi

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Kiểm tra cấu hình `.env`
3. Test kết nối SMTP thủ công
4. Liên hệ hosting provider nếu không kết nối được

---

**Cập nhật lần cuối**: 13/12/2024
**Phiên bản**: 1.0
