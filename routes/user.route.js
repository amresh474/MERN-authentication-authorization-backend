const express = require("express");
const userProfileController = require("../controllers/userProfile-controller");
const auth = require ("../middlewares/auth.middleware")
const router = express.Router();

router.get("/user", auth.verifyToken, userProfileController.getUserProfile);
router.post("/user", auth.verifyToken, userProfileController.userProfile);

module.exports = router;
