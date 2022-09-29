import mongoose from 'mongoose';
var Schema = mongoose.Schema

let QuestionModelSchema = new Schema({
    title: {
        type: String,
    },
    body: {
        type: String,
    },
    difficulty: {
        type: String,
    },
    url: {
        type: String,
    },
})

export default mongoose.model('QuestionModel', QuestionModelSchema)
