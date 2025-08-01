// Middleware phân quyền dựa trên vai trò
// Sử dụng: authorize('Admin'), authorize('NhanVienCuaHang', 'Admin'), ...

// Định nghĩa quyền hạn cho từng vai trò
const ROLE_PERMISSIONS = {
  Admin: {
    description: 'Toàn quyền - có thể truy cập tất cả chức năng',
    permissions: ['*'] // Tất cả quyền
  },
  NhanVienCuaHang: {
    description: 'Nhân viên cửa hàng - quản lý sản phẩm, nhập hàng, đặt hàng',
    permissions: [
      'product.*',           // Tất cả quyền sản phẩm
      'import.*',            // Tất cả quyền nhập hàng  
      'purchase.*',          // Tất cả quyền đặt hàng NCC
      'supplier.*',          // Quản lý nhà cung cấp
      'category.*',          // Quản lý loại sản phẩm
      'color.*',             // Quản lý màu sắc
      'size.*',              // Quản lý kích thước
      'order.view',          // Xem đơn hàng
      'order.update_status', // Cập nhật trạng thái đơn hàng
      'invoice.*',           // Quản lý hóa đơn
      'employee.view',       // Xem thông tin nhân viên
      'department.view'      // Xem thông tin bộ phận
    ]
  },
  NhanVienGiaoHang: {
    description: 'Nhân viên giao hàng - xem đơn hàng được phân công, xác nhận giao hàng',
    permissions: [
      'order.view_assigned',     // Xem đơn hàng được phân công
      'order.confirm_delivery',  // Xác nhận đã giao hàng
      'order.update_status',     // Cập nhật trạng thái đơn hàng (chỉ đơn được phân công)
      'profile.view',            // Xem thông tin cá nhân
      'order.view_own_delivery'  // Xem đơn hàng mình giao
    ]
  },
  KhachHang: {
    description: 'Khách hàng - đặt hàng, xem đơn hàng của mình',
    permissions: [
      'product.view',        // Xem sản phẩm
      'order.create',        // Tạo đơn hàng
      'order.view_own',      // Xem đơn hàng của mình
      'cart.*',              // Quản lý giỏ hàng
      'profile.view',        // Xem thông tin cá nhân
      'profile.update',      // Cập nhật thông tin cá nhân
      'comment.*'            // Quản lý bình luận (tạo, sửa, xóa bình luận của mình)
    ]
  }
};

function authorize(...allowedRoles) {
  return (req, res, next) => {
    console.log('authorize middleware - req.user:', req.user);
    if (
      !req.user ||
      (!req.user.MaVaiTro &&
        !req.user.role &&
        !req.user.TenVaiTro &&
        !req.user.VaiTro)
    ) {
      console.error('authorize middleware - Không có thông tin role trong req.user');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Hỗ trợ nhiều kiểu lưu role trong payload
    const userRole =
      req.user.TenVaiTro ||
      req.user.role ||
      req.user.MaVaiTro ||
      req.user.VaiTro;
      
    console.log('authorize middleware - userRole:', userRole, 'allowedRoles:', allowedRoles);
    
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    
    console.error('authorize middleware - Không đủ quyền');
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  };
}

// Middleware kiểm tra quyền cụ thể
function checkPermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userRole = req.user.TenVaiTro || req.user.role || req.user.VaiTro;
    const userPermissions = ROLE_PERMISSIONS[userRole]?.permissions || [];
    
    // Admin có tất cả quyền
    if (userRole === 'Admin' || userPermissions.includes('*')) {
      return next();
    }
    
    // Kiểm tra quyền cụ thể
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }
    
    // Kiểm tra quyền wildcard (ví dụ: product.* cho product.create)
    const permissionPrefix = requiredPermission.split('.')[0] + '.*';
    if (userPermissions.includes(permissionPrefix)) {
      return next();
    }
    
    return res.status(403).json({ 
      message: 'Forbidden: insufficient permissions',
      required: requiredPermission,
      userRole: userRole,
      userPermissions: userPermissions
    });
  };
}

// Middleware kiểm tra quyền sở hữu (chỉ cho phép truy cập dữ liệu của chính mình)
function checkOwnership(modelName, idField = 'id') {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userRole = req.user.TenVaiTro || req.user.role || req.user.VaiTro;
    const userId = req.user.id || req.user.MaTK;
    
    // Admin có thể truy cập tất cả
    if (userRole === 'Admin') {
      return next();
    }
    
    // Nhân viên cửa hàng có thể truy cập tất cả đơn hàng
    if (userRole === 'NhanVienCuaHang' && modelName === 'DonDatHang') {
      return next();
    }
    
    // Nhân viên giao hàng chỉ có thể truy cập đơn hàng được phân công
    if (userRole === 'NhanVienGiaoHang' && modelName === 'DonDatHang') {
      // TODO: Kiểm tra xem đơn hàng có được phân công cho nhân viên này không
      // Hiện tại cho phép tạm thời, cần implement logic phân công giao hàng
      return next();
    }
    
    // Khách hàng chỉ có thể truy cập dữ liệu của mình
    if (userRole === 'KhachHang') {
      const resourceId = req.params[idField] || req.body[idField];
      if (resourceId && resourceId.toString() === userId.toString()) {
        return next();
      }
    }
    
    return res.status(403).json({ message: 'Forbidden: cannot access this resource' });
  };
}

module.exports = { authorize, checkPermission, checkOwnership, ROLE_PERMISSIONS }; 