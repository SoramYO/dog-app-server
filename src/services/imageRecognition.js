const vision = require("@google-cloud/vision");
const BreedInfo = require("../models/BreedInfo");

class ImageRecognitionService {
  constructor() {
    this.client = new vision.ImageAnnotatorClient();
  }

  async identifyPetBreed(imageBuffer) {
    try {
      const [result] = await this.client.labelDetection(imageBuffer);
      const labels = result.labelAnnotations;

      // Filter for pet-related labels
      const petLabels = labels.filter(
        (label) =>
          label.description.toLowerCase().includes("dog") ||
          label.description.toLowerCase().includes("cat")
      );

      if (petLabels.length === 0) {
        return { success: false, message: "No pet detected in the image" };
      }

      // Get breed information using Mongoose
      const breedRegex = new RegExp(petLabels[0].description, "i");
      const breedInfo = await BreedInfo.findOne({ breed: breedRegex });

      if (!breedInfo) {
        return {
          success: true,
          breed: petLabels[0].description,
          confidence: petLabels[0].score * 100,
          message: "Breed details not found in database",
        };
      }

      return {
        success: true,
        breed: petLabels[0].description,
        confidence: petLabels[0].score * 100,
        breedInfo: breedInfo.toObject(),
      };
    } catch (error) {
      console.error("Error in breed identification:", error);
      return { success: false, message: "Error processing image" };
    }
  }
}

module.exports = new ImageRecognitionService();
