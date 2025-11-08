# FP-Growth Rules - Tóm Tắt Implementation

## 📦 Tổng Quan

Đã implement đầy đủ hệ thống để lấy và hiển thị các Association Rules từ thuật toán FP-Growth với thông tin chi tiết sản phẩm.

---

## 🗂️ Files Đã Tạo/Cập Nhật

### Models (3 files mới)

1. **`src/models/FP_ModelMetadata.js`**
   - Model cho bảng `FP_ModelMetadata`
   - Lưu thông tin metadata của model (N, min_sup, min_conf, etc.)

2. **`src/models/FP_Rules.js`**
   - Model cho bảng `FP_Rules`
   - Lưu các association rules
   - Có getter/setter để tự động parse JSON (antecedent, itemset)

3. **`src/models/FP_FrequentItemsets.js`**
   - Model cho bảng `FP_FrequentItemsets`
   - Lưu các frequent itemsets

### Services (2 files)

4. **`src/services/FpGrowthRulesService.js`** (MỚI)
   - Service chính để xử lý logic rules
   - Methods:
     - `getLatestModelMetadata()` - Lấy model mới nhất
     - `getModelMetadataByConfig()` - Lấy model theo config
     - `getAllRules()` - Lấy tất cả rules
     - `getProductDetails()` - Lấy chi tiết sản phẩm
     - `getRulesWithProductDetails()` - Lấy rules + chi tiết SP
     - `searchRulesByProduct()` - Tìm rules theo MaSP
     - `getTopRecommendedProducts()` - Top sản phẩm được recommend
     - `generateRuleInterpretation()` - Tạo diễn giải cho rule

5. **`src/services/FpGrowthService.js`** (CẬP NHẬT)
   - Thêm import `FpGrowthRulesService`
   - Thêm 4 methods mới gọi đến FpGrowthRulesService

### Controllers

6. **`src/controllers/FpGrowthController.js`** (CẬP NHẬT)
   - Thêm 4 controller methods mới:
     - `getRulesWithDetails()` - GET /rules
     - `searchRulesByProduct()` - GET /rules/search
     - `getTopRecommendedProducts()` - GET /rules/top-products
     - `getModelMetadata()` - GET /model

### Routes

7. **`src/routes/fpGrowth.js`** (CẬP NHẬT)
   - Thêm 4 routes mới (tất cả đều public):
     - `GET /api/fpgrowth/model`
     - `GET /api/fpgrowth/rules`
     - `GET /api/fpgrowth/rules/search`
     - `GET /api/fpgrowth/rules/top-products`

### Configuration

8. **`src/models/index.js`** (CẬP NHẬT)
   - Import 3 models mới
   - Thiết lập associations giữa FP_ModelMetadata và FP_Rules/FP_FrequentItemsets
   - Export 3 models mới

### Documentation

9. **`FP_GROWTH_RULES_API.md`** (MỚI)
   - Tài liệu chi tiết về các API mới
   - Giải thích metrics (support, confidence, lift)
   - Use cases thực tế
   - Examples (cURL, JavaScript, Axios)

### Testing

10. **`test_fpgrowth_rules.js`** (MỚI)
    - Script test đầy đủ cho tất cả API mới
    - 6 test cases
    - Hiển thị kết quả đẹp với màu sắc

---

## 🎯 API Endpoints Mới

### 1. GET /api/fpgrowth/model
**Mục đích:** Lấy thông tin model metadata mới nhất

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "N": 150,
    "min_sup": 0.4,
    "min_conf": 0.8,
    "total_rules": 45,
    "created_at": "2025-11-08T10:30:00.000Z"
  }
}
```

---

### 2. GET /api/fpgrowth/rules
**Mục đích:** Lấy danh sách rules với thông tin chi tiết sản phẩm

**Query Params:**
- `modelId` (optional)
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)
- `minConfidence` (optional)
- `minLift` (optional)

**Response:** Mỗi rule bao gồm:
- `antecedent_ids` - Danh sách MaSP trong giỏ
- `consequent_id` - MaSP được recommend
- `antecedent_products` - Chi tiết sản phẩm trong giỏ (full info)
- `consequent_product` - Chi tiết sản phẩm được gợi ý (full info)
- `interpretation` - Diễn giải dễ hiểu
- Metrics: support, confidence, lift

---

### 3. GET /api/fpgrowth/rules/search
**Mục đích:** Tìm rules liên quan đến một sản phẩm cụ thể

**Query Params:**
- `maSP` (required)
- `modelId` (optional)
- `searchIn` (optional): `antecedent` | `consequent` | `both`

**Use Cases:**
- Tìm sản phẩm nào thường được mua cùng X → `searchIn=antecedent`
- Tìm X được gợi ý khi mua sản phẩm nào → `searchIn=consequent`

---

### 4. GET /api/fpgrowth/rules/top-products
**Mục đích:** Top sản phẩm được recommend nhiều nhất

**Query Params:**
- `modelId` (optional)
- `limit` (optional, default: 10)

**Response:** Danh sách sản phẩm kèm statistics:
- `rule_count` - Số rules có sản phẩm này
- `avg_confidence` - Confidence trung bình
- `avg_support` - Support trung bình
- `avg_lift` - Lift trung bình

---

## 💾 Database Tables

### FP_ModelMetadata
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
```sql
CREATE TABLE FP_Rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  model_id INT NOT NULL,
  antecedent TEXT NOT NULL COMMENT 'JSON array [MaSP]',
  consequent INT NOT NULL COMMENT 'MaSP',
  itemset TEXT NOT NULL COMMENT 'JSON array',
  support FLOAT NOT NULL,
  confidence FLOAT NOT NULL,
  lift FLOAT NOT NULL,
  FOREIGN KEY (model_id) REFERENCES FP_ModelMetadata(id)
);
```

### FP_FrequentItemsets
```sql
CREATE TABLE FP_FrequentItemsets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  model_id INT NOT NULL,
  itemset TEXT NOT NULL COMMENT 'JSON array',
  support_count INT NOT NULL,
  support_ratio FLOAT NOT NULL,
  FOREIGN KEY (model_id) REFERENCES FP_ModelMetadata(id)
);
```

---

## 🔄 Luồng Hoạt Động

### 1. Python API tạo và lưu model
```
Python API (fp_rec_api.py)
  ↓
