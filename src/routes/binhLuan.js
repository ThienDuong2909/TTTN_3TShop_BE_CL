const express = require('express');
const BinhLuanController = require('../controllers/BinhLuanController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize, checkPermission } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===

// Lấy bình luận theo sản phẩm (public)
// GET /api/binh-luan/product/:maSP?page=1&limit=10
router.get('/product/:maSP', BinhLuanController.getByProduct);

// Lấy thống kê bình luận theo sản phẩm (public)
// GET /api/binh-luan/product/:maSP/stats
router.get('/product/:maSP/stats', BinhLuanController.getProductStats);

// Lấy bình luận theo ID (public)
// GET /api/binh-luan/:id
router.get('/:id', BinhLuanController.getById);

// === CUSTOMER ROUTES (Chỉ khách hàng) ===

// Lấy sản phẩm có thể bình luận (chỉ khách hàng)
// GET /api/binh-luan/commentable?page=1&limit=10
router.get('/commentable', 
  authenticateJWT, 
  authorize('KhachHang'), 
  BinhLuanController.getCommentableProducts
);

// Lấy bình luận của khách hàng (chỉ khách hàng đó)
// GET /api/binh-luan/customer?page=1&limit=10
router.get('/customer', 
  authenticateJWT, 
  authorize('KhachHang'), 
  BinhLuanController.getByCustomer
);

// Tạo bình luận mới (chỉ khách hàng)
// POST /api/binh-luan
// Body: { maCTDonDatHang: number, moTa: string, soSao: number(1-5) }
router.post('/', 
  authenticateJWT, 
  authorize('KhachHang'), 
  BinhLuanController.create
);

// Cập nhật bình luận (chỉ khách hàng sở hữu)
// PUT /api/binh-luan/:id
// Body: { moTa: string, soSao: number(1-5) }
router.put('/:id', 
  authenticateJWT, 
  authorize('KhachHang'), 
  BinhLuanController.update
);

// Xóa bình luận (chỉ khách hàng sở hữu)
// DELETE /api/binh-luan/:id
router.delete('/:id', 
  authenticateJWT, 
  authorize('KhachHang'), 
  BinhLuanController.delete
);

// === ADMIN ROUTES (Chỉ admin) ===

// Lấy tất cả bình luận (chỉ admin)
// GET /api/binh-luan?page=1&limit=10
router.get('/', 
  authenticateJWT, 
  authorize('Admin'), 
  BinhLuanController.getAll
);

module.exports = router; 