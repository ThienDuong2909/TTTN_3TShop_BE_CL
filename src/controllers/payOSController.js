const payOS = require("../configs/payos");
const { DonDatHang, CT_DonDatHang, ChiTietSanPham, SanPham, TrangThaiDH } = require("../models");

exports.createPaymentLink = async (req, res) => {
    try {
        const { maKH } = req.params;

        // 1. Tìm đơn hàng của khách hàng với trạng thái MaTTDH = 6 (chờ xử lý/giỏ hàng)
        const order = await DonDatHang.findOne({
            where: {
                MaKH: Number(maKH),
                MaTTDH: 6
            },
            include: [
                {
                    model: CT_DonDatHang,
                    include: [
                        {
                            model: ChiTietSanPham,
                            include: [
                                {
                                    model: SanPham,
                                    attributes: ["TenSP"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng chờ thanh toán" });
        }

        // 2. Calculate Total Amount
        let totalAmount = 0;
        const items = order.CT_DonDatHangs.map((item) => {
            // ⚠️ FIX: Đảm bảo price là số nguyên
            const price = Math.round(parseFloat(item.DonGia));
            const quantity = item.SoLuong;
            totalAmount += price * quantity;

            let name = item.ChiTietSanPham?.SanPham?.TenSP || "Sản phẩm";
            if (name.length > 50) name = name.substring(0, 50) + "...";

            return {
                name: name,
                quantity: quantity,
                price: price, // Bây giờ đã là số nguyên
            };
        });

        // PayOS requires amount to be integer
        totalAmount = Math.round(totalAmount);

        // 3. Generate Order Code for PayOS
        const orderCode = Number(String(Date.now()).slice(-9));

        // 4. Update Order with PayOS Order Code
        await order.update({ payosOrderCode: String(orderCode) });

        // 5. Create Payment Request Body
        const domain = process.env.CLIENT_URL || "http://localhost:5173";
        const body = {
            orderCode: orderCode,
            amount: totalAmount,
            description: `Thanh toan don hang #${order.MaDDH}`,
            items: items,
            returnUrl: `${domain}/checkout-success`,
            cancelUrl: `${domain}/checkout-fail`,
        };

        console.log("PayOS Request Body:", JSON.stringify(body, null, 2));

        // 6. Call PayOS API
        const paymentLinkResponse = await payOS.paymentRequests.create(body);
        console.log("PayOS Response:", paymentLinkResponse);

        // 7. Return Result
        return res.json({
            success: true,
            data: {
                checkoutUrl: paymentLinkResponse.checkoutUrl,
                qrCode: paymentLinkResponse.qrCode,
            },
        });

    } catch (error) {
        console.error("PayOS Create Link Error:", error);
        if (error.response) {
            console.error("PayOS Error Response:", error.response.data);
        }
        return res.status(500).json({
            success: false,
            message: error.message,
            details: error.response?.data || null
        });
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        const webhookData = payOS.webhooks.verify(req.body);

        if (webhookData.code === "00") {
            // Payment successful
            const orderCode = webhookData.orderCode;

            // Find order by PayOS Order Code
            // Note: We stored payosOrderCode as string in DB, but webhook sends number (or string). 
            // Sequelize query should handle type casting if needed, but best to be explicit.
            const order = await DonDatHang.findOne({
                where: { payosOrderCode: String(orderCode) }
            });

            if (order) {
                // Update Order Status
                // Assuming MaTTDH = 2 is "ĐANG CHUẨN BỊ" (Confirmed/Paid)
                // Adjust this ID based on your actual business logic
                await order.update({
                    MaTTDH: 2,
                    NgayCapNhat: new Date()
                });

                console.log(`Updated order ${order.MaDDH} status to PAID (MaTTDH: 2)`);
            } else {
                console.warn(`Order not found for PayOS code: ${orderCode}`);
            }
        }

        return res.json({ success: true, message: "Webhook received" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return res.status(400).json({ success: false, message: "Invalid webhook" });
    }
};
