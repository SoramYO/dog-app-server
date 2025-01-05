const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const breedInfoSchema = new Schema(
  {
    breed: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    temperament: {
      type: String,
      required: true,
    },
    lifeSpan: {
      type: String,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    origin: String,
    healthIssues: [String],
    grooming: String,
    exerciseNeeds: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for breed search
breedInfoSchema.index({ breed: "text" });

module.exports = mongoose.model("BreedInfo", breedInfoSchema);
