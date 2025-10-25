const {
  PhanQuyen,
  VaiTro,
  PhanQuyen_VaiTro,
  TaiKhoan,
  NhanVien,
} = require("../models");
const { Op } = require("sequelize");

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
        include: [
          {
            model: VaiTro,
            include: [
              {
                model: PhanQuyen,
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!taiKhoan || !taiKhoan.VaiTro) {
        return false;
      }

      // Chuyển permissions thành array nếu là string
      const permissionArray = Array.isArray(permissions)
        ? permissions
        : [permissions];

      // Kiểm tra xem user có quyền toàn quyền không
      const hasFullPermission = taiKhoan.VaiTro.PhanQuyens.some(
        (quyen) => quyen.Ten === "toanquyen"
      );

      if (hasFullPermission) {
        return true;
      }

      // Kiểm tra từng quyền cụ thể
      const userPermissions = taiKhoan.VaiTro.PhanQuyens.map(
        (quyen) => quyen.Ten
      );

      return permissionArray.every((permission) =>
        userPermissions.includes(permission)
      );
    } catch (error) {
      console.error("Error checking permission:", error);
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
        include: [
          {
            model: VaiTro,
            include: [
              {
                model: PhanQuyen,
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!taiKhoan || !taiKhoan.VaiTro) {
        return [];
      }

      return taiKhoan.VaiTro.PhanQuyens.map((quyen) => quyen.Ten);
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }
  }

  /**
   * Lấy tất cả quyền
   * @returns {Promise<Array>} - Danh sách tất cả quyền
   */
  static async getAllPermissions() {
    try {
      const permissions = await PhanQuyen.findAll({
        attributes: ["id", "Ten", "TenHienThi"],
        order: [["Ten", "ASC"]],
      });

      console.log("All permissions fetched:", permissions);

      // Chuyển đổi format để phù hợp với frontend
      return permissions.map((permission) => ({
        key: permission.Ten,
        name: permission.TenHienThi,
        description: permission.TenHienThi,
      }));
    } catch (error) {
      console.error("Error getting all permissions:", error);
      throw error;
    }
  }

  /**
   * Lấy tất cả vai trò
   * @returns {Promise<Array>} - Danh sách tất cả vai trò với quyền
   */
  static async getAllRoles() {
    try {
      const roles = await VaiTro.findAll({
        include: [
          {
            model: PhanQuyen,
            through: { attributes: [] },
            attributes: ["id", "Ten", "TenHienThi"],
          },
        ],
        order: [["MaVaiTro", "ASC"]],
      });

      // Chuyển đổi format để phù hợp với frontend
      return roles.map((role) => ({
        id: role.MaVaiTro,
        name: role.TenVaiTro,
        displayName: role.TenVaiTro,
        permissions: role.PhanQuyens.map((pq) => pq.Ten),
      }));
    } catch (error) {
      console.error("Error getting all roles:", error);
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
        include: [
          {
            model: PhanQuyen,
            through: { attributes: [] },
          },
        ],
      });

      if (!vaiTro) {
        return [];
      }

      return vaiTro.PhanQuyens;
    } catch (error) {
      console.error("Error getting permissions by role:", error);
      throw error;
    }
  }

  /**
   * Lấy quyền theo nhân viên (dựa trên vai trò của tài khoản nhân viên)
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  static async getPermissionsByEmployee(employeeId) {
    try {
      const nhanVien = await NhanVien.findByPk(employeeId, {
        include: [
          {
            model: TaiKhoan,
            include: [{ model: VaiTro, include: [PhanQuyen] }],
          },
        ],
      });

      if (!nhanVien) {
        throw new Error("Nhân viên không tồn tại");
      }

      if (!nhanVien.TaiKhoan || !nhanVien.TaiKhoan.VaiTro) {
        return [];
      }

      return nhanVien.TaiKhoan.VaiTro.PhanQuyens || [];
    } catch (error) {
      console.error("Error getting permissions by employee:", error);
      throw error;
    }
  }

  /**
   * Cập nhật quyền cho vai trò
   * @param {number} vaiTroId - ID của vai trò
   * @param {Array<number>} permissionIds - Danh sách id quyền
   * @returns {Promise<boolean>}
   */
  static async updateRolePermissions(vaiTroId, permissionIds) {
    try {
      // Kiểm tra vai trò có tồn tại không
      const vaiTro = await VaiTro.findByPk(vaiTroId);
      if (!vaiTro) {
        throw new Error("ROLE_NOT_FOUND");
      }

      // Xóa tất cả quyền hiện tại của vai trò
      await PhanQuyen_VaiTro.destroy({
        where: { VaiTroId: vaiTroId },
      });

      // Thêm quyền mới
      if (permissionIds && permissionIds.length > 0) {
        const rolePermissions = permissionIds.map((permissionId) => ({
          VaiTroId: vaiTroId,
          PhanQuyenId: permissionId,
        }));

        await PhanQuyen_VaiTro.bulkCreate(rolePermissions);
      }

      return true;
    } catch (error) {
      console.error("Error updating role permissions:", error);
      throw error;
    }
  }

  /**
   * Chuyển đổi permissions (strings) thành permissionIds (numbers)
   * @param {Array<string>} permissions - Danh sách tên quyền
   * @returns {Promise<Array<number>>} - Danh sách ID quyền
   */
  static async convertPermissionsToIds(permissions) {
    try {
      const phanQuyens = await PhanQuyen.findAll({
        where: {
          Ten: {
            [Op.in]: permissions,
          },
        },
        attributes: ["id", "Ten"],
      });

      // Kiểm tra xem tất cả permissions có tồn tại không
      if (phanQuyens.length !== permissions.length) {
        const foundPermissions = phanQuyens.map((pq) => pq.Ten);
        const missingPermissions = permissions.filter(
          (p) => !foundPermissions.includes(p)
        );
        console.error("Missing permissions:", missingPermissions);
        throw new Error("INVALID_PERMISSIONS");
      }

      return phanQuyens.map((pq) => pq.id);
    } catch (error) {
      console.error("Error converting permissions to IDs:", error);
      throw error;
    }
  }

  /**
   * Lấy thông tin vai trò cùng với danh sách quyền
   * @param {number} vaiTroId - ID của vai trò
   * @returns {Promise<Object>} - Thông tin vai trò và quyền
   */
  static async getRoleWithPermissions(vaiTroId) {
    try {
      const vaiTro = await VaiTro.findByPk(vaiTroId, {
        include: [
          {
            model: PhanQuyen,
            through: { attributes: [] },
            attributes: ["id", "Ten", "TenHienThi"],
          },
        ],
      });

      if (!vaiTro) {
        throw new Error("ROLE_NOT_FOUND");
      }

      return {
        roleId: vaiTro.MaVaiTro,
        roleName: vaiTro.TenVaiTro,
        permissions: vaiTro.PhanQuyens.map((pq) => pq.Ten),
      };
    } catch (error) {
      console.error("Error getting role with permissions:", error);
      throw error;
    }
  }

  /**
   * Gán quyền (theo danh sách permissionIds) cho tài khoản (user) thông qua vai trò hiện tại của tài khoản
   * Lưu ý: chỉnh sửa quyền của vai trò sẽ ảnh hưởng tới tất cả tài khoản thuộc vai trò đó
   * @param {number} userId - MaTK của tài khoản
   * @param {Array<number>} permissionIds - Danh sách id quyền
   * @returns {Promise<boolean>}
   */
  static async assignPermissionsToUser(userId, permissionIds) {
    try {
      const taiKhoan = await TaiKhoan.findByPk(userId);
      if (!taiKhoan) {
        throw new Error("Tài khoản không tồn tại");
      }

      if (!taiKhoan.MaVaiTro) {
        throw new Error("Tài khoản chưa được gán vai trò");
      }

      await this.updateRolePermissions(taiKhoan.MaVaiTro, permissionIds);
      return true;
    } catch (error) {
      console.error("Error assigning permissions to user:", error);
      throw error;
    }
  }

  /**
   * Gán quyền cho nhân viên (thông qua tài khoản và vai trò của nhân viên)
   * @param {number} employeeId - MaNV của nhân viên
   * @param {Array<number>} permissionIds - Danh sách id quyền
   * @returns {Promise<boolean>}
   */
  static async assignPermissionsToEmployee(employeeId, permissionIds) {
    try {
      const nhanVien = await NhanVien.findByPk(employeeId);
      if (!nhanVien) {
        throw new Error("Nhân viên không tồn tại");
      }

      if (!nhanVien.MaTK) {
        throw new Error("Nhân viên chưa liên kết tài khoản");
      }

      return await this.assignPermissionsToUser(nhanVien.MaTK, permissionIds);
    } catch (error) {
      console.error("Error assigning permissions to employee:", error);
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
      if (userPermissions.includes("toanquyen")) {
        return true;
      }

      // Kiểm tra quyền cụ thể
      if (!userPermissions.includes(permission)) {
        console.log(`User ${userId} does not have permission: ${userPermissions}, | ${permission}`);
        return false;
      }

      // Xử lý các trường hợp đặc biệt cần context
      switch (permission) {
        case "donhang.xem_cua_minh":
          console.log("Context for donhang.xem_cua_minh:", context, userId);
          return context.userId === userId;

        case "donhang.xem_duoc_giao":
          // Nếu có context.assignedTo, kiểm tra xem user có phải là người được phân công không
          // Nếu không có context, chỉ cần có quyền là được (đã kiểm tra ở trên)
          console.log("Context for donhang.xem_duoc_giao:", context, userId);
          return context.assignedTo ? context.assignedTo === userId : true;

        case "binhluan.sua_cua_minh":
        case "binhluan.xoa_cua_minh":
          return context.authorId === userId;

        default:
          return true;
      }
      return userPermissions.every((perm) => permission.includes(perm));
    } catch (error) {
      console.error("Error checking permission with context:", error);
      return false;
    }
  }
}

module.exports = PhanQuyenService;
