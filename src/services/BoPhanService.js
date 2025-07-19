const BoPhan = require('../models/BoPhan');

const BoPhanService = {
  async getAll() {
    return await BoPhan.findAll();
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
