import {
    ormCreateUserDifficulty as _createUserDifficulty,
} from '../model/match-orm.js'

export async function createUserDifficulty(req, res) {
    try {
        const { userId, difficulty } = req.body;
        if (userId && difficulty) {
            const resp = await _createUserDifficulty(userId, difficulty);
            console.log(resp);
            if (resp.err) {
                return res.status(400).json({ message: 'Could not create a new user difficulty!' });
            } else {
                console.log(`Created new user id ${userId} with difficulty ${difficulty} successfully!`)
                return res.status(201).json({ message: `Created new user id ${userId} with difficulty ${difficulty} successfully!` });
            }
        } else {
            return res.status(400).json({ message: 'userId and/or difficulty are missing!' });
        }
    } catch (err) {
        return res.status(500).json({ message: `${err}` })
    }
}