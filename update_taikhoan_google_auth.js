const { sequelize } = require('./src/models');

async function updateTaiKhoanForGoogleAuth() {
    try {
        console.log('🔄 Bắt đầu cập nhật bảng TaiKhoan cho Google Auth...');

        // 1. Modify Password to allow NULL
        console.log('1. Cập nhật cột Password cho phép NULL...');
        // Assuming MySQL
        await sequelize.query(`
      ALTER TABLE TaiKhoan 
      MODIFY COLUMN Password VARCHAR(255) NULL;
    `);
        console.log('✅ Đã cập nhật cột Password thành công!');

        // 2. Add AuthType column
        console.log('2. Thêm cột AuthType...');
        try {
            await sequelize.query(`
          ALTER TABLE TaiKhoan 
          ADD COLUMN AuthType VARCHAR(20) DEFAULT 'local' COMMENT 'local hoặc google';
        `);
            console.log('✅ Đã thêm cột AuthType thành công!');
        } catch (err) {
            if (err.original && err.original.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  Cột AuthType đã tồn tại.');
            } else if (err.message.includes('Duplicate column name')) {
                console.log('ℹ️  Cột AuthType đã tồn tại.');
            } else {
                throw err;
            }
        }

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật bảng TaiKhoan:', error.message);
        throw error;
    } finally {
        await sequelize.close();
    }
}

updateTaiKhoanForGoogleAuth()
    .then(() => {
        console.log('🎉 Migration hoàn thành!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration thất bại:', error);
        process.exit(1);
    });
