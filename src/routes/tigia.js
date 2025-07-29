const express = require("express");
const router = express.Router();
const TiGiaController = require("../controllers/TiGiaController");

router.post("/", TiGiaController.create);
router.put("/:MaTiGia", TiGiaController.update);
router.delete("/:MaTiGia", TiGiaController.delete);
router.get("/", TiGiaController.getAll);
router.get("/co-hieu-luc", TiGiaController.getHieuLuc);

module.exports = router;
