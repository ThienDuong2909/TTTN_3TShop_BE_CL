const TiGia = require("../models/TiGia");
const { Op } = require("sequelize");

const TiGiaService = {
  create: async (giaTri, ngayApDung) => {
    return await TiGia.create({ GiaTri: giaTri, NgayApDung: ngayApDung });
  },

  update: async (maTiGia, giaTri, ngayApDung) => {
    const [affected] = await TiGia.update(
      { GiaTri: giaTri, NgayApDung: ngayApDung },
      { where: { MaTiGia: maTiGia } }
    );
    return affected;
  },

  delete: async (maTiGia) => {
    return await TiGia.destroy({ where: { MaTiGia: maTiGia } });
  },

  getAll: async () => {
    return await TiGia.findAll({ order: [["NgayApDung", "DESC"]] });
  },

  getHieuLuc: async () => {
    const now = new Date();
    return await TiGia.findOne({
      where: {
        NgayApDung: { [Op.lte]: now },
      },
      order: [["NgayApDung", "DESC"]],
    });
  },
};

module.exports = TiGiaService;
