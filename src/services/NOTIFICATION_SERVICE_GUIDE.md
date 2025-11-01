# 📱 Hướng dẫn sử dụng Notification Service

## Cấu trúc thư mục

```
src/
├── utils/
│   └── notiHelper.js          # Cấu hình Firebase Admin SDK
├── services/
│   ├── NotificationService.js  # Service xử lý thông báo
│   ├── ThongBaoService.js      # Service quản lý thiết bị
│   └── DonDatHangService.js    # Service đơn hàng (tích hợp thông báo)
└── controllers/
    └── ThongBaoController.js   # Controller đăng ký thiết bị
```

## 1. File cấu hình: `notiHelper.js`

### Mục đích
- Khởi tạo Firebase Admin SDK
- Cung cấp các instance Firebase (Database, Messaging)
- Quản lý kết nối Firebase tập trung

### Các hàm chính

```javascript
const { 
  initializeFirebase,    // Khởi tạo Firebase (tự động gọi khi cần)
  getDatabase,          // Lấy Firebase Realtime Database instance
  getMessaging,         // Lấy Firebase Cloud Messaging instance
  getServerTimestamp,   // Lấy server timestamp
  admin                 // Firebase Admin SDK instance
} = require('../utils/notiHelper');
```

### Cấu hình

File yêu cầu `firebase-service-account.json` ở thư mục gốc dự án:

```json
{
  "type": "service_account",
  "project_id": "delivery-3tshop",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "..."
}
```

**Lấy file này từ Firebase Console:**
1. Vào Firebase Console → Project Settings
2. Tab "Service Accounts"
3. Click "Generate new private key"
4. Lưu file vào `e:\ThucTap\TTTN_3TShop_BE\firebase-service-account.json`

⚠️ **Quan trọng:** Thêm vào `.gitignore`:
```
firebase-service-account.json
```

---

## 2. Service thông báo: `NotificationService.js`

### Mục đích
- Gửi thông báo push qua Firebase Cloud Messaging
- Lưu thông báo vào Realtime Database
- Quản lý trạng thái thông báo (đã đọc/chưa đọc)

### Các phương thức

#### 2.1. Gửi thông báo cho nhân viên

```javascript
const NotificationService = require('./NotificationService');

const result = await NotificationService.sendNotificationToEmployee(maNhanVien, {
  title: 'Tiêu đề thông báo',
  body: 'Nội dung thông báo',
  data: {                           // Data tùy chọn
    key1: 'value1',
    key2: 'value2'
  },
  maDDH: 123,                       // Mã đơn hàng (tùy chọn)
  loaiThongBao: 'PHAN_CONG_DON_HANG' // Loại thông báo
});

// Kết quả trả về:
{
  success: true,
  message: "Đã gửi 2/2 thông báo",
  sentCount: 2,
  failedCount: 0,
  totalTokens: 2,
  notificationId: "xyz123",
  errors: undefined
}
```

#### 2.2. Đánh dấu thông báo đã đọc

```javascript
await NotificationService.markNotificationAsRead(maNhanVien, notificationId);
```

#### 2.3. Xóa thông báo

```javascript
await NotificationService.deleteNotification(maNhanVien, notificationId);
```

#### 2.4. Lấy danh sách thông báo

```javascript
const result = await NotificationService.getNotificationsByEmployee(maNhanVien, 50);
// result.data chứa array các thông báo
```

#### 2.5. Đếm thông báo chưa đọc

```javascript
const result = await NotificationService.countUnreadNotifications(maNhanVien);
// result.unreadCount
```

#### 2.6. Đánh dấu tất cả là đã đọc

```javascript
await NotificationService.markAllAsRead(maNhanVien);
```

---

## 3. Tích hợp vào DonDatHangService

### Ví dụ: Gửi thông báo khi phân công đơn hàng

