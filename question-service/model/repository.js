import 'dotenv/config'

//Set up mongoose connection
import mongoose from 'mongoose';
import QuestionModel from './question-model.js';

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

export async function createQuestionModel(params) {
    return new QuestionModel(params);
}

export async function getQuestionModelById(id) {
    return await QuestionModel.findById(id);
}

