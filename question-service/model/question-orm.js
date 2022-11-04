import { createQuestionModel, getQuestionModelById } from './repository.js';
import QuestionModel from "./question-model.js";
import "dotenv/config";
import redis from 'redis';

const redisClient = redis.createClient({
    url: process.env.REDIS_CLOUD_URI
});
redisClient.connect();

const DEFAULT_EXPIRATION = 6 * 60 * 60; // 6 hours

//need to separate orm functions from repository to decouple business logic from persistence
export async function createOneQuestionModel(title, body, difficulty, url) {
    try {
        const newQues = await createQuestionModel({
            title: title,
            body: body,
            difficulty: difficulty,
            url: url,
        });
        await newQues.save();
        return true;

    } catch (err) {
        console.log('ERROR: Could not create ques model');
        return { err };
    }
}

export async function getOneQuestionByDifficulty(difficulty) {
    try {
        let diffEnum = ["easy", "medium", "hard"];
        if (!diffEnum.includes(difficulty)) {
            return {
                err: "difficulty must be one of easy, medium or hard"
            }
        }
        const quesId = await randSelectQuestionId(difficulty);
        let ques = await checkAndGetFromRedis(`ques?quesId=${quesId}`);
        if (ques != null && !ques.err) {
            return ques;
        }
        ques = await getQuestionModelById(quesId);
        if (ques != null) {
            return ques;
        } else {
            return {
                err: "no question found by difficulty"
            }
        }
    } catch (err) {
        console.log('ERROR: Could not get one question by difficulty');
        return { err };
    }
}

async function randSelectQuestionId(difficulty) {
    const quesId = await QuestionModel.aggregate()
        .match({ difficulty: difficulty })
        .sample(1) // randomly select
        .then((res) => {
            return res[0]._id
        })
        .catch((err) => {
            console.log(err);
        })
    return quesId;
}


export async function getOneQuestionById(id) {
    try {
        let ques = await checkAndGetFromRedis(`ques?quesId=${id}`);
        if (ques != null && !ques.err) {
            return ques;
        }
        ques = await getQuestionModelById(id);
        if (ques != null) {
            redisClient.setEx(`ques?quesId=${id}`, DEFAULT_EXPIRATION, JSON.stringify(ques));
            return ques;
        } else {
            return {
                err: "ques not found by id"
            }
        }
    } catch (err) {
        console.log('ERROR: Could not get one question by id');
        console.log(err);
        return { err };
    }
}

async function checkAndGetFromRedis(key) {
    return await redisClient.get(key)
        .then((data) => {
            return data
        })
        .catch((err) => {
            return {
                err: "Something wrong while getting data from redis"
            }
        });
}
