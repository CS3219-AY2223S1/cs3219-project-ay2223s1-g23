import 'dotenv/config'

//Set up mongoose connection
import mongoose from 'mongoose';
import HistoryModel from './history-model.js';

let mongoDB = process.env.ENV == "PROD" ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });


let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export async function createHistoryModel(params) {
    return new HistoryModel(params);
}

export async function getHistoryModelById(id) {
    return await HistoryModel.findById(id);
}

export async function getHistoryModelByUserId(userId) {
    return await HistoryModel.find({
        $or: [
            { userId1: userId },
            { userId2: userId }
        ]
    });
}
