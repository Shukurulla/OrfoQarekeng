import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
    },
    isChecked: {
      type: Boolean,
      required: true,
    },
    owner: {
      type: String,
      default: "System",
    },
    type: {
      type: String,
      enum: ["kiril", "latin"],
    },
    inspectors: {
      type: Object,
      default: [],
    },
    trustScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const wordModel = mongoose.model("word", wordSchema);

export default wordModel;