```javascript
const NotificationService = require('./NotificationService');

// Trong hàm updateDeliveryStaff
await transaction.commit();

// Gửi thông báo (không chặn luồng chính)
NotificationService.sendNotificationToEmployee(maNVGiao, {
  title: '🚚 Đơn hàng mới được phân công',
  body: `Bạn có đơn hàng #${maDDH} cần giao đến ${order.DiaChiGiao}`,
  data: {
    maDDH: String(maDDH),
    diaChiGiao: order.DiaChiGiao || '',
    nguoiNhan: order.NguoiNhan || ''
  },
  maDDH: maDDH,
  loaiThongBao: 'PHAN_CONG_DON_HANG'
})
.then(result => console.log('✓ Thông báo đã gửi:', result))
.catch(error => console.error('✗ Lỗi gửi thông báo:', error));
```

### Ưu điểm của cách này:
- ✅ Không chặn luồng chính (async/await trong Promise)
- ✅ Lỗi thông báo không ảnh hưởng đến logic nghiệp vụ
- ✅ Log đầy đủ để debug

---

## 4. Cấu trúc dữ liệu

### 4.1. Trong Firebase Realtime Database

```json
{
  "notifications": {
    "123": {  // maNhanVien
      "abc-xyz-123": {  // notificationId
        "id": "abc-xyz-123",
        "maNhanVien": 123,
        "tieuDe": "Đơn hàng mới",
        "noiDung": "Bạn có đơn hàng #456...",
        "loaiThongBao": "PHAN_CONG_DON_HANG",
        "maDDH": 456,
        "ngayTao": 1698825600000,
        "daDoc": false,
        "diaChiGiao": "123 Đường ABC",
        "nguoiNhan": "Nguyễn Văn A"
      }
    }
  }
}
```

### 4.2. Trong Database SQL (Bảng ThongBao)

```sql
CREATE TABLE ThongBao (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  MaNhanVien INT NOT NULL,
  MaThietBi TEXT NOT NULL,
  NhaCungCap VARCHAR(10),  -- 'fcm', 'expo', 'apns'
  NenTang VARCHAR(10),     -- 'android', 'ios'
  token TEXT NOT NULL,
  FOREIGN KEY (MaNhanVien) REFERENCES NhanVien(MaNV)
);
```

---

## 5. Các loại thông báo

```javascript
const LOAI_THONG_BAO = {
  PHAN_CONG_DON_HANG: 'PHAN_CONG_DON_HANG',  // Phân công đơn hàng mới
  CAP_NHAT_DON_HANG: 'CAP_NHAT_DON_HANG',    // Cập nhật trạng thái
  HUY_DON_HANG: 'HUY_DON_HANG',              // Hủy đơn hàng
  TRA_HANG: 'TRA_HANG',                      // Trả hàng
  THANH_TOAN: 'THANH_TOAN',                  // Thanh toán
  KHAC: 'KHAC'                                // Khác
};
```

---

## 6. Testing

### 6.1. Test gửi thông báo đơn giản

```javascript
// test-notification.js
const NotificationService = require('./src/services/NotificationService');

async function testNotification() {
  try {
    const result = await NotificationService.sendNotificationToEmployee(123, {
      title: 'Test Notification',
      body: 'This is a test notification',
      loaiThongBao: 'KHAC'
    });
    
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testNotification();
```

### 6.2. Test trong Postman/Thunder Client

```http
POST /api/notifications/register
Content-Type: application/json

{
  "maNhanVien": 123,
  "maThietBi": "device-unique-id-123",
  "nhaCungCap": "fcm",
  "nenTang": "android",
  "token": "fcm-token-here..."
}
```

---

## 7. Xử lý lỗi phổ biến

### Lỗi: "Firebase Admin SDK not initialized"
**Nguyên nhân:** Chưa có file `firebase-service-account.json`
**Giải pháp:** Tải file từ Firebase Console và đặt vào thư mục gốc

### Lỗi: "No FCM token found"
**Nguyên nhân:** Nhân viên chưa đăng ký thiết bị
**Giải pháp:** Đảm bảo app mobile gọi API `/api/notifications/register`

### Lỗi: "Invalid FCM token"
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ
**Giải pháp:** App cần refresh token và gọi lại API register

---

## 8. Best Practices

### ✅ Nên làm:
- Gửi thông báo trong Promise để không chặn luồng chính
- Log đầy đủ để dễ debug
- Xử lý lỗi gracefully (không throw lỗi ra ngoài)
- Giới hạn số lượng thông báo query (dùng limit)

### ❌ Không nên:
- Await thông báo trong transaction (có thể làm chậm)
- Throw error khi gửi thông báo thất bại
- Gửi quá nhiều thông báo cùng lúc (có thể bị rate limit)
- Lưu trữ token trong code (dùng database)

---

## 9. Monitoring & Logs

Service tự động log các sự kiện quan trọng:

```
✓ Firebase Admin SDK đã được khởi tạo thành công
✓ Đã gửi thông báo đến token: abcd1234...
✗ Lỗi gửi thông báo đến token: Invalid token
📊 Kết quả: Đã gửi 2/3 thông báo cho nhân viên 123
✓ Đã đánh dấu thông báo xyz-123 là đã đọc
```

---

## 10. Dependencies

Cài đặt package cần thiết:

```bash
npm install firebase-admin
```

Thêm vào `package.json`:
```json
{
  "dependencies": {
    "firebase-admin": "^11.0.0"
  }
}
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. File `firebase-service-account.json` đã đúng chưa
2. Database URL trong `notiHelper.js` có chính xác không
3. Token FCM từ mobile có hợp lệ không
4. Log console để xem lỗi chi tiết
