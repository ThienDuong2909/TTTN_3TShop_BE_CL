# FP-Growth Rules API Documentation

API này cung cấp các endpoint để lấy và xem chi tiết các Association Rules được lưu trong database từ thuật toán FP-Growth.

## Base URL
```
http://localhost:8080/api/fpgrowth
```

## Endpoints

### 1. Lấy Thông Tin Model Metadata

**Endpoint:** `GET /api/fpgrowth/model`

**Mô tả:** Lấy thông tin về model FP-Growth mới nhất (số transactions, config, thời gian tạo)

**Authentication:** Không yêu cầu

**Response:**
```json
{
  "success": true,
  "message": "Lấy thông tin model thành công",
  "data": {
    "id": 5,
    "N": 150,
    "min_sup": 0.4,
    "min_conf": 0.8,
    "total_rules": 45,
    "total_freq_items": 120,
    "created_at": "2025-11-08T10:30:00.000Z"
  }
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:8080/api/fpgrowth/model
```

---

### 2. Lấy Danh Sách Rules Với Chi Tiết Sản Phẩm

**Endpoint:** `GET /api/fpgrowth/rules`

**Mô tả:** Lấy danh sách các association rules kèm thông tin chi tiết sản phẩm. Rule cho biết khi khách hàng mua sản phẩm A thì có khả năng mua thêm sản phẩm B.

**Authentication:** Không yêu cầu

**Query Parameters:**
- `modelId` (optional): ID của model cụ thể (mặc định: model mới nhất)
- `limit` (optional): Số lượng rules tối đa (mặc định: 50)
- `offset` (optional): Vị trí bắt đầu (mặc định: 0)
- `minConfidence` (optional): Lọc rules có confidence >= giá trị này
- `minLift` (optional): Lọc rules có lift >= giá trị này

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách rules thành công",
  "data": {
    "model_info": {
      "id": 5,
      "transactions": 150,
      "min_sup": 0.4,
      "min_conf": 0.8,
      "total_rules": 45,
      "created_at": "2025-11-08T10:30:00.000Z"
    },
    "rules": [
      {
        "rule_id": 123,
        "antecedent_ids": [5, 8],
        "consequent_id": 12,
        "itemset": [5, 8, 12],
        "support": 0.35,
        "confidence": 0.85,
        "lift": 1.5,
        "antecedent_products": [
          {
            "MaSP": 5,
            "TenSP": "Áo Polo Nam",
            "MoTa": "...",
            "LoaiSP": {...},
            "NhaCungCap": {...},
            "ThayDoiGias": [{...}],
            "CT_DotGiamGias": [{...}],
            "AnhSanPhams": [{...}],
            "ChiTietSanPhams": [{...}]
          },
          {
            "MaSP": 8,
            "TenSP": "Quần Jean Nam",
            ...
          }
        ],
        "consequent_product": {
          "MaSP": 12,
          "TenSP": "Giày Thể Thao",
          ...
        },
        "interpretation": "Khách hàng mua \"Áo Polo Nam\", \"Quần Jean Nam\" thì có 85.0% khả năng sẽ mua \"Giày Thể Thao\" (xuất hiện cùng nhau trong 35.0% đơn hàng, lift = 1.50)"
      }
    ],
    "total": 45,
    "limit": 50,
    "offset": 0
  }
}
```

**Example cURL:**
```bash
# Lấy 20 rules đầu tiên
curl -X GET "http://localhost:8080/api/fpgrowth/rules?limit=20"

# Lọc rules có confidence >= 0.9
curl -X GET "http://localhost:8080/api/fpgrowth/rules?minConfidence=0.9"

