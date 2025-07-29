# API Phân Công Nhân Viên Giao Hàng

## Tổng quan
Hệ thống phân công nhân viên giao hàng thông minh dựa trên:
1. **Khu vực phụ trách**: Ưu tiên nhân viên phụ trách khu vực đó
2. **Số lượng đơn hàng**: Ưu tiên nhân viên có ít đơn hàng đang xử lý

## API Endpoints

### 1. Tìm nhân viên giao hàng tối ưu
**POST** `/api/employees/delivery/find-optimal`

Tìm nhân viên giao hàng tốt nhất cho một đơn hàng dựa trên địa chỉ giao hàng.

#### Request Body:
```json
{
  "diaChi": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Tìm nhân viên giao hàng tối ưu thành công",
  "data": {
    "MaNV": 5,
    "TenNV": "Nguyễn Văn B",
    "KhuVuc": "Quận 1, Phường Bến Nghé, Phường Bến Thành",
    "DiaChi": "456 Lê Lợi, Quận 1, TP.HCM",
    "SoDonDangGiao": 2
  }
}
```

### 2. Lấy danh sách nhân viên giao hàng khả dụng
**POST** `/api/employees/delivery/available`

Lấy danh sách tất cả nhân viên giao hàng, ưu tiên theo khu vực và số đơn hàng.

#### Request Body:
```json
{
  "diaChi": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Lấy danh sách nhân viên giao hàng thành công",
  "data": [
    {
      "MaNV": 5,
      "TenNV": "Nguyễn Văn B",
      "KhuVuc": "Quận 1, Phường Bến Nghé",
      "DiaChi": "456 Lê Lợi, Quận 1, TP.HCM",
      "SoDonDangGiao": 2,
      "LoaiPhuTrach": "PHUTRACH"
    },
    {
      "MaNV": 3,
      "TenNV": "Nguyễn Văn A",
      "KhuVuc": "Quận 1, Phường Sài Gòn",
      "DiaChi": "123 Lê Duẩn, Quận 1, TP.HCM",
      "SoDonDangGiao": 5,
      "LoaiPhuTrach": "PHUTRACH"
    },
    {
      "MaNV": 7,
      "TenNV": "Nguyễn Văn C",
      "KhuVuc": "Quận 3, Phường Tân Định",
      "DiaChi": "789 Pasteur, Quận 3, TP.HCM",
      "SoDonDangGiao": 1,
      "LoaiPhuTrach": "KHAC"
    }
  ]
}
```

### 3. Lấy thống kê công việc nhân viên giao hàng
**GET** `/api/employees/delivery/workload`

Lấy thống kê công việc của tất cả nhân viên giao hàng.

#### Response:
```json
{
  "success": true,
  "message": "Lấy thống kê công việc thành công",
  "data": [
    {
      "MaNV": 5,
      "TenNV": "Nguyễn Văn B",
      "KhuVuc": "Quận 1, Phường Bến Nghé",
      "DonDaPhanCong": 1,
      "DonDangGiao": 1,
      "DonDaGiaoHomNay": 3,
      "TongDonDangXuLy": 2
    },
    {
      "MaNV": 3,
      "TenNV": "Nguyễn Văn A", 
      "KhuVuc": "Quận 1, Phường Sài Gòn",
      "DonDaPhanCong": 3,
      "DonDangGiao": 2,
      "DonDaGiaoHomNay": 5,
      "TongDonDangXuLy": 5
    }
  ]
}
```

### 4. Lấy thống kê công việc của một nhân viên
**GET** `/api/employees/delivery/workload/:id`

#### Response:
```json
{
  "success": true,
  "message": "Lấy thống kê công việc thành công",
  "data": {
    "MaNV": 5,
    "TenNV": "Nguyễn Văn B",
    "KhuVuc": "Quận 1, Phường Bến Nghé",
    "DonDaPhanCong": 1,
    "DonDangGiao": 1,
    "DonDaGiaoHomNay": 3,
    "TongDonDangXuLy": 2
  }
}
```

### 5. Phân công đơn hàng cho nhân viên giao hàng
**POST** `/api/employees/delivery/assign-order`

