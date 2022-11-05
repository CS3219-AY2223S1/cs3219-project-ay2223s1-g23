import { createMatchModel, deleteMatchModel } from './repository.js';
import "dotenv/config";

//need to separate orm functions from repository to decouple business logic from persistence
export async function createOneMatchModel(userId, difficulty) {
    try {
        const newDiff = await createMatchModel({
            userId: userId,
            difficulty: difficulty,
            matchedUser: null,
        });
        newDiff.save();
        return newDiff;

    } catch (err) {
        console.log('ERROR: Could not create match model');
        return { err };
    }
}

export async function deleteOneMatchModel(userId) {
    try {
        var doc = await deleteMatchModel(userId);
        if (!doc) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        console.log(`ERROR: ${err}`);
        return { err };
    }
}
