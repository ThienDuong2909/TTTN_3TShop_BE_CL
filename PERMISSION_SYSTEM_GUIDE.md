# Hệ Thống Phân Quyền - 3TShop

## Tổng Quan

Hệ thống phân quyền mới được thiết kế theo mô hình **Role-Based Access Control (RBAC)** với các đặc điểm:

- **Clean Code**: Code sạch, dễ bảo trì và mở rộng
- **Tái sử dụng**: Middleware và service có thể tái sử dụng
- **Linh hoạt**: Dễ dàng thêm/sửa/xóa quyền và vai trò
- **Bảo mật**: Kiểm tra quyền chi tiết với context

## Cấu Trúc Database

### 1. Bảng PhanQuyen
```sql
CREATE TABLE PhanQuyen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    Ten VARCHAR(100) NOT NULL UNIQUE,        -- Tên quyền (ví dụ: 'sanpham.xem')
    TenHienThi VARCHAR(150) NOT NULL,        -- Tên hiển thị (ví dụ: 'Xem sản phẩm')
    NgayTao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Bảng PhanQuyen_VaiTro (Quan hệ nhiều-nhiều)
```sql
CREATE TABLE PhanQuyen_VaiTro (
    VaiTroId INT NOT NULL,                   -- FK đến VaiTro.MaVaiTro
    PhanQuyenId INT NOT NULL,                -- FK đến PhanQuyen.id
    PRIMARY KEY (VaiTroId, PhanQuyenId)
);
```

## Danh Sách Quyền

### Quyền Admin
- `toanquyen` - Toàn quyền

### Quyền Sản Phẩm
- `sanpham.xem` - Xem sản phẩm
- `sanpham.tao` - Tạo sản phẩm
- `sanpham.sua` - Cập nhật sản phẩm
- `sanpham.xoa` - Xóa sản phẩm

### Quyền Nhập Hàng
- `nhaphang.xem` - Xem phiếu nhập
- `nhaphang.tao` - Tạo phiếu nhập
- `nhaphang.sua` - Cập nhật phiếu nhập
- `nhaphang.xoa` - Xóa phiếu nhập

### Quyền Đặt Hàng NCC
- `dathang.xem` - Xem đơn đặt hàng
- `dathang.tao` - Tạo đơn đặt hàng
- `dathang.sua` - Cập nhật đơn đặt hàng
- `dathang.xoa` - Xóa đơn đặt hàng

### Quyền Nhà Cung Cấp
- `nhacungcap.xem` - Xem nhà cung cấp
- `nhacungcap.tao` - Tạo nhà cung cấp
- `nhacungcap.sua` - Cập nhật nhà cung cấp
- `nhacungcap.xoa` - Xóa nhà cung cấp

### Quyền Danh Mục
- `danhmuc.xem` - Xem danh mục
- `danhmuc.tao` - Tạo danh mục
- `danhmuc.sua` - Cập nhật danh mục
- `danhmuc.xoa` - Xóa danh mục

### Quyền Màu Sắc
- `mausac.xem` - Xem màu sắc
- `mausac.tao` - Tạo màu sắc
- `mausac.sua` - Cập nhật màu sắc
- `mausac.xoa` - Xóa màu sắc

### Quyền Kích Thước
- `kichthuoc.xem` - Xem kích thước
- `kichthuoc.tao` - Tạo kích thước
- `kichthuoc.sua` - Cập nhật kích thước
- `kichthuoc.xoa` - Xóa kích thước

### Quyền Đơn Hàng
- `donhang.xem` - Xem tất cả đơn hàng
- `donhang.xem_cua_minh` - Xem đơn hàng của mình
- `donhang.xem_duoc_giao` - Xem đơn hàng được phân công
- `donhang.tao` - Tạo đơn hàng
- `donhang.capnhat_trangthai` - Cập nhật trạng thái đơn hàng
- `donhang.capnhat_trangthai_duocgiao` - Cập nhật trạng thái đơn được phân công
- `donhang.phancong_giaohang` - Phân công giao hàng
- `donhang.xacnhan_giaohang` - Xác nhận giao hàng

### Quyền Hóa Đơn
- `hoadon.xem` - Xem hóa đơn
- `hoadon.tao` - Tạo hóa đơn
- `hoadon.sua` - Cập nhật hóa đơn
- `hoadon.xoa` - Xóa hóa đơn

### Quyền Nhân Viên
- `nhanvien.xem` - Xem thông tin nhân viên
- `nhanvien.phancong` - Phân công nhân viên

### Quyền Bộ Phận
- `bophan.xem` - Xem thông tin bộ phận

### Quyền Giao Hàng
- `giaohang.quanly` - Quản lý giao hàng
- `giaohang.xem_cua_minh` - Xem đơn giao của mình

### Quyền Bình Luận
- `binhluan.tao` - Tạo bình luận
- `binhluan.sua_cua_minh` - Sửa bình luận của mình
- `binhluan.xoa_cua_minh` - Xóa bình luận của mình
- `binhluan.kiemduyet` - Quản lý bình luận

### Quyền Giỏ Hàng
- `giohang.xem` - Xem giỏ hàng
- `giohang.them` - Thêm vào giỏ hàng
- `giohang.sua` - Cập nhật giỏ hàng
- `giohang.xoa` - Xóa khỏi giỏ hàng

### Quyền Profile
- `thongtin.xem` - Xem thông tin cá nhân
- `thongtin.sua` - Cập nhật thông tin cá nhân

## Phân Quyền Theo Vai Trò

### 1. Admin (MaVaiTro: 1)
- **Quyền**: `toanquyen` (Toàn quyền)

### 2. Nhân Viên Cửa Hàng (MaVaiTro: 2)
- **Quyền**: Quản lý sản phẩm, nhập hàng, đặt hàng NCC, nhà cung cấp, danh mục, màu sắc, kích thước, đơn hàng, hóa đơn, nhân viên, bộ phận, giao hàng, bình luận

### 3. Nhân Viên Giao Hàng (MaVaiTro: 3)
- **Quyền**: Xem đơn hàng được phân công, xác nhận giao hàng, cập nhật trạng thái đơn được phân công, thông tin cá nhân, xem đơn giao của mình

### 4. Khách Hàng (MaVaiTro: 4)
- **Quyền**: Xem sản phẩm, tạo đơn hàng, xem đơn hàng của mình, quản lý giỏ hàng, thông tin cá nhân, quản lý bình luận của mình

## Cách Sử Dụng

### 1. Middleware Cơ Bản

```javascript
const { authorize } = require('../middlewares/authorize');

