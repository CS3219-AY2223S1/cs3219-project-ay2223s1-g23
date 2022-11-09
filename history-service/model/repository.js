import 'dotenv/config'

//Set up mongoose connection
import mongoose from 'mongoose';
import HistoryModel from './history-model.js';

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
        ],
    }).sort({ "updatedAt": "desc" });
}

export async function updateHistoryModel(id, params) {
    return await HistoryModel.findOneAndUpdate({ _id: id }, params, {
        new: true
    });
}

