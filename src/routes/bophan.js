const express = require('express');
const BoPhanController = require('../controllers/BoPhanController');
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

// Lấy tất cả bộ phận
router.get('/', BoPhanController.getAll);
// Lấy bộ phận theo id
router.get('/:id', BoPhanController.getById);
// Thêm bộ phận
router.post('/', /*authenticateJWT, authorize('Admin'),*/ BoPhanController.create);
// Sửa bộ phận
router.put('/:id', /*authenticateJWT, authorize('Admin'),*/ BoPhanController.update);
// Xóa bộ phận
router.delete('/:id', /*authenticateJWT, authorize('Admin'),*/ BoPhanController.delete);

module.exports = router;
