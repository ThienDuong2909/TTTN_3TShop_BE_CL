const { sequelize, VaiTro } = require('./models');

async function seedRoles() {
  await sequelize.sync();
  const roles = [
    { MaVaiTro: 1, TenVaiTro: 'Admin' },
    { MaVaiTro: 2, TenVaiTro: 'NhanVien' },
    { MaVaiTro: 3, TenVaiTro: 'KhachHang' }
  ];
  for (const role of roles) {
    await VaiTro.findOrCreate({ where: { MaVaiTro: role.MaVaiTro }, defaults: role });
  }
  console.log('Seeded roles successfully!');
  process.exit(0);
}

seedRoles().catch(err => {
  console.error('Seed roles error:', err);
  process.exit(1);
}); 