# Lọc rules có lift >= 2.0
curl -X GET "http://localhost:8080/api/fpgrowth/rules?minLift=2.0"
```

---

### 3. Tìm Kiếm Rules Theo Sản Phẩm

**Endpoint:** `GET /api/fpgrowth/rules/search`

**Mô tả:** Tìm kiếm các rules liên quan đến một sản phẩm cụ thể (MaSP)

**Authentication:** Không yêu cầu

**Query Parameters:**
- `maSP` (required): Mã sản phẩm cần tìm
- `modelId` (optional): ID của model cụ thể
- `searchIn` (optional): Tìm trong phần nào của rule
  - `antecedent`: Tìm sản phẩm trong giỏ hàng (A)
  - `consequent`: Tìm sản phẩm được gợi ý (B)
  - `both`: Tìm cả hai (mặc định)

**Response:**
```json
{
  "success": true,
  "message": "Tìm kiếm rules thành công",
  "data": {
    "searched_product": {
      "MaSP": 5,
      "TenSP": "Áo Polo Nam",
      ...
    },
    "rules": [
      {
        "rule_id": 123,
        "antecedent_ids": [5],
        "consequent_id": 12,
        "support": 0.4,
        "confidence": 0.85,
        "lift": 1.5,
        "antecedent_products": [...],
        "consequent_product": {...},
        "interpretation": "..."
      }
    ],
    "total": 8,
    "search_in": "both"
  }
}
```

**Use Cases:**

1. **Tìm sản phẩm nào thường được mua cùng với sản phẩm X:**
   ```bash
   curl -X GET "http://localhost:8080/api/fpgrowth/rules/search?maSP=5&searchIn=antecedent"
   ```

2. **Tìm sản phẩm X được gợi ý khi mua các sản phẩm nào:**
   ```bash
   curl -X GET "http://localhost:8080/api/fpgrowth/rules/search?maSP=5&searchIn=consequent"
   ```

**Example cURL:**
```bash
curl -X GET "http://localhost:8080/api/fpgrowth/rules/search?maSP=5"
```

---

### 4. Lấy Top Sản Phẩm Được Recommend Nhiều Nhất

**Endpoint:** `GET /api/fpgrowth/rules/top-products`

**Mô tả:** Lấy danh sách các sản phẩm được gợi ý nhiều nhất (xuất hiện nhiều nhất ở phần consequent của rules)

**Authentication:** Không yêu cầu

**Query Parameters:**
- `modelId` (optional): ID của model cụ thể
- `limit` (optional): Số lượng sản phẩm (mặc định: 10)

**Response:**
```json
{
  "success": true,
  "message": "Lấy top sản phẩm thành công",
  "data": {
    "products": [
      {
        "product": {
          "MaSP": 12,
          "TenSP": "Giày Thể Thao",
          ...
        },
        "statistics": {
          "rule_count": 15,
          "avg_confidence": 0.83,
          "avg_support": 0.38,
          "avg_lift": 1.45
        }
      },
      {
        "product": {
          "MaSP": 8,
          "TenSP": "Quần Jean Nam",
          ...
        },
        "statistics": {
          "rule_count": 12,
          "avg_confidence": 0.81,
          "avg_support": 0.35,
          "avg_lift": 1.38
        }
      }
    ],
    "total": 10
  }
}
```

**Ý nghĩa:**
- `rule_count`: Số lượng rules mà sản phẩm này được gợi ý
- `avg_confidence`: Độ tin cậy trung bình
- `avg_support`: Support trung bình
- `avg_lift`: Lift trung bình

**Example cURL:**
```bash
curl -X GET "http://localhost:8080/api/fpgrowth/rules/top-products?limit=20"
```

---

## Giải Thích Các Metrics

### Support (Hỗ trợ)
- **Định nghĩa:** Tỷ lệ đơn hàng chứa cả A và B
- **Công thức:** `support(A → B) = P(A ∪ B)`
- **Ví dụ:** `support = 0.35` = 35% đơn hàng có cả A và B

### Confidence (Độ tin cậy)
- **Định nghĩa:** Xác suất mua B khi đã mua A
- **Công thức:** `confidence(A → B) = P(B|A) = support(A∪B) / support(A)`
- **Ví dụ:** `confidence = 0.85` = 85% khách mua A cũng mua B

### Lift (Nâng cao)
- **Định nghĩa:** Mức độ mạnh của mối liên hệ giữa A và B
- **Công thức:** `lift(A → B) = confidence(A→B) / support(B)`
- **Giải thích:**
  - `lift = 1`: A và B độc lập
  - `lift > 1`: Mua A làm tăng khả năng mua B
  - `lift < 1`: Mua A làm giảm khả năng mua B

---

## Use Cases Thực Tế

### 1. Hiển Thị Gợi Ý Sản Phẩm
**Scenario:** Khách hàng đang xem sản phẩm MaSP = 5

**API Call:**
```javascript
const response = await fetch(
  'http://localhost:8080/api/fpgrowth/rules/search?maSP=5&searchIn=antecedent&limit=5'
);
```

**Kết quả:** Hiển thị top 5 sản phẩm thường được mua cùng với sản phẩm 5

---

### 2. Dashboard Analytics
**Scenario:** Admin muốn xem sản phẩm nào có sức ảnh hưởng cao nhất

**API Call:**
```javascript
const response = await fetch(
  'http://localhost:8080/api/fpgrowth/rules/top-products?limit=10'
);
```

**Kết quả:** Top 10 sản phẩm được recommend nhiều nhất

---

### 3. Phân Tích Combo Sản Phẩm
**Scenario:** Kinh doanh muốn tìm các combo sản phẩm bán chạy

**API Call:**
```javascript
const response = await fetch(
  'http://localhost:8080/api/fpgrowth/rules?minConfidence=0.8&minLift=1.5'
);
```

**Kết quả:** Các rules có độ tin cậy cao và liên hệ mạnh

---

## Response Format

### Thành Công
```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": { ... }
}
```

### Lỗi
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi kỹ thuật"
}
```

