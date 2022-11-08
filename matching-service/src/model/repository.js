import 'dotenv/config'

//Set up mongoose connection
import mongoose from 'mongoose';
import MatchModel from './match-model.js';

var mongoDB;
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

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });


let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export async function createMatchModel(params) {
    return new MatchModel(params)
}

export async function deleteMatchModel(params) {
    return (await MatchModel.findOneAndRemove({ userId: params }))
}

export async function existsMatchModel(params) {
    return (await MatchModel.findOne({ userId: params }, 'userId')) !== null
}

export async function updateMatchModel(params, updateParams) {
    return await MatchModel.findOneAndUpdate({ userId: params }, updateParams)
}