rebuild_model() được gọi
  ↓
Chạy thuật toán FP-Growth
  ↓
Lưu vào DB:
  - FP_ModelMetadata (metadata)
  - FP_Rules (rules)
  - FP_FrequentItemsets (frequent itemsets)
```

### 2. Node.js API đọc và hiển thị
```
Client gọi API
  ↓
FpGrowthController
  ↓
FpGrowthService
  ↓
FpGrowthRulesService
  ↓
Query DB (FP_Rules, SanPham, etc.)
  ↓
Gắn thông tin chi tiết sản phẩm
  ↓
Trả về JSON response
```

---

## 📊 Ví Dụ Response Thực Tế

### Rule với chi tiết sản phẩm:
```json
{
  "rule_id": 123,
  "antecedent_ids": [5, 8],
  "consequent_id": 12,
  "support": 0.35,
  "confidence": 0.85,
  "lift": 1.5,
  "antecedent_products": [
    {
      "MaSP": 5,
      "TenSP": "Áo Polo Nam",
      "MoTa": "Áo polo cao cấp...",
      "LoaiSP": {
        "MaLoaiSP": 1,
        "TenLoai": "Áo"
      },
      "NhaCungCap": {...},
      "ThayDoiGias": [
        {
          "Gia": 350000,
          "NgayApDung": "2025-11-01"
        }
      ],
      "CT_DotGiamGias": [
        {
          "PhanTramGiam": 10,
          "DotGiamGia": {
            "MoTa": "Sale 11/11"
          }
        }
      ],
      "AnhSanPhams": [...],
      "ChiTietSanPhams": [...]
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
```

---

## 🎨 Use Cases Frontend

### 1. Trang Chi Tiết Sản Phẩm
```javascript
// Khi user xem sản phẩm có MaSP = 5
const response = await fetch(
  'http://localhost:8080/api/fpgrowth/rules/search?maSP=5&searchIn=antecedent&limit=6'
);
const data = await response.json();

// Hiển thị section "Sản phẩm thường được mua cùng"
data.rules.forEach(rule => {
  displayProduct(rule.consequent_product);
});
```

### 2. Dashboard Admin
```javascript
// Lấy top sản phẩm được recommend
const response = await fetch(
  'http://localhost:8080/api/fpgrowth/rules/top-products?limit=10'
);
const data = await response.json();

// Hiển thị bảng thống kê
data.products.forEach(item => {
  console.log(`${item.product.TenSP}: ${item.statistics.rule_count} rules`);
});
```

### 3. Phân Tích Combo
```javascript
// Lấy rules có confidence cao
const response = await fetch(
  'http://localhost:8080/api/fpgrowth/rules?minConfidence=0.8&minLift=1.5'
);
const data = await response.json();

// Tạo gợi ý combo sản phẩm
data.rules.forEach(rule => {
  const combo = [
    ...rule.antecedent_products,
    rule.consequent_product
  ];
  displayCombo(combo);
});
```

---

## 🧪 Testing

### Chạy test:
```bash
node test_fpgrowth_rules.js
```

### Test cases:
1. ✅ Lấy model metadata
2. ✅ Lấy rules với chi tiết sản phẩm
3. ✅ Lấy rules với filter (confidence, lift)
4. ✅ Tìm kiếm rules theo MaSP
5. ✅ Test các chế độ search khác nhau
6. ✅ Lấy top sản phẩm được recommend

---

## 📝 Notes

### Ưu điểm:
- ✅ Đầy đủ thông tin sản phẩm (giá, giảm giá, ảnh, biến thể)
- ✅ Diễn giải rule dễ hiểu cho người dùng
- ✅ Hỗ trợ filter và search linh hoạt
- ✅ Performance tốt với pagination
- ✅ Tái sử dụng code SanPhamService (getProductDetails)

### Lưu ý:
- Python API phải chạy và đã tạo model (gọi POST /refresh)
- Bảng FP_Rules phải có dữ liệu
- JSON parse tự động trong Sequelize getter/setter
- Models sử dụng `timestamps: false` và `freezeTableName: true`

---

## 🚀 Deployment Checklist

- [ ] Python API đang chạy và có model
- [ ] Database có 3 bảng: FP_ModelMetadata, FP_Rules, FP_FrequentItemsets
- [ ] Node.js server khởi động thành công
- [ ] Chạy test để verify: `node test_fpgrowth_rules.js`
- [ ] Frontend có thể gọi được các API
- [ ] Monitoring logs để debug nếu cần

---

**Version:** 1.0.0  
**Created:** November 8, 2025  
**Author:** GitHub Copilot
