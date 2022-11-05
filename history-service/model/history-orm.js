import {
    createHistoryModel,
    getHistoryModelById,
    getHistoryModelByUserId,
    updateHistoryModel
} from './repository.js';
import "dotenv/config";

//need to separate orm functions from repository to decouple business logic from persistence
export async function createOneHistoryModel(quesId, userId1, userId2, answer) {
    try {
        const newHist = await createHistoryModel({
            quesId: quesId,
            userId1: userId1,
            userId2: userId2,
            answer: answer
        });
        newHist.save();
        return newHist;

    } catch (err) {
        console.log('ERROR: Could not create hist model');
        return { err };
    }
}

export async function getOneHistoryById(id) {
    try {
        const hist = await getHistoryModelById(id);
        if (hist != null) {
            return hist;
        } else {
            return {
                err: "hist not found by id"
            }
        }
    } catch (err) {
        console.log('ERROR: Could not get one hist by id');
        return { err };
    }
}

export async function getHistoryByUserId(userId) {
    try {
        const hists = await getHistoryModelByUserId(userId);
        if (hists != null) {
            return hists;
        } else {
            return {
                err: "hist not found by userId"
            }
        }
    } catch (err) {
        console.log('ERROR: Could not get hists by userId');
        return { err };
    }
}

export async function updateOneHistory(id, data) {
    try {
        const updatedHistory = await updateHistoryModel(id, data);
        if (updatedHistory != null) {
            return updatedHistory;
        } else {
            return {
                err: "hist not found when trying to update hist"
            }
        }
    } catch (err) {
        console.log("ERROR: Could not update hist. Err " + err);
        return { err };
    }
}