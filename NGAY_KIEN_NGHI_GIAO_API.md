# API Ngày Kiến Nghị Giao - PhieuDatHangNCC

## Tổng quan

Tính năng "Ngày Kiến Nghị Giao" cho phép nhân viên cửa hàng và admin thiết lập ngày giao hàng dự kiến khi đặt hàng từ nhà cung cấp. Điều này giúp quản lý kế hoạch giao hàng và theo dõi tiến độ đơn hàng.

## Cấu trúc dữ liệu

### Bảng PhieuDatHangNCC

```sql
ALTER TABLE PhieuDatHangNCC 
ADD COLUMN NgayKienNghiGiao DATE NULL 
COMMENT 'Ngày kiến nghị giao hàng từ nhà cung cấp';
```

### Model PhieuDatHangNCC

```javascript
{
  MaPDH: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  NgayDat: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  NgayKienNghiGiao: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Ngày kiến nghị giao hàng từ nhà cung cấp'
  },
  // ... các trường khác
}
```

## API Endpoints

### 1. Tạo phiếu đặt hàng với ngày kiến nghị giao

**POST** `/api/phieu-dat-hang-ncc`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "NgayDat": "2024-01-15",
  "NgayKienNghiGiao": "2024-01-25",
  "MaNCC": 1,
  "MaTrangThai": 1,
  "chiTiet": [
    {
      "MaCTSP": 1,
      "SoLuong": 10,
      "DonGia": 100000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "MaPDH": "PO000001",
    "NgayDat": "2024-01-15",
    "NgayKienNghiGiao": "2024-01-25",
    "MaNV": 1,
    "MaNCC": 1,
    "MaTrangThai": 1
  },
  "message": "Tạo phiếu đặt hàng NCC thành công"
}
```

### 2. Cập nhật ngày kiến nghị giao

**PUT** `/api/phieu-dat-hang-ncc/:id/ngay-kien-nghi-giao`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "NgayKienNghiGiao": "2024-01-30"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "MaPDH": "PO000001",
    "NgayDat": "2024-01-15",
    "NgayKienNghiGiao": "2024-01-30",
    "MaNV": 1,
    "MaNCC": 1,
    "MaTrangThai": 1
  },
  "message": "Cập nhật ngày kiến nghị giao thành công"
}
```

### 3. Lấy thông tin phiếu đặt hàng (bao gồm ngày kiến nghị giao)

**GET** `/api/phieu-dat-hang-ncc/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "MaPDH": "PO000001",
    "NgayDat": "2024-01-15",
    "NgayKienNghiGiao": "2024-01-25",
    "MaNV": 1,
    "MaNCC": 1,
    "MaTrangThai": 1,
    "NhanVien": { ... },
    "NhaCungCap": { ... },
    "TrangThaiDatHangNCC": { ... },
    "CT_PhieuDatHangNCC": [ ... ]
  },
  "message": "Lấy chi tiết phiếu đặt hàng NCC thành công"
}
```

## Quyền truy cập

- **Admin**: Toàn quyền
- **NhanVienCuaHang**: Toàn quyền
- **NhanVienGiaoHang**: Chỉ xem
- **KhachHang**: Không có quyền

## Validation Rules

1. **Ngày kiến nghị giao phải sau ngày đặt hàng:**
   - `NgayKienNghiGiao >= NgayDat`
   - Nếu vi phạm: "Ngày kiến nghị giao không thể trước ngày đặt hàng"

2. **Ngày kiến nghị giao là tùy chọn:**
   - Có thể `null` hoặc `undefined`
   - Không bắt buộc khi tạo phiếu đặt hàng

3. **Định dạng ngày:**
   - Phải là chuỗi ngày hợp lệ (YYYY-MM-DD)
   - Sử dụng `DATEONLY` trong Sequelize

## Business Logic

### Service Methods

#### `create(data)`
- Tạo phiếu đặt hàng với ngày kiến nghị giao
- Validation: Ngày kiến nghị giao phải sau ngày đặt hàng

#### `updateNgayKienNghiGiao(id, ngayKienNghiGiao)`
- Cập nhật ngày kiến nghị giao cho phiếu đặt hàng
- Validation: Ngày kiến nghị giao phải sau ngày đặt hàng
- Trả về phiếu đặt hàng đã cập nhật

### Controller Methods

#### `create(req, res)`
- Xử lý tạo phiếu đặt hàng với ngày kiến nghị giao
- Gọi `PhieuDatHangNCCService.create()`

#### `updateNgayKienNghiGiao(req, res)`
- Xử lý cập nhật ngày kiến nghị giao
- Gọi `PhieuDatHangNCCService.updateNgayKienNghiGiao()`

## Migration

### Chạy migration để thêm cột

```bash
node add_ngay_kien_nghi_giao_migration.js
```

### Migration Script

```javascript
// add_ngay_kien_nghi_giao_migration.js
const { sequelize } = require('./src/models');

async function addNgayKienNghiGiaoColumn() {
  try {
    await sequelize.query(`
      ALTER TABLE PhieuDatHangNCC 
      ADD COLUMN NgayKienNghiGiao DATE NULL 
      COMMENT 'Ngày kiến nghị giao hàng từ nhà cung cấp'
    `);
    console.log('✅ Đã thêm cột NgayKienNghiGiao thành công!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await sequelize.close();
  }
}

addNgayKienNghiGiaoColumn();
```

## Testing

### Test Script

```bash
node test_ngay_kien_nghi_giao.js
```

### Test Cases

1. **Tạo phiếu đặt hàng với ngày kiến nghị giao hợp lệ**
2. **Tạo phiếu đặt hàng không có ngày kiến nghị giao**
3. **Cập nhật ngày kiến nghị giao**
4. **Test validation: ngày kiến nghị giao trước ngày đặt hàng**
5. **Lấy thông tin phiếu đặt hàng và kiểm tra ngày kiến nghị giao**

## Sử dụng trong Frontend

### Tạo phiếu đặt hàng

```javascript
const createPurchaseOrder = async (data) => {
  const response = await fetch('/api/phieu-dat-hang-ncc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      NgayDat: '2024-01-15',
      NgayKienNghiGiao: '2024-01-25', // Tùy chọn
      MaNCC: 1,
      MaTrangThai: 1,
      chiTiet: [...]
    })
  });
  return response.json();
};
```

### Cập nhật ngày kiến nghị giao

```javascript
const updateSuggestedDeliveryDate = async (maPDH, ngayKienNghiGiao) => {
  const response = await fetch(`/api/phieu-dat-hang-ncc/${maPDH}/ngay-kien-nghi-giao`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ NgayKienNghiGiao: ngayKienNghiGiao })
  });
  return response.json();
};
```

## Lưu ý

1. **Backward Compatibility**: Cột mới cho phép `NULL`, không ảnh hưởng đến dữ liệu cũ
2. **Validation**: Ngày kiến nghị giao phải sau ngày đặt hàng
3. **Authorization**: Chỉ Admin và NhanVienCuaHang có quyền cập nhật
4. **Date Format**: Sử dụng định dạng YYYY-MM-DD cho tất cả ngày
5. **Error Handling**: Xử lý lỗi validation và trả về thông báo rõ ràng 