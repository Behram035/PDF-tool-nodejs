import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    tool: {
      type: String,
      required: true,
    },

    inputFiles: [
      {
        filename: String,
        path: String,
      },
    ],

    outputFile: {
      filename: String,
      path: String,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("History", historySchema);
