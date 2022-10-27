import {
    createOneHistoryModel as _createOneHistoryModel,
    getOneHistoryById as _getOneHistoryById,
    getHistoryByUserId as _getHistoryByUserId,
    updateOneHistory as _updateOneHistory
} from '../model/history-orm.js'

export async function createHistory(req, res) {
    try {
        const { quesId, userId1, userId2 } = req.body;
        // answer is empty string
        if (quesId && userId1 && userId2) {
            const resp = await _createOneHistoryModel(quesId, userId1, userId2, "");
            //console.log(resp);
            if (resp.err) {
                return res.status(400).json({ message: 'Could not create a history!' });
            } else {
                console.log(`Created new history successfully!`)
                return res.status(201).json({ message: `Created new history successfully!` });
            }
        } else {
            return res.status(400).json({ message: 'quesId or userId1 or userId2 may be missing!' });
        }
    } catch (err) {
        return res.status(500).json({ message: `${err}` })
    }
}

export async function getHistoryById(req, res) {
    try {
        const { id } = req.query;
        const resp = await _getOneHistoryById(id);
        //console.log(resp);
        if (resp.err) {
            return res.status(400).json({ message: 'Could not get history by id' });
        } else if (resp) {
            return res.status(200).json({
                message: "Success getting history by id!",
                data: resp
            });
        } else {
            return res.status(404).json({ message: 'Hist not found!' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Database failure when getting hist!' })
    }
}


export async function getHistoryByUserId(req, res) {
    try {
        const { userId } = req.query;
        const resp = await _getHistoryByUserId(userId);
        //console.log(resp);
        if (resp.err) {
            return res.status(400).json({ message: 'Could not get history by userId' });
        } else if (resp) {
            return res.status(200).json({
                message: "Success getting history by userId!",
                data: resp
            });
        } else {
            return res.status(404).json({ message: 'Hist not found!' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Database failure when getting hist by userId!' })
    }
}

export async function updateHistory(req, res) {
    try {
        const data = req.body;
        const { id } = data;
        // only update answer
        if (id && data.answer) {
            const resp = await _updateOneHistory(id, {
                answer: data.answer
            });
            if (resp.err) {
                return res.status(400).json({
                    message: "Could not update history!",
                    err: resp.err
                });
            } else if (!resp) {
                return res.status(404).json({
                    message: "History not found",
                    err: "History not found"
                });
            } else {
                return res.status(201).json({
                    message: `Updated history ${id} successfully!`,
                    data: resp,
                });
            }
        } else {
            return res.status(400).json({ message: "History ID or answer is missing!" });
        }
    } catch (err) {
        return res
            .status(500)
            .json({ message: "Database failure when updating history!" });
    }
}
