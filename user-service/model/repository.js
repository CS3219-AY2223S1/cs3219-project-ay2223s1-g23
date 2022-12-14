import UserModel from './user-model.js';
import 'dotenv/config'

//Set up mongoose connection
import mongoose from 'mongoose';

let mongoDB;
switch (process.env.ENV) {
  case "PROD":
    mongoDB = process.env.DB_CLOUD_URI;
    break;
  case "TEST":
    mongoDB = process.env.DB_TEST_URI;
    break;
  default:
    mongoDB = process.env.DB_LOCAL_URI;
}

mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export async function createUser(params) {
  return new UserModel(params)
}

export async function deleteUser(params) {
  return (await UserModel.deleteOne({username: params}))
}

export async function getUser(params) {
  return (await UserModel.findOne({username: params}, 'username email'))
}

export async function existsUser(params) {
  return (await UserModel.findOne({username: params}, 'username')) !== null
}

export async function getEmail(params) {
  return (await  UserModel.findOne({username: params}, 'email')).email
}

export async function getPassword(params) {
  return (await  UserModel.findOne({ username: params }, 'password')).password
}

export async function updateUser(params, updateParams) {
  return await  UserModel.findOneAndUpdate({username: params}, updateParams)
}

export async function clearAllUser() {
  return await UserModel.deleteMany({});
}
