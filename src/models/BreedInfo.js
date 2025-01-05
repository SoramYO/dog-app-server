const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const breedInfoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    name_vn: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    life_span: {
      type: String,
      required: true,
    },
    temperament: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    take_care: {
      type: String,
      required: true,
    },
    sick: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for name search
breedInfoSchema.index({ name: "text" });

module.exports = mongoose.model("BreedInfo", breedInfoSchema);
