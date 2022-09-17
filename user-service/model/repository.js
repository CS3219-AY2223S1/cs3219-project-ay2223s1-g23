import UserModel from './user-model.js';
import 'dotenv/config'

//Set up mongoose connection
import mongoose from 'mongoose';

let mongoDB = process.env.ENV == "PROD" ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export async function createUser(params) {
  return new UserModel(params)
}

export async function existsUser(params) {
  return (await  UserModel.findOne({username: params}, 'username')) !== null
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
