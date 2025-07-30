# API BÌNH LUẬN SẢN PHẨM

## Tổng quan
API bình luận cho phép khách hàng bình luận và đánh giá sản phẩm đã mua. Chỉ khách hàng đã mua và nhận được sản phẩm mới có thể bình luận.

## Base URL
```
/api/binh-luan
/api/comments (English alias)
```

## Cấu trúc dữ liệu

### Bình luận (Comment)
```json
{
  "MaBL": 1,
  "MaKH": 1,
  "MaCTDonDatHang": 1,
  "MoTa": "Sản phẩm rất tốt, giao hàng nhanh!",
  "SoSao": 5,
  "NgayBinhLuan": "2024-01-15T10:30:00.000Z",
  "KhachHang": {
    "MaKH": 1,
    "TenKH": "Nguyễn Văn A"
  },
  "CT_DonDatHang": {
    "MaCTDDH": 1,
    "SoLuong": 2,
    "DonGia": 150000,
    "ChiTietSanPham": {
      "MaCTSP": 1,
      "SanPham": {
        "MaSP": 1,
        "TenSP": "Áo thun nam"
      },
      "KichThuoc": {
        "MaKichThuoc": 1,
        "TenKichThuoc": "L"
      },
      "Mau": {
        "MaMau": 1,
        "TenMau": "Đen",
        "MaHex": "#000000"
      }
    }
  }
}
```

## PUBLIC ENDPOINTS (Không cần đăng nhập)

### 1. Lấy bình luận theo sản phẩm
**GET** `/api/binh-luan/product/:maSP`

**Parameters:**
- `maSP` (path): Mã sản phẩm
- `page` (query, optional): Trang (mặc định: 1)
- `limit` (query, optional): Số lượng bình luận mỗi trang (mặc định: 10, tối đa: 100)

**Response:**
```json
{
  "success": true,
  "message": "Lấy bình luận sản phẩm thành công",
  "data": {
    "comments": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

### 2. Lấy thống kê bình luận theo sản phẩm
**GET** `/api/binh-luan/product/:maSP/stats`

**Parameters:**
- `maSP` (path): Mã sản phẩm

**Response:**
```json
{
  "success": true,
  "message": "Lấy thống kê bình luận thành công",
  "data": {
    "totalComments": 50,
    "averageRating": 4.2,
    "starDistribution": {
      "1": 2,
      "2": 3,
      "3": 8,
      "4": 15,
      "5": 22
    }
  }
}
```

### 3. Lấy bình luận theo ID
**GET** `/api/binh-luan/:id`

**Parameters:**
- `id` (path): ID bình luận

**Response:**
```json
{
  "success": true,
  "message": "Lấy bình luận thành công",
  "data": { ... }
}
```

## CUSTOMER ENDPOINTS (Chỉ khách hàng đã đăng nhập)

### 4. Lấy sản phẩm có thể bình luận
**GET** `/api/binh-luan/commentable`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `page` (query, optional): Trang (mặc định: 1)
- `limit` (query, optional): Số lượng sản phẩm mỗi trang (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách sản phẩm có thể bình luận thành công",
  "data": {
    "products": [
      {
        "maCTDDH": 1,
        "maSP": 1,
        "tenSP": "Áo thun nam",
        "kichThuoc": "L",
        "mau": "Đen",
        "maHex": "#000000",
        "soLuong": 2,
        "donGia": 150000,
        "ngayMua": "2024-01-10T10:30:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### 5. Lấy bình luận của khách hàng
**GET** `/api/binh-luan/customer`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `page` (query, optional): Trang (mặc định: 1)
- `limit` (query, optional): Số lượng bình luận mỗi trang (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "message": "Lấy bình luận của khách hàng thành công",
  "data": {
    "comments": [...],
    "pagination": { ... }
  }
}
```

### 6. Tạo bình luận mới
**POST** `/api/binh-luan`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "maCTDonDatHang": 1,
  "moTa": "Sản phẩm rất tốt, giao hàng nhanh!",
  "soSao": 5
}
```

**Validation:**
- `maCTDonDatHang`: Bắt buộc, phải là chi tiết đơn hàng của khách hàng
- `moTa`: Bắt buộc, nội dung bình luận
- `soSao`: Bắt buộc, từ 1-5 sao

**Response:**
```json
{
  "success": true,
  "message": "Tạo bình luận thành công",
  "data": { ... }
}
```

### 7. Cập nhật bình luận
**PUT** `/api/binh-luan/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path): ID bình luận

