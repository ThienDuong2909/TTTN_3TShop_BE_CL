# Role Management APIs

## Tổng quan
Hệ thống cung cấp 2 API để quản lý vai trò của nhân viên:

## 1. GET /api/employees/:maNV/role

**Mô tả:** Lấy thông tin vai trò hiện tại của một nhân viên

**Request:**
- **Method:** GET
- **URL:** `http://localhost:8080/api/employees/{maNV}/role`
- **Headers:** 
  ```
  Authorization: Bearer {JWT_TOKEN}
  ```
- **Body:** Không có

**Response (Success):**
```json
{
  "success": true,
  "message": "Lấy vai trò nhân viên thành công",
  "data": {
    "roleId": 1,
    "roleName": "Admin"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Không tìm thấy vai trò cho nhân viên này"
}
```

## 2. PUT /api/employees/:maNV/role

**Mô tả:** Gán vai trò mới cho một nhân viên

**Request:**
- **Method:** PUT
- **URL:** `http://localhost:8080/api/employees/{maNV}/role`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {JWT_TOKEN}
  ```
- **Body:**
  ```json
  {
    "roleId": 2
  }
  ```

**Response (Success):**
```json
{
  "success": true,
  "message": "Gán vai trò cho nhân viên thành công",
  "data": {
    "roleId": 2,
    "roleName": "NhanVienCuaHang"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Vai trò không hợp lệ. Vai trò phải là số từ 1-4"
}
```

## Danh sách vai trò

| MaVaiTro | TenVaiTro | Mô tả |
|----------|-----------|-------|
| 1 | Admin | Quản trị viên - Toàn quyền |
| 2 | NhanVienCuaHang | Nhân viên cửa hàng - Quản lý sản phẩm, nhập hàng, đặt hàng |
| 3 | NhanVienGiaoHang | Nhân viên giao hàng - Xem đơn hàng được phân công, xác nhận giao hàng |
| 4 | KhachHang | Khách hàng - Đặt hàng, xem đơn hàng của mình |

## Quyền truy cập

- **GET /:maNV/role:** Yêu cầu quyền `toanquyen` (Admin)
- **PUT /:maNV/role:** Yêu cầu quyền `toanquyen` (Admin)

## Lưu ý

1. **roleId phải là số nguyên** từ 1-4, không phải string
2. Nếu nhân viên chưa có tài khoản, hệ thống sẽ tự động tạo tài khoản mới với:
   - Email: `nv{maNV}@company.com`
   - Password: `123456`
   - Vai trò: Theo roleId được chỉ định
3. Tất cả các thao tác đều sử dụng transaction để đảm bảo tính nhất quán dữ liệu

## Ví dụ sử dụng

### JavaScript/Frontend
```javascript
// Lấy vai trò nhân viên
const getRole = async (maNV) => {
  try {
    const response = await fetch(`/api/employees/${maNV}/role`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi:', error);
  }
};

// Gán vai trò mới
const updateRole = async (maNV, roleId) => {
  try {
    const response = await fetch(`/api/employees/${maNV}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ roleId })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
```

### cURL
```bash
# Lấy vai trò
curl -X GET "http://localhost:8080/api/employees/1/role" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Gán vai trò
curl -X PUT "http://localhost:8080/api/employees/1/role" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"roleId": 2}'
```

## Xử lý lỗi

Hệ thống sẽ trả về các mã lỗi HTTP phù hợp:

- **400 Bad Request:** Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized:** Token không hợp lệ hoặc hết hạn
- **403 Forbidden:** Không có quyền truy cập
- **404 Not Found:** Không tìm thấy nhân viên
- **500 Internal Server Error:** Lỗi server

## Testing

Sử dụng file `test_role_api.js` để test các API:

```bash
# Cài đặt dependencies
npm install axios

# Chạy test (nhớ thay đổi TOKEN)
node test_role_api.js
```
