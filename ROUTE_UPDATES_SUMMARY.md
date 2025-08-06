# Route Updates Summary - Permission System Migration

## Overview
All route files have been successfully updated to use the new permission-based authorization system instead of the old role-based system. This provides more granular control and better reusability.

## Updated Route Files

### 1. `src/routes/sanpham.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin', 'NhanVienCuaHang')`)
- Added new permission-based authorization:
  - `authorize('sanpham.xem')` - View products
  - `authorize('sanpham.tao')` - Create products
  - `authorize('sanpham.sua')` - Update products
  - `authorize('sanpham.xoa')` - Delete products
- Organized routes into public, authenticated, and authorized sections

### 2. `src/routes/donDatHang.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('donhang.xem')` - View all orders
  - `authorize('donhang.xem_cua_minh')` - View own orders
  - `authorize('donhang.xem_duoc_giao')` - View assigned orders
  - `authorize('donhang.tao')` - Create orders
  - `authorize('donhang.capnhat_trangthai')` - Update order status
  - `authorize('donhang.phancong_giaohang')` - Assign delivery
  - `authorize('donhang.xacnhan_giaohang')` - Confirm delivery

### 3. `src/routes/binhluan.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('binhluan.tao')` - Create comments
  - `authorize('binhluan.sua_cua_minh')` - Edit own comments
  - `authorize('binhluan.xoa_cua_minh')` - Delete own comments
  - `authorize('binhluan.kiemduyet')` - Manage comments (admin)

### 4. `src/routes/gioHang.js`
**Changes:**
- Removed old role-based authorization (`authorize('KhachHang')`)
- Added new permission-based authorization:
  - `authorize('giohang.xem')` - View cart
  - `authorize('giohang.them')` - Add to cart
  - `authorize('giohang.xoa')` - Remove from cart
  - `authorize('donhang.tao')` - Place order
  - `authorize('donhang.xem_cua_minh')` - View own orders

### 5. `src/routes/nhanvien.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('nhanvien.xem')` - View employees
  - `authorize('nhanvien.phancong')` - Assign employees
  - `authorize('donhang.phancong_giaohang')` - Assign delivery

### 6. `src/routes/hoadon.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin', 'NhanVienCuaHang')`)
- Added new permission-based authorization:
  - `authorize('hoadon.xem')` - View invoices
  - `authorize('hoadon.tao')` - Create invoices

### 7. `src/routes/nhacungcap.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('nhacungcap.xem')` - View suppliers
  - `authorize('nhacungcap.tao')` - Create suppliers
  - `authorize('nhacungcap.sua')` - Update suppliers
  - `authorize('nhacungcap.xoa')` - Delete suppliers

### 8. `src/routes/loaiSP.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('danhmuc.tao')` - Create categories
  - `authorize('danhmuc.sua')` - Update categories
  - `authorize('danhmuc.xoa')` - Delete categories

### 9. `src/routes/mau.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('mausac.tao')` - Create colors
  - `authorize('mausac.sua')` - Update colors
  - `authorize('mausac.xoa')` - Delete colors

### 10. `src/routes/kichthuoc.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('kichthuoc.tao')` - Create sizes
  - `authorize('kichthuoc.sua')` - Update sizes
  - `authorize('kichthuoc.xoa')` - Delete sizes

### 11. `src/routes/phieuNhap.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin', 'NhanVienCuaHang')`)
- Added new permission-based authorization:
  - `authorize('nhaphang.xem')` - View import slips
  - `authorize('nhaphang.tao')` - Create import slips
  - `authorize('nhaphang.sua')` - Update import slips

### 12. `src/routes/phieuDatHangNCC.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('dathang.xem')` - View purchase orders
  - `authorize('dathang.tao')` - Create purchase orders
  - `authorize('dathang.sua')` - Update purchase orders

### 13. `src/routes/bophan.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin')`)
- Added new permission-based authorization:
  - `authorize('bophan.xem')` - View departments
  - `authorize('toanquyen')` - Full access (create/update/delete)

### 14. `src/routes/tigia.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin')`)
- Added new permission-based authorization:
  - `authorize('toanquyen')` - Full access to exchange rates

### 15. `src/routes/trangThaiDH.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin')`)
- Added new permission-based authorization:
  - `authorize('donhang.xem')` - View order statuses
  - `authorize('toanquyen')` - Full access (create/update/delete)

### 16. `src/routes/trangthaidathang.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('dathang.xem')` - View purchase order statuses
  - `authorize('dathang.tao')` - Create purchase order statuses
  - `authorize('dathang.sua')` - Update purchase order statuses
  - `authorize('dathang.xoa')` - Delete purchase order statuses

### 17. `src/routes/taikhoan.js`
**Changes:**
- Removed old role-based authorization (`authorize('Admin')`)
- Added new permission-based authorization:
  - `authorize('toanquyen')` - Full access to account creation

### 18. `src/routes/traHang.js`
**Changes:**
- Removed old role-based authorization
- Added new permission-based authorization:
  - `authorize('thongtin.xem')` - Customer access to return requests
  - `authorize('toanquyen')` - Full access to return management

## Key Benefits of the New System

1. **Granular Control**: Each action now has its own specific permission
2. **Reusability**: Permissions can be easily assigned to different roles
3. **Flexibility**: Easy to add new permissions without changing code
4. **Clean Code**: Consistent authorization pattern across all routes
5. **Better Security**: More precise control over what each user can do

## Permission Mapping

| Old Role | New Permissions |
|----------|-----------------|
| Admin | `toanquyen` (full access) |
| NhanVienCuaHang | Product, order, invoice, supplier management |
| NhanVienGiaoHang | Delivery-specific permissions |
| KhachHang | Customer-specific permissions |

## Next Steps

1. Run the migration script to set up the database tables
2. Test the new permission system
3. Update any remaining route files if needed
4. Update frontend to handle new permission structure 