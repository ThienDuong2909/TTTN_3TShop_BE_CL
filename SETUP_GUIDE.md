# Setup Guide - FP-Growth Rules API

## 📋 Checklist Setup

### Bước 1: Kiểm Tra Python API
```bash
# Đảm bảo Python API đang chạy
python fp_rec_api.py
```

**Kiểm tra:**
- [ ] Python API chạy thành công tại http://localhost:8000
- [ ] Database connection thành công
- [ ] Có dữ liệu đơn hàng trong database

---

### Bước 2: Tạo Model FP-Growth
```bash
# Gọi API để tạo model lần đầu
curl -X POST http://localhost:8000/refresh
```

**Kiểm tra:**
- [ ] Response trả về `ok: true`
- [ ] Có thông tin `transactions` và `rules`
- [ ] Bảng `FP_ModelMetadata` có dữ liệu
- [ ] Bảng `FP_Rules` có dữ liệu
- [ ] Bảng `FP_FrequentItemsets` có dữ liệu

**Verify trong MySQL:**
```sql
-- Kiểm tra model
SELECT * FROM FP_ModelMetadata ORDER BY created_at DESC LIMIT 1;

-- Kiểm tra số rules
SELECT COUNT(*) as total_rules FROM FP_Rules;

-- Xem vài rules mẫu
SELECT * FROM FP_Rules LIMIT 5;
```

---

### Bước 3: Khởi Động Node.js Server
```bash
# Cài dependencies nếu chưa có
npm install

# Khởi động server
npm start
# hoặc
node server.js
```

**Kiểm tra:**
- [ ] Server chạy thành công tại http://localhost:8080
- [ ] Kết nối database thành công
- [ ] Không có lỗi về models

---

### Bước 4: Test API Mới
```bash
# Chạy test script
node test_fpgrowth_rules.js
```

**Expected Output:**
```
🚀 BẮT ĐẦU TEST FP-GROWTH RULES API
================================================================================
TEST 1: GET /api/fpgrowth/model - Lấy thông tin model
================================================================================
✅ Lấy model metadata thành công
Model Info:
  - ID: 1
  - Transactions: 150
  - MIN_SUP: 0.4
  - MIN_CONF: 0.8
  - Total Rules: 45
  ...
```

**Kiểm tra:**
- [ ] TEST 1: Lấy model metadata thành công
- [ ] TEST 2: Lấy rules với chi tiết sản phẩm thành công
- [ ] TEST 3: Filter rules thành công
- [ ] TEST 4: Tìm kiếm theo sản phẩm thành công
- [ ] TEST 5: Top products thành công
- [ ] TEST 6: Search modes thành công

---

### Bước 5: Test Bằng Browser/Postman

#### Test 1: Get Model
```
GET http://localhost:8080/api/fpgrowth/model
```

#### Test 2: Get Rules
```
GET http://localhost:8080/api/fpgrowth/rules?limit=10
```

#### Test 3: Search by Product
```
GET http://localhost:8080/api/fpgrowth/rules/search?maSP=5
```

#### Test 4: Top Products
```
GET http://localhost:8080/api/fpgrowth/rules/top-products?limit=10
```

**Kiểm tra mỗi endpoint:**
- [ ] Status code 200
- [ ] Response có `success: true`
- [ ] Data có đầy đủ thông tin sản phẩm
- [ ] Không có lỗi trong console

---

## 🐛 Troubleshooting

### Lỗi: "Không tìm thấy model nào trong database"
**Nguyên nhân:** Chưa tạo model hoặc bảng chưa có dữ liệu

**Giải pháp:**
```bash
# 1. Kiểm tra Python API đang chạy
curl http://localhost:8000/health

# 2. Tạo model
curl -X POST http://localhost:8000/refresh

# 3. Verify trong DB
mysql -u your_user -p
USE your_database;
SELECT COUNT(*) FROM FP_Rules;
```

---

### Lỗi: "Cannot find module FP_ModelMetadata"
**Nguyên nhân:** Models chưa được import đúng

**Giải pháp:**
```bash
# 1. Restart Node.js server
# 2. Kiểm tra file src/models/index.js có export đúng không
# 3. Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

---

### Lỗi: Không có dữ liệu sản phẩm trong rules
**Nguyên nhân:** MaSP trong rules không tồn tại trong bảng SanPham

**Giải pháp:**
```sql
-- Kiểm tra MaSP nào không tồn tại
SELECT DISTINCT consequent 
FROM FP_Rules 
WHERE consequent NOT IN (SELECT MaSP FROM SanPham);

-- Xóa các rules có sản phẩm không tồn tại (nếu cần)
DELETE FROM FP_Rules 
WHERE consequent NOT IN (SELECT MaSP FROM SanPham);
```

---

### Lỗi: JSON parsing error
**Nguyên nhân:** Dữ liệu JSON trong DB không hợp lệ

**Giải pháp:**
```sql
-- Kiểm tra format JSON trong bảng
SELECT id, antecedent, itemset 
FROM FP_Rules 
LIMIT 5;

-- Nếu không phải JSON array [1,2,3], cần rebuild model
curl -X POST http://localhost:8000/refresh
```

---

## 📊 Verify Data Flow

### 1. Kiểm tra Python tạo rules đúng:
```bash
curl http://localhost:8000/health
# Expected: ok: true, rules: > 0
```

### 2. Kiểm tra DB có dữ liệu:
```sql
SELECT 
  m.id,
  m.N,
  m.total_rules,
  COUNT(r.id) as actual_rules
FROM FP_ModelMetadata m
LEFT JOIN FP_Rules r ON m.id = r.model_id
GROUP BY m.id
ORDER BY m.created_at DESC
LIMIT 1;
```

### 3. Kiểm tra Node.js đọc được:
```bash
curl http://localhost:8080/api/fpgrowth/model
# Expected: success: true, data: {...}
```

### 4. Kiểm tra có chi tiết sản phẩm:
```bash
curl http://localhost:8080/api/fpgrowth/rules?limit=1
# Expected: antecedent_products và consequent_product có data
```

---

## 🔍 Debug Tips

### Enable logging:
```javascript
// Trong FpGrowthRulesService.js, thêm console.log
async getProductDetails(maSPList) {
  console.log('🔍 Getting details for MaSP:', maSPList);
  // ...
}
```

### Check query results:
```javascript
// Trong service, log SQL queries
const products = await SanPham.findAll({
  where: { MaSP: { [Op.in]: maSPList } },
  // ...
});
console.log('📦 Found products:', products.length);
```

### Monitor database:
```sql
-- Xem queries đang chạy
SHOW FULL PROCESSLIST;

-- Kiểm tra indexes
SHOW INDEX FROM FP_Rules;

-- Analyze performance
EXPLAIN SELECT * FROM FP_Rules WHERE model_id = 1;
```

---

## ✅ Final Checklist

Trước khi deploy lên production:

- [ ] Python API chạy ổn định
- [ ] Database có indexes đúng
- [ ] Node.js server không có memory leak
- [ ] Tất cả tests pass
- [ ] API response time < 500ms
- [ ] Error handling đầy đủ
- [ ] Logging được setup
- [ ] Documentation đầy đủ
- [ ] Frontend có thể gọi được API
- [ ] Backup database trước khi deploy

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs của Python API
2. Kiểm tra logs của Node.js server
3. Kiểm tra data trong database
4. Chạy test script để identify issue
5. Tham khảo FP_GROWTH_RULES_API.md

---

**Last Updated:** November 8, 2025
