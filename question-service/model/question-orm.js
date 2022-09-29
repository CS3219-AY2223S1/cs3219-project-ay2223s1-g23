import { createQuestionModel } from './repository.js';
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