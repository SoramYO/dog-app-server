const Search = require("../models/Search");
const Post = require("../models/Post");

const dogController = {
  getAllDogs: async (req, res) => {
    const CurrentPage = parseInt(req.query.page) || 1;
    const PageSize = parseInt(req.query.limit) || 10;
    const skip = (CurrentPage - 1) * PageSize;

    try {
      const dogs = await Search.find().skip(skip).limit(PageSize);
      const TotalCount = await Search.countDocuments();
      res.json({ success: true, dogs, TotalCount, PageSize, CurrentPage });
    } catch (error) {
      console.error("Error in getAllDogs:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  getDog: async (req, res) => {
    try {
      const { id } = req.params;

      // Lấy thông tin chi tiết của chó
      const dog = await Search.findById(id);
      if (!dog) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin chó",
        });
      }

      // Tìm các bài post liên quan
      const relatedPosts = await Post.find({
        post_pet: {
          $elemMatch: {
            $or: [
              { line: { $regex: dog.name, $options: "i" } },
              { health: { $regex: dog.sick, $options: "i" } },
              { takeCare: { $regex: dog.take_care, $options: "i" } },
            ],
          },
        },
        approved: true,
      })
        .select(
          "post_pet.name post_pet.health post_pet.takeCare post_pet.imageUrl"
        )
        .limit(5);

      const response = {
        success: true,
        dog_info: {
          name_dog: dog.name,
          gender: "Đực/Cái", // Thông tin này cần được thêm vào model Search
          age: dog.life_span,
          size: dog.size,
          common_disease: dog.sick,
          take_care: dog.take_care,
          des: dog.description,
        },
        related_posts: relatedPosts.map((post) => ({
          post_id: post._id,
          pet_info: post.post_pet.map((pet) => ({
            name: pet.name,
            health_info: pet.health,
            care_info: pet.takeCare,
            image: pet.imageUrl,
          })),
        })),
      };

      res.json(response);
    } catch (error) {
      console.error("Error in getDog:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },

  getDogsByCategory: async (req, res) => {
    try {
      const categories = {
        friendly: "Thân thiện",
        intelligent: "Thông minh",
        cute: "Dễ thương",
        trustworthy: "Đáng tin",
        guardian: "Giữ nhà",
      };

      const results = await Promise.all(
        Object.keys(categories).map(async (category) => {
          const dogs = await Search.find({ category })
            .select("name image -_id")
            .limit(10);

          return {
            category: categories[category],
            dogs: dogs.map((dog) => ({
              name_dog: dog.name,
              image: dog.image,
            })),
          };
        })
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error in getDogsByCategory:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },
};

module.exports = dogController;
