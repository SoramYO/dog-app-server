const express = require("express");
const router = express.Router();
const auth = require("../middleware/authenticate");

const socialController = require("../controllers/socialController");

// Social Routes
router.post("/posts", auth.verifyAccessToken, socialController.createPost);
router.get("/feed", auth.verifyAccessToken, socialController.getFeed);
router.post(
  "/posts/:postId/like",
  auth.verifyAccessToken,
  socialController.likePost
);
router.get("/recent-posts", socialController.getRecentPosts);
router.get(
  "/user-posts/:userId",
  auth.verifyAccessToken,
  socialController.getUserPosts
);

module.exports = router;
