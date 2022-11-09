import mongoose from "mongoose";
var Schema = mongoose.Schema;
let CollabModelSchema = new Schema(
  {
    user1: {
      type: String,
    },
    user2: {
      type: String,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
  },
  {
    toObject: { virtuals: true },
  },
);

export default mongoose.model("CollabModel", CollabModelSchema);
