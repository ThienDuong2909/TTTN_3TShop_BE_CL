# PROMPT YÊU CẦU TRIỂN KHAI BACKEND PAYOS

**Mục tiêu:** Tích hợp cổng thanh toán PayOS vào hệ thống Backend (NodeJS) để hỗ trợ tính năng thanh toán QR Code trên Frontend.

**Bối cảnh:**
Phía Frontend (ReactJS) đã tích hợp thư viện `payos-checkout`. Quy trình hoạt động như sau:
1.  Người dùng bấm "Thanh toán".
2.  Frontend gọi API tạo đơn hàng (`createOrder`) -> có `orderId`.
3.  Frontend gọi tiếp API lấy link thanh toán PayOS (`createPayOSLink`).
4.  Backend cần xử lý tạo link thanh toán và trả về `checkoutUrl`.
5.  Frontend dùng `checkoutUrl` để hiển thị popup thanh toán của PayOS.

---

### **Yêu Cầu Chi Tiết Cho Backend**

#### **1. Cài đặt và Cấu hình**
*   **Thư viện:** Cài đặt SDK chính thức của PayOS cho Node.js:
    ```bash
    npm install @payos/node
    ```
*   **Biến môi trường (.env):** Cần cấu hình các key sau (Lấy từ dashboard PayOS):
    ```env
    PAYOS_CLIENT_ID=<Client ID của bạn>
    PAYOS_API_KEY=<API Key của bạn>
    PAYOS_CHECKSUM_KEY=<Checksum Key của bạn>
    ```

#### **2. Khởi tạo PayOS Client**
Tạo file cấu hình PayOS (ví dụ `config/payos.js`) để khởi tạo instance dùng chung:
```javascript
const PayOS = require("@payos/node");

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

module.exports = payOS;
```

#### **3. API Endpoint: Tạo Link Thanh Toán**
Cần xây dựng API endpoint để Frontend gọi tới lấy thông tin thanh toán.

*   **Endpoint:** `POST /api/payment/payos/create-payment-link/:maKH`
*   **Logic xử lý:**
    1.  Lấy `maKH` (mã khách hàng) từ params.
    2.  Query Database để tìm đơn hàng của khách hàng với điều kiện `MaTTDH = 6` (trạng thái chờ xử lý/giỏ hàng).
    3.  Lấy thông tin đơn hàng (Tổng tiền, Chi tiết sản phẩm...).
    4.  Tạo payload gửi sang PayOS. **Lưu ý:** `orderCode` của PayOS yêu cầu là số nguyên (Number) và không quá lớn (Safe Integer). Generate một mã số duy nhất dựa trên timestamp.
    5.  Gọi hàm `payOS.paymentRequests.create(body)`.
    6.  Trả về `checkoutUrl` cho Frontend.

*   **Ví dụ Code Implementation (Controller):**
    ```javascript
    const payOS = require("../config/payos"); // Đường dẫn tới file config

    exports.createPaymentLink = async (req, res) => {
      try {
        const { maKH } = req.params;
        
        // TODO: Lấy thông tin đơn hàng từ DB của bạn
        // const order = await OrderModel.findById(orderId);
        // if (!order) return res.status(404).json({ message: "Order not found" });

        // Dữ liệu mẫu (Cần thay bằng dữ liệu thật từ DB)
        const domain = process.env.CLIENT_URL || "http://localhost:5173"; // URL Frontend
        const body = {
          orderCode: Number(String(Date.now()).slice(-6)), // Tạo mã đơn hàng (số) duy nhất
          amount: 2000, // order.totalAmount (BẮT BUỘC LÀ SỐ NGUYÊN)
          description: `Thanh toan don hang ${orderId}`,
          items: [
            // Map từ order.items của bạn
            {
              name: "Mì tôm Hảo Hảo ly",
              quantity: 1,
              price: 2000,
            },
          ],
          returnUrl: `${domain}/checkout-success`, // Trang Frontend chuyển hướng khi thành công (nếu không dùng popup)
          cancelUrl: `${domain}/checkout-fail`,   // Trang Frontend chuyển hướng khi hủy
        };

        const paymentLinkResponse = await payOS.paymentRequests.create(body);

        // Trả về đúng cấu trúc này để Frontend đọc được
        return res.json({
          success: true,
          data: {
            checkoutUrl: paymentLinkResponse.checkoutUrl,
            // Có thể trả thêm qrCode string nếu cần custom
          },
        });

      } catch (error) {
        console.error("PayOS Create Link Error:", error);
        return res.status(500).json({ success: false, message: error.message });
      }
    };
    ```

#### **4. API Endpoint: Webhook (Quan Trọng)**
Cần API này để PayOS báo ngược lại cho Backend biết khi khách hàng đã chuyển khoản thành công, nhằm cập nhật trạng thái đơn hàng trong Database tự động.

*   **Endpoint:** `POST /api/payment/payos/webhook` (Cần setup URL này trong Dashboard của PayOS).
*   **Logic xử lý:**
    ```javascript
    exports.handleWebhook = async (req, res) => {
        try {
            // 1. Xác thực webhook request thực sự đến từ PayOS
            const webhookData = payOS.webhooks.verify(req.body);

            // 2. Kiểm tra trạng thái thanh toán
            if (webhookData.code === "00") {
                // Thanh toán thành công
                const orderCode = webhookData.orderCode; 
                // TODO: Tìm đơn hàng trong DB dựa trên orderCode và cập nhật trạng thái
                // VD: await Order.update({ status: 'PAID' }, { where: { payosOrderCode: orderCode } });
            }

            // 3. Phản hồi cho PayOS
            return res.json({ success: true, message: "Webhook received" });
        } catch (error) {
            console.error("Webhook Error:", error);
            return res.status(400).json({ success: false, message: "Invalid webhook" });
        }
    };
    ```

#### **5. Lưu ý quan trọng cho Backend Developer**
1.  **Cấu trúc Order:** Cần lưu lại `orderCode` (mã sinh ra cho PayOS) vào Database tương ứng với đơn hàng (`orderId`) để khi nhận Webhook có thể đối soát cập nhật trạng thái đúng đơn hàng.
2.  **Cấu trúc Response:** API tạo link thanh toán bắt buộc phải trả về object có dạng:
    ```json
    {
       "success": true,
       "data": {
           "checkoutUrl": "https://pay.payos.vn/web/..."
       }
    }
    ```
    Frontend đang đọc `response.data.checkoutUrl`.
3.  **CORS:** Đảm bảo cấu hình CORS để Frontend (localhost hoặc domain prod) có thể gọi API này.
