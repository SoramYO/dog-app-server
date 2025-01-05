const PetPost = require("../models/PetPost");
const Pet = require("../models/Pet");
const User = require("../models/User");

const socialController = {
  createPost: async (req, res) => {
    try {
      const { petId, content, imageUrl } = req.body;
      const userId = req.user.id;

      const pet = await Pet.findOne({ _id: petId, userId });
      if (!pet) {
        return res
          .status(404)
          .json({ success: false, message: "Pet not found" });
      }

      const post = new PetPost({
        userId,
        petId,
        content,
        imageUrl,
      });

      await post.save();
      res.status(201).json({ success: true, post });
    } catch (error) {
      console.error("Error in createPost:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getFeed: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const posts = await PetPost.find({ isPublic: true })
        .populate("petId", "name breed imageUrl")
        .populate("userId", "username avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.json({ success: true, posts });
    } catch (error) {
      console.error("Error in getFeed:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  likePost: async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;

      const post = await PetPost.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex === -1) {
        post.likes.push(userId);
        post.likesCount++;
      } else {
        post.likes.splice(likeIndex, 1);
        post.likesCount--;
      }

      await post.save();
      res.json({ success: true, likesCount: post.likesCount });
    } catch (error) {
      console.error("Error in likePost:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getRecentPosts: async (req, res) => {
    try {
      const recentPosts = await PetPost.find({ isPublic: true })
        .populate({
          path: "petId",
          select: "breed temperament",
          populate: {
            path: "breed",
            model: "BreedInfo",
            select: "temperament",
          },
        })
        .populate("userId", "username name")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("content likesCount createdAt");

      const formattedPosts = recentPosts.map((post) => ({
        like_quantity: post.likesCount,
        time_post: post.createdAt,
        title: post.content.substring(0, 100),
        character:
          post.petId?.breed?.temperament ||
          post.petId?.temperament ||
          "Chưa cập nhật",
        owner: {
          name: post.userId?.name || "Người dùng ẩn danh",
          username: post.userId?.username,
        },
      }));

      res.json({
        success: true,
        posts: formattedPosts,
      });
    } catch (error) {
      console.error("Error in getRecentPosts:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },

  getUserPosts: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }

      const totalPosts = await PetPost.countDocuments({ userId });

      const posts = await PetPost.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("content imageUrl createdAt likesCount");

      const formattedPosts = posts.map((post) => ({
        image: post.imageUrl,
        title: post.content.substring(0, 100),
        time_post: post.createdAt,
        like_quantity: post.likesCount,
      }));

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts: totalPosts,
            hasMore: page * limit < totalPosts,
          },
        },
      });
    } catch (error) {
      console.error("Error in getUserPosts:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },
};

module.exports = socialController;
