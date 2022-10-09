import mongoose from "mongoose";
var Schema = mongoose.Schema;
let CollabModelSchema = new Schema(
  {
    user1: {
      type: String,
      unique: true,
    },
    user2: {
      type: String,
      unique: true,
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
