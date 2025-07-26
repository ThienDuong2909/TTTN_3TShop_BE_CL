# Tổng hợp API File Excel - Phiếu đặt hàng NCC

## 📋 Danh sách API

### 1. **PUT /api/phieu-dat-hang-ncc/:id/status** 
**Mục đích**: Cập nhật trạng thái và gửi email + trả về thông tin file Excel

**Khi nào sử dụng**: Khi muốn thay đổi trạng thái từ 1 (PENDING) sang 2 (APPROVED)

**Request**:
```json
{
  "MaTrangThai": 2
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cập nhật trạng thái phiếu đặt hàng NCC thành công. Đã gửi email phiếu đặt hàng đến lvthanh.work@gmail.com",
  "data": {
    "MaPDH": "PO000001",
    "MaTrangThai": 2,
    "excelFile": {
      "fileName": "PhieuDatHang_PO000001_2025-07-26.xlsx",
      "downloadUrl": "/uploads/PhieuDatHang_PO000001_2025-07-26.xlsx"
    }
  }
}
```

---

### 2. **GET /api/phieu-dat-hang-ncc/:id/excel-info**
**Mục đích**: Lấy thông tin file Excel (không tải xuống)

**Khi nào sử dụng**: Khi chỉ muốn lấy thông tin file Excel mà không thay đổi trạng thái

**Response**:
```json
{
  "success": true,
  "message": "Lấy thông tin file Excel thành công",
  "data": {
    "fileName": "PhieuDatHang_PO000001_2025-07-26.xlsx",
    "filePath": "C:\\Users\\DELL\\Documents\\TTTN\\3tshop\\uploads\\PhieuDatHang_PO000001_2025-07-26.xlsx",
    "downloadUrl": "/uploads/PhieuDatHang_PO000001_2025-07-26.xlsx",
    "fullDownloadUrl": "http://localhost:8080/uploads/PhieuDatHang_PO000001_2025-07-26.xlsx",
    "apiDownloadUrl": "http://localhost:8080/api/phieu-dat-hang-ncc/1/download-excel",
    "fileSize": 15420,
    "createdAt": "2025-07-26T10:30:00.000Z"
  }
}
```

---

### 3. **GET /api/phieu-dat-hang-ncc/:id/download-excel**
**Mục đích**: Tải xuống file Excel trực tiếp

**Khi nào sử dụng**: Khi muốn tải xuống file Excel ngay lập tức

**Response**: File Excel được tải xuống trực tiếp

---

## 🎯 Cách sử dụng trong Frontend

### **Cách 1: Sử dụng API updateStatus (Khuyến nghị)**
```javascript
// Cập nhật trạng thái và nhận thông tin file Excel
const updateStatus = async (phieuId) => {
  try {
    const response = await fetch(`/api/phieu-dat-hang-ncc/${phieuId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ MaTrangThai: 2 })
    });

    const result = await response.json();
    
    if (result.success && result.data.excelFile) {
      // Hiển thị thông báo thành công
      alert(result.message);
      
      // Tải xuống file Excel
      const downloadUrl = `http://localhost:8080${result.data.excelFile.downloadUrl}`;
      window.open(downloadUrl, '_blank');
      
      // Hoặc sử dụng API download
      // window.open(`http://localhost:8080/api/phieu-dat-hang-ncc/${phieuId}/download-excel`, '_blank');
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
```

### **Cách 2: Sử dụng API excel-info**
```javascript
// Lấy thông tin file Excel
const getExcelInfo = async (phieuId) => {
  try {
    const response = await fetch(`/api/phieu-dat-hang-ncc/${phieuId}/excel-info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      // Hiển thị thông tin file
      console.log('Tên file:', result.data.fileName);
      console.log('Kích thước:', result.data.fileSize);
      console.log('URL tải xuống:', result.data.fullDownloadUrl);
      
      // Tải xuống file
      window.open(result.data.fullDownloadUrl, '_blank');
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
```

### **Cách 3: Sử dụng API download trực tiếp**
```javascript
// Tải xuống file Excel trực tiếp
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

---

## 📊 So sánh các API

| API | Mục đích | Ưu điểm | Nhược điểm |
|-----|----------|---------|------------|
| **PUT /status** | Cập nhật trạng thái + gửi email + trả Excel | Tự động gửi email, đầy đủ thông tin | Chỉ hoạt động khi thay đổi trạng thái |
| **GET /excel-info** | Lấy thông tin file Excel | Linh hoạt, nhiều thông tin | Không tự động gửi email |
| **GET /download-excel** | Tải xuống trực tiếp | Đơn giản, nhanh | Ít thông tin |

---

## 🎯 Khuyến nghị sử dụng

### **Trường hợp 1: Cập nhật trạng thái và gửi email**
```javascript
// Sử dụng PUT /status
updateStatus(phieuId);
```

### **Trường hợp 2: Chỉ muốn tải xuống file Excel**
```javascript
// Sử dụng GET /excel-info hoặc GET /download-excel
getExcelInfo(phieuId);
// hoặc
downloadExcel(phieuId);
```

### **Trường hợp 3: Hiển thị thông tin file trước khi tải**
```javascript
// Sử dụng GET /excel-info để lấy thông tin
const info = await getExcelInfo(phieuId);
// Hiển thị thông tin cho user
showFileInfo(info);
// Sau đó tải xuống
window.open(info.fullDownloadUrl, '_blank');
```

---

## 🔧 Cấu hình

### **Quyền truy cập**
- Tất cả API đều yêu cầu JWT token
- Quyền: Admin hoặc NhanVien

### **File Excel**
- Format: `.xlsx`
- Nội dung: Thông tin phiếu đặt hàng đầy đủ
- Tự động xóa sau khi tải xuống

### **URL Base**
- Development: `http://localhost:8080`
- Production: Thay đổi theo domain thực tế 