# API TÍNH NĂNG TRẢ HÀNG

## Tổng quan
API tính năng trả hàng cho phép khách hàng yêu cầu trả hàng và nhân viên xử lý các yêu cầu trả hàng, tạo phiếu trả hàng và phiếu chi.

## Luồng hoạt động
1. **Khách hàng yêu cầu trả hàng**: Chuyển trạng thái đơn hàng thành "Trả hàng" (mã 7)
2. **Nhân viên xem danh sách yêu cầu**: Lấy danh sách các đơn hàng yêu cầu trả hàng
3. **Nhân viên tạo phiếu trả hàng**: Tạo phiếu chính thức cho việc trả hàng
4. **Nhân viên tạo phiếu chi**: Tạo phiếu chi để hoàn tiền cho khách hàng

## Endpoints

### 1. Khách hàng yêu cầu trả hàng
```
POST /api/tra-hang/request
```

**Headers:**
```
Authorization: Bearer <customer_token>
Content-Type: application/json
```

**Body:**
```json
{
  "maDDH": 123,
  "lyDo": "Sản phẩm không đúng như mô tả"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Yêu cầu trả hàng thành công",
  "data": {
    "MaDDH": 123,
    "MaTTDH": 7,
    "LyDoTraHang": "Sản phẩm không đúng như mô tả",
    "NgayYeuCauTraHang": "2025-08-02T10:30:00.000Z"
  }
}
```

### 2. Lấy danh sách yêu cầu trả hàng (Nhân viên)
```
GET /api/tra-hang/requests?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách yêu cầu trả hàng thành công",
  "data": {
    "orders": [
      {
        "MaDDH": 123,
        "NgayTao": "2025-07-30",
        "NgayYeuCauTraHang": "2025-08-02T10:30:00.000Z",
        "LyDoTraHang": "Sản phẩm không đúng như mô tả",
        "TongTien": 500000,
        "KhachHang": {
          "MaKH": 1,
          "TenKH": "Nguyễn Văn A",
          "SDT": "0123456789"
        },
        "CT_DonDatHangs": [...]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### 3. Tạo phiếu trả hàng (Nhân viên)
```
POST /api/tra-hang/slip
```

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "maDDH": 123,
  "danhSachSanPham": [
    {
      "maCTDDH": 1,
      "soLuongTra": 2
    },
    {
      "maCTDDH": 2,
      "soLuongTra": 1
    }
  ],
  "lyDo": "Sản phẩm bị lỗi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiếu trả hàng thành công",
  "data": {
    "MaPhieuTra": 1,
    "SoHD": "HD001",
    "NgayTra": "2025-08-02",
    "LyDo": "Sản phẩm bị lỗi",
    "TongTienTra": 300000,
    "ChiTietTraHang": [
      {
        "MaCTDDH": 1,
        "SoLuongTra": 2,
        "DonGia": 100000,
        "ThanhTien": 200000
      },
      {
        "MaCTDDH": 2,
        "SoLuongTra": 1,
        "DonGia": 100000,
        "ThanhTien": 100000
      }
    ]
  }
}
```

### 4. Tạo phiếu chi (Nhân viên)
```
POST /api/tra-hang/payment
```

**Headers:**
```
Authorization: Bearer <employee_token>
Content-Type: application/json
```

**Body:**
```json
{
  "maPhieuTra": 1,
  "soTien": 300000,
  "phuongThucChi": "Chuyển khoản",
  "ghiChu": "Hoàn tiền cho khách hàng"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo phiếu chi thành công",
  "data": {
    "MaPhieuChi": "PC1722590400000",
    "MaPhieuTra": 1,
    "NgayLap": "2025-08-02",
    "SoTien": 300000,
    "PhuongThucChi": "Chuyển khoản",
    "GhiChu": "Hoàn tiền cho khách hàng",
    "TrangThai": "Đã chi"
  }
}
```

### 5. Lấy chi tiết phiếu trả hàng
```
GET /api/tra-hang/slip/:id
```

**Headers:**
```
Authorization: Bearer <employee_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy chi tiết phiếu trả hàng thành công",
  "data": {
    "MaPhieuTra": 1,
    "NgayTra": "2025-08-02",
    "LyDo": "Sản phẩm bị lỗi",
    "TongTienTra": 300000,
    "NhanVien": {
      "MaNV": 1,
      "TenNV": "Nguyễn Thị B"
    },
    "DanhSachSanPhamTra": [
      {
        "MaCTDDH": 1,
        "TenSP": "Áo thun nam",
        "KichThuoc": "L",
        "MauSac": "Đỏ",
        "SoLuongMua": 3,
        "SoLuongTra": 2,
        "DonGia": 100000,
        "ThanhTienTra": 200000,
        "HinhAnh": "https://example.com/image.jpg"
      }
    ]
  }
}
```

### 6. Lấy lịch sử trả hàng của khách hàng
```
GET /api/tra-hang/history?page=1&limit=10
```

**Headers:**
```
Authorization: Bearer <customer_token>
```

### 7. Lấy danh sách phiếu trả hàng
```
GET /api/tra-hang/slips?page=1&limit=10&fromDate=2025-01-01&toDate=2025-12-31
```

**Headers:**
```
Authorization: Bearer <employee_token>
```

## Quy tắc nghiệp vụ

### Điều kiện trả hàng:
1. Đơn hàng phải có trạng thái "Hoàn tất" (MaTTDH = 4)
2. Thời hạn trả hàng: trong vòng 7 ngày kể từ ngày đặt hàng
3. Khách hàng phải là chủ sở hữu của đơn hàng

### Quy trình xử lý:
1. Khách hàng yêu cầu trả hàng → Chuyển trạng thái đơn hàng thành 7
2. Nhân viên tạo phiếu trả hàng → Cập nhật số lượng trả và tồn kho
3. Nhân viên tạo phiếu chi → Ghi nhận việc hoàn tiền

## Lỗi thường gặp

### 400 Bad Request
- Thiếu thông tin bắt buộc
- Số lượng trả vượt quá số lượng đã mua
- Đơn hàng không đủ điều kiện trả hàng

### 401 Unauthorized
- Không có token xác thực
- Token không hợp lệ hoặc đã hết hạn

### 403 Forbidden
- Không có quyền truy cập endpoint
- Đơn hàng không thuộc về khách hàng

### 404 Not Found
- Không tìm thấy đơn hàng
- Không tìm thấy phiếu trả hàng

## Migration Database
Chạy file migration để cập nhật database:
```sql
-- File: src/migrations/add_return_functionality.sql
-- Thêm các trường cần thiết và tạo bảng PhieuChi
```

## Testing
Sử dụng file `test_return_api.js` để test các API:
```bash
node test_return_api.js
```

**Lưu ý:** Cần cập nhật `customerToken` và `employeeToken` trong file test trước khi chạy.
