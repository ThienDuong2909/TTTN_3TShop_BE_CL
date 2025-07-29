const { NhaCungCap } = require('../models');

const NhaCungCapService = {
  getAll: async (page = 1, pageSize = 8) => {
    const offset = (page - 1) * pageSize;
    const { count, rows } = await NhaCungCap.findAndCountAll({
      limit: pageSize,
      offset: offset,
    });
    return {
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
      data: rows,
    };
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