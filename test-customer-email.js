require('dotenv').config();
const EmailService = require('./src/services/EmailService');

// Dữ liệu mẫu đơn hàng để test
const mockOrder = {
    MaDDH: 123,
    NguoiNhan: 'Nguyễn Văn A',
    SDT: '0123456789',
    DiaChiGiao: 'Số 123, Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    ThoiGianGiao: new Date('2024-12-15'),
    CT_DonDatHangs: [
        {
            SoLuong: 2,
            DonGia: 350000,
            ChiTietSanPham: {
                SanPham: {
                    TenSP: 'Áo Thun Nam Basic Trơn'
                },
                KichThuoc: {
                    TenKichThuoc: 'L'
                },
                Mau: {
                    TenMau: 'Trắng'
                }
            }
        },
        {
            SoLuong: 1,
            DonGia: 450000,
            ChiTietSanPham: {
                SanPham: {
                    TenSP: 'Quần Jean Nam Slim Fit'
                },
                KichThuoc: {
                    TenKichThuoc: 'M'
                },
                Mau: {
                    TenMau: 'Xanh đen'
                }
            }
        },
        {
            SoLuong: 1,
            DonGia: 550000,
            ChiTietSanPham: {
                SanPham: {
                    TenSP: 'Áo Khoác Hoodie Unisex'
                },
                KichThuoc: {
                    TenKichThuoc: 'XL'
                },
                Mau: {
                    TenMau: 'Đen'
                }
            }
        }
    ]
};

async function testCustomerEmail() {
    try {
        console.log('🚀 Bắt đầu test gửi email xác nhận đơn hàng cho khách hàng...\n');

        // Kiểm tra biến môi trường
        console.log('📋 Kiểm tra cấu hình email khách hàng:');
        console.log('CUSTOMER_MAIL_HOST:', process.env.CUSTOMER_MAIL_HOST || '❌ Chưa cấu hình');
        console.log('CUSTOMER_MAIL_PORT:', process.env.CUSTOMER_MAIL_PORT || '❌ Chưa cấu hình');
        console.log('CUSTOMER_MAIL_USER:', process.env.CUSTOMER_MAIL_USER || '❌ Chưa cấu hình');
        console.log('CUSTOMER_MAIL_PASS:', process.env.CUSTOMER_MAIL_PASS ? '✅ Đã cấu hình' : '❌ Chưa cấu hình');
        console.log('');

        // Kiểm tra xem tất cả config đã có chưa
        if (!process.env.CUSTOMER_MAIL_HOST || !process.env.CUSTOMER_MAIL_USER || !process.env.CUSTOMER_MAIL_PASS) {
            console.error('❌ Lỗi: Chưa cấu hình đầy đủ email trong file .env');
            console.log('\n💡 Hướng dẫn:');
            console.log('1. Tạo hoặc cập nhật file .env trong thư mục gốc');
            console.log('2. Thêm các biến sau:');
            console.log('   CUSTOMER_MAIL_HOST=mail.thienduong.info');
            console.log('   CUSTOMER_MAIL_PORT=465');
            console.log('   CUSTOMER_MAIL_USER=3tshop@thienduong.info');
            console.log('   CUSTOMER_MAIL_PASS=your-password-here');
            console.log('\n3. Xem file ENV_TEMPLATE.md để biết thêm chi tiết');
            return;
        }

        // Nhập email để test
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('📧 Nhập email để nhận test (Enter để dùng email mặc định): ', async (testEmail) => {
            const emailToSend = testEmail.trim() || process.env.CUSTOMER_MAIL_USER || 'test@example.com';

            console.log(`\n📨 Đang gửi email đến: ${emailToSend}...\n`);

            try {
                const result = await EmailService.sendOrderConfirmationEmail(
                    mockOrder,
                    emailToSend,
                    'Nguyễn Văn A'
                );

                if (result) {
                    console.log('✅ Gửi email thành công!');
                    console.log('📧 Message ID:', result.messageId);
                    console.log('\n💡 Vui lòng kiểm tra hộp thư của:', emailToSend);
                    console.log('   - Inbox (Hộp thư đến)');
                    console.log('   - Spam/Junk (Thư rác) nếu không thấy trong Inbox');
                } else {
                    console.log('⚠️  Email được xử lý nhưng có thể không gửi được');
                }
            } catch (error) {
                console.error('❌ Lỗi khi gửi email:', error.message);

                console.log('\n💡 Hướng dẫn khắc phục:');
                if (error.message.includes('Invalid login') || error.message.includes('authentication')) {
                    console.log('   - Kiểm tra lại username/password trong .env');
                    console.log('   - Đảm bảo password chính xác (không có khoảng trắng thừa)');
                } else if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
                    console.log('   - Kiểm tra kết nối internet');
                    console.log('   - Kiểm tra firewall/antivirus có chặn kết nối không');
                    console.log('   - Kiểm tra host và port có đúng không');
                } else {
                    console.log('   - Xem chi tiết lỗi ở trên');
                    console.log('   - Tham khảo file CUSTOMER_EMAIL_SETUP.md');
                }
            }

            rl.close();
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

// Chạy test
testCustomerEmail();
