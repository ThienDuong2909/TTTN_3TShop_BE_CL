# HỆ THỐNG PHÂN QUYỀN 3TSHOP

## Tổng quan
Hệ thống phân quyền được thiết kế với 4 vai trò chính, mỗi vai trò có quyền hạn riêng biệt:

## 1. ADMIN (MaVaiTro: 1)
**Mô tả**: Toàn quyền - có thể truy cập tất cả chức năng

**Quyền hạn**:
- Tất cả quyền trong hệ thống
- Quản lý tài khoản nhân viên
- Quản lý bộ phận
- Quản lý trạng thái đơn hàng
- Xem báo cáo và thống kê

## 2. NHÂN VIÊN CỬA HÀNG (MaVaiTro: 2)
**Mô tả**: Nhân viên cửa hàng - quản lý sản phẩm, nhập hàng, đặt hàng

**Quyền hạn**:
- `product.*` - Tất cả quyền sản phẩm (thêm, sửa, xóa, xem)
- `import.*` - Tất cả quyền nhập hàng
- `purchase.*` - Tất cả quyền đặt hàng NCC
- `supplier.*` - Quản lý nhà cung cấp
- `category.*` - Quản lý loại sản phẩm
- `color.*` - Quản lý màu sắc
- `size.*` - Quản lý kích thước
- `order.view` - Xem đơn hàng
- `order.update_status` - Cập nhật trạng thái đơn hàng
- `invoice.*` - Quản lý hóa đơn
- `employee.view` - Xem thông tin nhân viên
- `department.view` - Xem thông tin bộ phận

## 3. NHÂN VIÊN GIAO HÀNG (MaVaiTro: 3)
**Mô tả**: Nhân viên giao hàng - xem đơn hàng được phân công, xác nhận giao hàng

**Quyền hạn**:
- `order.view_assigned` - Xem đơn hàng được phân công
- `order.confirm_delivery` - Xác nhận đã giao hàng
- `order.update_status` - Cập nhật trạng thái đơn hàng (chỉ đơn được phân công)
- `profile.view` - Xem thông tin cá nhân
- `order.view_own_delivery` - Xem đơn hàng mình giao

**API Endpoints đặc biệt**:
- `GET /api/don-dat-hang/delivery/assigned` - Lấy đơn hàng được phân công
- `PUT /api/don-dat-hang/delivery/:id/confirm` - Xác nhận giao hàng

## 4. KHÁCH HÀNG (MaVaiTro: 4)
**Mô tả**: Khách hàng - đặt hàng, xem đơn hàng của mình

**Quyền hạn**:
- `product.view` - Xem sản phẩm
- `order.create` - Tạo đơn hàng
- `order.view_own` - Xem đơn hàng của mình
- `cart.*` - Quản lý giỏ hàng
- `profile.view` - Xem thông tin cá nhân
- `profile.update` - Cập nhật thông tin cá nhân

## CẬP NHẬT DATABASE

### 1. Cập nhật bảng VaiTro
```sql
-- Xóa dữ liệu cũ
DELETE FROM VaiTro;

-- Thêm vai trò mới
INSERT INTO VaiTro (MaVaiTro, TenVaiTro) VALUES
(1, 'Admin'),
(2, 'NhanVienCuaHang'),
(3, 'NhanVienGiaoHang'),
(4, 'KhachHang');
```

### 2. Cập nhật tài khoản hiện có
```sql
-- Cập nhật tài khoản admin
UPDATE TaiKhoan SET MaVaiTro = 1 WHERE Email = 'admin@3tshop.com';

-- Cập nhật tài khoản nhân viên (cần xác định ai là nhân viên cửa hàng, ai là giao hàng)
UPDATE TaiKhoan SET MaVaiTro = 2 WHERE MaVaiTro = 2; -- Nhân viên cửa hàng
UPDATE TaiKhoan SET MaVaiTro = 3 WHERE MaVaiTro = 2 AND EXISTS (
  SELECT 1 FROM NhanVien WHERE NhanVien.MaTK = TaiKhoan.MaTK AND NhanVien.KhuVuc IS NOT NULL
); -- Nhân viên giao hàng

-- Cập nhật tài khoản khách hàng
UPDATE TaiKhoan SET MaVaiTro = 4 WHERE MaVaiTro = 3;
```

## MIDDLEWARE PHÂN QUYỀN

