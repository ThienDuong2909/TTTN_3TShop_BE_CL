// Middleware phân quyền dựa trên vai trò
// Sử dụng: authorize('Admin'), authorize('NhanVien', 'Admin'), ...
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.MaVaiTro && !req.user.role && !req.user.TenVaiTro) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Hỗ trợ nhiều kiểu lưu role trong payload
    const userRole = req.user.TenVaiTro || req.user.role || req.user.MaVaiTro;
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  };
}

module.exports = authorize; 