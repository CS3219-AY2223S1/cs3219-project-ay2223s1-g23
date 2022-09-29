import {
    createOneQuestionModel as _createOneQuestionModel,
} from '../model/question-orm.js'

export async function createQuestion(req, res) {
    try {
        const { title, body, difficulty, url } = req.body;
        if (title && body && difficulty && url) {
            const resp = await _createOneQuestionModel(title, body, difficulty, url);
            console.log(resp);
            if (resp.err) {
                return res.status(400).json({ message: 'Could not create a question!' });
            } else {
                console.log(`Created new question successfully!`)
                return res.status(201).json({ message: `Created new question successfully!` });
            }
        } else {
            return res.status(400).json({ message: 'title, body, difficulty or url may be missing!' });
        }
    } catch (err) {
        return res.status(500).json({ message: `${err}` })
    }
}