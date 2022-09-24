import { createUserDifficulty, deleteUserDifficulty, existsUserDifficulty } from './repository.js';
import "dotenv/config";

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUserDifficulty(userId, difficulty) {
    try {
        const newDiff = await createUserDifficulty({
            userId: userId,
            difficulty: difficulty,
            matchedUser: null,
        });
        newDiff.save();
        return true;

    } catch (err) {
        console.log('ERROR: Could not create new user difficulty');
        return { err };
    }
}

export async function ormDeleteUserDifficulty(userId) {
    if (!await existsUserDifficulty(userId)) {
        return false;
    }
    try {
        await deleteUserDifficulty(userId);
        return true;
    } catch (err) {
        console.log(`ERROR: ${err}`);
        return { err };
    }
}
