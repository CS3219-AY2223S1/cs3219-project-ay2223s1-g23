import {
    createOneQuestionModel as _createOneQuestionModel,
    getOneQuestionByDifficulty as _getOneQuestionByDifficulty,
    getOneQuestionById as _getOneQuestionById
} from '../model/question-orm.js'

export async function createQuestion(req, res) {
    try {
        const { title, body, difficulty, url } = req.body;
        if (title && body && difficulty && url) {
            const resp = await _createOneQuestionModel(title, body, difficulty, url);
            //console.log(resp);
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

export async function getQuestionByDiff(req, res) {
    try {
        const { diff } = req.query;
        const resp = await _getOneQuestionByDifficulty(diff);
        //console.log(resp);
        if (resp.err) {
            return res.status(400).json({ message: 'Could not get question by diff' });
        } else if (resp) {
            return res.status(200).json({
                message: "Success getting question!",
                data: resp
            });
        } else {
            return res.status(404).json({ message: 'Ques not found!' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Database failure when getting ques!' })
    }
}


export async function getQuestionById(req, res) {
    try {
        const { id } = req.query;
        console.log(id);
        const resp = await _getOneQuestionById(id);
        //console.log(resp);
        if (resp.err) {
            return res.status(400).json({ message: 'Could not get question by id' });
        } else if (resp) {
            return res.status(200).json({
                message: "Success getting question by id!",
                data: resp
            });
        } else {
            return res.status(404).json({ message: 'Ques not found!' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Database failure when getting ques!' })
    }
}