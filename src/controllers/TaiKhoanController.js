// src/controllers/TaiKhoanController.js
const { createTaiKhoan } = require('../services/TaiKhoanService');
const response = require("../utils/response");

async function taoTaiKhoan(req, res) {
  try {
    const taiKhoan = await createTaiKhoan(req.body);
    res.status(201).json(taiKhoan);
    return response.success(res, data, 'Tạo tài khoản thành công');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = taoTaiKhoan;