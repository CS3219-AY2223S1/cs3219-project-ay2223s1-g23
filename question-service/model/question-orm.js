import { createQuestionModel } from './repository.js';
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
        newQues.save();
        return true;

    } catch (err) {
        console.log('ERROR: Could not create ques model');
        return { err };
    }
}

export async function getOneQuestion(difficulty) {
    try {
        const quesId = await randSelectQuestionId(difficulty);
        const ques = await QuestionModel.findById(quesId);
        if (ques != null) {
            return ques;
        } else {
            return {
                err: "ques empty"
            }
        }
    } catch (err) {
        console.log('ERROR: Could not create ques model');
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

// async function getNumOfQuestions(difficulty) {
//     const result = await QuestionModel.countDocuments({ difficulty: { $eq: difficulty } })
//         .exec()
//         .then((res) => {
//             return res
//         })
//     return result
// }