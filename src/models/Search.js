const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const searchSchema = new Schema(
  {
    name: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "both"],
      default: "both",
    },
    size: { type: String, required: true },
    life_span: { type: String, required: true },
    temperament: { type: String, required: true },
    description: { type: String, required: true },
    take_care: { type: String, required: true },
    sick: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ["friendly", "intelligent", "cute", "trustworthy", "guardian"],
      required: true,
    },
  },
  { timestamps: true }
);

const Search = mongoose.model("Search", searchSchema);

module.exports = Search;
