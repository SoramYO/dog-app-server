const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    post_pet: [
        {
            name: { type: String, required: true },
            line: { type: String, required: true },
            health: { type: String, required: true },
            medical: { type: String, required: true },
            fullVaccin: { type: String, required: true },
            vaccin: { type: String, required: true },
            sterilization: { type: String, required: true },
            takeCare: { type: String, required: true },
            specialTakeCare: { type: String, required: true },
            habit: { type: String, required: true },
            liveTogether: { type: String, required: true },
            train: { type: String, required: true },
            imageUrl: { type: String, required: true },
        }
    ],
    user: { type: Schema.Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false },
    dateApproved: { type: Date },
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;