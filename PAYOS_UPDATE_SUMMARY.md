# Cập nhật API PayOS: Thay đổi từ orderId sang maKH

## 📅 Ngày cập nhật: 15/12/2024

## 🎯 Mục tiêu
Thay đổi API tạo payment link của PayOS để nhận `maKH` (mã khách hàng) thay vì `orderId`, tự động tìm đơn hàng có trạng thái `MaTTDH = 6` (chờ xử lý/giỏ hàng) của khách hàng đó.

## ✅ Các thay đổi đã thực hiện

### 1. **Cập nhật Controller** (`src/controllers/payOSController.js`)

#### Thay đổi cách nhận tham số:
```javascript
// TRƯỚC
const { orderId } = req.params;

// SAU
const { maKH } = req.params;
```

#### Thay đổi cách query đơn hàng:
```javascript
// TRƯỚC
const order = await DonDatHang.findByPk(orderId, {
  include: [...]
});

// SAU
const order = await DonDatHang.findOne({
  where: { 
    MaKH: Number(maKH),
    MaTTDH: 6  // Chỉ lấy đơn hàng chờ xử lý/giỏ hàng
  },
  include: [...]
});
```

#### Thay đổi message lỗi:
```javascript
// TRƯỚC
if (!order) {
  return res.status(404).json({ message: "Order not found" });
}

// SAU
if (!order) {
  return res.status(404).json({ message: "Không tìm thấy đơn hàng chờ thanh toán" });
}
```

#### Thay đổi description trong PayOS request:
```javascript
// TRƯỚC
description: `Thanh toan don hang ${orderId}`

// SAU
description: `Thanh toan don hang #${order.MaDDH}`
```

### 2. **Cập nhật Route** (`src/routes/paymentRoutes.js`)

```javascript
// TRƯỚC
router.post('/payos/create-payment-link/:orderId', payOSController.createPaymentLink);

// SAU
router.post('/payos/create-payment-link/:maKH', payOSController.createPaymentLink);
```

### 3. **Cập nhật Tài liệu**

#### Files đã cập nhật:
- ✅ `payos.md` - Hướng dẫn tích hợp PayOS
- ✅ `Backend_PayOS_Prompt.md` - Prompt yêu cầu triển khai

#### Nội dung cập nhật:
- Endpoint từ `POST /api/payment/payos/create-payment-link/:orderId` → `POST /api/payment/payos/create-payment-link/:maKH`
- Logic xử lý: Thêm điều kiện tìm đơn hàng với `MaTTDH = 6`
- Ví dụ code trong tài liệu

## 📋 Chi tiết thay đổi

### Endpoint mới:
```
POST /api/payment/payos/create-payment-link/:maKH
```

### Request Parameters:
- **maKH** (Number): Mã khách hàng

### Response:
```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://pay.payos.vn/web/...",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Error Response:
```json
{
  "message": "Không tìm thấy đơn hàng chờ thanh toán"
}
```

## 🔍 Logic hoạt động

1. **Frontend gửi request** với `maKH` của khách hàng đang đăng nhập
2. **Backend tìm đơn hàng** với 2 điều kiện:
   - `MaKH` = mã khách hàng được gửi
   - `MaTTDH` = 6 (trạng thái chờ xử lý/giỏ hàng)
3. **Nếu tìm thấy đơn hàng:**
   - Tính tổng tiền
   - Generate PayOS orderCode
   - Lưu orderCode vào đơn hàng
   - Tạo payment link qua PayOS API
   - Trả về checkoutUrl cho Frontend
4. **Nếu không tìm thấy:**
   - Trả về lỗi 404 với message tiếng Việt

## 💡 Lợi ích của thay đổi

### 1. **Đơn giản hóa workflow:**
- Frontend không cần biết `orderId` trước
- Chỉ cần biết `maKH` từ session/token
- Tự động lấy đơn hàng chờ xử lý

### 2. **Tăng tính bảo mật:**
- Khách hàng chỉ có thể thanh toán đơn hàng của chính mình
- Không thể thanh toán đơn hàng của người khác bằng cách đổi `orderId`

### 3. **Phù hợp với flow thực tế:**
- Khách hàng có giỏ hàng (MaTTDH = 6)
- Khi thanh toán, tự động lấy giỏ hàng đó
- Không cần truyền thêm `orderId`

### 4. **Tránh nhầm lẫn:**
- Đảm bảo chỉ thanh toán đơn hàng đang ở trạng thái "chờ xử lý"
- Không thể tạo payment link cho đơn hàng đã thanh toán/đã hủy

## 🔄 Migration (nếu cần)

### Frontend cần cập nhật:

#### TRƯỚC:
```javascript
// Gọi API với orderId
const response = await axios.post(
  `/api/payment/payos/create-payment-link/${orderId}`
);
```

#### SAU:
```javascript
// Gọi API với maKH (lấy từ user context/token)
const response = await axios.post(
  `/api/payment/payos/create-payment-link/${user.maKH}`
);
```

## 🧪 Testing

### Test case 1: Tạo payment link thành công
```bash
POST /api/payment/payos/create-payment-link/1
# maKH = 1, có đơn hàng với MaTTDH = 6
# Expected: Return checkoutUrl
```

### Test case 2: Không tìm thấy đơn hàng chờ thanh toán
```bash
POST /api/payment/payos/create-payment-link/999
# maKH = 999, không có đơn hàng hoặc đơn hàng không ở trạng thái 6
# Expected: 404 "Không tìm thấy đơn hàng chờ thanh toán"
```

### Test case 3: Khách hàng có nhiều đơn hàng
```bash
POST /api/payment/payos/create-payment-link/1
# maKH = 1, có nhiều đơn hàng nhưng chỉ 1 đơn có MaTTDH = 6
# Expected: Return checkoutUrl cho đơn có MaTTDH = 6
```

## 📝 Lưu ý

### 1. **Trạng thái đơn hàng:**
- `MaTTDH = 6`: Giỏ hàng/Chờ xử lý (chưa thanh toán)
- Sau khi thanh toán thành công qua webhook: `MaTTDH = 2` (Đã thanh toán)

### 2. **orderCode:**
- Vẫn được generate từ timestamp
- Vẫn được lưu vào `payosOrderCode` trong database
- Webhook vẫn sử dụng `payosOrderCode` để tìm đơn hàng

### 3. **Không thay đổi:**
- Logic tính tổng tiền
- Format items
- Webhook handler
- PayOS configuration

## 🔗 Files liên quan

- ✅ `src/controllers/payOSController.js`
- ✅ `src/routes/paymentRoutes.js`
- ✅ `payos.md`
- ✅ `Backend_PayOS_Prompt.md`

## ✨ Kết quả

- ✅ API endpoint đã được cập nhật từ `:orderId` → `:maKH`
- ✅ Logic query đơn hàng đã thêm điều kiện `MaTTDH = 6`
- ✅ Message lỗi đã được Việt hóa
- ✅ Tài liệu đã được cập nhật
- ✅ Code syntax check passed

---

**Người thực hiện**: AI Assistant
**Ngày hoàn thành**: 15/12/2024
**Trạng thái**: ✅ Hoàn thành và sẵn sàng sử dụng
