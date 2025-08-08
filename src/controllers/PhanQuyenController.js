const PhanQuyenService = require('../services/PhanQuyenService');
const { response } = require('../utils/response');

class PhanQuyenController {
  /**
   * Lấy tất cả quyền
   */
  static async getAllPermissions(req, res) {
    try {
      const permissions = await PhanQuyenService.getAllPermissions();
      return res.json(response(true, 'Lấy danh sách quyền thành công', permissions));
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return res.status(500).json(response(false, 'Lỗi server khi lấy danh sách quyền'));
    }
  }

  /**
   * Lấy quyền theo vai trò
   */
  static async getPermissionsByRole(req, res) {
    try {
      const { vaiTroId } = req.params;
      const permissions = await PhanQuyenService.getPermissionsByRole(vaiTroId);
      return res.json(response(true, 'Lấy quyền theo vai trò thành công', permissions));
    } catch (error) {
      console.error('Error getting permissions by role:', error);
      return res.status(500).json(response(false, 'Lỗi server khi lấy quyền theo vai trò'));
    }
  }

  /**
   * Cập nhật quyền cho vai trò
   */
  static async updateRolePermissions(req, res) {
    try {
      const { vaiTroId } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return res.status(400).json(response(false, 'permissionIds phải là một mảng'));
      }

      await PhanQuyenService.updateRolePermissions(vaiTroId, permissionIds);
      return res.json(response(true, 'Cập nhật quyền cho vai trò thành công'));
    } catch (error) {
      console.error('Error updating role permissions:', error);
      return res.status(500).json(response(false, 'Lỗi server khi cập nhật quyền cho vai trò'));
    }
  }

  /**
   * Lấy quyền của user hiện tại
   */
  static async getCurrentUserPermissions(req, res) {
    try {
      const userId = req.user.MaTK;
      const permissions = await PhanQuyenService.getUserPermissions(userId);
      return res.json(response(true, 'Lấy quyền của user thành công', permissions));
    } catch (error) {
      console.error('Error getting current user permissions:', error);
      return res.status(500).json(response(false, 'Lỗi server khi lấy quyền của user'));
    }
  }

  /**
   * Kiểm tra quyền của user
   */
  static async checkUserPermission(req, res) {
    try {
      const userId = req.user.MaTK;
      const { permissions } = req.body;

      if (!permissions) {
        return res.status(400).json(response(false, 'permissions là bắt buộc'));
      }

      const hasPermission = await PhanQuyenService.checkPermission(userId, permissions);
      return res.json(response(true, 'Kiểm tra quyền thành công', { hasPermission }));
    } catch (error) {
      console.error('Error checking user permission:', error);
      return res.status(500).json(response(false, 'Lỗi server khi kiểm tra quyền'));
    }
  }
}

module.exports = PhanQuyenController; 