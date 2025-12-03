import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);

export default Image;