---

## Error Codes

| Status Code | Mô tả |
|------------|-------|
| 200 | Thành công |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 404 | Không tìm thấy dữ liệu |
| 500 | Lỗi server |

---

## JavaScript Examples

### Fetch API
```javascript
// Lấy rules
async function getRules() {
  const response = await fetch(
    'http://localhost:8080/api/fpgrowth/rules?limit=20'
  );
  const data = await response.json();
  console.log(data);
}

// Tìm kiếm theo sản phẩm
async function searchByProduct(maSP) {
  const response = await fetch(
    `http://localhost:8080/api/fpgrowth/rules/search?maSP=${maSP}`
  );
  const data = await response.json();
  return data;
}

// Lấy top products
async function getTopProducts() {
  const response = await fetch(
    'http://localhost:8080/api/fpgrowth/rules/top-products?limit=10'
  );
  const data = await response.json();
  return data;
}
```

### Axios
```javascript
import axios from 'axios';

// Lấy rules với filter
const rules = await axios.get('http://localhost:8080/api/fpgrowth/rules', {
  params: {
    limit: 20,
    minConfidence: 0.8,
    minLift: 1.5
  }
});

// Tìm kiếm
const searchResult = await axios.get(
  'http://localhost:8080/api/fpgrowth/rules/search',
  {
    params: {
      maSP: 5,
      searchIn: 'antecedent'
    }
  }
);
```

---

## Database Tables

### FP_ModelMetadata
Lưu thông tin về model
```sql
CREATE TABLE FP_ModelMetadata (
  id INT PRIMARY KEY AUTO_INCREMENT,
  N INT NOT NULL COMMENT 'Số lượng transactions',
  min_sup FLOAT NOT NULL,
  min_conf FLOAT NOT NULL,
  total_rules INT NOT NULL,
  total_freq_items INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### FP_Rules
Lưu các association rules
```sql
CREATE TABLE FP_Rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  model_id INT NOT NULL,
  antecedent TEXT NOT NULL COMMENT 'Tập A (MaSP) - JSON array',
  consequent INT NOT NULL COMMENT 'Item b (MaSP)',
  itemset TEXT NOT NULL COMMENT 'Tập X = A ∪ {b} - JSON array',
  support FLOAT NOT NULL,
  confidence FLOAT NOT NULL,
  lift FLOAT NOT NULL,
  FOREIGN KEY (model_id) REFERENCES FP_ModelMetadata(id)
);
```

---

**Version:** 1.0.0  
**Last Updated:** November 8, 2025
