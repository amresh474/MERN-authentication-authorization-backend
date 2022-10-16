const express = require("express");
const userController = require("../controllers/user-controller");
const userProfileController = require("../controllers/userProfile-controller");
const auth = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/:id/verify/:token/", userController.emailVerify);

router.post("/password-reset", userController.sendPasswordlink);
router.get("/password-reset/:id/:token", userController.verifyPassord);
router.post("/password-reset/:id/:token", userController.setNewPassword);

router.post("/token", auth.verifyRefreshToken, userProfileController.getUser);

module.exports = router;
