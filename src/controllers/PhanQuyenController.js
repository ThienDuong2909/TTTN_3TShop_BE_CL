const PhanQuyenService = require('../services/PhanQuyenService');
const response = require('../utils/response');

class PhanQuyenController {
  /**
   * Lấy tất cả quyền
   */
  static async getAllPermissions(req, res) {
    try {
      const permissions = await PhanQuyenService.getAllPermissions();
      return response.success(res, permissions, 'Lấy danh sách quyền thành công');
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return response.error(res, error, 'Lỗi server khi lấy danh sách quyền', 500);
    }
  }

  /**
   * Lấy quyền theo vai trò
   */
  static async getPermissionsByRole(req, res) {
    try {
      const { vaiTroId } = req.params;
      const permissions = await PhanQuyenService.getPermissionsByRole(vaiTroId);
      return response.success(res, permissions, 'Lấy quyền theo vai trò thành công');
    } catch (error) {
      console.error('Error getting permissions by role:', error);
      return response.error(res, error, 'Lỗi server khi lấy quyền theo vai trò', 500);
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
        return response.validationError(
          res,
          { permissionIds: 'phải là một mảng' },
          'permissionIds phải là một mảng',
          400
        );
      }

      await PhanQuyenService.updateRolePermissions(vaiTroId, permissionIds);
      return response.success(res, null, 'Cập nhật quyền cho vai trò thành công');
    } catch (error) {
      console.error('Error updating role permissions:', error);
      return response.error(res, error, 'Lỗi server khi cập nhật quyền cho vai trò', 500);
    }
  }

  /**
   * Lấy quyền của user hiện tại
   */
  static async getCurrentUserPermissions(req, res) {
    try {
      const userId = req.user.MaTK;
      const permissions = await PhanQuyenService.getUserPermissions(userId);
      return response.success(res, permissions, 'Lấy quyền của user thành công');
    } catch (error) {
      console.error('Error getting current user permissions:', error);
      return response.error(res, error, 'Lỗi server khi lấy quyền của user', 500);
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
        return response.validationError(
          res,
          { permissions: 'là bắt buộc' },
          'permissions là bắt buộc',
          400
        );
      }

      const hasPermission = await PhanQuyenService.checkPermission(userId, permissions);
      return response.success(res, { hasPermission }, 'Kiểm tra quyền thành công');
    } catch (error) {
      console.error('Error checking user permission:', error);
      return response.error(res, error, 'Lỗi server khi kiểm tra quyền', 500);
    }
  }

  /**
   * Gán quyền cho nhân viên (thông qua vai trò của tài khoản nhân viên)
   */
  static async assignPermissionsToEmployee(req, res) {
    try {
      const { nhanVienId } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds)) {
        return response.validationError(
          res,
          { permissionIds: 'phải là một mảng' },
          'permissionIds phải là một mảng',
          400
        );
      }

      await PhanQuyenService.assignPermissionsToEmployee(nhanVienId, permissionIds);
      return response.success(res, null, 'Gán quyền cho nhân viên thành công');
    } catch (error) {
      console.error('Error assigning permissions to employee:', error);
      return response.error(res, error, error.message || 'Lỗi server khi gán quyền cho nhân viên', 500);
    }
  }

  /**
   * Lấy quyền của một nhân viên (theo vai trò hiện tại của tài khoản nhân viên)
   */
  static async getPermissionsByEmployee(req, res) {
    try {
      const { nhanVienId } = req.params;
      const permissions = await PhanQuyenService.getPermissionsByEmployee(nhanVienId);
      return response.success(res, permissions, 'Lấy quyền theo nhân viên thành công');
    } catch (error) {
      console.error('Error getting permissions by employee:', error);
      return response.error(res, error, error.message || 'Lỗi server khi lấy quyền theo nhân viên', 500);
    }
  }
}

module.exports = PhanQuyenController; 