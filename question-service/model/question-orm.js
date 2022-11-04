import { createQuestionModel, getQuestionModelById } from './repository.js';
import QuestionModel from "./question-model.js";
import "dotenv/config";

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
        return newQues;

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
        const ques = await getQuestionModelById(quesId);
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
        const ques = await getQuestionModelById(id);
        if (ques != null) {
            return ques;
        } else {
            return {
                err: "ques not found by id"
            }
        }
    } catch (err) {
        console.log('ERROR: Could not get one question by id');
        return { err };
    }
}