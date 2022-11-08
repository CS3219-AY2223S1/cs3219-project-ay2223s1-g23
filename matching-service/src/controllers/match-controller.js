import {
    createOneMatchModel as _createOneMatchModel,
} from '../model/match-orm.js'

export async function createMatch(req, res) {
    try {
        const { userId, difficulty } = req.body;
        if (userId && difficulty) {
            const resp = await _createOneMatchModel(userId, difficulty);
            if (resp.err) {
                return res.status(400).json({ message: 'Could not create a match!' });
            } else {
                return res.status(201).json({
                    message: `Created new user id ${userId} with difficulty ${difficulty} successfully!`,
                    data: resp
                });
            }
        } else {
            return res.status(400).json({ message: 'userId and/or difficulty are missing!' });
        }
    } catch (err) {
        return res.status(500).json({ message: `${err}` })
    }
}