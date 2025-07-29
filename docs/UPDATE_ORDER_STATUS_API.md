# API Cập nhật trạng thái đơn hàng

## 1. Cập nhật trạng thái đơn hàng đơn lẻ

**Endpoint:** `PUT /api/orders/:id/status`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Params:**
- `id` (number): ID của đơn hàng cần cập nhật

**Request Body:**
```json
{
  "maTTDH": 2,            // required: Mã trạng thái đơn hàng mới
  "maNVDuyet": 1,         // optional: Mã nhân viên duyệt
  "maNVGiao": 2           // optional: Mã nhân viên giao hàng
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    // Thông tin đơn hàng đã được cập nhật
  }
}
```

## 2. Cập nhật trạng thái nhiều đơn hàng cùng lúc (Batch Update)

**Endpoint:** `PUT /api/orders/batch/status`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orders": [
    {
      "id": 1,              // required: ID đơn hàng
      "maTTDH": 2,          // required: Mã trạng thái mới
      "maNVDuyet": 1,       // optional: Mã nhân viên duyệt
      "maNVGiao": 2         // optional: Mã nhân viên giao hàng
    },
    {
      "id": 2,
      "maTTDH": 3,
      "maNVGiao": 3
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thành công 2 đơn hàng",
  "data": {
    "success": 2,           // Số đơn hàng cập nhật thành công
    "failed": 0,            // Số đơn hàng cập nhật thất bại
    "errors": []            // Danh sách lỗi (nếu có)
  }
}
```

**Response khi có lỗi:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái thành công 1 đơn hàng",
  "data": {
    "success": 1,
    "failed": 1,
    "errors": [
      "Không tìm thấy đơn hàng với ID: 999"
    ]
  }
}
```

## Mã trạng thái đơn hàng phổ biến:
- 1: Chờ duyệt
- 2: Đã duyệt
- 3: Đang giao hàng
- 4: Đã giao
- 5: Đã hủy

## Phân quyền:
- Cần đăng nhập (JWT token)
- Chỉ Admin và NhanVien mới có thể cập nhật trạng thái

## Ví dụ sử dụng:

### JavaScript/Fetch:
```javascript
// Cập nhật đơn lẻ
const updateSingleOrder = async (orderId, newStatus) => {
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      maTTDH: newStatus,
      maNVDuyet: 1
    })
  });
  return response.json();
};

// Cập nhật nhiều đơn hàng
const updateMultipleOrders = async (orders) => {
  const response = await fetch('/api/orders/batch/status', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orders })
  });
  return response.json();
};
```
