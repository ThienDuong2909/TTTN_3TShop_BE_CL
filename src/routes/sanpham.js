const express = require("express");
const SanPhamController = require("../controllers/SanPhamController");
// const authenticateJWT = require('../middlewares/jwt');
// const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get("/", SanPhamController.getAll);
module.exports = router;
