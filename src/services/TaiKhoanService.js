// src/services/TaiKhoanService.js
const TaiKhoan = require('../models/TaiKhoan');

async function createTaiKhoan({ Email, Password, MaVaiTro }) {
  if (!Email || !Password || !MaVaiTro) {
    throw new Error('Missing required fields');
  }
  return await TaiKhoan.create({ Email, Password, MaVaiTro });
}

module.exports = { createTaiKhoan };