const express = require("express");
const barcodeController = require("../controllers/barcode-controller");
const auth = require ("../middlewares/auth.middleware")
const router = express.Router();

router.get("/barcode/:text",  barcodeController.createBarcode);

module.exports = router;