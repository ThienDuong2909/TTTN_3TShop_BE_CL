# API Tải xuống File Excel - Phiếu đặt hàng NCC

## Tổng quan
Sau khi cập nhật trạng thái phiếu đặt hàng NCC từ 1 (PENDING) sang 2 (APPROVED), hệ thống sẽ:
1. Gửi email với file Excel đính kèm đến nhà cung cấp
2. Trả về thông tin file Excel cho Frontend để người dùng có thể tải xuống

## API Endpoints

### 1. Cập nhật trạng thái và gửi email
```
PUT /api/phieu-dat-hang-ncc/:id/status
```

**Request Body:**
```json
{
  "MaTrangThai": 2
}
```

**Response khi thành công:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái phiếu đặt hàng NCC thành công. Đã gửi email phiếu đặt hàng đến lvthanh.work@gmail.com",
  "data": {
    "MaPDH": "PO000001",
    "NgayDat": "2025-07-26T00:00:00.000Z",
    "MaTrangThai": 2,
    "NhanVien": {
      "HoTen": "Nguyễn Văn Thanh"
    },
    "NhaCungCap": {
      "TenNCC": "CÔNG TY TNHH MAY MẶC THỜI ĐẠI",
      "Email": "lvthanh.work@gmail.com"
    },
    "excelFile": {
      "fileName": "PhieuDatHang_PO000001_2025-07-26.xlsx",
      "filePath": "C:\\Users\\DELL\\Documents\\TTTN\\3tshop\\uploads\\PhieuDatHang_PO000001_2025-07-26.xlsx",
      "downloadUrl": "/uploads/PhieuDatHang_PO000001_2025-07-26.xlsx"
    }
  }
}
```

### 2. Tải xuống file Excel trực tiếp
```
GET /api/phieu-dat-hang-ncc/:id/download-excel
```

**Response:**
- File Excel được tải xuống trực tiếp
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="PhieuDatHang_PO000001_2025-07-26.xlsx"`

## Cách sử dụng trong Frontend

### 1. Sử dụng downloadUrl từ response
```javascript
// Sau khi gọi API updateStatus
const response = await fetch('/api/phieu-dat-hang-ncc/1/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ MaTrangThai: 2 })
});

const result = await response.json();

if (result.success && result.data.excelFile) {
  // Tải xuống file Excel
  const downloadUrl = `http://localhost:8080${result.data.excelFile.downloadUrl}`;
  window.open(downloadUrl, '_blank');
}
```

### 2. Sử dụng API download trực tiếp
```javascript
// Tải xuống file Excel
const downloadExcel = async (phieuId) => {
  try {
    const response = await fetch(`/api/phieu-dat-hang-ncc/${phieuId}/download-excel`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PhieuDatHang_${phieuId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error('Lỗi tải xuống:', error);
  }
};
```

## Lưu ý

1. **File Excel tự động xóa**: File Excel sẽ được xóa sau khi gửi email hoặc tải xuống để tiết kiệm dung lượng server.

2. **Quyền truy cập**: API yêu cầu xác thực JWT và quyền Admin hoặc NhanVien.

3. **Format file**: File Excel được tạo với format giống như mẫu trong hình, bao gồm:
   - Thông tin công ty
   - Thông tin nhà cung cấp
   - Danh sách sản phẩm với đầy đủ thông tin
   - Tổng tiền và thông tin thanh toán

4. **Xử lý lỗi**: Nếu gửi email thất bại, hệ thống vẫn cập nhật trạng thái thành công và có thể tải xuống file Excel.

## Test

Để test chức năng, chạy lệnh:
```bash
npm run test:email
``` 