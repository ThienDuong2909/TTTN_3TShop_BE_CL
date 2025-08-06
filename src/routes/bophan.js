const express = require('express');
const BoPhanController = require('../controllers/BoPhanController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// === AUTHENTICATED ROUTES ===
router.use(authenticateJWT);

// Lấy tất cả bộ phận
router.get('/', authorize('bophan.xem'), BoPhanController.getAll);

// Lấy bộ phận theo id
router.get('/:id', authorize('bophan.xem'), BoPhanController.getById);

// Thêm bộ phận
router.post('/', authorize('toanquyen'), BoPhanController.create);

// Sửa bộ phận
router.put('/:id', authorize('toanquyen'), BoPhanController.update);

// Xóa bộ phận
router.delete('/:id', authorize('toanquyen'), BoPhanController.delete);

module.exports = router;