### 1. authorize(...allowedRoles)
Kiểm tra vai trò người dùng có trong danh sách được phép không.

**Sử dụng**:
```javascript
router.get('/admin-only', authenticateJWT, authorize('Admin'), controller.method);
router.post('/staff-only', authenticateJWT, authorize('Admin', 'NhanVienCuaHang'), controller.method);
```

### 2. checkPermission(requiredPermission)
Kiểm tra quyền cụ thể của người dùng.

**Sử dụng**:
```javascript
router.post('/product', authenticateJWT, checkPermission('product.create'), controller.createProduct);
```

### 3. checkOwnership(modelName, idField)
Kiểm tra quyền sở hữu (chỉ cho phép truy cập dữ liệu của chính mình).

**Sử dụng**:
```javascript
router.get('/profile', authenticateJWT, checkOwnership('KhachHang', 'MaKH'), controller.getProfile);
```

## CÁC THAY ĐỔI CHÍNH

### 1. Model VaiTro
- Cập nhật comment mô tả 4 vai trò mới
- Seed data với 4 vai trò

### 2. AuthService
- Cập nhật logic login để hỗ trợ 3 loại nhân viên
- Cập nhật register để tạo khách hàng với MaVaiTro = 4

### 3. NhanVienService
- Tự động xác định vai trò dựa trên KhuVuc
- Nhân viên có KhuVuc → NhanVienGiaoHang
- Nhân viên không có KhuVuc → NhanVienCuaHang

### 4. Middleware authorize
- Thêm ROLE_PERMISSIONS để định nghĩa quyền chi tiết
- Thêm checkPermission và checkOwnership
- Hỗ trợ wildcard permissions (ví dụ: product.*)

### 5. Routes
- Cập nhật tất cả routes để sử dụng middleware mới
- Thêm routes đặc biệt cho nhân viên giao hàng
- Phân quyền chi tiết cho từng endpoint

### 6. Controllers & Services
- Thêm methods cho nhân viên giao hàng
- getAssignedOrders: Lấy đơn hàng được phân công
- confirmDelivery: Xác nhận giao hàng

## API ENDPOINTS THEO PHÂN QUYỀN

### Admin (Tất cả endpoints)
- Tất cả API endpoints

### Nhân viên cửa hàng
- Sản phẩm: CRUD
- Nhập hàng: CRUD
- Đặt hàng NCC: CRUD
- Hóa đơn: CRUD
- Đơn hàng: Xem, cập nhật trạng thái
- Nhà cung cấp: CRUD
- Loại sản phẩm: CRUD
- Màu sắc: CRUD
- Kích thước: CRUD

### Nhân viên giao hàng
- Đơn hàng: Xem đơn được phân công, xác nhận giao hàng
- Profile: Xem thông tin cá nhân

### Khách hàng
- Sản phẩm: Xem
- Đơn hàng: Tạo, xem đơn của mình
- Giỏ hàng: CRUD
- Profile: Xem, cập nhật thông tin cá nhân

## LƯU Ý QUAN TRỌNG

1. **Không thay đổi tên endpoint API** - Giữ nguyên tất cả endpoint hiện có
2. **Không sửa các hàm đang có** - Chỉ thêm middleware phân quyền
3. **Nhân viên cửa hàng bao gồm tất cả nhân viên** - Không có kho riêng biệt
4. **Nhân viên giao hàng** - Chỉ liên quan đến giao hàng, không có quyền quản lý sản phẩm
5. **Admin có toàn quyền** - Có thể truy cập tất cả chức năng

## TESTING

### 1. Test đăng nhập với các vai trò khác nhau
```bash
# Admin
POST /api/auth/login
{
  "email": "admin@3tshop.com",
  "password": "admin123"
}

# Nhân viên cửa hàng
POST /api/auth/login
{
  "email": "staff@3tshop.com", 
  "password": "staff123"
}

# Nhân viên giao hàng
POST /api/auth/login
{
  "email": "delivery@3tshop.com",
  "password": "delivery123"
}

# Khách hàng
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "customer123"
}
```

### 2. Test phân quyền
- Admin có thể truy cập tất cả endpoints
- Nhân viên cửa hàng không thể truy cập endpoints của nhân viên giao hàng
- Nhân viên giao hàng chỉ có thể xem đơn hàng được phân công
- Khách hàng chỉ có thể xem và quản lý dữ liệu của mình 