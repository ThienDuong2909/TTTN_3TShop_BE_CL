const express = require('express');
const BinhLuanController = require('../controllers/BinhLuanController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize, authorizeOwnership } = require('../middlewares/authorize');

const router = express.Router();

// === PUBLIC ROUTES (Không cần đăng nhập) ===
// Lấy bình luận theo sản phẩm (public)
router.get('/product/:maSP', BinhLuanController.getByProduct);

// Lấy thống kê bình luận theo sản phẩm (public)
router.get('/product/:maSP/stats', BinhLuanController.getProductStats);

// Lấy bình luận theo ID (public)
router.get('/:id', BinhLuanController.getById);

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy sản phẩm có thể bình luận (chỉ khách hàng)
router.get('/commentable', authorize('binhluan.tao'), BinhLuanController.getCommentableProducts);

// Lấy bình luận của khách hàng (chỉ khách hàng đó)
router.get('/customer', authorize('binhluan.tao'), BinhLuanController.getByCustomer);

// Tạo bình luận mới (chỉ khách hàng)
router.post('/', authorize('binhluan.tao'), BinhLuanController.create);

// Tạo nhiều bình luận cùng lúc (chỉ khách hàng)
router.post('/multiple', authorize('binhluan.tao'), BinhLuanController.createMultiple);

// Cập nhật bình luận (chỉ khách hàng sở hữu)
router.put('/:id', authorize('binhluan.sua_cua_minh'), BinhLuanController.update);

// Xóa bình luận (chỉ khách hàng sở hữu)
router.delete('/:id', authorize('binhluan.xoa_cua_minh'), BinhLuanController.delete);

// === ADMIN ROUTES ===
// Lấy tất cả bình luận (chỉ admin)
router.get('/', authorize('binhluan.kiemduyet'), BinhLuanController.getAll);

module.exports = router;