#### Request Body:
```json
{
  "MaDDH": 123,
  "MaNV": 5,
  "GhiChu": "Giao hàng trong giờ hành chính"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Phân công đơn hàng thành công",
  "data": {
    "MaDDH": 123,
    "MaNV": 5,
    "MaTTDH": 3,
    "NgayPhanCong": "2025-01-26T10:30:00.000Z",
    "GhiChu": "Giao hàng trong giờ hành chính",
    "NhanVien": {
      "MaNV": 5,
      "TenNV": "Nguyễn Văn B",
      "KhuVuc": "Quận 1, Phường Bến Nghé"
    }
  }
}
```

## Thuật toán phân công

### 1. Trích xuất khu vực từ địa chỉ
Hệ thống sử dụng regex để tìm phường/xã trong địa chỉ:
- `phường/phư/p.` + tên phường
- `xã/xa/x.` + tên xã  
- `thị trấn/tt.` + tên thị trấn

### 2. Tiêu chí ưu tiên
1. **Khu vực phụ trách**: Nhân viên có khu vực chứa phường/xã đích
2. **Số đơn hàng**: Ít đơn hàng đang xử lý (DA_PHAN_CONG, DANG_GIAO)
3. **Thứ tự**: Mã nhân viên tăng dần (tie-breaker)

### 3. Query SQL
```sql
SELECT 
  nv.MaNV, nv.TenNV, nv.KhuVuc, nv.DiaChi,
  COUNT(CASE WHEN dh.MaTTDH IN (3, 4) THEN 1 END) as SoDonDangGiao
FROM nhanvien nv
INNER JOIN nhanvien_bophan nvbp ON nv.MaNV = nvbp.MaNV 
LEFT JOIN dondathang dh ON nv.MaNV = dh.MaNV_Giao 
WHERE nvbp.MaBoPhan = 11 
  AND nvbp.TrangThai = 'DANGLAMVIEC'
  AND (nv.KhuVuc LIKE '%Bến Nghé%' OR nv.KhuVuc IS NULL)
GROUP BY nv.MaNV, nv.TenNV, nv.KhuVuc, nv.DiaChi
ORDER BY 
  CASE WHEN nv.KhuVuc LIKE '%Bến Nghé%' THEN 0 ELSE 1 END,
  SoDonDangGiao ASC, 
  nv.MaNV ASC
```

## Ví dụ sử dụng

### Scenario: Đơn hàng giao tại Phường Bến Nghé
**Nhân viên khả dụng:**
- Nguyễn Văn A: Phụ trách Phường Sài Gòn, 5 đơn đang giao
- Nguyễn Văn B: Phụ trách Phường Bến Nghé, 2 đơn đang giao  
- Nguyễn Văn C: Phụ trách Phường Tân Định, 1 đơn đang giao

**Kết quả:** Chọn Nguyễn Văn B (phụ trách khu vực + ít đơn hàng)

### Scenario: Đơn hàng giao tại Phường mới (không có ai phụ trách)
**Nhân viên khả dụng:**
- Nguyễn Văn A: 5 đơn đang giao
- Nguyễn Văn B: 2 đơn đang giao
- Nguyễn Văn C: 1 đơn đang giao

**Kết quả:** Chọn Nguyễn Văn C (ít đơn hàng nhất)

## Lưu ý

1. **Bộ phận Giao hàng**: Mã bộ phận = 11
2. **Trạng thái nhân viên**: Chỉ lấy nhân viên DANGLAMVIEC  
3. **Trạng thái đơn hàng**: Đếm đơn có MaTTDH = 3 (Đã phân công) và MaTTDH = 4 (Đang giao)
4. **Khu vực**: Sử dụng LIKE để tìm kiếm linh hoạt
5. **Transaction**: Sử dụng transaction khi phân công đơn hàng
6. **Cấu trúc database**: 
   - Bảng `dondathang` có cột `MaNV_Giao` để lưu mã nhân viên giao hàng
   - Bảng `dondathang` có cột `MaTTDH` để lưu mã trạng thái đơn hàng (số nguyên)

## Error Handling

- **400**: Thiếu thông tin bắt buộc (địa chỉ, mã đơn hàng, mã nhân viên)
- **404**: Không tìm thấy nhân viên phụ trách khu vực
- **500**: Lỗi server/database
