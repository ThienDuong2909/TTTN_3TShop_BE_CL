// Middleware phân quyền dựa trên vai trò
// Sử dụng: authorize('Admin'), authorize('NhanVien', 'Admin'), ...
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

module.exports = authorize; 