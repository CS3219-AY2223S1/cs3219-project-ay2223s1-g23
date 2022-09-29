import mongoose from "mongoose";
var Schema = mongoose.Schema;
let CollabModelSchema = new Schema(
  {
    user1: {
      type: String,
      required: true,
      unique: true,
    },
    user2: {
      type: String,
      required: true,
      unique: true,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
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
