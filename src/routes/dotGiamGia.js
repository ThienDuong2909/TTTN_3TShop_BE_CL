const express = require('express');
const router = express.Router();
const DotGiamGiaController = require('../controllers/DotGiamGiaController');
const authenticateJWT = require('../middlewares/jwt');
const { authorize } = require('../middlewares/authorize');

// Create new discount period (Admin and Store Employee)
router.post('/', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.createDotGiamGia
);

// Get discount periods list (Public)
router.get('/', DotGiamGiaController.getDotGiamGiaList);

// Validate discount period dates (Admin and Store Employee)
router.post('/validate-period', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.validateDiscountPeriod
);

// Get discount period details (Public)
router.get('/:maDot', DotGiamGiaController.getDotGiamGiaDetail);

// Get available products for discount period (Admin and Store Employee)
router.get('/:maDot/available-products', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.getAvailableProductsForDiscount
);

// Add product to discount period (Admin and Store Employee)
router.post('/:maDot/products', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.addSanPhamToDot
);

// Remove product from discount period (Admin and Store Employee)
router.delete('/:maDot/products/:maSP', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.removeSanPhamFromDot
);

// Update discount percentage (Admin and Store Employee)
router.put('/:maDot/products/:maSP', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.updatePhanTramGiam
);

// Update discount period information (Admin and Store Employee)
router.put('/:maDot', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.updateDotGiamGia
);

// Delete discount period (Admin and Store Employee)
router.delete('/:maDot', 
  authenticateJWT, 
  authorize('Admin', 'NhanVienCuaHang'), 
  DotGiamGiaController.deleteDotGiamGia
);

module.exports = router;
