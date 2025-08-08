const PhanQuyenService = require('../services/PhanQuyenService');
const { error, notFound } = require('../utils/response');

/**
 * Middleware kiểm tra quyền
 * @param {string|Array} permissions - Quyền cần kiểm tra
 * @param {Object} options - Tùy chọn bổ sung
 * @returns {Function} Middleware function
 */
function authorize(permissions, options = {}) {
  return async (req, res, next) => {
    try {
      // Kiểm tra xem user đã được xác thực chưa
      if (!req.user || !req.user.MaTK) {
        return error(res, null, 'Unauthorized - User not authenticated', 401);
      }

      console.log('=== AUTHORIZATION DEBUG ===');
      console.log('User info:', req.user);
      const userId = req.user.MaTK;
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      const context = options.context ? options.context(req) : {};

      console.log('Required permissions:', permissions);
      console.log('Context:', context);
      console.log('User ID:', userId);

      // Debug: Lấy quyền của user
      const userPermissions = await PhanQuyenService.getUserPermissions(userId);
      console.log('User permissions:', userPermissions);

      // Điền ngữ cảnh mặc định cho các quyền "của_mình" nếu thiếu
      if (requiredPermissions.includes('donhang.xem_cua_minh') && context.userId == null) {
        context.userId = userId;
      }

      if ((requiredPermissions.includes('binhluan.sua_cua_minh') || requiredPermissions.includes('binhluan.xoa_cua_minh')) && context.authorId == null) {
        context.authorId = userId;
      }

      // Kiểm tra quyền
      const hasPermission = await PhanQuyenService.checkPermissionWithContext(
        userId,
        permissions,
        context
      );

      console.log('Has permission:', hasPermission);
      console.log('=== END AUTHORIZATION DEBUG ===');

      if (!hasPermission) {
        return error(res, null, 'Forbidden - Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return error(res, error, 'Internal server error during authorization', 500);
    }
  };
}

/**
 * Middleware kiểm tra quyền với context động
 * @param {string|Array} permissions - Quyền cần kiểm tra
 * @param {Function} contextProvider - Function trả về context
 * @returns {Function} Middleware function
 */
function authorizeWithContext(permissions, contextProvider) {
  return authorize(permissions, { context: contextProvider });
}

/**
 * Middleware kiểm tra quyền cho resource thuộc sở hữu của user
 * @param {string} permission - Quyền cần kiểm tra
 * @param {Function} resourceProvider - Function trả về thông tin resource
 * @returns {Function} Middleware function
 */
function authorizeOwnership(permission, resourceProvider) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.MaTK) {
        return error(res, null, 'Unauthorized - User not authenticated', 401);
      }

      const userId = req.user.MaTK;
      const resource = resourceProvider ? resourceProvider(req) : null;

      if (!resource) {
        return notFound(res, 'Resource not found');
      }

      // Kiểm tra quyền với context
      const context = {
        userId: resource.userId || resource.MaKH || resource.MaNV,
        authorId: resource.authorId,
        assignedTo: resource.assignedTo
      };

      const hasPermission = await PhanQuyenService.checkPermissionWithContext(
        userId,
        permission,
        context
      );

      if (!hasPermission) {
        return error(res, null, 'Forbidden - Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      console.error('Ownership authorization error:', error);
      return error(res, error, 'Internal server error during authorization', 500);
    }
  };
}

/**
 * Middleware kiểm tra quyền cho đơn hàng
 * @param {string} permission - Quyền cần kiểm tra
 * @returns {Function} Middleware function
 */
function authorizeOrder(permission) {
  return authorizeOwnership(permission, (req) => {
    const orderId = req.params.id || req.body.MaDDH || req.query.MaDDH;
    // Trả về object với thông tin cần thiết cho việc kiểm tra quyền
    return {
      MaDDH: orderId,
      MaKH: req.body.MaKH || req.query.MaKH,
      MaNV_Giao: req.body.MaNV_Giao || req.query.MaNV_Giao
    };
  });
}

/**
 * Middleware kiểm tra quyền cho bình luận
 * @param {string} permission - Quyền cần kiểm tra
 * @returns {Function} Middleware function
 */
function authorizeComment(permission) {
  return authorizeOwnership(permission, (req) => {
    const commentId = req.params.id || req.body.MaBinhLuan;
    return {
      MaBinhLuan: commentId,
      MaKH: req.body.MaKH || req.query.MaKH
    };
  });
}

module.exports = {
  authorize,
  authorizeWithContext,
  authorizeOwnership,
  authorizeOrder,
  authorizeComment
}; 