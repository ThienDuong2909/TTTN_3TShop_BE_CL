const { PhanQuyen, VaiTro, PhanQuyen_VaiTro, TaiKhoan } = require('../models');
const { Op } = require('sequelize');

class PhanQuyenService {
  /**
   * Kiểm tra quyền của user
   * @param {number} userId - ID của user
   * @param {string|Array} permissions - Quyền cần kiểm tra
   * @returns {Promise<boolean>}
   */
  static async checkPermission(userId, permissions) {
    try {
      // Lấy thông tin tài khoản và vai trò
      const taiKhoan = await TaiKhoan.findByPk(userId, {
        include: [{
          model: VaiTro,
          include: [{
            model: PhanQuyen,
            through: { attributes: [] }
          }]
        }]
      });

      if (!taiKhoan || !taiKhoan.VaiTro) {
        return false;
      }

      // Chuyển permissions thành array nếu là string
      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

      // Kiểm tra xem user có quyền toàn quyền không
      const hasFullPermission = taiKhoan.VaiTro.PhanQuyens.some(
        quyen => quyen.Ten === 'toanquyen'
      );

      if (hasFullPermission) {
        return true;
      }

      // Kiểm tra từng quyền cụ thể
      const userPermissions = taiKhoan.VaiTro.PhanQuyens.map(quyen => quyen.Ten);
      
      return permissionArray.every(permission => 
        userPermissions.includes(permission)
      );
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Lấy tất cả quyền của user
   * @param {number} userId - ID của user
   * @returns {Promise<Array>}
   */
  static async getUserPermissions(userId) {
    try {
      const taiKhoan = await TaiKhoan.findByPk(userId, {
        include: [{
          model: VaiTro,
          include: [{
            model: PhanQuyen,
            through: { attributes: [] }
          }]
        }]
      });

      if (!taiKhoan || !taiKhoan.VaiTro) {
        return [];
      }

      return taiKhoan.VaiTro.PhanQuyens.map(quyen => quyen.Ten);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Lấy tất cả quyền
   * @returns {Promise<Array>}
   */
  static async getAllPermissions() {
    try {
      return await PhanQuyen.findAll({
        order: [['Ten', 'ASC']]
      });
    } catch (error) {
      console.error('Error getting all permissions:', error);
      throw error;
    }
  }

  /**
   * Lấy quyền theo vai trò
   * @param {number} vaiTroId - ID của vai trò
   * @returns {Promise<Array>}
   */
  static async getPermissionsByRole(vaiTroId) {
    try {
      const vaiTro = await VaiTro.findByPk(vaiTroId, {
        include: [{
          model: PhanQuyen,
          through: { attributes: [] }
        }]
      });

      if (!vaiTro) {
        return [];
      }

      return vaiTro.PhanQuyens;
    } catch (error) {
      console.error('Error getting permissions by role:', error);
      throw error;
    }
  }

  /**
   * Cập nhật quyền cho vai trò
   * @param {number} vaiTroId - ID của vai trò
   * @param {Array} permissionIds - Array các ID quyền
   * @returns {Promise<boolean>}
   */
  static async updateRolePermissions(vaiTroId, permissionIds) {
    try {
      // Xóa tất cả quyền hiện tại của vai trò
      await PhanQuyen_VaiTro.destroy({
        where: { VaiTroId: vaiTroId }
      });

      // Thêm quyền mới
      if (permissionIds && permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          VaiTroId: vaiTroId,
          PhanQuyenId: permissionId
        }));

        await PhanQuyen_VaiTro.bulkCreate(rolePermissions);
      }

      return true;
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra quyền với context (cho các trường hợp đặc biệt)
   * @param {number} userId - ID của user
   * @param {string} permission - Quyền cần kiểm tra
   * @param {Object} context - Context bổ sung
   * @returns {Promise<boolean>}
   */
  static async checkPermissionWithContext(userId, permission, context = {}) {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      
      // Kiểm tra quyền toàn quyền
      if (userPermissions.includes('toanquyen')) {
        return true;
      }

      // Kiểm tra quyền cụ thể
      if (!userPermissions.includes(permission)) {
        return false;
      }

      // Xử lý các trường hợp đặc biệt cần context
      switch (permission) {
        case 'donhang.xem_cua_minh':
          return context.userId === userId;
        
        case 'donhang.xem_duoc_giao':
          // Nếu có context.assignedTo, kiểm tra xem user có phải là người được phân công không
          // Nếu không có context, chỉ cần có quyền là được (đã kiểm tra ở trên)
          return context.assignedTo ? context.assignedTo === userId : true;
        
        case 'binhluan.sua_cua_minh':
        case 'binhluan.xoa_cua_minh':
          return context.authorId === userId;
        
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking permission with context:', error);
      return false;
    }
  }
}

module.exports = PhanQuyenService; 