**Body:**
```json
{
  "moTa": "Sản phẩm rất tốt, giao hàng nhanh!",
  "soSao": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật bình luận thành công",
  "data": { ... }
}
```

### 8. Xóa bình luận
**DELETE** `/api/binh-luan/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): ID bình luận

**Response:**
```json
{
  "success": true,
  "message": "Xóa bình luận thành công",
  "data": null
}
```

## ADMIN ENDPOINTS (Chỉ admin)

### 9. Lấy tất cả bình luận
**GET** `/api/binh-luan`

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `page` (query, optional): Trang (mặc định: 1)
- `limit` (query, optional): Số lượng bình luận mỗi trang (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách bình luận thành công",
  "data": {
    "comments": [...],
    "pagination": { ... }
  }
}
```

## QUY TẮC BÌNH LUẬN

### Điều kiện để bình luận:
1. **Đã mua sản phẩm**: Khách hàng phải đã đặt hàng và thanh toán
2. **Đã nhận hàng**: Đơn hàng phải có trạng thái "Đã giao hàng" (MaTTDH = 4)
3. **Chưa bình luận**: Mỗi chi tiết đơn hàng chỉ được bình luận 1 lần
4. **Đã đăng nhập**: Phải đăng nhập với tài khoản khách hàng

### Quyền hạn:
- **Khách hàng**: Chỉ có thể bình luận sản phẩm mình đã mua
- **Khách hàng**: Chỉ có thể sửa/xóa bình luận của mình
- **Admin**: Có thể xem tất cả bình luận
- **Public**: Ai cũng có thể xem bình luận và thống kê

### Validation:
- Số sao: 1-5 sao
- Nội dung: Không được để trống
- Chi tiết đơn hàng: Phải thuộc về khách hàng đang đăng nhập

## ERROR CODES

| Code | Message | Mô tả |
|------|---------|-------|
| 400 | Thiếu thông tin bình luận | Thiếu các trường bắt buộc |
| 400 | Số sao phải từ 1 đến 5 | Số sao không hợp lệ |
| 400 | Chi tiết đơn hàng không tồn tại hoặc không thuộc về bạn | Không có quyền bình luận |
| 400 | Chỉ có thể bình luận sản phẩm sau khi đơn hàng đã được giao | Đơn hàng chưa giao |
| 400 | Bạn đã bình luận sản phẩm này rồi | Đã bình luận trước đó |
| 401 | Không xác định được khách hàng | Chưa đăng nhập |
| 403 | Forbidden: insufficient permissions | Không có quyền truy cập |
| 404 | Không tìm thấy bình luận | Bình luận không tồn tại |

## VÍ DỤ SỬ DỤNG

### 1. Lấy bình luận sản phẩm
```bash
curl -X GET "http://localhost:8080/api/binh-luan/product/1?page=1&limit=10"
```

### 2. Tạo bình luận mới
```bash
curl -X POST "http://localhost:8080/api/binh-luan" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "maCTDonDatHang": 1,
    "moTa": "Sản phẩm rất tốt!",
    "soSao": 5
  }'
```

### 3. Lấy thống kê bình luận
```bash
curl -X GET "http://localhost:8080/api/binh-luan/product/1/stats"
```

### 4. Lấy sản phẩm có thể bình luận
```bash
curl -X GET "http://localhost:8080/api/binh-luan/commentable" \
  -H "Authorization: Bearer <token>"
```

## TÍCH HỢP VỚI FRONTEND

### 1. Hiển thị bình luận sản phẩm
```javascript
// Lấy bình luận sản phẩm
const getProductComments = async (productId, page = 1) => {
  const response = await fetch(`/api/binh-luan/product/${productId}?page=${page}`);
  const data = await response.json();
  return data.data;
};

// Lấy thống kê bình luận
const getProductStats = async (productId) => {
  const response = await fetch(`/api/binh-luan/product/${productId}/stats`);
  const data = await response.json();
  return data.data;
};
```

### 2. Tạo bình luận
```javascript
const createComment = async (commentData) => {
  const response = await fetch('/api/binh-luan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(commentData)
  });
  const data = await response.json();
  return data;
};
```

### 3. Quản lý bình luận của khách hàng
```javascript
// Lấy bình luận của mình
const getMyComments = async (page = 1) => {
  const response = await fetch(`/api/binh-luan/customer?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};

// Lấy sản phẩm có thể bình luận
const getCommentableProducts = async (page = 1) => {
  const response = await fetch(`/api/binh-luan/commentable?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data;
};
``` 