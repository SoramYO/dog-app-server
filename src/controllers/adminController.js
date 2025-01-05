const User = require("../models/User");
const Pet = require("../models/Pet");
const PetPost = require("../models/PetPost");
const BreedInfo = require("../models/BreedInfo");

const adminController = {
  // Quản lý người dùng
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalUsers = await User.countDocuments();

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers,
          },
        },
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Quản lý bài đăng
  managePosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const posts = await PetPost.find()
        .populate("userId", "username name")
        .populate("petId", "name breed")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalPosts = await PetPost.countDocuments();

      res.json({
        success: true,
        data: {
          posts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
          },
        },
      });
    } catch (error) {
      console.error("Error in managePosts:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Quản lý giống
  manageBreeds: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const breeds = await BreedInfo.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalBreeds = await BreedInfo.countDocuments();

      res.json({
        success: true,
        data: {
          breeds,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalBreeds / limit),
            totalBreeds,
          },
        },
      });
    } catch (error) {
      console.error("Error in manageBreeds:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Thêm giống mới
  addBreed: async (req, res) => {
    try {
      const breedData = req.body;
      const newBreed = new BreedInfo(breedData);
      await newBreed.save();

      res.status(201).json({
        success: true,
        message: "Thêm giống thành công",
        breed: newBreed,
      });
    } catch (error) {
      console.error("Error in addBreed:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Cập nhật thông tin giống
  updateBreed: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedBreed = await BreedInfo.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedBreed) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy giống",
        });
      }

      res.json({
        success: true,
        message: "Cập nhật thành công",
        breed: updatedBreed,
      });
    } catch (error) {
      console.error("Error in updateBreed:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Xóa bài đăng
  deletePost: async (req, res) => {
    try {
      const { postId } = req.params;
      await PetPost.findByIdAndDelete(postId);

      res.json({
        success: true,
        message: "Xóa bài đăng thành công",
      });
    } catch (error) {
      console.error("Error in deletePost:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },
};

module.exports = adminController;
