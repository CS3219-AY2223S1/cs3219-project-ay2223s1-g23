import mongoose from 'mongoose';
var Schema = mongoose.Schema

let QuestionModelSchema = new Schema({
    title: {
        type: String,
        unique: true
    },
    body: {
        type: String,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    url: {
        type: String,
    },
})

export default mongoose.model('QuestionModel', QuestionModelSchema)
