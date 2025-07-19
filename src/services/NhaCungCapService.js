const { NhaCungCap } = require('../models');

const NhaCungCapService = {
  getAll: async () => {
    return await NhaCungCap.findAll();
  },
  
  getById: async (id) => {
    return await NhaCungCap.findByPk(id);
  },
  
  create: async (data) => {
    return await NhaCungCap.create(data);
  },
  
  update: async (id, data) => {
    const nhaCungCap = await NhaCungCap.findByPk(id);
    if (!nhaCungCap) return null;
    await nhaCungCap.update(data);
    return nhaCungCap;
  },
  
  delete: async (id) => {
    const nhaCungCap = await NhaCungCap.findByPk(id);
    if (!nhaCungCap) return null;
    await nhaCungCap.destroy();
    return nhaCungCap;
  },
};

module.exports = NhaCungCapService; 