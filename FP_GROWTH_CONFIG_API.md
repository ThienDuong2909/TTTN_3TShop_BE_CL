# FP-Growth Configuration API Documentation

API này cung cấp các endpoint để quản lý cấu hình FP-Growth (MIN_SUP, MIN_CONF) thông qua việc gọi Python API.

## Base URL
```
http://localhost:8080/api/fpgrowth
```

## Endpoints

### 1. Lấy Cấu Hình Hiện Tại

**Endpoint:** `GET /api/fpgrowth/config`

**Mô tả:** Lấy thông số cấu hình hiện tại của FP-Growth algorithm

**Authentication:** Không yêu cầu

**Response:**
```json
{
  "success": true,
  "message": "Lấy cấu hình FP-Growth thành công",
  "data": {
    "min_sup": 0.4,
    "min_conf": 0.8,
    "transactions": 150,
    "rules": 45
  }
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:8080/api/fpgrowth/config
```

---

### 2. Cập Nhật Cấu Hình

**Endpoint:** `POST /api/fpgrowth/config`

**Mô tả:** Cập nhật MIN_SUP và/hoặc MIN_CONF. Sau khi cập nhật, model sẽ tự động rebuild.

**Authentication:** Yêu cầu JWT token và quyền `admin`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "min_sup": 0.3,
  "min_conf": 0.7
}
```

**Parameters:**
- `min_sup` (optional): Giá trị MIN_SUP mới (0 < min_sup ≤ 1)
- `min_conf` (optional): Giá trị MIN_CONF mới (0 < min_conf ≤ 1)

**Note:** Phải cung cấp ít nhất một trong hai tham số

**Success Response:**
```json
{
  "success": true,
  "message": "Cập nhật cấu hình FP-Growth thành công",
  "data": {
    "old_config": {
      "min_sup": 0.4,
      "min_conf": 0.8
    },
    "new_config": {
      "min_sup": 0.3,
      "min_conf": 0.7
    },
    "transactions": 150,
    "rules": 67
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "min_sup phải là số trong khoảng (0, 1]"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/fpgrowth/config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "min_sup": 0.3,
    "min_conf": 0.7
  }'
```

---

### 3. Làm Mới Model

**Endpoint:** `POST /api/fpgrowth/refresh`

**Mô tả:** Rebuild model với cấu hình hiện tại (re-train với dữ liệu mới nhất)

**Authentication:** Yêu cầu JWT token và quyền `admin`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Làm mới model FP-Growth thành công",
  "data": {
    "transactions": 150,
    "rules": 45
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:8080/api/fpgrowth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 4. Kiểm Tra Health Status

**Endpoint:** `GET /api/fpgrowth/health`

**Mô tả:** Kiểm tra trạng thái hoạt động của Python API

**Authentication:** Không yêu cầu

**Response:**
```json
{
  "success": true,
  "message": "Python API hoạt động bình thường",
  "data": {
    "ok": true,
    "transactions": 150,
    "rules": 45,
    "min_sup": 0.4,
    "min_conf": 0.8
  }
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:8080/api/fpgrowth/health
```

---

## Error Codes

| Status Code | Mô tả |
|------------|-------|
| 200 | Thành công |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền truy cập |
| 500 | Lỗi server |
| 503 | Python API không hoạt động |

## Quy Tắc Validate

### MIN_SUP (Minimum Support)
- **Kiểu:** Number
- **Giá trị:** 0 < min_sup ≤ 1
- **Ý nghĩa:** Tần suất tối thiểu của itemset (ví dụ: 0.4 = 40%)

### MIN_CONF (Minimum Confidence)
- **Kiểu:** Number  
- **Giá trị:** 0 < min_conf ≤ 1
- **Ý nghĩa:** Độ tin cậy tối thiểu của rule (ví dụ: 0.8 = 80%)

## Lưu Ý Quan Trọng

1. **Authentication:** 
   - Routes GET không yêu cầu đăng nhập (public)
   - Routes POST yêu cầu đăng nhập và quyền admin

2. **Python API:**
   - Đảm bảo Python API đang chạy tại `http://localhost:8000`
   - Có thể cấu hình URL qua biến môi trường `PYTHON_API_URL`

3. **Rebuild Model:**
   - Sau khi update config, model sẽ tự động rebuild
   - Quá trình này có thể mất vài giây tùy thuộc vào số lượng giao dịch
   - Có thể dùng endpoint `/refresh` để rebuild thủ công

4. **Performance:**
   - MIN_SUP thấp hơn = nhiều rules hơn = chậm hơn
   - MIN_CONF cao hơn = ít rules hơn = nhanh hơn
   - Cần cân bằng giữa độ chính xác và hiệu suất

## Ví Dụ Sử Dụng

### JavaScript (Fetch API)
```javascript
// Lấy config hiện tại
async function getConfig() {
  const response = await fetch('http://localhost:8080/api/fpgrowth/config');
  const data = await response.json();
  console.log(data);
}

// Cập nhật config (cần token)
async function updateConfig(minSup, minConf, token) {
  const response = await fetch('http://localhost:8080/api/fpgrowth/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      min_sup: minSup,
      min_conf: minConf
    })
  });
  const data = await response.json();
  console.log(data);
}
```

### Axios Example
```javascript
import axios from 'axios';

// Lấy config
const config = await axios.get('http://localhost:8080/api/fpgrowth/config');

// Cập nhật config
const result = await axios.post(
  'http://localhost:8080/api/fpgrowth/config',
  {
    min_sup: 0.3,
    min_conf: 0.7
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

## Môi Trường Development

Thêm vào file `.env`:
```env
PYTHON_API_URL=http://localhost:8000
```

## Testing

Để test các API này, bạn có thể:
1. Sử dụng Postman/Thunder Client
2. Chạy các file test trong thư mục `tests/`
3. Sử dụng các command cURL ở trên

---

**Version:** 1.0.0  
**Last Updated:** November 2, 2025
