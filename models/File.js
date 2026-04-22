import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    path: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("File", fileSchema);
