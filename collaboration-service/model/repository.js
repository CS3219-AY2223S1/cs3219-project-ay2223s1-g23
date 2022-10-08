import CollabModel from "./collab-model.js";
import "dotenv/config";

//Set up mongoose connection
import mongoose from "mongoose";

let mongoDB =
  process.env.ENV == "PROD"
    ? process.env.DB_CLOUD_URI
    : process.env.DB_LOCAL_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

export async function createCollab(params) {
  return await CollabModel.findOneAndUpdate({ roomId: params.roomId }, params, {
    // if exist update else create
    upsert: true,
    new: true,
  });
}

export async function deleteCollab(params) {
  return await CollabModel.deleteOne({ roomId: params });
}

export async function getCollab(params) {
  return await CollabModel.findOne({ roomId: params });
}

export async function updateCollab(params, updateParams) {
  return await CollabModel.findOneAndUpdate({ roomId: params }, updateParams, {
    new: true,
  });
}

export async function existsCollab(params) {
  return (
    (await CollabModel.findOne({
      user1: params.user1,
      user2: params.user2,
    })) !== null
  );
}
