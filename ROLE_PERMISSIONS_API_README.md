# Role & Permission Management APIs

## Tổng quan
Hệ thống cung cấp các API để quản lý vai trò và quyền hạn trong hệ thống 3TShop.

## API Endpoints

### 1. **GET /api/roles** - Lấy tất cả vai trò

**Mô tả:** Lấy danh sách tất cả vai trò cùng với quyền hạn của từng vai trò

**Request:**
- **Method:** GET
- **URL:** `http://localhost:8080/api/roles`
- **Headers:** 
  ```
  Authorization: Bearer {JWT_TOKEN}
  ```
- **Body:** Không có

**Response (Success):**
```json
{
  "success": true,
  "message": "Lấy danh sách vai trò thành công",
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "displayName": "Admin",
      "permissions": ["toanquyen"]
    },
    {
      "id": 2,
      "name": "NhanVienCuaHang",
      "displayName": "NhanVienCuaHang",
      "permissions": ["sanpham.xem", "sanpham.tao", "donhang.xem"]
    },
    {
      "id": 3,
      "name": "NhanVienGiaoHang",
      "displayName": "NhanVienGiaoHang",
      "permissions": ["donhang.xem_duoc_giao", "donhang.xacnhan_giaohang"]
    },
    {
      "id": 4,
      "name": "KhachHang",
      "displayName": "KhachHang",
      "permissions": ["sanpham.xem", "donhang.tao", "giohang.xem"]
    }
  ]
}
```

**Quyền truy cập:** `toanquyen` (Admin)

---

### 2. **GET /api/permissions** - Lấy tất cả quyền hạn

**Mô tả:** Lấy danh sách tất cả quyền hạn có trong hệ thống

**Request:**
- **Method:** GET
- **URL:** `http://localhost:8080/api/permissions`
- **Headers:** 
  ```
  Authorization: Bearer {JWT_TOKEN}
  ```
- **Body:** Không có

**Response (Success):**
```json
{
  "success": true,
  "message": "Lấy danh sách quyền thành công",
  "data": [
    {
      "key": "toanquyen",
      "name": "Toàn quyền",
      "description": "Toàn quyền"
    },
    {
      "key": "sanpham.xem",
      "name": "Xem sản phẩm",
      "description": "Xem sản phẩm"
    },
    {
      "key": "sanpham.tao",
      "name": "Tạo sản phẩm",
      "description": "Tạo sản phẩm"
    },
    {
      "key": "donhang.xem",
      "name": "Xem đơn hàng",
      "description": "Xem đơn hàng"
    }
  ]
}
```

**Quyền truy cập:** `toanquyen` (Admin)

**Lưu ý:** Có thể sử dụng `GET /api/permissions/all` để có kết quả tương tự

---

### 3. **PUT /api/roles/{roleId}/permissions** - Cập nhật quyền cho vai trò

**Mô tả:** Cập nhật danh sách quyền hạn cho một vai trò cụ thể

**Request:**
- **Method:** PUT
- **URL:** `http://localhost:8080/api/roles/{roleId}/permissions`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer {JWT_TOKEN}
  ```
- **Body:**
  ```json
  {
    "permissions": ["sanpham.xem", "sanpham.tao", "donhang.xem", "binhluan.xem"]
  }
  ```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cập nhật quyền cho vai trò thành công",
  "data": {
    "roleId": 2,
    "roleName": "NhanVienCuaHang",
    "permissions": ["sanpham.xem", "sanpham.tao", "donhang.xem", "binhluan.xem"],
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Error - Role not found):**
```json
{
  "success": false,
  "message": "Không tìm thấy vai trò với ID: 999"
}
```

**Response (Error - Invalid permissions):**
```json
{
  "success": false,
  "message": "Một số quyền không tồn tại trong hệ thống",
  "errors": {
    "permissions": "chứa quyền không hợp lệ"
  }
}
```

**Quyền truy cập:** `toanquyen` (Admin)

---

## Danh sách vai trò mặc định

| ID | Tên | Mô tả |
|----|-----|-------|
| 1 | Admin | Quản trị viên - Toàn quyền |
| 2 | NhanVienCuaHang | Nhân viên cửa hàng - Quản lý sản phẩm, nhập hàng, đặt hàng |
| 3 | NhanVienGiaoHang | Nhân viên giao hàng - Xem đơn hàng được phân công, xác nhận giao hàng |
| 4 | KhachHang | Khách hàng - Đặt hàng, xem đơn hàng của mình |

## Danh sách quyền hạn chính

### Quyền Admin
- `toanquyen` - Toàn quyền

### Quyền Sản Phẩm
- `sanpham.xem` - Xem sản phẩm
- `sanpham.tao` - Tạo sản phẩm
- `sanpham.sua` - Cập nhật sản phẩm
- `sanpham.xoa` - Xóa sản phẩm

### Quyền Đơn Hàng
- `donhang.xem` - Xem đơn hàng
- `donhang.xem_cua_minh` - Xem đơn hàng của mình
- `donhang.xem_duoc_giao` - Xem đơn hàng được phân công
- `donhang.tao` - Tạo đơn hàng
- `donhang.capnhat_trangthai` - Cập nhật trạng thái đơn hàng
- `donhang.phancong_giaohang` - Phân công giao hàng
- `donhang.xacnhan_giaohang` - Xác nhận giao hàng

### Quyền Nhân Viên
- `nhanvien.xem` - Xem nhân viên
- `nhanvien.phancong` - Phân công nhân viên

### Quyền Khác
- `binhluan.xem` - Xem bình luận
- `binhluan.tao` - Tạo bình luận
- `binhluan.sua_cua_minh` - Sửa bình luận của mình
- `binhluan.xoa_cua_minh` - Xóa bình luận của mình
- `giohang.xem` - Xem giỏ hàng
- `giohang.them` - Thêm vào giỏ hàng
- `giohang.xoa` - Xóa khỏi giỏ hàng

## Cách sử dụng

### 1. Lấy danh sách vai trò
```javascript
const response = await fetch('/api/roles', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const roles = await response.json();
```

### 2. Lấy danh sách quyền
```javascript
const response = await fetch('/api/permissions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const permissions = await response.json();
```

### 3. Cập nhật quyền cho vai trò
```javascript
const response = await fetch('/api/roles/2/permissions', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    permissions: ["sanpham.xem", "sanpham.tao", "donhang.xem"]
  })
});
const result = await response.json();
```

## Lưu ý quan trọng

1. **Quyền truy cập:** Tất cả API đều yêu cầu quyền `toanquyen` (Admin)
2. **Validation:** Hệ thống sẽ kiểm tra tính hợp lệ của permissions trước khi cập nhật
3. **Atomic operation:** Việc cập nhật quyền là atomic - tất cả quyền cũ sẽ bị xóa và thay thế bằng quyền mới
4. **Impact:** Thay đổi quyền của vai trò sẽ ảnh hưởng đến tất cả tài khoản thuộc vai trò đó
5. **Backup:** Nên backup dữ liệu trước khi thay đổi quyền quan trọng

## Testing

Sử dụng file `test_all_role_apis.js` để test tất cả các API:

```bash
# Cài đặt dependencies
npm install axios

# Chạy test (thay thế TOKEN bằng JWT token thực tế)
node test_all_role_apis.js
```



