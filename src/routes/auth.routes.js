const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");

router.post(
    "/register",
    [
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 }),
        body("username").trim().isLength({ min: 3 }),
        validate,
    ],
    authController.register
);

router.post(
    "/login",
    [body("username").trim().notEmpty(), body("password").notEmpty(), validate],
    authController.login
);

router.post("/logout", authController.logout);

router.post("/refresh-token", authController.refreshToken);

router.post(
    "/forgot-password",
    [body("email").isEmail().normalizeEmail(), validate],
    authController.forgotPassword
);

router.post(
    "/reset-password",
    [body("token").notEmpty(), body("password").isLength({ min: 6 }), validate],
    authController.resetPassword
);

module.exports = router;