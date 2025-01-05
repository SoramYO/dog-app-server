const Pet = require("../models/Pet");
const imageRecognition = require("../services/imageRecognition");
const petAnalysis = require("../services/petAnalysis");
const sharp = require("sharp");
const petController = {
  scanPet: async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No image provided" });
      }

      const optimizedImage = await sharp(req.file.buffer)
        .resize(800, 800, { fit: "inside" })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Get breed and characteristics
      const breedResult = await imageRecognition.identifyPetBreed(
        optimizedImage
      );

      // Get additional analysis
      const [ageEstimate, sizeEstimate] = await Promise.all([
        petAnalysis.analyzePetAge(optimizedImage),
        petAnalysis.analyzePetSize(optimizedImage),
      ]);

      const result = {
        ...breedResult,
        estimatedAge: ageEstimate,
        size: sizeEstimate,
        temperature: breedResult.breedInfo?.temperament,
        careInstructions: breedResult.breedInfo?.grooming,
        healthIssues: breedResult.breedInfo?.healthIssues,
      };

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error in scanPet:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  createPetProfile: async (req, res) => {
    try {
      const { name, breed, age, size, image } = req.body;
      const pet = new Pet({
        name,
        breed,
        age,
        size,
        image,
        owner: req.user.id,
      });

      await pet.save();
      res.json({ success: true, pet });
    } catch (error) {
      console.error("Error in createPetProfile:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  getPetProfile: async (req, res) => {
    try {
      const pet = await Pet.findById(req.params.id).populate("owner", "name");
      if (!pet) {
        return res
          .status(404)
          .json({ success: false, message: "Pet not found" });
      }

      res.json({ success: true, pet });
    } catch (error) {
      console.error("Error in getPetProfile:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
module.exports = petController;
