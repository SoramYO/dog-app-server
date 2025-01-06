const BreedInfo = require("../models/BreedInfo");
const Post = require("../models/PetPost");

const breedController = {
  getBreed: async (req, res) => {
    try {
      const { id } = req.params;

      // Lấy thông tin chi tiết của giống
      const breed = await BreedInfo.findById(id);
      if (!breed) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thông tin giống",
        });
      }

      // Tìm các bài post liên quan
      const relatedPosts = await Post.find({
        post_pet: {
          $elemMatch: {
            $or: [
              { line: { $regex: breed.name, $options: "i" } },
              { health: { $regex: breed.sick, $options: "i" } },
              { takeCare: { $regex: breed.take_care, $options: "i" } },
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
        breed_info: {
          name_dog: breed.name,
          gender: breed.gender || "Đực/Cái",
          age: breed.life_span,
          size: breed.size,
          common_disease: breed.sick,
          take_care: breed.take_care,
          des: breed.description,
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
      console.error("Error in getBreed:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },

  getAllBreeds: async (req, res) => {
    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (currentPage - 1) * pageSize;

    try {
      const breeds = await BreedInfo.find().skip(skip).limit(pageSize);
      const totalCount = await BreedInfo.countDocuments();

      res.json({
        success: true,
        breeds,
        totalCount,
        pageSize,
        currentPage,
      });
    } catch (error) {
      console.error("Error in getAllBreeds:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },

  getBreedsByCategory: async (req, res) => {
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
          const breeds = await BreedInfo.find({ category })
            .select("name image -_id")
            .limit(10);

          return {
            category: categories[category],
            breeds: breeds.map((breed) => ({
              name_dog: breed.name,
              image: breed.image,
            })),
          };
        })
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Error in getBreedsByCategory:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
      });
    }
  },
};

module.exports = breedController;