// Kiểm tra một quyền
router.get('/products', authorize('sanpham.xem'), ProductController.getAll);

// Kiểm tra nhiều quyền (phải có tất cả)
router.post('/products', authorize(['sanpham.tao', 'sanpham.sua']), ProductController.create);
```

### 2. Middleware Với Context

```javascript
const { authorizeWithContext } = require('../middlewares/authorize');

// Kiểm tra quyền với context động
router.get('/orders/:id', authorizeWithContext('donhang.xem_cua_minh', (req) => ({
  userId: req.params.userId
})), OrderController.getById);
```

### 3. Middleware Sở Hữu

```javascript
const { authorizeOwnership } = require('../middlewares/authorize');

// Kiểm tra quyền sở hữu
router.put('/comments/:id', authorizeOwnership('binhluan.sua_cua_minh', (req) => ({
  authorId: req.body.authorId
})), CommentController.update);
```

### 4. Middleware Đặc Biệt

```javascript
const { authorizeOrder, authorizeComment } = require('../middlewares/authorize');

// Kiểm tra quyền đơn hàng
router.get('/orders/:id', authorizeOrder('donhang.xem_cua_minh'), OrderController.getById);

// Kiểm tra quyền bình luận
router.delete('/comments/:id', authorizeComment('binhluan.xoa_cua_minh'), CommentController.delete);
```

### 5. Service Layer

```javascript
const PhanQuyenService = require('../services/PhanQuyenService');

