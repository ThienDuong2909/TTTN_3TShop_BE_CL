const BoPhan = require('../models/BoPhan');
const sequelize = require('../models/sequelize');

const BoPhanService = {
  async getAll() {
    return await BoPhan.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM NhanVien_BoPhan AS nvb
              WHERE nvb.MaBoPhan = BoPhan.MaBoPhan AND nvb.TrangThai = 'DANGLAMVIEC'
            )`),
            'SoLuongNhanVien'
          ]
        ]
      }
    });
  },
  async getById(id) {
    return await BoPhan.findByPk(id);
  },
  async create(data) {
    return await BoPhan.create(data);
  },
  async update(id, data) {
    const boPhan = await BoPhan.findByPk(id);
    if (!boPhan) return null;
    await boPhan.update(data);
    return boPhan;
  },
  async delete(id) {
    const boPhan = await BoPhan.findByPk(id);
    if (!boPhan) return null;
    await boPhan.destroy();
    return true;
  },
};

module.exports = BoPhanService;
