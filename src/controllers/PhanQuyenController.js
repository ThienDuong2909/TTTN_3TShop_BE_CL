const PhanQuyenService = require('../services/PhanQuyenService');
const response = require('../utils/response');

class PhanQuyenController {
  /**
   * Lấy tất cả quyền
   */
  static async getAllPermissions(req, res) {
    try {
      const permissions = await PhanQuyenService.getAllPermissions();
      console.log('Permissions in controller:', permissions);
      return response.success(res, permissions, 'Lấy danh sách quyền thành công');
    } catch (error) {
      console.error('Error getting all permissions:', error);
      return response.error(res, error, 'Lỗi server khi lấy danh sách quyền', 500);
    }
  }

  /**
   * Lấy tất cả vai trò
   */
  static async getAllRoles(req, res) {
    try {
      const roles = await PhanQuyenService.getAllRoles();
      return response.success(res, roles, 'Lấy danh sách vai trò thành công');
    } catch (error) {
      console.error('Error getting all roles:', error);
      return response.error(res, error, 'Lỗi server khi lấy danh sách vai trò', 500);
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
      const { roleId } = req.params;
      const { permissions, permissionIds } = req.body;

      // Hỗ trợ cả permissions (strings) và permissionIds (numbers)
      let finalPermissionIds = permissionIds;
      
      if (permissions) {
        if (!Array.isArray(permissions)) {
          return response.validationError(
            res,
            { permissions: 'phải là một mảng' },
            'permissions phải là một mảng',
            400
          );
        }
        
        if (permissions.length === 0) {
          return response.validationError(
            res,
            { permissions: 'không được rỗng' },
            'permissions không được rỗng',
            400
          );
        }

        // Chuyển đổi permissions (strings) thành permissionIds (numbers)
        try {
          finalPermissionIds = await PhanQuyenService.convertPermissionsToIds(permissions);
        } catch (error) {
          if (error.message === 'INVALID_PERMISSIONS') {
            return response.validationError(
              res,
              { permissions: 'chứa quyền không hợp lệ' },
              'Một số quyền không tồn tại trong hệ thống',
              400
            );
          }
          throw error;
        }
      } else if (permissionIds) {
        if (!Array.isArray(permissionIds)) {
          return response.validationError(
            res,
            { permissionIds: 'phải là một mảng' },
            'permissionIds phải là một mảng',
            400
          );
        }
        
        if (permissionIds.length === 0) {
          return response.validationError(
            res,
            { permissionIds: 'không được rỗng' },
            'permissionIds không được rỗng',
            400
          );
        }
      } else {
        return response.validationError(
          res,
          { permissions: 'hoặc permissionIds là bắt buộc' },
          'Phải cung cấp permissions hoặc permissionIds',
          400
        );
      }

      const result = await PhanQuyenService.updateRolePermissions(roleId, finalPermissionIds);
      
      // Lấy thông tin vai trò và quyền đã cập nhật để trả về
      const roleInfo = await PhanQuyenService.getRoleWithPermissions(roleId);
      
      return response.success(res, {
        roleId: parseInt(roleId),
        roleName: roleInfo.roleName,
        permissions: roleInfo.permissions,
        updatedAt: new Date().toISOString()
      }, 'Cập nhật quyền cho vai trò thành công');
    } catch (error) {
      console.error('Error updating role permissions:', error);
      
      if (error.message === 'ROLE_NOT_FOUND') {
        return response.notFound(res, `Không tìm thấy vai trò với ID: ${req.params.roleId}`);
      }
      
      if (error.message === 'INSUFFICIENT_PERMISSIONS') {
        return response.error(res, null, 'Bạn không có quyền cập nhật vai trò này', 403);
      }
      
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