const { NhanVien } = require('../models');

/**
 * Lấy MaNV từ MaTK
 * @param {number} maTK - Mã tài khoản
 * @returns {Promise<number|null>} - Mã nhân viên hoặc null nếu không tìm thấy
 */
async function getMaNVFromMaTK(maTK) {
  try {
    const nhanVien = await NhanVien.findOne({
      where: { MaTK: maTK }
    });
    
    return nhanVien ? nhanVien.MaNV : null;
  } catch (error) {
    console.error('Error getting MaNV from MaTK:', error);
    return null;
  }
}

/**
 * Lấy thông tin nhân viên từ MaTK
 * @param {number} maTK - Mã tài khoản
 * @returns {Promise<Object|null>} - Thông tin nhân viên hoặc null nếu không tìm thấy
 */
async function getNhanVienFromMaTK(maTK) {
  try {
    const nhanVien = await NhanVien.findOne({
      where: { MaTK: maTK }
    });
    
    return nhanVien;
  } catch (error) {
    console.error('Error getting NhanVien from MaTK:', error);
    return null;
  }
}

module.exports = {
  getMaNVFromMaTK,
  getNhanVienFromMaTK
}; 