// Kiểm tra quyền trong controller
const hasPermission = await PhanQuyenService.checkPermission(userId, 'sanpham.xem');

// Lấy quyền của user
const userPermissions = await PhanQuyenService.getUserPermissions(userId);

// Kiểm tra quyền với context
const hasPermission = await PhanQuyenService.checkPermissionWithContext(
  userId, 
  'donhang.xem_cua_minh', 
  { userId: orderUserId }
);
```

## API Endpoints

### Quản Lý Quyền (Chỉ Admin)

```
GET    /api/permissions/all                    - Lấy tất cả quyền
GET    /api/permissions/role/:vaiTroId         - Lấy quyền theo vai trò
PUT    /api/permissions/role/:vaiTroId         - Cập nhật quyền cho vai trò
GET    /api/permissions/my-permissions         - Lấy quyền của user hiện tại
POST   /api/permissions/check                  - Kiểm tra quyền của user
```

## Ví Dụ Sử Dụng Trong Routes

### Sản Phẩm
```javascript
router.get('/', authorize('sanpham.xem'), SanPhamController.getAll);
router.post('/', authorize('sanpham.tao'), SanPhamController.create);
router.put('/:id', authorize('sanpham.sua'), SanPhamController.update);
router.delete('/:id', authorize('sanpham.xoa'), SanPhamController.delete);
```

### Đơn Hàng
```javascript
router.get('/', authorize('donhang.xem'), DonDatHangController.getAll);
router.get('/my-orders', authorize('donhang.xem_cua_minh'), DonDatHangController.getMyOrders);
router.get('/assigned', authorize('donhang.xem_duoc_giao'), DonDatHangController.getAssignedOrders);
router.post('/', authorize('donhang.tao'), DonDatHangController.create);
router.put('/:id/status', authorize('donhang.capnhat_trangthai'), DonDatHangController.updateStatus);
```

### Bình Luận
```javascript
router.get('/', authorize('binhluan.xem'), BinhLuanController.getAll);
router.post('/', authorize('binhluan.tao'), BinhLuanController.create);
router.put('/:id', authorizeComment('binhluan.sua_cua_minh'), BinhLuanController.update);
router.delete('/:id', authorizeComment('binhluan.xoa_cua_minh'), BinhLuanController.delete);
```

## Cài Đặt

### 1. Chạy Migration
```bash
node setup_permission_system.js
```

### 2. Kiểm Tra Kết Quả
```bash
# Kiểm tra bảng đã được tạo
mysql -u root -p 3tshop_tttn -e "SHOW TABLES LIKE 'PhanQuyen%';"

# Kiểm tra dữ liệu
mysql -u root -p 3tshop_tttn -e "SELECT COUNT(*) FROM PhanQuyen;"
mysql -u root -p 3tshop_tttn -e "SELECT COUNT(*) FROM PhanQuyen_VaiTro;"
```

## Lợi Ích

1. **Bảo Mật**: Kiểm tra quyền chi tiết, ngăn chặn truy cập trái phép
2. **Linh Hoạt**: Dễ dàng thêm/sửa/xóa quyền và vai trò
3. **Tái Sử Dụng**: Middleware và service có thể dùng lại
4. **Clean Code**: Code sạch, dễ đọc và bảo trì
5. **Mở Rộng**: Dễ dàng mở rộng thêm quyền mới
6. **Context-Aware**: Hỗ trợ kiểm tra quyền với context phức tạp

## Lưu Ý

- Luôn sử dụng middleware `authenticateJWT` trước middleware `authorize`
- Kiểm tra quyền ở cả frontend và backend
- Log lại các hoạt động quan trọng để audit
- Cập nhật documentation khi thêm quyền mới 