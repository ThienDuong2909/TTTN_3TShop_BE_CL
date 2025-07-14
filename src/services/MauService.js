const Mau = require('../models/Mau');

const MauService = {
  getAll: async () => {
    return Mau.findAll();
  },
  getById: async (id) => {
    return Mau.findByPk(id);
  },
  create: async (data) => {
    return Mau.create(data);
  },
  update: async (id, data) => {
    const mau = await Mau.findByPk(id);
    if (!mau) return null;
    await mau.update(data);
    return mau;
  },
  delete: async (id) => {
    const mau = await Mau.findByPk(id);
    if (!mau) return null;
    await mau.destroy();
    return mau;
  },
};

module.exports = MauService;
