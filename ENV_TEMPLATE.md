# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=3tshop
DB_PORT=3306

# ==========================================
# JWT SECRET
# ==========================================
JWT_SECRET=your-jwt-secret-key-here

# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# EMAIL CONFIGURATION - KHÁCH HÀNG (cPanel Hosting)
# Dùng để gửi email xác nhận đơn hàng cho khách hàng
# ==========================================
CUSTOMER_MAIL_HOST=mail.thienduong.info
CUSTOMER_MAIL_PORT=465
CUSTOMER_MAIL_USER=3tshop@thienduong.info
CUSTOMER_MAIL_PASS=your-cpanel-email-password-here

# ==========================================
# EMAIL CONFIGURATION - NHÀ CUNG CẤP (Gmail)
# Dùng để gửi phiếu đặt hàng cho nhà cung cấp
# ==========================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-gmail-app-password-here
DEFAULT_SUPPLIER_EMAIL=supplier@example.com

# ==========================================
# PAYOS CONFIGURATION
# ==========================================
PAYOS_CLIENT_ID=your-payos-client-id
PAYOS_API_KEY=your-payos-api-key
PAYOS_CHECKSUM_KEY=your-payos-checksum-key

# ==========================================
# FIREBASE CONFIGURATION (Optional)
# ==========================================
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_PRIVATE_KEY=your-firebase-private-key
# FIREBASE_CLIENT_EMAIL=your-firebase-client-email
