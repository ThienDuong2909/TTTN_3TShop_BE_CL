# API Quản lý Khu vực Phụ trách Nhân viên

## Phân quyền

⚠️ **Yêu cầu phân quyền:** Tất cả các API này yêu cầu quyền `toanquyen` (admin toàn quyền).

### Yêu cầu Authentication

- **JWT Token:** Bắt buộc phải có JWT token hợp lệ trong header `Authorization: Bearer <token>`
- **Permission:** User phải có quyền `toanquyen`

## Tổng quan

API này cung cấp các chức năng quản lý khu vực phụ trách của nhân viên trong hệ thống.

## Danh sách API

### 1. Lấy danh sách khu vực phụ trách

```http
GET /api/nhan-vien/:id/khu-vuc
```

**Mô tả:** Lấy danh sách các khu vực mà nhân viên đang phụ trách

**Parameters:**

- `id` (number): Mã nhân viên

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách khu vực phụ trách thành công",
  "data": {
    "MaNV": 1,
    "TenNV": "Nguyễn Văn A",
    "KhuVucPhuTrach": [
      {
        "MaKhuVuc": 1,
        "TenKhuVuc": "Quận 1",
        "NgayBatDau": "2024-01-01T00:00:00.000Z",
        "NgayTao": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. Lấy danh sách khu vực chưa phụ trách

```http
GET /api/nhan-vien/:id/khu-vuc-chua-phu-trach
```

**Mô tả:** Lấy danh sách các khu vực mà nhân viên chưa phụ trách

**Parameters:**

- `id` (number): Mã nhân viên

**Response:**

```json
{
  "success": true,
  "message": "Lấy danh sách khu vực chưa phụ trách thành công",
  "data": {
    "MaNV": 1,
    "TenNV": "Nguyễn Văn A",
    "KhuVucChuaPhuTrach": [
      {
        "MaKhuVuc": 3,
        "TenKhuVuc": "Quận 3"
      },
      {
        "MaKhuVuc": 5,
        "TenKhuVuc": "Quận 5"
      }
    ],
    "TongSoKhuVucChuaPhuTrach": 2
  }
}
```

### 3. Thêm khu vực phụ trách mới

```http
POST /api/nhan-vien/:id/khu-vuc
```

**Mô tả:** Thêm các khu vực phụ trách mới cho nhân viên (không xóa khu vực cũ)

**Parameters:**

- `id` (number): Mã nhân viên

**Body:**

```json
{
  "danhSachKhuVuc": [
    {
      "MaKhuVuc": 2,
      "NgayBatDau": "2025-09-20"
    },
    {
      "MaKhuVuc": 3,
      "NgayBatDau": "2025-09-21"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Thêm khu vực phụ trách thành công",
  "data": [
    {
      "MaKhuVuc": 2,
      "TenKhuVuc": "Quận 2",
      "NgayBatDau": "2025-09-20T00:00:00.000Z",
      "NgayTao": "2025-09-20T07:00:00.000Z"
    }
  ]
}
```

### 4. Cập nhật toàn bộ khu vực phụ trách

```http
PUT /api/nhan-vien/:id/khu-vuc
```

**Mô tả:** Thay thế toàn bộ danh sách khu vực phụ trách của nhân viên

**Parameters:**

- `id` (number): Mã nhân viên

**Body:**

```json
{
  "danhSachKhuVuc": [
    {
      "MaKhuVuc": 1,
      "NgayBatDau": "2024-01-01"
    },
    {
      "MaKhuVuc": 4,
      "NgayBatDau": "2025-09-20"
    }
  ]
}
```

### 5. Xóa khu vực phụ trách

```http
DELETE /api/nhan-vien/khu-vuc
```

**Mô tả:** Xóa các bản ghi phụ trách cụ thể trong bảng NhanVien_KhuVuc bằng ID

**Body:**

```json
{
  "danhSachMaNVKV": [1, 2, 5]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Xóa khu vực phụ trách thành công",
  "data": [
    {
      "MaNVKV": 1,
      "MaNV": 1,
      "MaKhuVuc": 4,
      "TenNV": "Nguyễn Văn A",
      "TenKhuVuc": "Quận 4",
      "message": "Đã xóa thành công"
    }
  ]
}
```

## Mã lỗi phổ biến

| Status Code | Mô tả                                                |
| ----------- | ---------------------------------------------------- |
| 400         | Bad Request - Dữ liệu đầu vào không hợp lệ           |
| 404         | Not Found - Không tìm thấy nhân viên/khu vực/bản ghi |
| 409         | Conflict - Nhân viên đã phụ trách khu vực này        |
| 500         | Internal Server Error - Lỗi server                   |

## Lưu ý quan trọng

1. **NgayBatDau**: Nếu không truyền sẽ mặc định là ngày hiện tại
2. **Validation**: Tất cả API đều có validation đầu vào
3. **Transaction**: Các thao tác cập nhật đều sử dụng database transaction

## Test API

Sử dụng file `test_nhan_vien_khu_vuc_api.js` để test các API:

```bash
node test_nhan_vien_khu_vuc_api.js
```

## Ví dụ sử dụng

### Lấy khu vực chưa phụ trách để hiển thị dropdown

```javascript
const response = await fetch("/api/nhan-vien/1/khu-vuc-chua-phu-trach");
const data = await response.json();
// data.data.KhuVucChuaPhuTrach sẽ chứa danh sách các khu vực có thể assign
```

### Thêm khu vực mới từ danh sách chưa phụ trách

```javascript
const response = await fetch("/api/nhan-vien/1/khu-vuc", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    danhSachKhuVuc: [{ MaKhuVuc: 5, NgayBatDau: "2025-10-01" }],
  }),
});
```

### Xóa khu vực phụ trách bằng ID

```javascript
// Trước tiên lấy danh sách để có MaNVKV
const getResponse = await fetch("/api/nhan-vien/1/khu-vuc");
const currentData = await getResponse.json();

// Giả sử muốn xóa các bản ghi có MaNVKV = 1, 2
const deleteResponse = await fetch("/api/nhan-vien/khu-vuc", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    danhSachMaNVKV: [1, 2],
  }),
});
```
