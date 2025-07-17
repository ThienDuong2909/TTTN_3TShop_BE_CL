const { KichThuoc } = require('../models');

const KichThuocService = {
  getAll: async () => {
    return await KichThuoc.findAll();
  },
  
  getById: async (id) => {
    return await KichThuoc.findByPk(id);
  },
  
  create: async (data) => {
    return await KichThuoc.create(data);
  },
  
  update: async (id, data) => {
    const kichThuoc = await KichThuoc.findByPk(id);
    if (!kichThuoc) return null;
    await kichThuoc.update(data);
    return kichThuoc;
  },
  
  delete: async (id) => {
    const kichThuoc = await KichThuoc.findByPk(id);
    if (!kichThuoc) return null;
    await kichThuoc.destroy();
    return kichThuoc;
  },
};

module.exports = KichThuocService; 