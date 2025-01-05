const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authenticate");
const adminAuth = require("../middleware/adminAuth");

// Middleware xác thực admin
router.use(auth.verifyAccessToken, adminAuth.isAdmin);

// Quản lý người dùng
router.get("/users", adminController.getAllUsers);

// Quản lý bài đăng
router.get("/posts", adminController.managePosts);
router.delete("/posts/:postId", adminController.deletePost);

// Quản lý giống
router.get("/breeds", adminController.manageBreeds);
router.post("/breeds", adminController.addBreed);
router.put("/breeds/:id", adminController.updateBreed);

module.exports = router;
